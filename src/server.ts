import "reflect-metadata";
import "dotenv-safe/config";
import express from "express";
import { ApolloServer, PubSub } from "apollo-server-express";
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
import http from "http";
import { Images } from "./entities/Images";
import { Profile } from "./entities/Profile";
import { SearchResolver } from "./resolvers/search";
import { ImgResolver } from "./resolvers/images";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    // logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Tweet, Like, Comment, Follow, Images, Profile],
  });

  await conn.runMigrations();

  const app = express();
  const pubsub = new PubSub();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({ url: process.env.REDIS_URL });

  app.use((req: any, _: any, next: any) => {
    req.pubsub = pubsub;
    next();
  });

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
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
        domain: __prod__ ? ".edydee.xyz" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        HelloResolver,
        UserResolver,
        PostsResolver,
        FollowResolver,
        SearchResolver,
        ImgResolver,
      ],
      validate: false,
      pubSub: pubsub,
    }),
    context: ({ req, res }) => ({ req, res }),
    subscriptions: {
      onConnect() {},
      onDisconnect() {},
    },
  });

  server.applyMiddleware({ app, cors: false });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(parseInt(process.env.PORT), () => {
    console.log(`server is at: http://localhost:4001${server.graphqlPath}`);
    console.log(
      `subscription is at: ws://localhost:4001${server.subscriptionsPath}`
    );
  });
};

main().catch((err) => {
  console.log(err.message);
});
