import { Connection } from "typeorm";
import { Images, Tweet } from "../entities";
import { TweetWithLikedStatus, TweetWithProfileImage } from "../interfaces";
import { UserResolver } from "../resolvers/user";

const userResolvers = new UserResolver();

export const addProfileImageToTweets = async (
    tweetsWithLikedStatus: Array<TweetWithLikedStatus>,
    conn: Connection
) => {
    const tweetsWithProfileImage: Array<TweetWithProfileImage> = [];

    for (let i = 0; i < tweetsWithLikedStatus.length; i++) {
        const tweetRepo = conn.getRepository(Tweet);

        const tweetId = tweetsWithLikedStatus[i].tweet_id;
        const tweet = await tweetRepo.findOne({ where: { tweet_id: tweetId } });

        if (!tweet) return [];

        const user = await userResolvers.getUserByUsername(tweet.username);
        const img_url = await Images.findOne({
            where: { user, type: "profile" },
        });

        tweetsWithProfileImage.push({
            ...tweetsWithLikedStatus[i],
            profile_img: img_url ? img_url.url : "",
        });
    }

    return tweetsWithProfileImage;
};
