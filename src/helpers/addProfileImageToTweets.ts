import { User } from "../entities/User";
import { Images } from "../entities/Images";
import { TweetWithLikedStatus, TweetWithProfileImage } from "../interfaces";

export const addProfileImageToTweets = async (
  tweetsWithLikedStatus: Array<TweetWithLikedStatus>
) => {
  const tweetsWithProfileImage: Array<TweetWithProfileImage> = [];

  for (let i = 0; i < tweetsWithLikedStatus.length; i++) {
    const tweetRelAcc = tweetsWithLikedStatus[i].rel_acc;

    const user = await User.findOne({ where: { id: tweetRelAcc } });
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
