import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { habits } from "./habits";

export const checkIns = sqliteTable("check_ins", {
  id: text("id").primaryKey(),

  habitId: text("habit_id")
    .notNull()
    .references(() => habits.id),

  note: text("note"),
  proofUrl: text("proof_url"),

  completedAt: integer("completed_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
