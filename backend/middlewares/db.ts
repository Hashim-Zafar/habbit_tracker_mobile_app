import { drizzle } from "drizzle-orm/d1";
import * as schema from "../database";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../lib/types";

export const dbMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const db = drizzle(c.env.habit_tracker_db, { schema });

  c.set("db", db);

  await next();
};
