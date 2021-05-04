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
exports.CommentInput = exports.CommentPostedReponse = void 0;
const type_graphql_1 = require("type-graphql");
let CommentPostedReponse = class CommentPostedReponse {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], CommentPostedReponse.prototype, "commented", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", Object)
], CommentPostedReponse.prototype, "error", void 0);
CommentPostedReponse = __decorate([
    type_graphql_1.ObjectType()
], CommentPostedReponse);
exports.CommentPostedReponse = CommentPostedReponse;
let CommentInput = class CommentInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CommentInput.prototype, "commentMsg", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], CommentInput.prototype, "tweet_id", void 0);
CommentInput = __decorate([
    type_graphql_1.InputType()
], CommentInput);
exports.CommentInput = CommentInput;
//# sourceMappingURL=postActionTypes.js.map