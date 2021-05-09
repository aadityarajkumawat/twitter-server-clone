import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Images } from "./Images";
import { Profile } from "./Profile";
import { Tweet } from "./Tweets";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: string;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: string;

    @Column()
    password!: string;

    @Field(() => String)
    @Column({ unique: true })
    username!: string;

    @Field(() => String)
    @Column()
    name!: string;

    @Field(() => String)
    @Column({ length: 10 })
    phone!: string;

    @OneToMany(() => Tweet, (tweet) => tweet.user, {
        cascade: ["insert", "remove", "update"],
    })
    tweets: Tweet[];

    @OneToOne(() => Profile, (profile) => profile.user, {
        cascade: ["insert", "remove", "update"],
    })
    profile: Profile;
    @OneToMany(() => Images, (images) => images.user, {
        cascade: ["insert", "recover", "update"],
    })
    images: Images[];
}
