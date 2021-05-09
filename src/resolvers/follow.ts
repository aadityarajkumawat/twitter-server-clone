import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { FollowedAUser, UserToFollow } from "../constants";
import { Follow } from "../entities/Follow";
import { MyContext } from "../types";

@Resolver()
export class FollowResolver {
    @Mutation(() => FollowedAUser)
    async followAUser(
        @Arg("options") options: UserToFollow,
        @Ctx() { req }: MyContext
    ): Promise<FollowedAUser> {
        const { thatUser: following } = options;
        if (!req.session.userId) {
            return { error: "User is not authenticated", followed: false };
        }

        const isAlready = await Follow.findOne({
            where: [{ userId: req.session.userId, following }],
        });

        if (isAlready) {
            isAlready.remove();
            return { error: "", followed: false };
        }

        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Follow)
                .values({ following, userId: req.session.userId })
                .returning("*")
                .execute();

            return { error: "", followed: true };
        } catch (error) {
            return { error: error.message, followed: false };
        }
    }
}
