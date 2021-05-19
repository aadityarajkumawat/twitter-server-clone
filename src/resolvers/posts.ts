import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    PubSubEngine,
    Query,
    Resolver,
    Root,
    Subscription,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import {
    EditProfile,
    GetFeedTweets,
    GetOneTweet,
    GetPaginatedFeedTweets,
    GetPaginatedUserTweets,
    GetProfile,
    GetTweetById,
    GetTweetResponse,
    GetUserTweets,
    LikedTweet,
    PaginatingParams,
    PaginatingUserParams,
    PostCreatedResponse,
    PostTweetInput,
    ProfileStuffAndUserTweets,
    SubUserTweets,
    TweetInfo,
} from "../constants";
import { Follow, Images, Like, Profile, Tweet, User } from "../entities";
import { addLikedStatusToTweets } from "../helpers/addLikedStatusToTweets";
import { addProfileImageToTweets } from "../helpers/addProfileImageToTweets";
import { dataOnSteroids } from "../helpers/dataOnSteroids";
import {
    getFeedTweets,
    getNumberOfTweetsInFeed,
} from "../helpers/getFeedTweets";
import { Auth } from "../middlewares/Auth";
import { Time } from "../middlewares/Time";
import { TWEET, USER_TWEETS } from "../triggers";
import { MyContext } from "../types";
import { UserResolver } from "./user";

const userResolvers = new UserResolver();

@Resolver()
export class PostsResolver {
    private userTweets: Array<GetOneTweet> = [];

    @Mutation(() => PostCreatedResponse)
    @UseMiddleware(Time)
    @UseMiddleware(Auth)
    async createPost(
        @Arg("options") options: PostTweetInput,
        @Ctx() { req, conn }: MyContext,
        @PubSub() pubsub: PubSubEngine
    ): Promise<PostCreatedResponse> {
        let { tweet_content, img } = options;

        try {
            const user = await User.findOne({
                where: { id: req.session.userId },
            });
            if (!user) return { error: "user not found", uploaded: "" };

            const tweetRepo = conn.getRepository(Tweet);
            const newTweet = tweetRepo.create({
                _type: "tweet",
                comments: 0,
                img: img ? img : "",
                likes: 0,
                name: user.name,
                tweet_content,
                user,
                username: user.username,
            });

            const post = await tweetRepo.manager.save(newTweet);

            const profileI = await Images.findOne({ where: { user } });
            if (!profileI) return { error: "images not found", uploaded: "" };

            /**
             * Publishing tweet to home feed
             */
            const payload: Required<GetTweetResponse> = {
                error: "",
                tweet: { ...post, liked: false, profile_img: profileI.url },
            };

            await pubsub.publish(TWEET, payload);

            /**
             * pushing tweet to global user tweets list
             */
            this.userTweets = [payload.tweet, ...this.userTweets];
            await pubsub.publish(USER_TWEETS, [payload.tweet]);

            const __data__: PostCreatedResponse = {
                error: "",
                uploaded: `uploaded${post.tweet_id}`,
            };

            return dataOnSteroids(__data__);
        } catch (err) {
            return { error: err.message, uploaded: "" };
        }
    }

    @Query(() => GetTweetResponse)
    @UseMiddleware(Auth)
    async getTweetById(
        @Arg("options") options: GetTweetById,
        @Ctx() { req }: MyContext
    ): Promise<GetTweetResponse> {
        const { tweet_id } = options;

        try {
            let tweet = await Tweet.findOne({ where: { tweet_id } });
            if (!tweet) return { error: "Tweet not found", tweet: undefined };
            let like = await Like.findOne({
                where: { like_on_id: tweet_id, user_id: req.session.userId },
            });
            let img;
            if (tweet) {
                const user = await userResolvers.getUserByUsername(
                    tweet.username
                );

                if (!user.user)
                    return { error: "user not found", tweet: undefined };

                const realUser = await User.findOne({
                    where: { id: user.user.id },
                });

                img = await Images.findOne({
                    where: { user: realUser, type: "profile" },
                });
            }
            if (!tweet) return { error: "tweet not found", tweet: undefined };

            const __data__: GetTweetResponse = {
                error: "",
                tweet: {
                    ...tweet,
                    liked: like ? true : false,
                    profile_img: img ? img.url : "",
                    img: tweet.img,
                },
            };

            return dataOnSteroids(__data__);
        } catch (error) {
            return { error: error.message, tweet: undefined };
        }
    }

    @Query(() => GetFeedTweets)
    @UseMiddleware(Time)
    @UseMiddleware(Auth)
    async getTweetsByUser(
        @Ctx() { req, conn }: MyContext
    ): Promise<GetFeedTweets> {
        try {
            const userId = req.session.userId;
            const follow = await Follow.find({ where: { userId } });

            const followingIds = [];
            for (let i = 0; i < follow.length; i++) {
                followingIds.push(follow[i].following);
            }

            const tweets = await getFeedTweets(followingIds, userId);

            /**
             * To return the total number of tweets in user's
             * feed, used in pagination on frontend
             */
            const numberOfTweetsInFeed = await getNumberOfTweetsInFeed(
                followingIds,
                userId
            );

            /**
             * The return type of tweet needs a liked by logged in
             * user status and a profile image of user, which are added
             * additionally on the fly.
             */
            const tweetsWithLikedStatus = await addLikedStatusToTweets(
                tweets,
                userId
            );

            const tweetsWithProfileImage = await addProfileImageToTweets(
                tweetsWithLikedStatus,
                conn
            );

            const __data__: GetFeedTweets = {
                error: undefined,
                tweets: tweetsWithProfileImage,
                num: numberOfTweetsInFeed,
            };

            return dataOnSteroids(__data__);
        } catch (error) {
            return { error: error.message, tweets: undefined, num: undefined };
        }
    }

    @Query(() => GetPaginatedFeedTweets)
    async getPaginatedPosts(
        @Ctx() { req }: MyContext,
        @Arg("options") options: PaginatingParams
    ): Promise<GetPaginatedFeedTweets> {
        if (!req.session.userId) {
            return { error: "User is unauthorized", tweets: [] };
        }

        const { limit, offset } = options;

        try {
            const follow = await Follow.find({
                where: { userId: req.session.userId },
            });

            const followingIds = [];

            for (let i = 0; i < follow.length; i++) {
                followingIds.push(follow[i].following);
            }

            const tweets: Array<Tweet> = await getConnection()
                .createQueryBuilder()
                .select("*")
                .from(Tweet, "tweet")
                .where("tweet.userId IN (:...ids)", {
                    ids: [...followingIds, req.session.userId],
                })
                .offset(offset)
                .limit(limit)
                .orderBy("tweet.created_At", "DESC")
                .execute();

            const finalTweets = [];

            let like = await Like.find({
                where: { user_id: req.session.userId },
            });

            for (let i = 0; i < tweets.length; i++) {
                let currID = tweets[i].tweet_id;
                let oo = { ...tweets[i], liked: false };
                for (let j = 0; j < like.length; j++) {
                    if (like[j].like_on_id === currID) {
                        oo.liked = true;
                    }
                }
                finalTweets.push(oo);
            }

            const tweetsResponse: GetOneTweet[] = [];

            for (let i = 0; i < finalTweets.length; i++) {
                const user = await userResolvers.getUserByUsername(
                    finalTweets[i].username
                );

                if (!user.user) return { error: "no user found", tweets: [] };

                const realUser = await User.findOne({
                    where: { id: user.user.id },
                });
                const img_url = await Images.findOne({
                    where: { user: realUser, type: "profile" },
                });

                tweetsResponse.push({
                    ...finalTweets[i],
                    profile_img: img_url ? img_url.url : "",
                });
            }

            const __data__: GetPaginatedFeedTweets = {
                error: "",
                tweets: tweetsResponse,
            };

            return dataOnSteroids(__data__);
        } catch (error) {
            if (error.code == "2201W") {
                return { error: "you", tweets: [] };
            }
            return { error: error.message, tweets: [] };
        }
    }

    @Mutation(() => LikedTweet)
    @UseMiddleware(Auth)
    async likeTweet(
        @Arg("options") options: TweetInfo,
        @Ctx() { req, conn }: MyContext
    ): Promise<LikedTweet> {
        const { like_on_id, like_on } = options;
        const likeRepo = conn.getRepository(Like);

        try {
            let tweet = await Tweet.findOne({
                where: { tweet_id: like_on_id },
            });

            if (!tweet)
                return { error: "Tweet not found", liked: `Can't be liked!` };

            let like = await Like.findOne({
                where: {
                    user_id: req.session.userId,
                    tweet,
                    like_on_id,
                    like_on,
                },
            });

            if (!like) {
                const newLike = likeRepo.create({
                    like_on_id,
                    like_on: "tweet",
                    tweet,
                    user_id: req.session.userId,
                });

                tweet.likes += 1;

                await likeRepo.manager.save(newLike);
                await tweet.save();
            } else {
                tweet.likes -= 1;

                await like.remove();
                await tweet.save();
            }

            return { liked: "liked", error: "" };
        } catch (err) {
            console.log(err.message);
            return { error: err.message, liked: `nope` };
        }
    }

    @Query(() => Boolean)
    async triggerUserTweetsSubscriptions(
        @Arg("id") id: number,
        @PubSub() pubsub: PubSubEngine
    ) {
        try {
            const tweets: Array<Tweet> = await getConnection()
                .createQueryBuilder()
                .select("*")
                .from(Tweet, "tweet")
                .where("tweet.userId = :id", {
                    id,
                })
                .limit(15)
                .orderBy("tweet.created_At", "DESC")
                .execute();

            const finalTweets = [];

            let like = await Like.find({ where: { user_id: id } });

            for (let i = 0; i < tweets.length; i++) {
                let currID = tweets[i].tweet_id;
                let oo = { ...tweets[i], liked: false };
                for (let j = 0; j < like.length; j++) {
                    if (like[j].like_on_id === currID) {
                        oo.liked = true;
                    }
                }
                finalTweets.push(oo);
            }

            const userTweets = [];

            for (let i = 0; i < finalTweets.length; i++) {
                const ii = finalTweets[i].user.id;
                const user = await User.findOne({ where: { id: ii } });
                const img_url = await Images.findOne({
                    where: { user, type: "profile" },
                });

                userTweets.push({
                    ...finalTweets[i],
                    profile_img: img_url ? img_url.url : "",
                });
            }

            this.userTweets = userTweets;
            await pubsub.publish(USER_TWEETS, userTweets);

            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }

    @Subscription(() => SubUserTweets, { topics: USER_TWEETS })
    async listenUserTweets(
        @Ctx() { conn: connection }: MyContext,
        @Arg("id") id: number
    ): Promise<SubUserTweets> {
        try {
            const tweetRepository = connection.getRepository(Tweet);
            const userRepository = connection.getRepository(User);

            const user = await userRepository.findOne({ where: { id } });
            const num = await tweetRepository.count({ where: { user } });

            const tweets = this.userTweets;

            return { error: undefined, num, tweets };
        } catch (error) {
            return { error: error.message, num: undefined, tweets: [] };
        }
    }

    @Subscription(() => GetTweetResponse, {
        topics: TWEET,
    })
    async listenTweets(
        @Root() tweet: GetTweetResponse
    ): Promise<GetTweetResponse> {
        if (!tweet.tweet) return { error: "no tweet found", tweet: undefined };
        const thatTweetThough = await Tweet.findOne({
            where: { tweet_id: tweet.tweet?.tweet_id },
        });
        if (!thatTweetThough)
            return { error: "tweet not posted", tweet: undefined };

        const user = await userResolvers.getUserByUsername(
            tweet.tweet.username
        );
        if (!user.user) return { error: "user not found", tweet: undefined };

        const realUser = await User.findOne({
            where: { id: user.user.id },
        });

        const img = await Images.findOne({
            where: { user: realUser, type: "profile" },
        });
        if (img && tweet.tweet) {
            tweet.tweet.profile_img = img.url;
        } else if (tweet.tweet) {
            tweet.tweet.profile_img = "";
        }

        return tweet;
    }

    @Query(() => GetUserTweets)
    async getTweetsByUserF(
        @Ctx() { req }: MyContext,
        @Arg("id") id: number
    ): Promise<GetUserTweets> {
        if (!req.session.userId) {
            return { error: "user is not authenticated", tweets: [], num: 0 };
        }

        try {
            const tweets: Array<Tweet> = await getConnection()
                .createQueryBuilder()
                .select("*")
                .from(Tweet, "tweet")
                .where("tweet.userId = :id", {
                    id,
                })
                .limit(15)
                .orderBy("tweet.created_At", "DESC")
                .execute();

            const allTweets: Array<Tweet> = await getConnection()
                .createQueryBuilder()
                .select("*")
                .from(Tweet, "tweet")
                .where("tweet.userId = :id", {
                    id,
                })
                .orderBy("tweet.created_At", "DESC")
                .execute();

            const finalTweets = [];

            let like = await Like.find({ where: { user_id: id } });

            for (let i = 0; i < tweets.length; i++) {
                let currID = tweets[i].tweet_id;
                let oo = { ...tweets[i], liked: false };
                for (let j = 0; j < like.length; j++) {
                    if (like[j].like_on_id === currID) {
                        oo.liked = true;
                    }
                }
                finalTweets.push(oo);
            }

            const f = [];

            for (let i = 0; i < finalTweets.length; i++) {
                const user = await userResolvers.getUserByUsername(
                    finalTweets[i].username
                );

                if (!user.user)
                    return { error: "user not found", num: -1, tweets: [] };

                const realUser = await User.findOne({
                    where: { id: user.user.id },
                });

                const img_url = await Images.findOne({
                    where: { user: realUser, type: "profile" },
                });

                f.push({
                    ...finalTweets[i],
                    profile_img: img_url ? img_url.url : "",
                });
            }

            const __data__: GetUserTweets = {
                error: "",
                tweets: f,
                num: allTweets.length,
            };
            return dataOnSteroids(__data__);
        } catch (error) {
            return { error, tweets: [], num: 0 };
        }
    }

    @Query(() => GetPaginatedUserTweets)
    async getPaginatedUserTweets(
        @Ctx() { req }: MyContext,
        @Arg("options") options: PaginatingUserParams
    ): Promise<GetPaginatedUserTweets> {
        if (!req.session.userId) {
            return { error: "user is not authenticated", tweets: [] };
        }

        const { limit, offset, id } = options;

        try {
            const tweets: Array<Tweet> = await getConnection()
                .createQueryBuilder()
                .select("*")
                .from(Tweet, "tweet")
                .where("tweet.userId = :id", {
                    id,
                })
                .offset(offset)
                .limit(limit)
                .orderBy("tweet.created_At", "DESC")
                .execute();

            const finalTweets = [];

            let like = await Like.find({ where: { user_id: id } });

            for (let i = 0; i < tweets.length; i++) {
                let currID = tweets[i].tweet_id;
                let oo = { ...tweets[i], liked: false };
                for (let j = 0; j < like.length; j++) {
                    if (like[j].like_on_id === currID) {
                        oo.liked = true;
                    }
                }
                finalTweets.push(oo);
            }

            const f: GetOneTweet[] = [];

            for (let i = 0; i < finalTweets.length; i++) {
                const user = await userResolvers.getUserByUsername(
                    finalTweets[i].username
                );

                if (!user.user) return { error: "user not found", tweets: [] };

                const realUser = await User.findOne({
                    where: { id: user.user.id },
                });

                const img_url = await Images.findOne({
                    where: { user: realUser, type: "profile" },
                });

                f.push({
                    ...finalTweets[i],
                    profile_img: img_url ? img_url.url : "",
                });
            }

            const __data__: GetPaginatedUserTweets = { error: "", tweets: f };
            return dataOnSteroids(__data__);
        } catch (error) {
            if (error.code == "2201W") {
                return { error: "you", tweets: [] };
            }
            return { error: error.message, tweets: [] };
        }
    }

    @Query(() => GetProfile)
    async getUserProfile(@Ctx() { req }: MyContext): Promise<GetProfile> {
        if (!req.session.userId) {
            return { error: "user is not authenticated", profile: null };
        }

        try {
            const following = await getConnection()
                .createQueryBuilder()
                .select("COUNT(*)")
                .from(Follow, "follow")
                .where("follow.userId = :id", { id: req.session.userId })
                .execute();

            const followers = await getConnection()
                .createQueryBuilder()
                .select("COUNT(*)")
                .from(Follow, "follow")
                .where("follow.following = :id", { id: req.session.userId })
                .execute();

            const n = await getConnection()
                .createQueryBuilder()
                .select("COUNT(*)")
                .from(Tweet, "tweet")
                .where("tweet.userId = :id", { id: req.session.userId })
                .execute();

            const num = n[0].count;

            const user = await User.findOne({
                where: { id: req.session.userId },
            });
            const profile = await Profile.findOne({ where: { user } });
            if (!profile) return { error: "profile not found", profile: null };
            const { link, bio } = profile;

            const __data__: GetProfile = {
                error: "",
                profile: {
                    followers: followers[0].count,
                    following: following[0].count,
                    bio,
                    link,
                    num,
                },
            };

            return dataOnSteroids(__data__);
        } catch (error) {
            return { error: error, profile: null };
        }
    }

    @Mutation(() => Boolean)
    async editProfile(
        @Ctx() { req }: MyContext,
        @Arg("options") options: EditProfile
    ): Promise<Boolean> {
        if (!req.session.userId) {
            return false;
        }

        const { link, bio } = options;
        let result = false;
        try {
            const user = await User.findOne({
                where: { id: req.session.userId },
            });
            const currentProfile = await Profile.findOne({ where: { user } });
            if (currentProfile) {
                currentProfile.bio = bio;
                currentProfile.link = link;

                await currentProfile.save();
                result = true;
            } else {
                result = false;
            }

            const __data__: Boolean = result;
            return dataOnSteroids(__data__);
        } catch (error) {
            return false;
        }
    }

    @Query(() => ProfileStuffAndUserTweets)
    async profileStuffAndUserTweets(
        @Ctx() ctx: MyContext,
        @Arg("id") id: number
    ): Promise<ProfileStuffAndUserTweets> {
        const getProfileStuff = userResolvers.getProfileStuff;

        try {
            const profileStuff = await getProfileStuff(ctx, id);
            const userTweets = await this.getTweetsByUserF(ctx, id);

            const __data__: ProfileStuffAndUserTweets = {
                error: "",
                profile: profileStuff.profile,
                tweets: userTweets.tweets,
            };

            return dataOnSteroids(__data__);
        } catch (error) {
            console.log(error.message);
            return { error: error.message, profile: null, tweets: null };
        }
    }
}
