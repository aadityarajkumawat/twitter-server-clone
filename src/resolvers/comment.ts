import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { Comment, Images, Like, Tweet } from "../entities";
import { Auth } from "../middlewares/Auth";
import {
    CommentInput,
    CommentPostedReponse,
    GetCommentInput,
    GetCommentResponse,
    GetCommentsInput,
    GetCommentsResponse,
    LikeCommentInput,
    LikeCommentResponse,
} from "../object-types/postActionTypes";
import { MyContext } from "../types";
import { UserResolver } from "./user";

const userResolvers = new UserResolver();

@Resolver()
export class CommentResolver {
    @Mutation(() => CommentPostedReponse)
    @UseMiddleware(Auth)
    async postComment(
        @Arg("args") args: CommentInput,
        @Ctx() ctx: MyContext
    ): Promise<CommentPostedReponse> {
        const { commentMsg, comment_on_id, img, comment_on } = args;
        const { conn } = ctx;
        const attatchedImage = img ? img : "";

        const commentsRepo = conn.getRepository(Comment);
        const tweetRepo = conn.getRepository(Tweet);
        const imagesRepo = conn.getRepository(Images);

        let tweet: Tweet | undefined = undefined;

        try {
            const me = await userResolvers.me(ctx);
            if (!me.user)
                return { commented: false, error: "You are not logeed in " };

            if (comment_on === "tweet") {
                tweet = await tweetRepo.findOne({
                    where: { tweet_id: comment_on_id },
                });

                if (!tweet)
                    return { commented: false, error: "tweet not found" };

                tweet.comments++;
                await tweetRepo.manager.save(tweet);
            }

            const profileImg = await imagesRepo.findOne({
                where: { user: me.user, type: "profile" },
            });

            if (!profileImg)
                return { commented: false, error: "profile_img not found" };

            const newComment = commentsRepo.create({
                commentMsg,
                comment_on_id,
                comment_on,
                comment_by: me.user.id,
                username: me.user.username,
                name: me.user.name,
                profileImg: profileImg.url,
                likes: 0,
                comments: 0,
                img: attatchedImage,
                tweet,
            });

            await commentsRepo.manager.save(newComment);

            return { commented: true, error: null };
        } catch (error) {
            return { commented: false, error: error.message };
        }
    }

    @Mutation(() => LikeCommentResponse)
    @UseMiddleware(Auth)
    async likeComment(
        @Arg("args") args: LikeCommentInput,
        @Ctx() ctx: MyContext
    ): Promise<LikeCommentResponse> {
        const { comment_id } = args;
        const { conn, req } = ctx;

        const commentRepo = conn.getRepository(Comment);
        const likeRepo = conn.getRepository(Like);
        let liked = "unliked";

        try {
            const comment = await commentRepo.findOne({
                where: { comment_id },
            });

            if (!comment) return { liked, error: "Comment not found" };

            const like = await likeRepo.findOne({
                where: {
                    like_on: "comment",
                    like_on_id: comment_id,
                    user_id: req.session.userId,
                    tweet: null,
                },
            });

            if (!like) {
                const newLike = likeRepo.create({
                    like_on: "comment",
                    like_on_id: comment_id,
                    user_id: req.session.userId,
                    tweet: undefined,
                });

                comment.likes += 1;
                liked = "liked";

                await likeRepo.manager.save(newLike);
                await commentRepo.manager.save(comment);
            } else {
                comment.likes -= 1;
                liked = "unliked";
                await like.remove();
                await commentRepo.manager.save(comment);
            }

            return { error: null, liked };
        } catch (error) {
            console.log(error.message);
            return { error: error.message, liked };
        }
    }

    @Query(() => GetCommentResponse)
    @UseMiddleware(Auth)
    async getOneComment(
        @Ctx() { conn, req }: MyContext,
        @Arg("args") args: GetCommentInput
    ): Promise<GetCommentResponse> {
        const { comment_id, fetchFrom } = args;

        const commentRepo = conn.getRepository(Comment);
        const likeRepo = conn.getRepository(Like);

        try {
            const comment = await commentRepo.findOne({
                where: { comment_id, comment_on: fetchFrom },
            });

            if (!comment) return { comment: null, error: "Comment not found" };

            const like = await likeRepo.count({
                where: {
                    like_on_id: comment.comment_id,
                    like_on: "comment",
                    user_id: req.session.userId,
                },
            });

            return {
                error: null,
                comment: { ...comment, liked: like > 0 },
            };
        } catch (error) {
            console.log(error.message);
            return { error: error.message, comment: null };
        }
    }

    @Query(() => GetCommentsResponse)
    @UseMiddleware(Auth)
    async getComments(
        @Arg("args") args: GetCommentsInput,
        @Ctx() { conn }: MyContext
    ): Promise<GetCommentsResponse> {
        const { fetchFrom, postId } = args;
        const commentRepo = conn.getRepository(Comment);

        try {
            if (fetchFrom === "tweet") {
                const comments = await commentRepo.find({
                    where: { comment_on_id: postId },
                });

                return { comments, error: null };
            } else if (fetchFrom == "comment") {
                return { comments: [], error: null };
            } else {
                return { comments: [], error: null };
            }
        } catch (error) {
            return { comments: [], error: error.message };
        }
    }
}
