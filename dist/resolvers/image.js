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
exports.ImageResolver = void 0;
const constants_1 = require("../constants");
const type_graphql_1 = require("type-graphql");
const Images_1 = require("../entities/Images");
const User_1 = require("../entities/User");
let ImageResolver = class ImageResolver {
    addProfilePicture(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.session);
            if (!req.session.userId) {
                return false;
            }
            const { url, type } = options;
            try {
                const user = yield User_1.User.findOne({ where: { id: req.session.userId } });
                console.log("\n\n\n", user, "\n\n\n", req.session.userId);
                const image = Images_1.Images.create({ url, type, user });
                yield image.save();
                return true;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [constants_1.ImageParams, Object]),
    __metadata("design:returntype", Promise)
], ImageResolver.prototype, "addProfilePicture", null);
ImageResolver = __decorate([
    type_graphql_1.Resolver()
], ImageResolver);
exports.ImageResolver = ImageResolver;
//# sourceMappingURL=image.js.map