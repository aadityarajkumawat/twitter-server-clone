import { DisplayProfiles, Searched } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { getConnection } from "typeorm";

@Resolver()
export class SearchResolver {
  @Query(() => DisplayProfiles)
  async getSearchResults(
    @Ctx() { req }: MyContext,
    @Arg("options") options: Searched
  ): Promise<DisplayProfiles> {
    console.log(req.session);
    if (!req.session.userId) {
      return { error: "user not authenticated", profiles: [] };
    }

    const profiles = await getConnection()
      .createQueryBuilder()
      .select("name, username, id")
      .from(User, "user")
      .where("user.username LIKE :name", { name: `%${options.search}%` })
      .execute();

    return { error: null, profiles };
  }
}
