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
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const redis_1 = __importDefault(require("redis"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("./constants");
const entities_1 = require("./entities");
const follow_1 = require("./resolvers/follow");
const hello_1 = require("./resolvers/hello");
const images_1 = require("./resolvers/images");
const posts_1 = require("./resolvers/posts");
const search_1 = require("./resolvers/search");
const user_1 = require("./resolvers/user");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [entities_1.User, entities_1.Tweet, entities_1.Like, entities_1.Follow, entities_1.Images, entities_1.Profile, entities_1.Comment],
    });
    yield conn.runMigrations();
    const app = express_1.default();
    const pubsub = new apollo_server_express_1.PubSub();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redisClient = redis_1.default.createClient({ url: process.env.REDIS_URL });
    app.use((req, _, next) => {
        req.pubsub = pubsub;
        next();
    });
    app.set("trust proxy", 1);
    app.use(cors_1.default({
        origin: process.env.CORS_ORIGIN,
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
            domain: constants_1.__prod__ ? ".edydee.xyz" : undefined,
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
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
        context: ({ req, res }) => ({ req, res, conn }),
        subscriptions: {
            onConnect() { },
            onDisconnect() { },
        },
    });
    server.applyMiddleware({ app, cors: false });
    const httpServer = http_1.default.createServer(app);
    server.installSubscriptionHandlers(httpServer);
    httpServer.listen(parseInt(process.env.PORT), () => {
        console.log(`server is at: http://localhost:4001${server.graphqlPath}`);
        console.log(`subscription is at: ws://localhost:4001${server.subscriptionsPath}`);
    });
});
main().catch((err) => {
    console.log(err.message);
});
//# sourceMappingURL=server.js.map