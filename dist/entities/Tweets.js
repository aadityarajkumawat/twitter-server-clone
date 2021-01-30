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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.Like = exports.Tweet = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Tweet = class Tweet extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Tweet.prototype, "tweet_id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ length: 100 }),
    __metadata("design:type", String)
], Tweet.prototype, "tweet_content", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", String)
], Tweet.prototype, "created_At", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Tweet.prototype, "_type", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Tweet.prototype, "rel_acc", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Tweet.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Tweet.prototype, "name", void 0);
__decorate([
    typeorm_1.ManyToOne(() => User_1.User, (user) => user.tweets),
    __metadata("design:type", User_1.User)
], Tweet.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Tweet.prototype, "likes", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Tweet.prototype, "comments", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Tweet.prototype, "img", void 0);
__decorate([
    typeorm_1.OneToMany(() => Like, (like) => like.tweet, {
        cascade: ["insert", "remove", "update"],
    }),
    __metadata("design:type", Array)
], Tweet.prototype, "like", void 0);
__decorate([
    typeorm_1.OneToMany(() => Comment, (comment) => comment.tweet, {
        cascade: ["insert", "remove", "update"],
    }),
    __metadata("design:type", Array)
], Tweet.prototype, "comment", void 0);
Tweet = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Tweet);
exports.Tweet = Tweet;
let Like = class Like extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.created_At = new Date();
    }
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Like.prototype, "like_id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Object)
], Like.prototype, "created_At", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Like.prototype, "user_id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Like.prototype, "tweet_id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Tweet, (tweet) => tweet.like),
    __metadata("design:type", Tweet)
], Like.prototype, "tweet", void 0);
Like = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Like);
exports.Like = Like;
let Comment = class Comment extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.created_At = new Date();
    }
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Comment.prototype, "comment_id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Object)
], Comment.prototype, "created_At", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Comment.prototype, "comment", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Tweet, (tweet) => tweet.comment),
    __metadata("design:type", Tweet)
], Comment.prototype, "tweet", void 0);
Comment = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Comment);
exports.Comment = Comment;
//# sourceMappingURL=Tweets.js.map