import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";
import { editHabitValidator } from "../../routes_Validators/Habits";
import { habits } from "../../database";
import { eq, and } from "drizzle-orm";
import { delCachedHabits } from "../../lib/habitsCache";

export const edithabbitRoute = new Hono<AppEnv>();

edithabbitRoute.patch(
  "/editHabit",
  zValidator("json", editHabitValidator, validationError),
  async (c) => {
    // 1. Initialize the setup
    const db = c.get("db");
    const userID = c.get("userID");
    // 2. de structure the data
    const { habbitName, updates } = c.req.valid("json");
    // 3. update in the db
    const updatedRow = await db
      .update(habits)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(habits.title, habbitName), eq(habits.userId, userID)))
      .returning();
    // 4. guard clause to check if the habit does not exists
    if (updatedRow.length === 0) {
      return c.json(
        { error: "No habit with that name found for this user" },
        404,
      );
    }
    // 5. delete the cache
    await delCachedHabits(c.env, userID);
    // 6. return the updated row
    return c.json({ habit: updatedRow[0] }, 200);
  },
);
