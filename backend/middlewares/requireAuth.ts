import type { MiddlewareHandler } from "hono";
import { createAuth } from "../lib/auth";
import type { AppEnv } from "../lib/types";

export const requirauthMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  // 1. initialize basic setup
  const auth = createAuth(c.env);
  const header = c.req.header("Authorization");
  // 2. check if the token is sent in correct format
  if (!header?.startsWith("Bearer ")) {
    return c.json({ message: "unauthorized" }, 401);
  }
  // 3. extract the token
  const token = header?.split(" ")[1];
  if (!token) {
    return c.json({ message: "No token in the authorization header" }, 400);
  }
  // 4. verify the token  and extract the payload
  try {
    const { user_id } = await auth.verifyAccessToken(token);
    if (!user_id) {
      return c.json({ message: "Invalid Token" }, 401);
    }
    // 5. set the payload to be latter used in our routes

    c.set("userID", user_id);
    await next();
  } catch {
    return c.json({ message: "Invalid Token" }, 401);
  }
};
