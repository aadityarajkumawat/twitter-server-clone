"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentResolver = void 0;
const type_graphql_1 = require("type-graphql");
const entities_1 = require("../entities");
const Auth_1 = require("../middlewares/Auth");
const postActionTypes_1 = require("../object-types/postActionTypes");
const user_1 = require("./user");
const userResolvers = new user_1.UserResolver();
let CommentResolver = class CommentResolver {
    postComment(args, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { commentMsg, comment_on_id, img, comment_on } = args;
            const { conn } = ctx;
            const attatchedImage = img ? img : "";
            const commentsRepo = conn.getRepository(entities_1.Comment);
            const tweetRepo = conn.getRepository(entities_1.Tweet);
            const imagesRepo = conn.getRepository(entities_1.Images);
            let tweet = undefined;
            try {
                const me = yield userResolvers.me(ctx);
                if (!me.user)
                    return { commented: false, error: "You are not logeed in " };
                if (comment_on === "tweet") {
                    tweet = yield tweetRepo.findOne({
                        where: { tweet_id: comment_on_id },
                    });
                    if (!tweet)
                        return { commented: false, error: "tweet not found" };
                    tweet.comments++;
                    yield tweetRepo.manager.save(tweet);
                }
                const profileImg = yield imagesRepo.findOne({
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
                yield commentsRepo.manager.save(newComment);
                return { commented: true, error: null };
            }
            catch (error) {
                return { commented: false, error: error.message };
            }
        });
    }
    likeComment(args, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { comment_id } = args;
            const { conn, req } = ctx;
            const commentRepo = conn.getRepository(entities_1.Comment);
            const likeRepo = conn.getRepository(entities_1.Like);
            let liked = "unliked";
            try {
                const comment = yield commentRepo.findOne({
                    where: { comment_id },
                });
                if (!comment)
                    return { liked, error: "Comment not found" };
                const like = yield likeRepo.findOne({
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
                    yield likeRepo.manager.save(newLike);
                    yield commentRepo.manager.save(comment);
                }
                else {
                    comment.likes -= 1;
                    liked = "unliked";
                    yield like.remove();
                    yield commentRepo.manager.save(comment);
                }
                return { error: null, liked };
            }
            catch (error) {
                console.log(error.message);
                return { error: error.message, liked };
            }
        });
    }
    getOneComment({ conn, req }, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { comment_id, fetchFrom } = args;
            const commentRepo = conn.getRepository(entities_1.Comment);
            const likeRepo = conn.getRepository(entities_1.Like);
            try {
                const comment = yield commentRepo.findOne({
                    where: { comment_id, comment_on: fetchFrom },
                });
                if (!comment)
                    return { comment: null, error: "Comment not found" };
                const like = yield likeRepo.count({
                    where: {
                        like_on_id: comment.comment_id,
                        like_on: "comment",
                        user_id: req.session.userId,
                    },
                });
                return {
                    error: null,
                    comment: Object.assign(Object.assign({}, comment), { liked: like > 0 }),
                };
            }
            catch (error) {
                console.log(error.message);
                return { error: error.message, comment: null };
            }
        });
    }
    getComments(args, { conn }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fetchFrom, postId } = args;
            const commentRepo = conn.getRepository(entities_1.Comment);
            try {
                if (fetchFrom === "tweet") {
                    const comments = yield commentRepo.find({
                        where: { comment_on_id: postId },
                    });
                    return { comments, error: null };
                }
                else if (fetchFrom == "comment") {
                    return { comments: [], error: null };
                }
                else {
                    return { comments: [], error: null };
                }
            }
            catch (error) {
                return { comments: [], error: error.message };
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => postActionTypes_1.CommentPostedReponse),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Arg("args")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postActionTypes_1.CommentInput, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "postComment", null);
__decorate([
    type_graphql_1.Mutation(() => postActionTypes_1.LikeCommentResponse),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Arg("args")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postActionTypes_1.LikeCommentInput, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "likeComment", null);
__decorate([
    type_graphql_1.Query(() => postActionTypes_1.GetCommentResponse),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("args")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, postActionTypes_1.GetCommentInput]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getOneComment", null);
__decorate([
    type_graphql_1.Query(() => postActionTypes_1.GetCommentsResponse),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Arg("args")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postActionTypes_1.GetCommentsInput, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getComments", null);
CommentResolver = __decorate([
    type_graphql_1.Resolver()
], CommentResolver);
exports.CommentResolver = CommentResolver;
//# sourceMappingURL=comment.js.map