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
    if (!req.session.userId) {
      return { error: "user not authenticated", profiles: [] };
    }

    const profiles = await getConnection()
      .createQueryBuilder()
      .select("name, username")
      .from(User, "user")
      .where("user.name LIKE :name", { name: `%${options.search}%` })
      .execute();

    return { error: null, profiles };
  }
}
