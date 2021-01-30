import { MyContext } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class PagResolver {
  @Query(() => String)
  hi(@Ctx() f: MyContext) {
    console.log(f.req.session);
    return "LOL";
  }
}
