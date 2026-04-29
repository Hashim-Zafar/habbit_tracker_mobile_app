import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../database/index";

export type AppEnv = {
  Bindings: {
    habit_tracker_db: D1Database;
    ENVIRONMENT: string;
    JWT_SECRET: string;
    REFRESH_SECRET: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
  };
  Variables: {
    db: DrizzleD1Database<typeof schema>;
    userID: string;
  };
};
