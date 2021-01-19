import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
