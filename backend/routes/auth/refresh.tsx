import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import {
  createAuth,
  verifyRefreshTokenHash,
  hashRefreshToken,
} from "../../lib/auth";
import { users } from "../../database";
import { eq } from "drizzle-orm";
import { refreshtokenValidator } from "../../routes_Validators/auth";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";

export const refreshRoute = new Hono<AppEnv>();

refreshRoute.post(
  "/refresh",
  zValidator("json", refreshtokenValidator, validationError),
  async (c) => {
    const { refreshToken } = c.req.valid("json");
    const auth = createAuth(c.env);
    const db = c.get("db");
    // 1. verify refresh token and extract the user ID from the payload
    let userId: string;
    try {
      const payload = await auth.verifyRefreshToken(refreshToken);
      userId = payload.user_id;
    } catch {
      return c.json({ error: "Refresh token is invalid" }, 401);
    }
    // 2.  fetch the previously stored refresh token
    const user = await db
      .select({ refreshTokenHash: users.refreshTokenHash })
      .from(users)
      .where(eq(users.id, userId))
      .get();
    //3 . guard clauses
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    if (!user.refreshTokenHash) {
      return c.json({ error: "Refresh token missing" }, 401);
    }
    // 4. check if the refresh token is verified
    const isVerified = await verifyRefreshTokenHash(
      refreshToken,
      user.refreshTokenHash,
    );
    // 5. guard clause
    if (!isVerified) {
      return c.json({ error: "Refresh tokens do not match" }, 401);
    }
    // 6. generate new access and refresh tokens
    const newAccessToken = await auth.generateAccessToken(userId);
    const newRefreshToken = await auth.generateRefreshToken(userId);
    // 7. Hash the new refresh token and store it in the db
    const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
    await db
      .update(users)
      .set({ refreshTokenHash: newRefreshTokenHash })
      .where(eq(users.id, userId))
      .run();
    // 8. return the new tokens
    return c.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  },
);
