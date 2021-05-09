import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
