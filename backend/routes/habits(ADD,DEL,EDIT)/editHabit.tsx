import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";
import { editHabitValidator } from "../../routes_Validators/Habits";
import { habits } from "../../database";
import { eq, and } from "drizzle-orm";

export const edithabbitRoute = new Hono<AppEnv>();

edithabbitRoute.patch(
  "/editHabit",
  zValidator("json", editHabitValidator, validationError),
  async (c) => {
    const db = c.get("db");
    const userID = c.get("userID");
    const { habbitName, updates } = c.req.valid("json");

    const updatedRow = await db
      .update(habits)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(habits.title, habbitName), eq(habits.userId, userID)))
      .returning();

    if (updatedRow.length === 0) {
      return c.json(
        { error: "No habit with that name found for this user" },
        404,
      );
    }

    return c.json({ habit: updatedRow[0] }, 200);
  },
);
