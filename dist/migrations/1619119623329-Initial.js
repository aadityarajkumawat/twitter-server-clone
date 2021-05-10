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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initial1619119623329 = void 0;
class Initial1619119623329 {
    constructor() {
        this.name = "Initial1619119623329";
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "follow" ("follow_id" SERIAL NOT NULL, "userId" integer NOT NULL, "following" integer NOT NULL, CONSTRAINT "PK_a28c498eea8b783e08c326e5d02" PRIMARY KEY ("follow_id"))`);
            yield queryRunner.query(`CREATE TABLE "profile" ("profile_id" SERIAL NOT NULL, "bio" character varying NOT NULL, "link" character varying NOT NULL, "userId" integer, CONSTRAINT "REL_a24972ebd73b106250713dcddd" UNIQUE ("userId"), CONSTRAINT "PK_b0465dda30314a8786db3354a65" PRIMARY KEY ("profile_id"))`);
            yield queryRunner.query(`CREATE TABLE "tweet" ("tweet_id" SERIAL NOT NULL, "tweet_content" character varying(100) NOT NULL, "created_At" TIMESTAMP NOT NULL DEFAULT now(), "_type" character varying NOT NULL, "rel_acc" integer NOT NULL, "username" character varying NOT NULL, "name" character varying NOT NULL, "likes" integer NOT NULL, "comments" integer NOT NULL, "img" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_75fe7a2fec59c70e2add643e3e0" PRIMARY KEY ("tweet_id"))`);
            yield queryRunner.query(`CREATE TABLE "like" ("like_id" SERIAL NOT NULL, "created_At" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "tweet_id" integer NOT NULL, "tweetTweetId" integer, CONSTRAINT "PK_90999e6c2872ea84c11682a1762" PRIMARY KEY ("like_id"))`);
            yield queryRunner.query(`CREATE TABLE "comment" ("comment_id" SERIAL NOT NULL, "created_At" TIMESTAMP NOT NULL DEFAULT now(), "comment" character varying NOT NULL, "tweetTweetId" integer, CONSTRAINT "PK_6a9f9bf1cf9a09107d3224a0e9a" PRIMARY KEY ("comment_id"))`);
            yield queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "password" character varying NOT NULL, "username" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying(10) NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "images" ("image_id" SERIAL NOT NULL, "url" character varying NOT NULL, "type" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_c84a23d9d89dd5ea37c283c340e" PRIMARY KEY ("image_id"))`);
            yield queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_a24972ebd73b106250713dcddd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "tweet" ADD CONSTRAINT "FK_a9703cf826200a2d155c22eda96" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_f61dc588a5212f27ef7625d96bb" FOREIGN KEY ("tweetTweetId") REFERENCES "tweet"("tweet_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_cbf2e682ac291d5cd6bff3865e7" FOREIGN KEY ("tweetTweetId") REFERENCES "tweet"("tweet_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_96514329909c945f10974aff5f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_96514329909c945f10974aff5f8"`);
            yield queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_cbf2e682ac291d5cd6bff3865e7"`);
            yield queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_f61dc588a5212f27ef7625d96bb"`);
            yield queryRunner.query(`ALTER TABLE "tweet" DROP CONSTRAINT "FK_a9703cf826200a2d155c22eda96"`);
            yield queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_a24972ebd73b106250713dcddd9"`);
            yield queryRunner.query(`DROP TABLE "images"`);
            yield queryRunner.query(`DROP TABLE "user"`);
            yield queryRunner.query(`DROP TABLE "comment"`);
            yield queryRunner.query(`DROP TABLE "like"`);
            yield queryRunner.query(`DROP TABLE "tweet"`);
            yield queryRunner.query(`DROP TABLE "profile"`);
            yield queryRunner.query(`DROP TABLE "follow"`);
        });
    }
}
exports.Initial1619119623329 = Initial1619119623329;
//# sourceMappingURL=1619119623329-Initial.js.map