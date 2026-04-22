import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { habits } from "./habits";

export const streaks = sqliteTable("streaks", {
  habitId: text("habit_id")
    .primaryKey()
    .references(() => habits.id),

  currentStreak: integer("current_streak").notNull().default(0),

  longestStreak: integer("longest_streak").notNull().default(0),

  lastCompletedAt: integer("last_completed_at", {
    mode: "timestamp_ms",
  }),
});
