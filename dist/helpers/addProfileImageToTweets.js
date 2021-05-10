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
const entities_1 = require("../entities");
const user_1 = require("../resolvers/user");
const userResolvers = new user_1.UserResolver();
const addProfileImageToTweets = (tweetsWithLikedStatus, conn) => __awaiter(void 0, void 0, void 0, function* () {
    const tweetsWithProfileImage = [];
    for (let i = 0; i < tweetsWithLikedStatus.length; i++) {
        const tweetRepo = conn.getRepository(entities_1.Tweet);
        const tweetId = tweetsWithLikedStatus[i].tweet_id;
        const tweet = yield tweetRepo.findOne({ where: { tweet_id: tweetId } });
        if (!tweet)
            return [];
        const user = yield userResolvers.getUserByUsername(tweet.username);
        const img_url = yield entities_1.Images.findOne({
            where: { user, type: "profile" },
        });
        tweetsWithProfileImage.push(Object.assign(Object.assign({}, tweetsWithLikedStatus[i]), { profile_img: img_url ? img_url.url : "" }));
    }
    return tweetsWithProfileImage;
});
exports.addProfileImageToTweets = addProfileImageToTweets;
//# sourceMappingURL=addProfileImageToTweets.js.map