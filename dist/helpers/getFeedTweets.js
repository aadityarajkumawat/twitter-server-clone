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
exports.getNumberOfTweetsInFeed = exports.getFeedTweets = void 0;
const typeorm_1 = require("typeorm");
const Tweets_1 = require("../entities/Tweets");
const getFeedTweets = (followingIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield typeorm_1.getConnection()
        .createQueryBuilder()
        .select("*")
        .from(Tweets_1.Tweet, "tweet")
        .where("tweet.userId IN (:...ids)", {
        ids: [...followingIds, userId],
    })
        .limit(10)
        .orderBy("tweet.created_At", "DESC")
        .execute();
});
exports.getFeedTweets = getFeedTweets;
const getNumberOfTweetsInFeed = (followingIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield typeorm_1.getConnection()
        .createQueryBuilder()
        .select("COUNT(*)")
        .from(Tweets_1.Tweet, "tweet")
        .where("tweet.userId IN (:...ids)", {
        ids: [...followingIds, userId],
    })
        .execute();
});
exports.getNumberOfTweetsInFeed = getNumberOfTweetsInFeed;
//# sourceMappingURL=getFeedTweets.js.map