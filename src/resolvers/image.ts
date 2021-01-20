import { createWriteStream } from "fs";
import { GraphQLUpload } from "graphql-upload";
import { Upload } from "../constants";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

@Resolver()
export class ImageResolver {
  @Mutation(() => Boolean)
  async addProfilePicture(
    @Arg("picture", () => GraphQLUpload)
    { createReadStream, filename }: Upload
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(__dirname + `/../../images/${filename}`))
        .on("finish", () => resolve(true))
        .on("error", () => reject(false))
    );
  }
}
