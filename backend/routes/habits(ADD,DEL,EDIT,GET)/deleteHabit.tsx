import { Hono } from "hono";
import type { AppEnv } from "../../lib/types";
import { zValidator } from "@hono/zod-validator";
import { validationError } from "../../lib/validationError";
import { deleteHabitValidator } from "../../routes_Validators/Habits";
import { habits } from "../../database";
import { eq, and } from "drizzle-orm";
import { delCachedHabits } from "../../lib/habitsCache";
export const deletehabbitRoute = new Hono<AppEnv>();

deletehabbitRoute.delete(
  "/deleteHabit",
  zValidator("json", deleteHabitValidator, validationError),
  async (c) => {
    // 1. establish the connection with db and extract userID and title
    const db = c.get("db");
    const userID = c.get("userID");
    const { habbitName } = c.req.valid("json");
    // 2. check if the habbit exists for that user
    const deletedRow = await db
      .delete(habits)
      .where(and(eq(habits.title, habbitName), eq(habits.userId, userID)))
      .returning();
    // 3. if no habbit with that name exists
    if (deletedRow.length === 0) {
      return c.json(
        { error: "No habit with that name exists for that user" },
        404,
      );
    }
    //4. delete the cache
    await delCachedHabits(c.env, userID);

    // 5. other wise return succesful response
    return c.json(
      { message: "The habit is found and deleted successfully" },
      200,
    );
  },
);
