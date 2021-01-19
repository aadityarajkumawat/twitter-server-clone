import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Images extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  image_id!: number;
  @Field(() => String)
  @Column()
  url: string;
}
