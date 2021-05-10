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
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const entities_1 = require("../entities");
const addLikedStatusToTweets_1 = require("../helpers/addLikedStatusToTweets");
const addProfileImageToTweets_1 = require("../helpers/addProfileImageToTweets");
const dataOnSteroids_1 = require("../helpers/dataOnSteroids");
const getFeedTweets_1 = require("../helpers/getFeedTweets");
const Auth_1 = require("../middlewares/Auth");
const Time_1 = require("../middlewares/Time");
const postActionTypes_1 = require("../object-types/postActionTypes");
const triggers_1 = require("../triggers");
const user_1 = require("./user");
const userResolvers = new user_1.UserResolver();
let PostsResolver = class PostsResolver {
    constructor() {
        this.userTweets = [];
    }
    createPost(options, { req, conn }, pubsub) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tweet_content, img } = options;
            try {
                const user = yield entities_1.User.findOne({
                    where: { id: req.session.userId },
                });
                if (!user)
                    return { error: "user not found", uploaded: "" };
                const tweetRepo = conn.getRepository(entities_1.Tweet);
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
                const post = yield tweetRepo.manager.save(newTweet);
                const profileI = yield entities_1.Images.findOne({ where: { user } });
                if (!profileI)
                    return { error: "images not found", uploaded: "" };
                const payload = {
                    error: "",
                    tweet: Object.assign(Object.assign({}, post), { liked: false, profile_img: profileI.url }),
                };
                yield pubsub.publish(triggers_1.TWEET, payload);
                this.userTweets = [payload.tweet, ...this.userTweets];
                yield pubsub.publish(triggers_1.USER_TWEETS, [payload.tweet]);
                const __data__ = {
                    error: "",
                    uploaded: `uploaded${post.tweet_id}`,
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
            }
            catch (err) {
                return { error: err.message, uploaded: "" };
            }
        });
    }
    getTweetById(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tweet_id } = options;
            try {
                let tweet = yield entities_1.Tweet.findOne({ where: { tweet_id } });
                if (!tweet)
                    return { error: "Tweet not found", tweet: undefined };
                let like = yield entities_1.Like.findOne({
                    where: { tweet_id, user_id: req.session.userId },
                });
                let img;
                if (tweet) {
                    const user = yield entities_1.User.findOne({
                        where: { id: tweet.user.id },
                    });
                    img = yield entities_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                }
                if (!tweet)
                    return { error: "tweet not found", tweet: undefined };
                const __data__ = {
                    error: "",
                    tweet: Object.assign(Object.assign({}, tweet), { liked: like ? true : false, profile_img: img ? img.url : "", img: tweet.img }),
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
            }
            catch (error) {
                return { error: error.message, tweet: undefined };
            }
        });
    }
    getTweetsByUser({ req, conn }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.session.userId;
                const follow = yield entities_1.Follow.find({ where: { userId } });
                const followingIds = [];
                for (let i = 0; i < follow.length; i++) {
                    followingIds.push(follow[i].following);
                }
                const tweets = yield getFeedTweets_1.getFeedTweets(followingIds, userId);
                const numberOfTweetsInFeed = yield getFeedTweets_1.getNumberOfTweetsInFeed(followingIds, userId);
                const tweetsWithLikedStatus = yield addLikedStatusToTweets_1.addLikedStatusToTweets(tweets, userId);
                const tweetsWithProfileImage = yield addProfileImageToTweets_1.addProfileImageToTweets(tweetsWithLikedStatus, conn);
                const __data__ = {
                    error: undefined,
                    tweets: tweetsWithProfileImage,
                    num: numberOfTweetsInFeed,
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
            }
            catch (error) {
                return { error: error.message, tweets: undefined, num: undefined };
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
                const follow = yield entities_1.Follow.find({
                    where: { userId: req.session.userId },
                });
                const followingIds = [];
                for (let i = 0; i < follow.length; i++) {
                    followingIds.push(follow[i].following);
                }
                const tweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(entities_1.Tweet, "tweet")
                    .where("tweet.userId IN (:...ids)", {
                    ids: [...followingIds, req.session.userId],
                })
                    .offset(offset)
                    .limit(limit)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield entities_1.Like.find({
                    where: { user_id: req.session.userId },
                });
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
                    const user = userResolvers.getUserByUsername(finalTweets[i].username);
                    const img_url = yield entities_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    tweetsResponse.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                const __data__ = {
                    error: "",
                    tweets: tweetsResponse,
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
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
            let tweet = yield entities_1.Tweet.findOne({ where: { tweet_id } });
            let like = yield entities_1.Like.findOne({
                where: { user_id: req.session.userId, tweet },
            });
            let img;
            if (tweet) {
                const user = yield entities_1.User.findOne({ where: { id: tweet.user.id } });
                img = yield entities_1.Images.findOne({ where: { user, type: "profile" } });
            }
            const tweetAfterLike = yield entities_1.Tweet.findOne({ where: { tweet_id } });
            if (!tweetAfterLike)
                return { error: "tweet not found", liked: "__no_status__" };
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
                    .into(entities_1.Like)
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
            catch (err) { }
            return { liked: `liked${like === null || like === void 0 ? void 0 : like.like_id}`, error: "" };
        });
    }
    triggerUserTweetsSubscriptions(id, pubsub) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(entities_1.Tweet, "tweet")
                    .where("tweet.userId = :id", {
                    id,
                })
                    .limit(15)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield entities_1.Like.find({ where: { user_id: id } });
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
                const userTweets = [];
                for (let i = 0; i < finalTweets.length; i++) {
                    const ii = finalTweets[i].user.id;
                    const user = yield entities_1.User.findOne({ where: { id: ii } });
                    const img_url = yield entities_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    userTweets.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                this.userTweets = userTweets;
                yield pubsub.publish(triggers_1.USER_TWEETS, userTweets);
                return true;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    listenUserTweets({ conn: connection }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tweetRepository = connection.getRepository(entities_1.Tweet);
                const userRepository = connection.getRepository(entities_1.User);
                const user = yield userRepository.findOne({ where: { id } });
                const num = yield tweetRepository.count({ where: { user } });
                const tweets = this.userTweets;
                return { error: undefined, num, tweets };
            }
            catch (error) {
                return { error: error.message, num: undefined, tweets: [] };
            }
        });
    }
    listenTweets(tweet) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!tweet.tweet)
                return { error: "no tweet found", tweet: undefined };
            const thatTweetThough = yield entities_1.Tweet.findOne({
                where: { tweet_id: (_a = tweet.tweet) === null || _a === void 0 ? void 0 : _a.tweet_id },
            });
            if (!thatTweetThough)
                return { error: "tweet not posted", tweet: undefined };
            const user = userResolvers.getUserByUsername(tweet.tweet.username);
            const img = yield entities_1.Images.findOne({ where: { user, type: "profile" } });
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
                    .from(entities_1.Tweet, "tweet")
                    .where("tweet.userId = :id", {
                    id,
                })
                    .limit(15)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const allTweets = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("*")
                    .from(entities_1.Tweet, "tweet")
                    .where("tweet.userId = :id", {
                    id,
                })
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield entities_1.Like.find({ where: { user_id: id } });
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
                    const user = userResolvers.getUserByUsername(finalTweets[i].username);
                    const img_url = yield entities_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    f.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                const __data__ = {
                    error: "",
                    tweets: f,
                    num: allTweets.length,
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
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
                    .from(entities_1.Tweet, "tweet")
                    .where("tweet.userId = :id", {
                    id,
                })
                    .offset(offset)
                    .limit(limit)
                    .orderBy("tweet.created_At", "DESC")
                    .execute();
                const finalTweets = [];
                let like = yield entities_1.Like.find({ where: { user_id: id } });
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
                    const ii = finalTweets[i].user.id;
                    const user = yield entities_1.User.findOne({ where: { id: ii } });
                    const img_url = yield entities_1.Images.findOne({
                        where: { user, type: "profile" },
                    });
                    f.push(Object.assign(Object.assign({}, finalTweets[i]), { profile_img: img_url ? img_url.url : "" }));
                }
                const __data__ = { error: "", tweets: f };
                return dataOnSteroids_1.dataOnSteroids(__data__);
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
                    .from(entities_1.Follow, "follow")
                    .where("follow.userId = :id", { id: req.session.userId })
                    .execute();
                const followers = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(entities_1.Follow, "follow")
                    .where("follow.following = :id", { id: req.session.userId })
                    .execute();
                const n = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(entities_1.Tweet, "tweet")
                    .where("tweet.userId = :id", { id: req.session.userId })
                    .execute();
                const num = n[0].count;
                const user = yield entities_1.User.findOne({
                    where: { id: req.session.userId },
                });
                const profile = yield entities_1.Profile.findOne({ where: { user } });
                if (!profile)
                    return { error: "profile not found", profile: null };
                const { link, bio } = profile;
                const __data__ = {
                    error: "",
                    profile: {
                        followers: followers[0].count,
                        following: following[0].count,
                        bio,
                        link,
                        num,
                    },
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
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
                const user = yield entities_1.User.findOne({
                    where: { id: req.session.userId },
                });
                const currentProfile = yield entities_1.Profile.findOne({ where: { user } });
                if (currentProfile) {
                    currentProfile.bio = bio;
                    currentProfile.link = link;
                    yield currentProfile.save();
                    result = true;
                }
                else {
                    result = false;
                }
                const __data__ = result;
                return dataOnSteroids_1.dataOnSteroids(__data__);
            }
            catch (error) {
                return false;
            }
        });
    }
    profileStuffAndUserTweets(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getProfileStuff = userResolvers.getProfileStuff;
            try {
                const profileStuff = yield getProfileStuff(ctx, id);
                const userTweets = yield this.getTweetsByUserF(ctx, id);
                const __data__ = {
                    error: "",
                    profile: profileStuff.profile,
                    tweets: userTweets.tweets,
                };
                return dataOnSteroids_1.dataOnSteroids(__data__);
            }
            catch (error) {
                console.log(error.message);
                return { error: error.message, profile: null, tweets: null };
            }
        });
    }
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
};
__decorate([
    type_graphql_1.Mutation(() => constants_1.PostCreatedResponse),
    type_graphql_1.UseMiddleware(Time_1.Time),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.PostTweetInput, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetTweetResponse),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.GetTweetById, Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getTweetById", null);
__decorate([
    type_graphql_1.Query(() => constants_1.GetFeedTweets),
    type_graphql_1.UseMiddleware(Time_1.Time),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
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
    type_graphql_1.Query(() => Boolean),
    __param(0, type_graphql_1.Arg("id")),
    __param(1, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "triggerUserTweetsSubscriptions", null);
__decorate([
    type_graphql_1.Subscription(() => constants_1.SubUserTweets, { topics: triggers_1.USER_TWEETS }),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "listenUserTweets", null);
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
__decorate([
    type_graphql_1.Mutation(() => postActionTypes_1.CommentPostedReponse),
    __param(0, type_graphql_1.Arg("args")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postActionTypes_1.CommentInput, Object]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "postComment", null);
PostsResolver = __decorate([
    type_graphql_1.Resolver()
], PostsResolver);
exports.PostsResolver = PostsResolver;
//# sourceMappingURL=posts.js.map