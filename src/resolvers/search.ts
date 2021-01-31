import { DisplayProfiles, Searched } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { Images } from "../entities/Images";

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

    console.log(profiles);

    const f = [];

    for (let i = 0; i < profiles.length; i++) {
      const ii = profiles[i].id;
      const user = await User.findOne({ where: { id: ii } });
      const img = await Images.findOne({ where: { user, type: "profile" } });
      f.push({ ...profiles[i], img: img ? img.url : "" });
    }

    console.log(f);

    return { error: null, profiles: f };
  }
}
