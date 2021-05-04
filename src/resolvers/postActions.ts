import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Comment, Tweet } from "../entities";
import { Auth } from "../middlewares/Auth";
import { Time } from "../middlewares/Time";
import {
  CommentInput,
  CommentPostedReponse,
} from "../object-types/postActionTypes";
import { MyContext } from "../types";

@Resolver()
export class PostActionResolver {
  @Mutation(() => CommentPostedReponse)
  @UseMiddleware(Time)
  @UseMiddleware(Auth)
  async commentOnTweet(
    @Ctx() { conn }: MyContext,
    @Arg("args") args: CommentInput
  ): Promise<CommentPostedReponse> {
    const { commentMsg, tweet_id } = args;

    const tweetRepository = conn.getRepository(Tweet);
    const commentRepository = conn.getRepository(Comment);

    try {
      const tweet = await tweetRepository.findOne({ where: { tweet_id } });
      if (!tweet) return { error: "Error!, tweet not found", commented: false };

      const newComment = commentRepository.create({
        comment: commentMsg,
        tweet,
      });

      tweet.comments = tweet.comments + 1;
      await commentRepository.manager.save(newComment);
      await tweetRepository.manager.save(tweet);
      return { error: null, commented: true };
    } catch (error) {
      console.log(error.message);
      return { error: error.message, commented: false };
    }
  }
}
