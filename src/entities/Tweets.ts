import { Field, ObjectType } from "type-graphql";
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Tweet extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  tweet_id!: number;

  @Field()
  @Column({ length: 100 })
  tweet_content!: string;

  @Field(() => String)
  @CreateDateColumn()
  created_At: string;

  @Field()
  @Column()
  _type!: string;

  @Field({ nullable: true })
  @Column()
  rel_acc: number;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.tweets)
  user: User;

  @Field()
  @Column()
  likes: number;

  @Field()
  @Column()
  comments: number;

  @OneToMany(() => Like, (like) => like.tweet, {
    cascade: ["insert", "remove", "update"],
  })
  like: Like[];

  @OneToMany(() => Comment, (comment) => comment.tweet, {
    cascade: ["insert", "remove", "update"],
  })
  comment: Comment[];
}

@ObjectType()
@Entity()
export class Like extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  like_id!: number;

  @Field(() => String)
  @CreateDateColumn()
  created_At = new Date();

  @Field()
  @Column()
  user_id!: number;

  @Field()
  @Column()
  tweet_id: number;

  @ManyToOne(() => Tweet, (tweet) => tweet.like)
  tweet: Tweet;
}

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  comment_id!: number;

  @Field(() => String)
  @CreateDateColumn()
  created_At = new Date();

  @Field()
  @Column()
  comment: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.comment)
  tweet: Tweet;
}
