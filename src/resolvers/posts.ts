import {
  GetLikes,
  GetTweetById,
  GetTweetResponse,
  GetUserTweets,
  LikedTweet,
  PostCreatedResponse,
  PostTweetInput,
  TweetInfo,
} from "../constants";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Tweet, Like } from "../entities/Tweets";
import { getConnection } from "typeorm";
import { User } from "../entities/User";
import { Follow } from "../entities/Follow";

@Resolver()
export class PostsResolver {
  @Mutation(() => PostCreatedResponse)
  async createPost(
    @Arg("options") options: PostTweetInput,
    @Ctx() { req }: MyContext
  ): Promise<PostCreatedResponse> {
    const { tweet_content, rel_acc } = options;
    if (!req.session.userId) {
      return { error: "User is unauthorized" };
    }
    let post;
    try {
      const user = await User.findOne({ where: { id: req.session.userId } });
      if (rel_acc) {
        const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Tweet)
          .values({
            user: await User.findOne({ where: { id: req.session.userId } }),
            tweet_content,
            _type: "retweet",
            rel_acc,
            username: user?.username,
            name: user?.name,
          })
          .returning("*")
          .execute();

        post = result.raw[0];
      } else {
        const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Tweet)
          .values({
            user: await User.findOne({ where: { id: req.session.userId } }),
            tweet_content,
            _type: "tweet",
            rel_acc: req.session.userId,
            username: user?.username,
            name: user?.name,
          })
          .returning("*")
          .execute();

        post = result.raw[0];
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
      return {
        error: "",
        tweet: {
          _type: tweet?._type,
          created_At: tweet?.created_At,
          rel_acc: tweet?.rel_acc,
          tweet_content: tweet?.tweet_content,
          tweet_id: tweet?.tweet_id,
          name: tweet?.name,
          username: tweet?.username,
        },
      };
    } catch (error) {
      return { error: error.message, tweet: null };
    }
  }

  @Query(() => GetUserTweets)
  async getTweetsByUser(@Ctx() { req }: MyContext): Promise<GetUserTweets> {
    if (!req.session.userId) {
      return { error: "User is unauthorized", tweets: [] };
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
        .orderBy("tweet.created_At", "ASC")
        .execute();

      return { error: "", tweets };
    } catch (error) {
      console.log("err");
      return { error: error.message, tweets: [] };
    }
  }

  @Mutation(() => LikedTweet)
  async likeTweet(
    @Arg("options") options: TweetInfo,
    @Ctx() { req }: MyContext
  ): Promise<LikedTweet> {
    const { tweet_id } = options;
    if (!req.session.userId) {
      return { error: "User is unauthorized", liked: "" };
    }

    let tweet = await Tweet.findOne({ where: { tweet_id } });

    let like = await Like.findOne({ user_id: req.session.userId, tweet });

    if (like) {
      await like.remove();
      return { liked: "unliked", error: "" };
    }

    try {
      let tweet = await Tweet.findOne({ where: { tweet_id } });

      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Like)
        .values({ tweet, user_id: req.session.userId, tweet_id })
        .returning("*")
        .execute();

      like = result.raw[0];
    } catch (err) {
      console.log(err);
    }
    return { liked: `liked${like?.like_id}`, error: "" };
  }

  @Query(() => GetLikes)
  async getLikes(@Ctx() { req }: MyContext): Promise<GetLikes> {
    if (!req.session.userId) {
      return { likes: [], error: "User is not authenticated" };
    }

    try {
      const likes = await Like.find({ where: { user_id: req.session.userId } });
      console.log(likes);
      return { likes, error: "" };
    } catch (error) {
      return { error: error.message, likes: [] };
    }
  }
}
