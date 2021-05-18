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

@ObjectType()
export class CommentRespose {
    @Field()
    comment_id!: number;
    @Field()
    profileImg!: string;
    @Field()
    name!: string;
    @Field()
    username!: string;
    @Field()
    commentMsg!: string;
    @Field()
    comments!: number;
    @Field()
    likes!: number;
    @Field()
    img!: string;
    @Field()
    liked!: boolean;
}

@ObjectType()
export class GetCommentsResponse {
    @Field(() => [CommentRespose])
    comments!: CommentRespose[];
    @Field(() => String, { nullable: true })
    error: string | null;
}

@InputType()
export class GetCommentsInput {
    @Field()
    fetchFrom!: "tweet" | "comment";
    @Field()
    postId!: number;
}

@InputType()
export class LikeCommentInput {
    @Field()
    comment_id!: number;
}

@ObjectType()
export class LikeCommentResponse {
    @Field(() => Boolean)
    liked!: boolean;
    @Field(() => String)
    error: string | null;
}
