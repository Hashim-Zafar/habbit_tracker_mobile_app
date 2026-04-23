import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../database/index";

export type AppEnv = {
  Bindings: {
    habit_tracker_db: D1Database;
    ENVIRONMENT: string;
    JWT_SECRET: string;
    REFRESH_SECRET: string;
  };
  Variables: {
    db: DrizzleD1Database<typeof schema>;
  };
};
