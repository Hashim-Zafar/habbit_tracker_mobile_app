import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { loginValidator } from "../../routes_Validators/auth";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";
import { users } from "../../database";
import { eq } from "drizzle-orm";
import { createAuth, hashRefreshToken, verifyPassword } from "../../lib/auth";

export const loginRoute = new Hono<AppEnv>();

loginRoute.post(
  "/login",
  zValidator("json", loginValidator, validationError),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const db = c.get("db");
    const auth = createAuth(c.env);

    // 1. check if a user with the given email exsists
    const user = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .get();
    // 2 . guard clause if user does not exsist
    if (!user) {
      return c.json({ error: "No account with this email exsists" }, 404);
    }
    // 3. verify the password
    const validPassword = await verifyPassword(password, user.passwordHash);
    // 4. guard clause if password is invalid
    if (!validPassword) {
      return c.json({ error: "Invalid password" }, 401);
    }
    // 5. if password is valid we will generate access and refresh tokens
    const accessToken = await auth.generateAccessToken(user.id);
    const refreshToken = await auth.generateRefreshToken(user.id);
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    // 6. update the user refresh token hash in the database
    await db
      .update(users)
      .set({ refreshTokenHash: refreshTokenHash })
      .where(eq(users.id, user.id))
      .run();
    // 7. return the access and refresh tokens to the client
    return c.json({ accessToken, refreshToken });
  },
);
