import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { createAuth, verifyRefreshTokenHash } from "../../lib/auth";
import { users } from "../../database";
import { eq } from "drizzle-orm";
import { refreshtokenValidator } from "../../routes_Validators/auth";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";

export const logoutRoute = new Hono<AppEnv>();

logoutRoute.post(
  "/logout",
  zValidator("json", refreshtokenValidator, validationError),
  async (c) => {
    const { refreshToken } = c.req.valid("json");
    const auth = createAuth(c.env);
    const db = c.get("db");

    let userId: string;
    try {
      const payload = await auth.verifyRefreshToken(refreshToken);
      userId = payload.user_id;
    } catch {
      return c.json({ error: "Refresh token is invalid" }, 401);
    }

    const user = await db
      .select({ refreshTokenHash: users.refreshTokenHash })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    if (!user.refreshTokenHash) {
      return c.json({ error: "Refresh token missing" }, 401);
    }

    const isVerified = await verifyRefreshTokenHash(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isVerified) {
      return c.json({ error: "Refresh tokens do not match" }, 401);
    }

    await db
      .update(users)
      .set({
        refreshTokenHash: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .run();

    return c.json({ message: "Logged out successfully" }, 200);
  },
);
