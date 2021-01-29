import { ImageParams } from "../constants";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Images } from "../entities/Images";
import { User } from "../entities/User";

@Resolver()
export class ImageResolver {
  @Mutation(() => Boolean)
  async addProfilePicture(
    @Arg("options") options: ImageParams,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    console.log(req.session);
    if (!req.session.userId) {
      return false;
    }

    const { url, type } = options;

    try {
      const user = await User.findOne({ where: { id: req.session.userId } });
      console.log("\n\n\n", user, "\n\n\n", req.session.userId);
      const image = Images.create({ url, type, user });
      await image.save();
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
