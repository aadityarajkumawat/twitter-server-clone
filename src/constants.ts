import { ObjectType, InputType, Field } from "type-graphql";
import { User } from "./entities/User";
import * as Yup from "yup";
import { Like } from "./entities/Tweets";
import { Stream } from "stream";

export const __prod__ = process.env.NODE_ENV === "production";

// User Authentication
@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@InputType()
export class UserRegisterInput {
  @Field()
  email: string;
  @Field()
  password: string;
  @Field()
  username: string;
  @Field()
  phone: string;
  @Field()
  name: string;
}

@InputType()
export class UserLoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

// Createa a tweet
@ObjectType()
export class PostCreatedResponse {
  @Field({ nullable: true })
  uploaded?: string;
  @Field({ nullable: true })
  error?: string;
}

@InputType()
export class PostTweetInput {
  @Field()
  tweet_content: string;
  @Field({ nullable: true })
  rel_acc?: number;
  @Field({ nullable: true })
  img?: string;
}

// Like a tweet
@ObjectType()
export class LikedTweet {
  @Field({ nullable: true })
  liked?: string;
  @Field({ nullable: true })
  error?: string;
}

@InputType()
export class TweetInfo {
  @Field()
  tweet_id!: number;
}

// Fetch a tweet
@ObjectType()
export class GetTweetResponse {
  @Field(() => GetOneTweet, { nullable: true })
  tweet?: GetOneTweet | null;
  @Field({ nullable: true })
  error: string;
}

@ObjectType()
export class GetOneTweet {
  @Field()
  tweet_id?: number;
  @Field()
  tweet_content?: string;
  @Field(() => String)
  created_At?: string;
  @Field()
  _type?: string;
  @Field()
  rel_acc?: number;
  @Field()
  username?: string;
  @Field()
  name?: string;
  @Field()
  likes?: number;
  @Field()
  comments?: number;
  @Field()
  liked?: boolean;
  @Field()
  profile_img: string;
  @Field()
  img: string;
}
@InputType()
export class GetTweetById {
  @Field()
  tweet_id?: number;
}

@ObjectType()
export class GetFeedTweets {
  @Field(() => [GetOneTweet])
  tweets: GetOneTweet[];
  @Field()
  error: string;
  @Field()
  num: number;
}

@ObjectType()
export class GetPaginatedFeedTweets {
  @Field(() => [GetOneTweet])
  tweets: GetOneTweet[];
  @Field()
  error: string;
}

@ObjectType()
export class GetUserTweets {
  @Field(() => [GetOneTweet])
  tweets: GetOneTweet[];
  @Field()
  error: string;
  @Field()
  num: number;
}

@ObjectType()
export class GetPaginatedUserTweets {
  @Field(() => [GetOneTweet])
  tweets: GetOneTweet[];
  @Field()
  error: string;
}

// Follow a user

@ObjectType()
export class FollowedAUser {
  @Field()
  followed!: boolean;
  @Field()
  error!: string;
}

@InputType()
export class UserToFollow {
  @Field()
  thatUser!: number;
}

@ObjectType()
export class GetLikes {
  @Field(() => [Like])
  likes: Like[];
  @Field()
  error: string;
}

@InputType()
export class PaginatingParams {
  @Field(() => Number)
  offset: number;
  @Field(() => Number)
  limit: number;
}

@InputType()
export class PaginatingUserParams {
  @Field(() => Number)
  offset: number;
  @Field(() => Number)
  limit: number;
  @Field(() => Number)
  id: number;
}

// Image Upload
export interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@ObjectType()
export class Profile {
  @Field(() => Number)
  followers: number;
  @Field(() => Number)
  following: number;
  @Field(() => String)
  bio: string;
  @Field(() => String)
  link: string;
  @Field(() => Number)
  num: number;
}

@ObjectType()
export class GetProfile {
  @Field(() => Profile)
  profile: Profile | null;
  @Field(() => String)
  error: string;
}

@InputType()
export class EditProfile {
  @Field(() => String)
  bio: string;
  @Field(() => String)
  link: string;
}

@ObjectType()
export class DisplayProfiles {
  @Field(() => [DisplayProfile])
  profiles: DisplayProfile[];
  @Field(() => String, { nullable: true })
  error: string | null;
}

@ObjectType()
export class DisplayProfile {
  @Field(() => String)
  name: string;
  @Field(() => String)
  username: string;
  @Field(() => Number)
  id: number;
  @Field(() => String)
  img: string;
}

@InputType()
export class Searched {
  @Field(() => String)
  search: string;
}

export type ImageTypes = "profile" | "cover" | "feed";

@InputType()
export class ImageParams {
  @Field(() => String)
  url!: string;
  @Field(() => String)
  type!: ImageTypes;
}

@ObjectType()
export class ProfileItems {
  @Field(() => String)
  profile_img: string;
  @Field(() => String)
  cover_img: string;
  @Field(() => String)
  name: string;
  @Field(() => String)
  username: string;
  @Field(() => String)
  bio: string;
  @Field(() => String)
  link: string;
  @Field(() => Number)
  followers: number;
  @Field(() => Number)
  following: number;
  @Field(() => Number)
  num: number;
}

@ObjectType()
export class ProfileStuff {
  @Field(() => ProfileItems)
  profile: ProfileItems | null;
  @Field(() => String)
  error: string;
}

export const validSchemaRegister = Yup.object().shape({
  email: Yup.string().email().required("Required"),
  password: Yup.string().min(8).max(15).required("Required"),
  username: Yup.string().min(3).max(15).required("Required"),
  phone: Yup.string().length(10).required("Required"),
});

export const validSchemaLogin = Yup.object().shape({
  email: Yup.string().email().required("Required"),
  password: Yup.string().min(8).max(15).required("Required"),
});
