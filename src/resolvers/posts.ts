import {
  GetTweetById,
  GetTweetResponse,
  GetUserTweets,
  LikedTweet,
  PostCreatedResponse,
  PostTweetInput,
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

@Resolver()
export class PostsResolver {
  @Mutation(() => PostCreatedResponse)
  async createPost(
    @Arg("options") options: PostTweetInput,
    @Ctx() { req }: MyContext
  ): Promise<PostCreatedResponse> {
    let { tweet_content, rel_acc } = options;
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
      if (tweet) {
        return {
          error: "",
          tweet,
        };
      } else {
        return { error: "", tweet: null };
      }
    } catch (error) {
      return { error: error.message, tweet: null };
    }
  }

  @Query(() => GetUserTweets)
  async getTweetsByUser(
    @Ctx() { req }: MyContext,
    @PubSub() pubSub: PubSubEngine
  ): Promise<GetUserTweets> {
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
      const payload: GetUserTweets = { error: "", tweets: finalTweets };
      await pubSub.publish("TWEETS", payload);
      return { error: "", tweets: finalTweets };
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
    let like = await Like.findOne({
      where: { user_id: req.session.userId, tweet },
    });

    if (like) {
      await like.remove();
      if (tweet) {
        tweet.likes = tweet.likes - 1;
        await tweet.save();
      }
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

      if (tweet) {
        tweet.likes = tweet.likes + 1;
        await tweet.save();
      }

      like = result.raw[0];
    } catch (err) {
      console.log(err);
    }
    return { liked: `liked${like?.like_id}`, error: "" };
  }

  // @Query(() => String)
  // async hell(@Ctx() ctx: any) {
  //   await ctx.req.pubsub.publish("MESSAGE");
  //   return "Hello World";
  // }

  @Subscription(() => GetUserTweets, {
    topics: "TWEETS",
  })
  async subscription(@Root() gg: GetUserTweets): Promise<any> {
    return gg;
  }
}
