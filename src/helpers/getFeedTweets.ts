import { getConnection } from "typeorm";
import { Tweet } from "../entities/Tweets";

export const getFeedTweets = async (
    followingIds: Array<number>,
    userId: number
): Promise<Array<Tweet>> => {
    return await getConnection()
        .createQueryBuilder()
        .select("*")
        .from(Tweet, "tweet")
        .where("tweet.userId IN (:...ids)", {
            ids: [...followingIds, userId],
        })
        .limit(15)
        .orderBy("tweet.created_At", "DESC")
        .execute();
};

export const getNumberOfTweetsInFeed = async (
    followingIds: Array<number>,
    userId: number
): Promise<number> => {
    const s = await getConnection()
        .createQueryBuilder()
        .select("COUNT(*)")
        .from(Tweet, "tweet")
        .where("tweet.userId IN (:...ids)", {
            ids: [...followingIds, userId],
        })
        .execute();

    return parseInt(s[0].count);
};
