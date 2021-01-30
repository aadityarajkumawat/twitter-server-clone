import { ImageParams } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Images } from "../entities/Images";

@Resolver()
export class ImgResolver {
  @Mutation(() => Boolean)
  async saveImage(
    @Ctx() { req }: MyContext,
    @Arg("options") options: ImageParams
  ): Promise<boolean> {
    console.log(req.session);
    if (!req.session.userId) {
      return false;
    }

    const { type, url } = options;

    try {
      const user = await User.findOne({ where: { id: req.session.userId } });
      const img = await Images.findOne({ where: { user, type } });

      if (img) {
        img.url = url;
        img.type = type;
        await img.save();
        return true;
      }

      const newImg = Images.create({ type, url, user });
      await newImg.save();

      return true;
    } catch (error) {
      return false;
    }
  }

  @Query(() => String, { nullable: true })
  async getProfileImage(
    @Ctx() { req }: MyContext,
    @Arg("id") id: number
  ): Promise<String | null> {
    if (!req.session.userId) {
      return null;
    }

    try {
      const user = await User.findOne({ where: { id } });
      const img = await Images.findOne({ where: { user } });
      if (img) {
        return img.url;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  @Query(() => String, { nullable: true })
  async getCoverImage(
    @Ctx() { req }: MyContext,
    @Arg("id") id: number
  ): Promise<String | null> {
    if (!req.session.userId) {
      return null;
    }

    try {
      const user = await User.findOne({ where: { id } });
      const img = await Images.findOne({ where: { user, type: "cover" } });
      if (img) {
        return img.url;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
