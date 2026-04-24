import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { registerValidator } from "../../routes_Validators/auth";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";
import { createAuth, hashPassword, hashRefreshToken } from "../../lib/auth";
import { users } from "../../database";
import { eq } from "drizzle-orm";

export const registerRoute = new Hono<AppEnv>();

registerRoute.post(
  "/register",
  zValidator("json", registerValidator, validationError),
  async (c) => {
    const { email, password, name } = c.req.valid("json");
    const db = c.get("db");
    const auth = createAuth(c.env);

    // 1. Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();
    if (existing) {
      return c.json(
        { error: "An account with this email already exists" },
        409,
      );
    }

    // 2. Generate the user ID first needed for both insert and tokens
    const userId = crypto.randomUUID();

    // 3. Hash the password
    const password_hash = await hashPassword(password);

    // 4. Generate refresh token using the userId we just created

    const refreshToken = await auth.generateRefreshToken(userId);
    const refresh_token_hash = await hashRefreshToken(refreshToken);

    const now = new Date();

    // 5. Insert user into DB
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        passwordHash: password_hash,
        refreshTokenHash: refresh_token_hash,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    // 6. Generate access token using confirmed user ID
    const accessToken = await auth.generateAccessToken(newUser.id);

    // 7. Return tokens + safe user data (never return password_hash)
    return c.json(
      {
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        accessToken,
        refreshToken,
      },
      201,
    );
  },
);
