import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Follow extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  follow_id!: number;
  @Field()
  @Column()
  userId!: number;
  @Field()
  @Column()
  following!: number;
}
