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
exports.validSchemaLogin = exports.validSchemaRegister = exports.ProfileStuff = exports.ProfileItems = exports.ImageParams = exports.Searched = exports.DisplayProfile = exports.DisplayProfiles = exports.EditProfile = exports.GetProfile = exports.Profile = exports.PaginatingParams = exports.GetLikes = exports.UserToFollow = exports.FollowedAUser = exports.GetPaginatedUserTweets = exports.GetUserTweets = exports.GetPaginatedFeedTweets = exports.GetFeedTweets = exports.GetTweetById = exports.GetOneTweet = exports.GetTweetResponse = exports.TweetInfo = exports.LikedTweet = exports.PostTweetInput = exports.PostCreatedResponse = exports.UserLoginInput = exports.UserRegisterInput = exports.FieldError = exports.UserResponse = exports.__prod__ = void 0;
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
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PostTweetInput.prototype, "img", void 0);
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
    type_graphql_1.Field(() => GetOneTweet, { nullable: true }),
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
let GetOneTweet = class GetOneTweet {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetOneTweet.prototype, "tweet_id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetOneTweet.prototype, "tweet_content", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], GetOneTweet.prototype, "created_At", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetOneTweet.prototype, "_type", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetOneTweet.prototype, "rel_acc", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetOneTweet.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetOneTweet.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetOneTweet.prototype, "likes", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetOneTweet.prototype, "comments", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], GetOneTweet.prototype, "liked", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetOneTweet.prototype, "profile_img", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetOneTweet.prototype, "img", void 0);
GetOneTweet = __decorate([
    type_graphql_1.ObjectType()
], GetOneTweet);
exports.GetOneTweet = GetOneTweet;
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
let GetFeedTweets = class GetFeedTweets {
};
__decorate([
    type_graphql_1.Field(() => [GetOneTweet]),
    __metadata("design:type", Array)
], GetFeedTweets.prototype, "tweets", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetFeedTweets.prototype, "error", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetFeedTweets.prototype, "num", void 0);
GetFeedTweets = __decorate([
    type_graphql_1.ObjectType()
], GetFeedTweets);
exports.GetFeedTweets = GetFeedTweets;
let GetPaginatedFeedTweets = class GetPaginatedFeedTweets {
};
__decorate([
    type_graphql_1.Field(() => [GetOneTweet]),
    __metadata("design:type", Array)
], GetPaginatedFeedTweets.prototype, "tweets", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetPaginatedFeedTweets.prototype, "error", void 0);
GetPaginatedFeedTweets = __decorate([
    type_graphql_1.ObjectType()
], GetPaginatedFeedTweets);
exports.GetPaginatedFeedTweets = GetPaginatedFeedTweets;
let GetUserTweets = class GetUserTweets {
};
__decorate([
    type_graphql_1.Field(() => [GetOneTweet]),
    __metadata("design:type", Array)
], GetUserTweets.prototype, "tweets", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetUserTweets.prototype, "error", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], GetUserTweets.prototype, "num", void 0);
GetUserTweets = __decorate([
    type_graphql_1.ObjectType()
], GetUserTweets);
exports.GetUserTweets = GetUserTweets;
let GetPaginatedUserTweets = class GetPaginatedUserTweets {
};
__decorate([
    type_graphql_1.Field(() => [GetOneTweet]),
    __metadata("design:type", Array)
], GetPaginatedUserTweets.prototype, "tweets", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetPaginatedUserTweets.prototype, "error", void 0);
GetPaginatedUserTweets = __decorate([
    type_graphql_1.ObjectType()
], GetPaginatedUserTweets);
exports.GetPaginatedUserTweets = GetPaginatedUserTweets;
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
let PaginatingParams = class PaginatingParams {
};
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], PaginatingParams.prototype, "offset", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], PaginatingParams.prototype, "limit", void 0);
PaginatingParams = __decorate([
    type_graphql_1.InputType()
], PaginatingParams);
exports.PaginatingParams = PaginatingParams;
let Profile = class Profile {
};
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], Profile.prototype, "followers", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], Profile.prototype, "following", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Profile.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Profile.prototype, "link", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], Profile.prototype, "num", void 0);
Profile = __decorate([
    type_graphql_1.ObjectType()
], Profile);
exports.Profile = Profile;
let GetProfile = class GetProfile {
};
__decorate([
    type_graphql_1.Field(() => Profile),
    __metadata("design:type", Object)
], GetProfile.prototype, "profile", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], GetProfile.prototype, "error", void 0);
GetProfile = __decorate([
    type_graphql_1.ObjectType()
], GetProfile);
exports.GetProfile = GetProfile;
let EditProfile = class EditProfile {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], EditProfile.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], EditProfile.prototype, "link", void 0);
EditProfile = __decorate([
    type_graphql_1.InputType()
], EditProfile);
exports.EditProfile = EditProfile;
let DisplayProfiles = class DisplayProfiles {
};
__decorate([
    type_graphql_1.Field(() => [DisplayProfile]),
    __metadata("design:type", Array)
], DisplayProfiles.prototype, "profiles", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", Object)
], DisplayProfiles.prototype, "error", void 0);
DisplayProfiles = __decorate([
    type_graphql_1.ObjectType()
], DisplayProfiles);
exports.DisplayProfiles = DisplayProfiles;
let DisplayProfile = class DisplayProfile {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], DisplayProfile.prototype, "url", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], DisplayProfile.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], DisplayProfile.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], DisplayProfile.prototype, "id", void 0);
DisplayProfile = __decorate([
    type_graphql_1.ObjectType()
], DisplayProfile);
exports.DisplayProfile = DisplayProfile;
let Searched = class Searched {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Searched.prototype, "search", void 0);
Searched = __decorate([
    type_graphql_1.InputType()
], Searched);
exports.Searched = Searched;
let ImageParams = class ImageParams {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ImageParams.prototype, "url", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ImageParams.prototype, "type", void 0);
ImageParams = __decorate([
    type_graphql_1.InputType()
], ImageParams);
exports.ImageParams = ImageParams;
let ProfileItems = class ProfileItems {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileItems.prototype, "profile_img", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileItems.prototype, "cover_img", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileItems.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileItems.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileItems.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileItems.prototype, "link", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], ProfileItems.prototype, "followers", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], ProfileItems.prototype, "following", void 0);
__decorate([
    type_graphql_1.Field(() => Number),
    __metadata("design:type", Number)
], ProfileItems.prototype, "num", void 0);
ProfileItems = __decorate([
    type_graphql_1.ObjectType()
], ProfileItems);
exports.ProfileItems = ProfileItems;
let ProfileStuff = class ProfileStuff {
};
__decorate([
    type_graphql_1.Field(() => ProfileItems),
    __metadata("design:type", Object)
], ProfileStuff.prototype, "profile", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], ProfileStuff.prototype, "error", void 0);
ProfileStuff = __decorate([
    type_graphql_1.ObjectType()
], ProfileStuff);
exports.ProfileStuff = ProfileStuff;
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