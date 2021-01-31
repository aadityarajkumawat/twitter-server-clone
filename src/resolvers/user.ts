import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { MyContext } from "src/types";
import {
  UserResponse,
  UserRegisterInput,
  validSchemaRegister,
  UserLoginInput,
  validSchemaLogin,
  ProfileStuff,
} from "../constants";
import { getConnection } from "typeorm";
import { Profile } from "../entities/Profile";
import { Images } from "../entities/Images";
import { Follow } from "../entities/Follow";
import { Tweet } from "../entities/Tweets";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne({ where: { id: req.session.userId } });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserRegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { email, password, username, phone, name } = options;
    const optValid = validSchemaRegister
      .validate(options)
      .then(() => {
        return { isCorrect: true, validationError: null };
      })
      .catch((err) => {
        return { isCorrect: false, validationError: err.message };
      });

    if ((await optValid).isCorrect) {
      const hashedPossword = await argon2.hash(password);
      let user;

      try {
        let result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({ email, password: hashedPossword, phone, username, name })
          .returning("*")
          .execute();

        user = result.raw[0];

        const profile = new Profile();
        profile.bio = "";
        profile.link = "";
        profile.user = user;
        await profile.save();
      } catch (err) {
        if (err.detail.includes("email")) {
          return {
            errors: [{ field: "email", message: "email already exist" }],
          };
        } else if (err.detail.includes("phone")) {
          return {
            errors: [{ field: "phone", message: "phone already exist" }],
          };
        }
      }
      req.session.userId = user.id;
      return { user };
    } else {
      if ((await optValid).validationError.includes("email")) {
        return { errors: [{ field: "email", message: "email is incorrect" }] };
      } else if ((await optValid).validationError.includes("phone")) {
        return { errors: [{ field: "phone", message: "phone is incorrect" }] };
      } else if ((await optValid).validationError.includes("password")) {
        return {
          errors: [
            {
              field: "password",
              message: "password must have between 8 and 15 charcters",
            },
          ],
        };
      } else {
        return {
          errors: [
            {
              field: "username",
              message: "username must be between 3 and 15 charcters",
            },
          ],
        };
      }
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserLoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { email, password } = options;

    const optValid = validSchemaLogin
      .validate(options)
      .then(() => {
        return { isCorrect: true, validationError: null };
      })
      .catch((err) => {
        return { isCorrect: false, validationError: err.message };
      });

    if ((await optValid).isCorrect) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return {
          errors: [{ field: "email", message: "email does not exist" }],
        };
      }

      const valid = await argon2.verify(user.password, password);
      if (!valid) {
        return {
          errors: [{ field: "password", message: "incorrect password" }],
        };
      }
      req.session.userId = user.id;
      console.log(req.session);
      return { user };
    } else {
      if ((await optValid).validationError.includes("email")) {
        return { errors: [{ field: "email", message: "email is incorrect" }] };
      } else {
        return {
          errors: [{ field: "password", message: "password is incorrect" }],
        };
      }
    }
  }

  @Query(() => ProfileStuff)
  async getProfileStuff(
    @Ctx() { req }: MyContext,
    @Arg("id") id: number
  ): Promise<ProfileStuff> {
    if (!req.session.userId) {
      return { error: "user not authenticated", profile: null };
    }

    try {
      const user = await User.findOne({ where: { id } });
      const profile_img = await Images.findOne({
        where: { user, type: "profile" },
      });

      const cover_img = await Images.findOne({
        where: { user, type: "cover" },
      });

      const profile = await Profile.findOne({ where: { user } });

      const following = await getConnection()
        .createQueryBuilder()
        .select("COUNT(*)")
        .from(Follow, "follow")
        .where("follow.userId = :id", { id })
        .execute();

      const followers = await getConnection()
        .createQueryBuilder()
        .select("COUNT(*)")
        .from(Follow, "follow")
        .where("follow.following = :id", { id })
        .execute();

      const n = await getConnection()
        .createQueryBuilder()
        .select("COUNT(*)")
        .from(Tweet, "tweet")
        .where("tweet.rel_acc = :id", { id })
        .execute();

      if (user && profile && following && followers) {
        return {
          error: "",
          profile: {
            bio: profile.bio,
            cover_img: cover_img ? cover_img.url : "",
            followers: followers[0].count,
            following: following[0].count,
            link: profile ? profile.link : "",
            name: user.name,
            profile_img: profile_img ? profile_img.url : "",
            username: user.username,
            num: n[0].count,
          },
        };
      } else {
        return {
          error: "",
          profile: null,
        };
      }
    } catch (error) {
      console.log(error.message);
      return { error: error.message, profile: null };
    }
  }
}
