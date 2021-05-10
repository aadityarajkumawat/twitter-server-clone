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
    comment_on_id!: number;
    @Field()
    comment_on!: string;
    @Field()
    img: string;
}
