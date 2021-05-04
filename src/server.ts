import { ApolloServer, PubSub } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe/config";
import express from "express";
import session from "express-session";
import http from "http";
import path from "path";
import redis from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { Follow } from "./entities/Follow";
import { Images } from "./entities/Images";
import { Profile } from "./entities/Profile";
import { Like, Tweet } from "./entities/Tweets";
import { User } from "./entities/User";
import { FollowResolver } from "./resolvers/follow";
import { HelloResolver } from "./resolvers/hello";
import { ImgResolver } from "./resolvers/images";
import { PostActionResolver } from "./resolvers/postActions";
import { PostsResolver } from "./resolvers/posts";
import { SearchResolver } from "./resolvers/search";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    // logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Tweet, Like, Follow, Images, Profile],
  });

  // await conn.runMigrations();

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
        PostActionResolver,
      ],
      validate: false,
      pubSub: pubsub,
    }),
    context: ({ req, res }) => ({ req, res, conn }),
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
