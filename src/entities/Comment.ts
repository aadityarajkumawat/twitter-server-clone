import { Field, ObjectType } from "type-graphql";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tweet } from ".";

@ObjectType()
@Entity()
export class Comment {
    @Field()
    @PrimaryGeneratedColumn()
    comment_id!: number;

    @Field()
    @Column({ unique: true })
    comment_on_id!: number;

    @Field()
    @Column()
    comment_on!: string;

    @Field()
    @Column()
    comment_by!: number;

    @Field()
    @Column()
    commentMsg!: string;

    @Field(() => String)
    @CreateDateColumn()
    created_At!: string;

    @Field()
    @Column()
    username!: string;

    @Field()
    @Column()
    name!: string;

    @Field()
    @Column()
    profileImg!: string;

    @Field()
    @Column()
    likes!: number;

    @Field()
    @Column()
    comments!: number;

    @Field()
    @Column()
    img: string;

    @ManyToOne(() => Tweet, (tweet) => tweet.comment)
    tweet: Tweet;
}
