import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const Auth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session.userId) return;
  await next();
};
