"use strict";
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
exports.addProfileImageToTweets = void 0;
const User_1 = require("../entities/User");
const Images_1 = require("../entities/Images");
const addProfileImageToTweets = (tweetsWithLikedStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const tweetsWithProfileImage = [];
    for (let i = 0; i < tweetsWithLikedStatus.length; i++) {
        const tweetRelAcc = tweetsWithLikedStatus[i].rel_acc;
        const user = yield User_1.User.findOne({ where: { id: tweetRelAcc } });
        const img_url = yield Images_1.Images.findOne({
            where: { user, type: "profile" },
        });
        tweetsWithProfileImage.push(Object.assign(Object.assign({}, tweetsWithLikedStatus[i]), { profile_img: img_url ? img_url.url : "" }));
    }
    return tweetsWithProfileImage;
});
exports.addProfileImageToTweets = addProfileImageToTweets;
//# sourceMappingURL=addProfileImageToTweets.js.map