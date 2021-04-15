"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const express_session_1 = __importDefault(require("express-session"));
const constants_1 = require("./constants");
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = __importDefault(require("redis"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
const Tweets_1 = require("./entities/Tweets");
const user_1 = require("./resolvers/user");
const posts_1 = require("./resolvers/posts");
const Follow_1 = require("./entities/Follow");
const follow_1 = require("./resolvers/follow");
const http_1 = __importDefault(require("http"));
const Images_1 = require("./entities/Images");
const Profile_1 = require("./entities/Profile");
const search_1 = require("./resolvers/search");
const images_1 = require("./resolvers/images");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection({
        type: "postgres",
        url: "postgres://postgres:postgres@localhost:5432/twitter66",
        synchronize: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [User_1.User, Tweets_1.Tweet, Tweets_1.Like, Tweets_1.Comment, Follow_1.Follow, Images_1.Images, Profile_1.Profile],
    });
    const app = express_1.default();
    const pubsub = new apollo_server_express_1.PubSub();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redisClient = redis_1.default.createClient();
    app.use((req, _, next) => {
        req.pubsub = pubsub;
        next();
    });
    app.use(cors_1.default({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use(express_session_1.default({
        name: "qid",
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30 * 12 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.__prod__,
        },
        saveUninitialized: false,
        secret: "thisissomerandomwhichbecomesusajibrish",
        resave: false,
    }));
    const server = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [
                hello_1.HelloResolver,
                user_1.UserResolver,
                posts_1.PostsResolver,
                follow_1.FollowResolver,
                search_1.SearchResolver,
                images_1.ImgResolver,
            ],
            validate: false,
            pubSub: pubsub,
        }),
        context: ({ req, res }) => ({ req, res }),
        subscriptions: {
            onConnect() { },
            onDisconnect() { },
        },
    });
    server.applyMiddleware({ app, cors: false });
    const httpServer = http_1.default.createServer(app);
    server.installSubscriptionHandlers(httpServer);
    httpServer.listen(4001, () => {
        console.log(`server is at: http://localhost:4001${server.graphqlPath}`);
        console.log(`subscription is at: ws://localhost:4001${server.subscriptionsPath}`);
    });
});
main().catch((err) => {
    console.log(err.message);
});
//# sourceMappingURL=server.js.map