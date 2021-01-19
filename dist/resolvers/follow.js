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
exports.FollowResolver = void 0;
const constants_1 = require("../constants");
const type_graphql_1 = require("type-graphql");
const Follow_1 = require("../entities/Follow");
const typeorm_1 = require("typeorm");
let FollowResolver = class FollowResolver {
    followAUser(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { thatUser: following } = options;
            if (!req.session.userId) {
                return { error: "User is not authenticated", followed: false };
            }
            const isAlready = yield Follow_1.Follow.findOne({
                where: [{ userId: req.session.userId, following }],
            });
            if (isAlready) {
                isAlready.remove();
                return { error: "", followed: false };
            }
            try {
                yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Follow_1.Follow)
                    .values({ following, userId: req.session.userId })
                    .returning("*")
                    .execute();
                return { error: "", followed: true };
            }
            catch (error) {
                return { error: error.message, followed: false };
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => constants_1.FollowedAUser),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.UserToFollow, Object]),
    __metadata("design:returntype", Promise)
], FollowResolver.prototype, "followAUser", null);
FollowResolver = __decorate([
    type_graphql_1.Resolver()
], FollowResolver);
exports.FollowResolver = FollowResolver;
//# sourceMappingURL=follow.js.map