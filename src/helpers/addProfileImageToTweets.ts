import { Tweet } from "../entities";
import { Images } from "../entities/Images";
import { User } from "../entities/User";
import { TweetWithLikedStatus, TweetWithProfileImage } from "../interfaces";

export const addProfileImageToTweets = async (
    tweetsWithLikedStatus: Array<TweetWithLikedStatus>
) => {
    const tweetsWithProfileImage: Array<TweetWithProfileImage> = [];

    for (let i = 0; i < tweetsWithLikedStatus.length; i++) {
        const tweetId = tweetsWithLikedStatus[i].tweet_id;
        const tweet = await Tweet.findOne({ where: { tweet_id: tweetId } });
        if (!tweet) return [];

        console.log(tweet.user);

        const user = await User.findOne({ where: { id: tweet.user.id } });
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
