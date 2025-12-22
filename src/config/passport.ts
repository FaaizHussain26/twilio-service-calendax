import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { pgPool } from "./pg";
import { variables } from "../constants/variables";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: variables.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload: any, done: any) => {
    try {
      const { rows } = await pgPool.query(
        "SELECT id, email, role, name FROM users WHERE id = $1 LIMIT 1",
        [jwt_payload.id]
      );
      const user = rows[0];
      if (user) return done(null, user);
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);
