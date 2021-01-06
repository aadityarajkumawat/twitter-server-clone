import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import session from "express-session";
import { __prod__ } from "./constants";
import connectRedis from "connect-redis";
import redis from "redis";
import cors from "cors";
import { createConnection } from "typeorm";
import path from "path";
import { User } from "./entities/User";
import { Comment, Like, Tweet } from "./entities/Tweets";
import { UserResolver } from "./resolvers/user";
import { PostsResolver } from "./resolvers/posts";
import { Follow } from "./entities/Follow";
import { FollowResolver } from "./resolvers/follow";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "AwS56$ds",
    database: "twitter66",
    logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Tweet, Like, Comment, Follow],
  });

  // await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 12 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: "thisissomerandomwhichbecomesusajibrish",
      resave: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostsResolver, FollowResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  server.applyMiddleware({ app, cors: false });

  app.listen(4000, () => console.log("server is running on port 4000"));
};

main().catch((err) => {
  console.log(err.message);
});
