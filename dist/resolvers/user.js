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
let UserResolver = class UserResolver {
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
            return user;
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
};
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
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
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map