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
exports.addLikedStatusToTweets = void 0;
const Tweets_1 = require("../entities/Tweets");
const addLikedStatusToTweets = (tweets, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const tweetsWithLikedStatus = [];
    for (let i = 0; i < tweets.length; i++) {
        let currID = tweets[i].tweet_id;
        let tweetWithLikedStatus = Object.assign(Object.assign({}, tweets[i]), { liked: false });
        const numberOfLikes = yield Tweets_1.Like.count({
            where: { user_id, like_on_id: currID },
        });
        if (numberOfLikes === 1) {
            tweetWithLikedStatus.liked = true;
        }
        tweetsWithLikedStatus.push(tweetWithLikedStatus);
    }
    return tweetsWithLikedStatus;
});
exports.addLikedStatusToTweets = addLikedStatusToTweets;
//# sourceMappingURL=addLikedStatusToTweets.js.map