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
exports.PostsResolver = void 0;
const constants_1 = require("../constants");
const type_graphql_1 = require("type-graphql");
const Tweets_1 = require("../entities/Tweets");
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Follow_1 = require("../entities/Follow");
const triggers_1 = require("../triggers");
const Profile_1 = require("../entities/Profile");
const Images_1 = require("../entities/Images");
const user_1 = require("./user");
const userResolvers = new user_1.UserResolver();
let PostsResolver = class PostsResolver {
    createPost(options, { req }, pubsub) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tweet_content, rel_acc, img } = options;
            if (!req.session.userId) {
                return { error: "User is unauthorized" };
            }
            let post;
            try {
                const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
                let tweetType = "tweet";
                if (rel_acc) {
                    tweetType = "retweet";
                }
                else {
                    rel_acc = req.session.userId;
                }
                if (user) {
                    const result = yield typeorm_1.getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(Tweets_1.Tweet)
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
                    const payload = {
                        error: "",
                        tweet: Object.assign(Object.assign({}, post), { liked: false }),
                    };
                    yield pubsub.publish(triggers_1.TWEET, payload);
                }
            }
            catch (err) {
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
                let like = yield Tweets_1.Like.findOne({
                    where: { tweet_id, user_id: req.session.userId },
                });
                let img;
                if (tweet) {
                    const user = yield User_1.User.findOne({ where: { id: tweet.rel_acc } });
                    img = yield Images_1.Images.findOne({ where: { user, type: "profile" } });
                }
                if (tweet) {
                    return {
                        error: "",
                        tweet: Object.assign(Object.assign({}, tweet), { liked: like ? true : false, profile_img: img ? img.url : "", img: tweet.img }),
                    };
                }
                else {
                    return { error: "", tweet: null };
                }
            }
            catch (error) {
                return { error: error.message, tweet: null };
            }
        });
    }
    getTweetsByUser({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "User is unauthorized", tweets: [], num: 0 };
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
                    .limit(7)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const tw = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.userId IN (:...ids)", {
                    ids: [...followingIds, req.session.userId],
                })
                    .execute();
                const finalTweets = [];
                let like = yield Tweets_1.Like.find({ where: { user_id: req.session.userId } });
                for (let i = 0; i < tweets.length; i++) {
                    let currID = tweets[i].tweet_id;
                    let oo = Object.assign(Object.assign({}, tweets[i]), { liked: false });
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
                    const user = yield User_1.User.findOne({ where: { id: ii } });
                    const img_url = yield Images_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    f.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                return { error: "", tweets: f, num: tw.length };
            }
            catch (error) {
                return { error: error.message, tweets: [], num: 0 };
            }
        });
    }
    getPaginatedPosts({ req }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "User is unauthorized", tweets: [] };
            }
            const { limit, offset } = options;
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
                    .offset(offset)
                    .limit(limit)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield Tweets_1.Like.find({ where: { user_id: req.session.userId } });
                for (let i = 0; i < tweets.length; i++) {
                    let currID = tweets[i].tweet_id;
                    let oo = Object.assign(Object.assign({}, tweets[i]), { liked: false });
                    for (let j = 0; j < like.length; j++) {
                        if (like[j].tweet_id === currID) {
                            oo.liked = true;
                        }
                    }
                    finalTweets.push(oo);
                }
                const tweetsResponse = [];
                for (let i = 0; i < finalTweets.length; i++) {
                    const ii = finalTweets[i].rel_acc;
                    const user = yield User_1.User.findOne({ where: { id: ii } });
                    const img_url = yield Images_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    tweetsResponse.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                return { error: "", tweets: tweetsResponse };
            }
            catch (error) {
                if (error.code == "2201W") {
                    return { error: "you", tweets: [] };
                }
                return { error: error.message, tweets: [] };
            }
        });
    }
    likeTweet(options, { req }, pubsub) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tweet_id } = options;
            if (!req.session.userId) {
                return { error: "User is unauthorized", liked: "" };
            }
            let tweet = yield Tweets_1.Tweet.findOne({ where: { tweet_id } });
            let like = yield Tweets_1.Like.findOne({
                where: { user_id: req.session.userId, tweet },
            });
            let img;
            if (tweet) {
                const user = yield User_1.User.findOne({ where: { id: tweet.rel_acc } });
                img = yield Images_1.Images.findOne({ where: { user, type: "profile" } });
            }
            const tweetAfterLike = yield Tweets_1.Tweet.findOne({ where: { tweet_id } });
            if (like) {
                yield like.remove();
                let newLikes = 0;
                if (tweet) {
                    tweet.likes = tweet.likes - 1;
                    newLikes = tweet.likes;
                    yield tweet.save();
                }
                const payload = {
                    error: "",
                    tweet: Object.assign(Object.assign({}, tweetAfterLike), { liked: false, likes: newLikes, profile_img: img ? img.url : "", img: tweetAfterLike ? tweetAfterLike.img : "" }),
                };
                yield pubsub.publish(triggers_1.TWEET, payload);
                return { liked: "unliked", error: "" };
            }
            try {
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Tweets_1.Like)
                    .values({ tweet, user_id: req.session.userId, tweet_id })
                    .returning("*")
                    .execute();
                let newLikes = 0;
                if (tweet) {
                    tweet.likes = tweet.likes + 1;
                    newLikes = tweet.likes;
                    yield tweet.save();
                }
                like = result.raw[0];
                const payload = {
                    error: "",
                    tweet: Object.assign(Object.assign({}, tweetAfterLike), { liked: true, likes: newLikes, profile_img: img ? img.url : "", img: tweetAfterLike ? tweetAfterLike.img : "" }),
                };
                yield pubsub.publish(triggers_1.TWEET, payload);
            }
            catch (err) {
            }
            return { liked: `liked${like === null || like === void 0 ? void 0 : like.like_id}`, error: "" };
        });
    }
    listenTweets(tweet) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { id: (_a = tweet.tweet) === null || _a === void 0 ? void 0 : _a.rel_acc } });
            const img = yield Images_1.Images.findOne({ where: { user, type: "profile" } });
            if (img && tweet.tweet) {
                tweet.tweet.profile_img = img.url;
            }
            else if (tweet.tweet) {
                tweet.tweet.profile_img = "";
            }
            return tweet;
        });
    }
    getTweetsByUserF({ req }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "user is not authenticated", tweets: [], num: 0 };
            }
            try {
                const tweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.rel_acc = :id", {
                    id,
                })
                    .limit(5)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const allTweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.rel_acc = :id", {
                    id,
                })
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield Tweets_1.Like.find({ where: { user_id: id } });
                for (let i = 0; i < tweets.length; i++) {
                    let currID = tweets[i].tweet_id;
                    let oo = Object.assign(Object.assign({}, tweets[i]), { liked: false });
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
                    const user = yield User_1.User.findOne({ where: { id: ii } });
                    const img_url = yield Images_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    f.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                return { error: "", tweets: f, num: allTweets.length };
            }
            catch (error) {
                return { error, tweets: [], num: 0 };
            }
        });
    }
    getPaginatedUserTweets({ req }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "user is not authenticated", tweets: [] };
            }
            const { limit, offset, id } = options;
            try {
                const tweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.userId = :id", {
                    id,
                })
                    .offset(offset)
                    .limit(limit)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield Tweets_1.Like.find({ where: { user_id: id } });
                for (let i = 0; i < tweets.length; i++) {
                    let currID = tweets[i].tweet_id;
                    let oo = Object.assign(Object.assign({}, tweets[i]), { liked: false });
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
                    const user = yield User_1.User.findOne({ where: { id: ii } });
                    const img_url = yield Images_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    f.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                return { error: "", tweets: f };
            }
            catch (error) {
                if (error.code == "2201W") {
                    return { error: "you", tweets: [] };
                }
                return { error: error.message, tweets: [] };
            }
        });
    }
    getUserProfile({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "user is not authenticated", profile: null };
            }
            try {
                const following = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(Follow_1.Follow, "follow")
                    .where("follow.userId = :id", { id: req.session.userId })
                    .execute();
                const followers = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(Follow_1.Follow, "follow")
                    .where("follow.following = :id", { id: req.session.userId })
                    .execute();
                const n = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.rel_acc = :id", { id: req.session.userId })
                    .execute();
                const num = n[0].count;
                const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
                const profile = yield Profile_1.Profile.findOne({ where: { user } });
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
                }
                else {
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
            }
            catch (error) {
                return { error: error, profile: null };
            }
        });
    }
    editProfile({ req }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return false;
            }
            const { link, bio } = options;
            let result = false;
            try {
                const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
                const currentProfile = yield Profile_1.Profile.findOne({ where: { user } });
                if (currentProfile) {
                    currentProfile.bio = bio;
                    currentProfile.link = link;
                    yield currentProfile.save();
                    result = true;
                }
                else {
                    result = false;
                }
                return result;
            }
            catch (error) {
                return false;
            }
        });
    }
    profileStuffAndUserTweets(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getProfileStuff = userResolvers.getProfileStuff;
            const profileStuff = yield getProfileStuff(ctx, id);
            const userTweets = yield this.getTweetsByUserF(ctx, id);
            return {
                error: "",
                profile: profileStuff.profile,
                tweets: userTweets.tweets,
            };
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => constants_1.PostCreatedResponse),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.PostTweetInput, Object, type_graphql_1.PubSubEngine]),
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
    type_graphql_1.Query(() => constants_1.GetFeedTweets),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getTweetsByUser", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetPaginatedFeedTweets),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, constants_1.PaginatingParams]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getPaginatedPosts", null);
__decorate([
    type_graphql_1.Mutation(() => constants_1.LikedTweet),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.TweetInfo, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "likeTweet", null);
__decorate([
    type_graphql_1.Subscription(() => constants_1.GetTweetResponse, {
        topics: triggers_1.TWEET,
    }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.GetTweetResponse]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "listenTweets", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetUserTweets),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getTweetsByUserF", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetPaginatedUserTweets),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, constants_1.PaginatingUserParams]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getPaginatedUserTweets", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetProfile),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getUserProfile", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, constants_1.EditProfile]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "editProfile", null);
__decorate([
    type_graphql_1.Query(() => constants_1.ProfileStuffAndUserTweets),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "profileStuffAndUserTweets", null);
PostsResolver = __decorate([
    type_graphql_1.Resolver()
], PostsResolver);
exports.PostsResolver = PostsResolver;
//# sourceMappingURL=posts.js.map