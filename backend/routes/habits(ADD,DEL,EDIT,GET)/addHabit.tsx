import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";
import { addHabitValidator } from "../../routes_Validators/Habits";
import type { AppEnv } from "../../lib/types";
import { habits } from "../../database";
import { eq, and } from "drizzle-orm";
import { delCachedHabits } from "../../lib/habitsCache";
export const addhabbitRoute = new Hono<AppEnv>();

addhabbitRoute.post(
  "/addHabit",
  zValidator("json", addHabitValidator, validationError),
  async (c) => {
    const db = c.get("db");
    const userId = c.get("userID");
    // 1. destructure the request
    const { title, description, reminderTime, frequency, isActive } =
      c.req.valid("json");
    // 2. check if the habbit already exsists and , user ID of that Habbit is equal to our userID
    const exists = await db
      .select()
      .from(habits)
      .where(and(eq(habits.title, title), eq(habits.userId, userId)))
      .get();
    //guard clause
    if (exists) {
      return c.json({ error: "A habbit with this name already exists" }, 409);
    }
    // 3. generate the id for the habbit
    const habitId = crypto.randomUUID();
    const now = new Date();
    // 4. add the habbit into our table
    const newHabbit = await db
      .insert(habits)
      .values({
        id: habitId,
        userId,
        title,
        description,
        reminderTime,
        frequency,
        isActive,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    // 5. delete the cache
    await delCachedHabits(c.env, userId);
    // 6. return the added habbit
    return c.json({ habit: newHabbit }, 201);
  },
);
