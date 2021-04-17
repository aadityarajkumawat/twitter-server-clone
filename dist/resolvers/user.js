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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const typeorm_1 = require("typeorm");
const Profile_1 = require("../entities/Profile");
const Images_1 = require("../entities/Images");
const Follow_1 = require("../entities/Follow");
const Tweets_1 = require("../entities/Tweets");
let UserResolver = class UserResolver {
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "User not authenticated", user: undefined };
            }
            try {
                const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
                if (!user)
                    return { error: "No user", user: undefined };
                const img = yield Images_1.Images.findOne({ where: { user, type: "profile" } });
                if (!img)
                    return { error: "No image", user: undefined };
                const { id, email, createdAt, updatedAt, username, phone, name } = user;
                return {
                    error: undefined,
                    user: {
                        id,
                        email,
                        createdAt,
                        updatedAt,
                        username,
                        phone,
                        name,
                        img: img.url,
                    },
                };
            }
            catch (error) {
                return { error: error.message, user: undefined };
            }
        });
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, username, phone, name } = options;
            const optValid = constants_1.validSchemaRegister
                .validate(options)
                .then(() => {
                return { isCorrect: true, validationError: null };
            })
                .catch((err) => {
                return { isCorrect: false, validationError: err.message };
            });
            if ((yield optValid).isCorrect) {
                const hashedPossword = yield argon2_1.default.hash(password);
                let user;
                try {
                    let result = yield typeorm_1.getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(User_1.User)
                        .values({ email, password: hashedPossword, phone, username, name })
                        .returning("*")
                        .execute();
                    user = result.raw[0];
                    const profile = new Profile_1.Profile();
                    profile.bio = "";
                    profile.link = "";
                    profile.user = user;
                    yield profile.save();
                }
                catch (err) {
                    if (err.detail.includes("email")) {
                        return {
                            errors: [{ field: "email", message: "email already exist" }],
                        };
                    }
                    else if (err.detail.includes("phone")) {
                        return {
                            errors: [{ field: "phone", message: "phone already exist" }],
                        };
                    }
                }
                req.session.userId = user.id;
                return { user };
            }
            else {
                if ((yield optValid).validationError.includes("email")) {
                    return { errors: [{ field: "email", message: "email is incorrect" }] };
                }
                else if ((yield optValid).validationError.includes("phone")) {
                    return { errors: [{ field: "phone", message: "phone is incorrect" }] };
                }
                else if ((yield optValid).validationError.includes("password")) {
                    return {
                        errors: [
                            {
                                field: "password",
                                message: "password must have between 8 and 15 charcters",
                            },
                        ],
                    };
                }
                else {
                    return {
                        errors: [
                            {
                                field: "username",
                                message: "username must be between 3 and 15 charcters",
                            },
                        ],
                    };
                }
            }
        });
    }
    login(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = options;
            const optValid = constants_1.validSchemaLogin
                .validate(options)
                .then(() => {
                return { isCorrect: true, validationError: null };
            })
                .catch((err) => {
                return { isCorrect: false, validationError: err.message };
            });
            if ((yield optValid).isCorrect) {
                const user = yield User_1.User.findOne({ where: { email } });
                if (!user) {
                    return {
                        errors: [{ field: "email", message: "email does not exist" }],
                    };
                }
                const valid = yield argon2_1.default.verify(user.password, password);
                if (!valid) {
                    return {
                        errors: [{ field: "password", message: "incorrect password" }],
                    };
                }
                req.session.userId = user.id;
                console.log(req.session);
                return { user };
            }
            else {
                if ((yield optValid).validationError.includes("email")) {
                    return { errors: [{ field: "email", message: "email is incorrect" }] };
                }
                else {
                    return {
                        errors: [{ field: "password", message: "password is incorrect" }],
                    };
                }
            }
        });
    }
    getProfileStuff({ req }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return { error: "user not authenticated", profile: null };
            }
            try {
                const user = yield User_1.User.findOne({ where: { id } });
                const profile_img = yield Images_1.Images.findOne({
                    where: { user, type: "profile" },
                });
                const cover_img = yield Images_1.Images.findOne({
                    where: { user, type: "cover" },
                });
                const follow = yield Follow_1.Follow.findOne({
                    where: { userId: req.session.userId, following: id },
                });
                const profile = yield Profile_1.Profile.findOne({ where: { user } });
                const following = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(Follow_1.Follow, "follow")
                    .where("follow.userId = :id", { id })
                    .execute();
                const followers = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(Follow_1.Follow, "follow")
                    .where("follow.following = :id", { id })
                    .execute();
                const n = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .select("COUNT(*)")
                    .from(Tweets_1.Tweet, "tweet")
                    .where("tweet.rel_acc = :id", { id })
                    .execute();
                if (user && profile && following && followers) {
                    return {
                        error: "",
                        profile: {
                            bio: profile.bio,
                            cover_img: cover_img ? cover_img.url : "",
                            followers: followers[0].count,
                            following: following[0].count,
                            link: profile ? profile.link : "",
                            name: user.name,
                            profile_img: profile_img ? profile_img.url : "",
                            username: user.username,
                            num: n[0].count,
                            isFollowed: follow ? true : false,
                        },
                    };
                }
                else {
                    return {
                        error: "",
                        profile: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return { error: error.message, profile: null };
            }
        });
    }
};
__decorate([
    type_graphql_1.Query(() => constants_1.MeResponse, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => constants_1.UserResponse),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.UserRegisterInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => constants_1.UserResponse),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.UserLoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Query(() => constants_1.ProfileStuff),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getProfileStuff", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map