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
const constants_1 = require("../constants");
const type_graphql_1 = require("type-graphql");
const Tweets_1 = require("../entities/Tweets");
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Follow_1 = require("../entities/Follow");
let PostsResolver = class PostsResolver {
    createPost(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tweet_content, rel_acc } = options;
            if (!req.session.userId) {
                return { error: "User is unauthorized" };
            }
            let post;
            try {
                const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
                if (rel_acc) {
                    const result = yield typeorm_1.getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(Tweets_1.Tweet)
                        .values({
                        user: yield User_1.User.findOne({ where: { id: req.session.userId } }),
                        tweet_content,
                        _type: "retweet",
                        rel_acc,
                        username: user === null || user === void 0 ? void 0 : user.username,
                        name: user === null || user === void 0 ? void 0 : user.name,
                    })
                        .returning("*")
                        .execute();
                    post = result.raw[0];
                }
                else {
                    const result = yield typeorm_1.getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(Tweets_1.Tweet)
                        .values({
                        user: yield User_1.User.findOne({ where: { id: req.session.userId } }),
                        tweet_content,
                        _type: "tweet",
                        rel_acc: req.session.userId,
                        username: user === null || user === void 0 ? void 0 : user.username,
                        name: user === null || user === void 0 ? void 0 : user.name,
                    })
                        .returning("*")
                        .execute();
                    post = result.raw[0];
                }
            }
            catch (err) {
                console.log(err);
            }
            return { error: "", uploaded: `uploaded${post.tweet_id}` };
        });
    }
    getTweetById(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tweet_id } = options;
            if (!req.session.userId) {
                return { error: "User is unauthorized", tweet: null };
            }
            try {
                let tweet = yield Tweets_1.Tweet.findOne({ where: { tweet_id } });
                return {
                    error: "",
                    tweet: {
                        _type: tweet === null || tweet === void 0 ? void 0 : tweet._type,
                        created_At: tweet === null || tweet === void 0 ? void 0 : tweet.created_At,
                        rel_acc: tweet === null || tweet === void 0 ? void 0 : tweet.rel_acc,
                        tweet_content: tweet === null || tweet === void 0 ? void 0 : tweet.tweet_content,
                        tweet_id: tweet === null || tweet === void 0 ? void 0 : tweet.tweet_id,
                        name: tweet === null || tweet === void 0 ? void 0 : tweet.name,
                        username: tweet === null || tweet === void 0 ? void 0 : tweet.username,
                    },
                };
            }
            catch (error) {
                return { error: error.message, tweet: null };
            }
        });
    }
    getTweetsByUser({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "User is unauthorized", tweets: [] };
            }
            try {
                const follow = yield Follow_1.Follow.find({
                    where: { userId: req.session.userId },
                });
                const followingIds = [];
                for (let i = 0; i < follow.length; i++) {
                    followingIds.push(follow[i].following);
                }
                const tweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.userId IN (:...ids)", {
                    ids: [...followingIds, req.session.userId],
                })
                    .orderBy("tweet.created_At", "ASC")
                    .execute();
                return { error: "", tweets };
            }
            catch (error) {
                console.log("err");
                return { error: error.message, tweets: [] };
            }
        });
    }
    likeTweet(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tweet_id } = options;
            if (!req.session.userId) {
                return { error: "User is unauthorized", liked: "" };
            }
            let tweet = yield Tweets_1.Tweet.findOne({ where: { tweet_id } });
            let like = yield Tweets_1.Like.findOne({ user_id: req.session.userId, tweet });
            if (like) {
                yield like.remove();
                return { liked: "unliked", error: "" };
            }
            try {
                let tweet = yield Tweets_1.Tweet.findOne({ where: { tweet_id } });
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Tweets_1.Like)
                    .values({ tweet, user_id: req.session.userId, tweet_id })
                    .returning("*")
                    .execute();
                like = result.raw[0];
            }
            catch (err) {
                console.log(err);
            }
            return { liked: `liked${like === null || like === void 0 ? void 0 : like.like_id}`, error: "" };
        });
    }
    getLikes({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { likes: [], error: "User is not authenticated" };
            }
            try {
                const likes = yield Tweets_1.Like.find({ where: { user_id: req.session.userId } });
                console.log(likes);
                return { likes, error: "" };
            }
            catch (error) {
                return { error: error.message, likes: [] };
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => constants_1.PostCreatedResponse),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.PostTweetInput, Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetTweetResponse),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.GetTweetById, Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getTweetById", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetUserTweets),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getTweetsByUser", null);
__decorate([
    type_graphql_1.Mutation(() => constants_1.LikedTweet),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.TweetInfo, Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "likeTweet", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetLikes),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getLikes", null);
PostsResolver = __decorate([
    type_graphql_1.Resolver()
], PostsResolver);
exports.PostsResolver = PostsResolver;
//# sourceMappingURL=posts.js.map