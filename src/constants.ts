import { ObjectType, InputType, Field } from "type-graphql";
import { User } from "./entities/User";
import * as Yup from "yup";
import { Like } from "./entities/Tweets";

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
  @Field(() => GetTweet, { nullable: true })
  tweet?: GetTweet | null;
  @Field({ nullable: true })
  error: string;
}

@ObjectType()
export class GetTweet {
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
}

@InputType()
export class GetTweetById {
  @Field()
  tweet_id?: number;
}

@ObjectType()
export class GetUserTweets {
  @Field(() => [GetTweet])
  tweets: GetTweet[];
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
