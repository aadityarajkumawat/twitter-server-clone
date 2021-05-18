import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { Comment, Images, Tweet } from "../entities";
import { Auth } from "../middlewares/Auth";
import {
    CommentInput,
    CommentPostedReponse,
    CommentRespose,
    GetCommentsInput,
    GetCommentsResponse,
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

    // @Mutation(() => LikeCommentResponse)
    // @UseMiddleware(Auth)
    // async likeComment(
    //     @Arg("args") args: LikeCommentInput,
    //     @Ctx() ctx: MyContext
    // ): Promise<LikeCommentResponse> {
    //     const { comment_id } = args;
    //     const { conn } = ctx;
    //     const commentRepo = conn.getRepository(Comment);

    //     try {
    //         const comment = await commentRepo.findOne({
    //             where: { comment_id },
    //         });
    //         if (!comment) return { liked: false, error: "Comment not found" };

    //         comment.likes += 1;
    //     } catch (error) {}
    // }

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
                const commentsWithLikedStatus: Array<CommentRespose> = [];

                for (let comment of comments) {
                    const commentWithLikedStatus: CommentRespose = {
                        commentMsg: comment.commentMsg,
                        comment_id: comment.comment_id,
                        comments: comment.comments,
                        img: comment.img,
                        liked: false,
                        likes: comment.likes,
                        name: comment.name,
                        profileImg: comment.profileImg,
                        username: comment.username,
                    };

                    // @TODO: Add liked status
                    // -> here

                    commentsWithLikedStatus.push(commentWithLikedStatus);
                }

                return { comments: commentsWithLikedStatus, error: null };
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
