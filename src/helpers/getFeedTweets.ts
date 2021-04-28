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
    .limit(10)
    .orderBy("tweet.created_At", "DESC")
    .execute();
};

export const getNumberOfTweetsInFeed = async (
  followingIds: Array<number>,
  userId: number
): Promise<number> => {
  return await getConnection()
    .createQueryBuilder()
    .select("COUNT(*)")
    .from(Tweet, "tweet")
    .where("tweet.userId IN (:...ids)", {
      ids: [...followingIds, userId],
    })
    .execute();
};
