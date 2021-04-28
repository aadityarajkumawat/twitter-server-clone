import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const Time: MiddlewareFn<MyContext> = async ({ info }, next) => {
  const start = Date.now();
  await next();
  const resolveTime = Date.now() - start;
  console.log(`${info.parentType.name}.${info.fieldName} [${resolveTime} ms]`);
};
