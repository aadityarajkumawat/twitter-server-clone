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
exports.PostActionResolver = void 0;
const type_graphql_1 = require("type-graphql");
const entities_1 = require("../entities");
const Auth_1 = require("../middlewares/Auth");
const Time_1 = require("../middlewares/Time");
const postActionTypes_1 = require("../object-types/postActionTypes");
let PostActionResolver = class PostActionResolver {
    commentOnTweet({ conn }, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { commentMsg, tweet_id } = args;
            const tweetRepository = conn.getRepository(entities_1.Tweet);
            const commentRepository = conn.getRepository(entities_1.Comment);
            try {
                const tweet = yield tweetRepository.findOne({ where: { tweet_id } });
                const newComment = commentRepository.create({
                    comment: commentMsg,
                    tweet,
                });
                yield commentRepository.manager.save(newComment);
                return { error: null, commented: true };
            }
            catch (error) {
                console.log(error.message);
                return { error: error.message, commented: false };
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => postActionTypes_1.CommentPostedReponse),
    type_graphql_1.UseMiddleware(Time_1.Time),
    type_graphql_1.UseMiddleware(Auth_1.Auth),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("args")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, postActionTypes_1.CommentInput]),
    __metadata("design:returntype", Promise)
], PostActionResolver.prototype, "commentOnTweet", null);
PostActionResolver = __decorate([
    type_graphql_1.Resolver()
], PostActionResolver);
exports.PostActionResolver = PostActionResolver;
//# sourceMappingURL=postActions.js.map