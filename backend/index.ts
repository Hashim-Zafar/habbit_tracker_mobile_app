import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./database/index";
import type { AppEnv } from "./lib/types";
import { registerRoute } from "./routes/auth/signup";
const app = new Hono<AppEnv>();

// DB middleware — runs before every request
app.use("*", async (c, next) => {
  const db = drizzle(c.env.habit_tracker_db, { schema });
  c.set("db", db);
  await next();
});

app.get("/", (c) => c.text("Hello!"));

// Mount your routes
app.route("/auth", registerRoute);

export default app;
