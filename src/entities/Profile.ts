import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  profile_id: number;
  @Field(() => String)
  @Column()
  bio: string;
  @Field(() => String)
  @Column()
  link: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
