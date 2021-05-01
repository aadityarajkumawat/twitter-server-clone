import { Tweet } from "./entities/Tweets";

type BaseEntityFunctions =
  | "hasId"
  | "recover"
  | "remove"
  | "reload"
  | "save"
  | "softRemove";

type BetterTweet = Omit<Tweet, BaseEntityFunctions>;

export interface TweetWithLikedStatus extends BetterTweet {
  liked: boolean;
}

export interface TweetWithProfileImage extends TweetWithLikedStatus {
  profile_img: string;
}

export type ReturnCount = [{ count: number }];
