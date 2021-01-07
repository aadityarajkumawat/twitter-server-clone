"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validSchemaLogin = exports.validSchemaRegister = exports.GetLikes = exports.UserToFollow = exports.FollowedAUser = exports.GetUserTweets = exports.GetTweetById = exports.GetTweet = exports.GetTweetResponse = exports.TweetInfo = exports.LikedTweet = exports.PostTweetInput = exports.PostCreatedResponse = exports.UserLoginInput = exports.UserRegisterInput = exports.FieldError = exports.UserResponse = exports.__prod__ = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("./entities/User");
const Yup = __importStar(require("yup"));
const Tweets_1 = require("./entities/Tweets");
exports.__prod__ = process.env.NODE_ENV === "production";
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
exports.UserResponse = UserResponse;
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
exports.FieldError = FieldError;
let UserRegisterInput = class UserRegisterInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "password", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "phone", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "name", void 0);
UserRegisterInput = __decorate([
    type_graphql_1.InputType()
], UserRegisterInput);
exports.UserRegisterInput = UserRegisterInput;
let UserLoginInput = class UserLoginInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserLoginInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserLoginInput.prototype, "password", void 0);
UserLoginInput = __decorate([
    type_graphql_1.InputType()
], UserLoginInput);
exports.UserLoginInput = UserLoginInput;
let PostCreatedResponse = class PostCreatedResponse {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PostCreatedResponse.prototype, "uploaded", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PostCreatedResponse.prototype, "error", void 0);
PostCreatedResponse = __decorate([
    type_graphql_1.ObjectType()
], PostCreatedResponse);
exports.PostCreatedResponse = PostCreatedResponse;
let PostTweetInput = class PostTweetInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostTweetInput.prototype, "tweet_content", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], PostTweetInput.prototype, "rel_acc", void 0);
PostTweetInput = __decorate([
    type_graphql_1.InputType()
], PostTweetInput);
exports.PostTweetInput = PostTweetInput;
let LikedTweet = class LikedTweet {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], LikedTweet.prototype, "liked", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], LikedTweet.prototype, "error", void 0);
LikedTweet = __decorate([
    type_graphql_1.ObjectType()
], LikedTweet);
exports.LikedTweet = LikedTweet;
let TweetInfo = class TweetInfo {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], TweetInfo.prototype, "tweet_id", void 0);
TweetInfo = __decorate([
    type_graphql_1.InputType()
], TweetInfo);
exports.TweetInfo = TweetInfo;
let GetTweetResponse = class GetTweetResponse {
};
__decorate([
    type_graphql_1.Field(() => GetTweet, { nullable: true }),
    __metadata("design:type", Object)
], GetTweetResponse.prototype, "tweet", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], GetTweetResponse.prototype, "error", void 0);
GetTweetResponse = __decorate([
    type_graphql_1.ObjectType()
], GetTweetResponse);
exports.GetTweetResponse = GetTweetResponse;
let GetTweet = class GetTweet {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetTweet.prototype, "tweet_id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetTweet.prototype, "tweet_content", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], GetTweet.prototype, "created_At", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetTweet.prototype, "_type", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetTweet.prototype, "rel_acc", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetTweet.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetTweet.prototype, "name", void 0);
GetTweet = __decorate([
    type_graphql_1.ObjectType()
], GetTweet);
exports.GetTweet = GetTweet;
let GetTweetById = class GetTweetById {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetTweetById.prototype, "tweet_id", void 0);
GetTweetById = __decorate([
    type_graphql_1.InputType()
], GetTweetById);
exports.GetTweetById = GetTweetById;
let GetUserTweets = class GetUserTweets {
};
__decorate([
    type_graphql_1.Field(() => [GetTweet]),
    __metadata("design:type", Array)
], GetUserTweets.prototype, "tweets", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetUserTweets.prototype, "error", void 0);
GetUserTweets = __decorate([
    type_graphql_1.ObjectType()
], GetUserTweets);
exports.GetUserTweets = GetUserTweets;
let FollowedAUser = class FollowedAUser {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], FollowedAUser.prototype, "followed", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FollowedAUser.prototype, "error", void 0);
FollowedAUser = __decorate([
    type_graphql_1.ObjectType()
], FollowedAUser);
exports.FollowedAUser = FollowedAUser;
let UserToFollow = class UserToFollow {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], UserToFollow.prototype, "thatUser", void 0);
UserToFollow = __decorate([
    type_graphql_1.InputType()
], UserToFollow);
exports.UserToFollow = UserToFollow;
let GetLikes = class GetLikes {
};
__decorate([
    type_graphql_1.Field(() => [Tweets_1.Like]),
    __metadata("design:type", Array)
], GetLikes.prototype, "likes", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetLikes.prototype, "error", void 0);
GetLikes = __decorate([
    type_graphql_1.ObjectType()
], GetLikes);
exports.GetLikes = GetLikes;
exports.validSchemaRegister = Yup.object().shape({
    email: Yup.string().email().required("Required"),
    password: Yup.string().min(8).max(15).required("Required"),
    username: Yup.string().min(3).max(15).required("Required"),
    phone: Yup.string().length(10).required("Required"),
});
exports.validSchemaLogin = Yup.object().shape({
    email: Yup.string().email().required("Required"),
    password: Yup.string().min(8).max(15).required("Required"),
});
//# sourceMappingURL=constants.js.map