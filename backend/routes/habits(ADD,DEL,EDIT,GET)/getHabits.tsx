import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { getCachedHabits, setCachedHabits } from "../../lib/habitsCache";
import { habits } from "../../database";
import { eq } from "drizzle-orm";

export const getHabbit = new Hono<AppEnv>();

getHabbit.get("/getHabits", async (c) => {
  const db = c.get("db");
  const userId = c.get("userID");

  // 1. check if the user has any cached habits
  const cached = await getCachedHabits(c.env, userId);

  if (cached) {
    console.log("Cache hit!!!!");
    return c.json({ habits: cached, source: "Cache" });
  }

  // 2. if cache miss , then hit the db

  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId));

  // 3. store in cache for next time
  await setCachedHabits(c.env, userId, userHabits);

  // 4. return the habits
  return c.json({ habits: userHabits, source: "Database" });
});
