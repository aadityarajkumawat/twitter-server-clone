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
  TweetInfo,
} from "../constants";
import { MyContext } from "src/types";
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
} from "type-graphql";
import { Tweet, Like } from "../entities/Tweets";
import { getConnection } from "typeorm";
import { User } from "../entities/User";
import { Follow } from "../entities/Follow";
import { TWEET } from "../triggers";
import { Profile } from "../entities/Profile";
import { Images } from "../entities/Images";

import { UserResolver } from "./user";
const userResolvers = new UserResolver();

@Resolver()
export class PostsResolver {
  t = 200;

  @Mutation(() => PostCreatedResponse)
  async createPost(
    @Arg("options") options: PostTweetInput,
    @Ctx() { req }: MyContext,
    @PubSub() pubsub: PubSubEngine
  ): Promise<PostCreatedResponse> {
    let { tweet_content, rel_acc, img } = options;
    console.log(req.session.userId);
    if (!req.session.userId) {
      return { error: "User is unauthorized" };
    }
    let post;
    try {
      const user = await User.findOne({ where: { id: req.session.userId } });
      let tweetType = "tweet";
      if (rel_acc) {
        tweetType = "retweet";
      } else {
        rel_acc = req.session.userId;
      }
      if (user) {
        const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Tweet)
          .values({
            user,
            tweet_content,
            _type: tweetType,
            rel_acc,
            username: user.username,
            name: user.name,
            likes: 0,
            comments: 0,
            img: img ? img : "",
          })
          .returning("*")
          .execute();

        post = result.raw[0];
        const payload: GetTweetResponse = {
          error: "",
          tweet: { ...post, liked: false },
        };
        await pubsub.publish(TWEET, payload);
      }
    } catch (err) {
      console.log(err);
    }

    return { error: "", uploaded: `uploaded${post.tweet_id}` };
  }

  @Query(() => GetTweetResponse)
  async getTweetById(
    @Arg("options") options: GetTweetById,
    @Ctx() { req }: MyContext
  ): Promise<GetTweetResponse> {
    const { tweet_id } = options;
    if (!req.session.userId) {
      return { error: "User is unauthorized", tweet: null };
    }

    try {
      let tweet = await Tweet.findOne({ where: { tweet_id } });
      let like = await Like.findOne({
        where: { tweet_id, user_id: req.session.userId },
      });
      let img;
      if (tweet) {
        const user = await User.findOne({ where: { id: tweet.rel_acc } });
        img = await Images.findOne({ where: { user, type: "profile" } });
      }
      if (tweet) {
        return {
          error: "",
          tweet: {
            ...tweet,
            liked: like ? true : false,
            profile_img: img ? img.url : "",
            img: tweet.img,
          },
        };
      } else {
        return { error: "", tweet: null };
      }
    } catch (error) {
      return { error: error.message, tweet: null };
    }
  }

  @Query(() => GetFeedTweets)
  async getTweetsByUser(@Ctx() { req }: MyContext): Promise<GetFeedTweets> {
    if (!req.session.userId) {
      return { error: "User is unauthorized", tweets: [], num: 0 };
    }

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
        .limit(7)
        .orderBy("tweet.created_At", "DESC")
        .execute();

      const tw: Array<Tweet> = await getConnection()
        .createQueryBuilder()
        .select("*")
        .from(Tweet, "tweet")
        .where("tweet.userId IN (:...ids)", {
          ids: [...followingIds, req.session.userId],
        })
        .execute();

      const finalTweets = [];

      let like = await Like.find({ where: { user_id: req.session.userId } });

      for (let i = 0; i < tweets.length; i++) {
        let currID = tweets[i].tweet_id;
        let oo = { ...tweets[i], liked: false };
        for (let j = 0; j < like.length; j++) {
          if (like[j].tweet_id === currID) {
            oo.liked = true;
          }
        }
        finalTweets.push(oo);
      }

      const f = [];

      for (let i = 0; i < finalTweets.length; i++) {
        const ii = finalTweets[i].rel_acc;
        const user = await User.findOne({ where: { id: ii } });
        const img_url = await Images.findOne({
          where: { user, type: "profile" },
        });

        f.push({ ...finalTweets[i], profile_img: img_url ? img_url.url : "" });
      }

      return { error: "", tweets: f, num: tw.length };
    } catch (error) {
      console.log("err");
      return { error: error.message, tweets: [], num: 0 };
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

      let like = await Like.find({ where: { user_id: req.session.userId } });

      for (let i = 0; i < tweets.length; i++) {
        let currID = tweets[i].tweet_id;
        let oo = { ...tweets[i], liked: false };
        for (let j = 0; j < like.length; j++) {
          if (like[j].tweet_id === currID) {
            oo.liked = true;
          }
        }
        finalTweets.push(oo);
      }

      const tweetsResponse: GetOneTweet[] = [];

      for (let i = 0; i < finalTweets.length; i++) {
        const ii = finalTweets[i].rel_acc;
        const user = await User.findOne({ where: { id: ii } });
        const img_url = await Images.findOne({
          where: { user, type: "profile" },
        });

        tweetsResponse.push({
          ...finalTweets[i],
          profile_img: img_url ? img_url.url : "",
        });
      }

      return new Promise((resolve, _) => {
        setTimeout(() => {
          resolve({ error: "", tweets: tweetsResponse });
        }, this.t);
      });
    } catch (error) {
      if (error.code == "2201W") {
        console.log(error.message);
        return { error: "you", tweets: [] };
      }
      return { error: error.message, tweets: [] };
    }
  }

  @Mutation(() => LikedTweet)
  async likeTweet(
    @Arg("options") options: TweetInfo,
    @Ctx() { req }: MyContext,
    @PubSub() pubsub: PubSubEngine
  ): Promise<LikedTweet> {
    const { tweet_id } = options;
    if (!req.session.userId) {
      return { error: "User is unauthorized", liked: "" };
    }

    let tweet = await Tweet.findOne({ where: { tweet_id } });
    let like = await Like.findOne({
      where: { user_id: req.session.userId, tweet },
    });
    let img;
    if (tweet) {
      const user = await User.findOne({ where: { id: tweet.rel_acc } });
      img = await Images.findOne({ where: { user, type: "profile" } });
    }

    const tweetAfterLike = await Tweet.findOne({ where: { tweet_id } });

    if (like) {
      await like.remove();
      let newLikes = 0;
      if (tweet) {
        tweet.likes = tweet.likes - 1;
        newLikes = tweet.likes;
        await tweet.save();
      }

      const payload: GetTweetResponse = {
        error: "",
        tweet: {
          ...tweetAfterLike,
          liked: false,
          likes: newLikes,
          profile_img: img ? img.url : "",
          img: tweetAfterLike ? tweetAfterLike.img : "",
        },
      };
      await pubsub.publish(TWEET, payload);
      return { liked: "unliked", error: "" };
    }

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Like)
        .values({ tweet, user_id: req.session.userId, tweet_id })
        .returning("*")
        .execute();

      let newLikes = 0;
      if (tweet) {
        tweet.likes = tweet.likes + 1;
        newLikes = tweet.likes;
        await tweet.save();
      }

      like = result.raw[0];
      const payload: GetTweetResponse = {
        error: "",
        tweet: {
          ...tweetAfterLike,
          liked: true,
          likes: newLikes,
          profile_img: img ? img.url : "",
          img: tweetAfterLike ? tweetAfterLike.img : "",
        },
      };
      await pubsub.publish(TWEET, payload);
    } catch (err) {
      console.log(err);
    }
    return { liked: `liked${like?.like_id}`, error: "" };
  }

  @Subscription(() => GetTweetResponse, {
    topics: TWEET,
  })
  async listenTweets(
    @Root() tweet: GetTweetResponse
  ): Promise<GetTweetResponse> {
    const user = await User.findOne({ where: { id: tweet.tweet?.rel_acc } });
    const img = await Images.findOne({ where: { user, type: "profile" } });
    if (img && tweet.tweet) {
      tweet.tweet.profile_img = img.url;
    } else if (tweet.tweet) {
      tweet.tweet.profile_img = "";
    }

    return new Promise((resolve, _) => {
      setTimeout(() => {
        resolve(tweet);
      }, this.t);
    });
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
        .where("tweet.rel_acc = :id", {
          id,
        })
        .limit(5)
        .orderBy("tweet.created_At", "DESC")
        .execute();

      const allTweets: Array<Tweet> = await getConnection()
        .createQueryBuilder()
        .select("*")
        .from(Tweet, "tweet")
        .where("tweet.rel_acc = :id", {
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
          if (like[j].tweet_id === currID) {
            oo.liked = true;
          }
        }
        finalTweets.push(oo);
      }

      const f = [];

      for (let i = 0; i < finalTweets.length; i++) {
        const ii = finalTweets[i].rel_acc;
        const user = await User.findOne({ where: { id: ii } });
        const img_url = await Images.findOne({
          where: { user, type: "profile" },
        });

        f.push({ ...finalTweets[i], profile_img: img_url ? img_url.url : "" });
      }

      return { error: "", tweets: f, num: allTweets.length };
    } catch (error) {
      console.log(error);
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
          if (like[j].tweet_id === currID) {
            oo.liked = true;
          }
        }
        finalTweets.push(oo);
      }

      const f: GetOneTweet[] = [];

      for (let i = 0; i < finalTweets.length; i++) {
        const ii = finalTweets[i].rel_acc;
        const user = await User.findOne({ where: { id: ii } });
        const img_url = await Images.findOne({
          where: { user, type: "profile" },
        });

        f.push({ ...finalTweets[i], profile_img: img_url ? img_url.url : "" });
      }

      return new Promise((resolve, _) => {
        setTimeout(() => {
          resolve({ error: "", tweets: f });
        }, this.t);
      });
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
        .where("tweet.rel_acc = :id", { id: req.session.userId })
        .execute();

      const num = n[0].count;

      const user = await User.findOne({ where: { id: req.session.userId } });
      const profile = await Profile.findOne({ where: { user } });
      if (profile) {
        const { link, bio } = profile;

        return {
          error: "",
          profile: {
            followers: followers[0].count,
            following: following[0].count,
            bio,
            link,
            num,
          },
        };
      } else {
        return {
          error: "",
          profile: {
            followers: followers[0].count,
            following: following[0].count,
            bio: "",
            link: "",
            num,
          },
        };
      }
    } catch (error) {
      console.log(error);
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
      const user = await User.findOne({ where: { id: req.session.userId } });
      const currentProfile = await Profile.findOne({ where: { user } });
      if (currentProfile) {
        currentProfile.bio = bio;
        currentProfile.link = link;

        await currentProfile.save();
        result = true;
      } else {
        result = false;
      }
      return new Promise((resolve, _) => {
        setTimeout(() => {
          resolve(result);
        }, this.t);
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Query(() => ProfileStuffAndUserTweets)
  async profileStuffAndUserTweets(
    @Ctx() ctx: MyContext,
    @Arg("id") id: number
  ): Promise<ProfileStuffAndUserTweets> {
    const getProfileStuff = userResolvers.getProfileStuff;

    const profileStuff = await getProfileStuff(ctx, id);
    const userTweets = await this.getTweetsByUserF(ctx, id);

    return new Promise((resolve, _) => {
      setTimeout(() => {
        resolve({
          error: "",
          profile: profileStuff.profile,
          tweets: userTweets.tweets,
        });
      }, this.t);
    });
  }
}
