import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class CommentPostedReponse {
  @Field()
  commented: boolean;
  @Field(() => String, { nullable: true })
  error: string | null;
}

@InputType()
export class CommentInput {
  @Field()
  commentMsg!: string;
  @Field()
  tweet_id!: number;
}
