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
    @Field({ defaultValue: false })
    liked!: boolean;
}

@ObjectType()
export class CommentResposeI {
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
    img!: string;
}

@ObjectType()
export class GetCommentResponse {
    @Field(() => CommentRespose, { nullable: true })
    comment!: CommentRespose | null;
    @Field(() => String, { nullable: true })
    error: string | null;
}

@InputType()
export class GetCommentInput {
    @Field()
    fetchFrom!: "tweet" | "comment";
    @Field()
    comment_id!: number;
}

@ObjectType()
export class GetCommentsResponse {
    @Field(() => [CommentResposeI])
    comments!: CommentResposeI[];
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
    @Field(() => String)
    liked!: string;
    @Field(() => String, { nullable: true })
    error: string | null;
}
