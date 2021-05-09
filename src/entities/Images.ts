import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Images extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    image_id!: number;
    @Field(() => String)
    @Column()
    url: string;
    @Field(() => String)
    @Column()
    type: string;

    @ManyToOne(() => User, (user) => user.images)
    user: User;
}
