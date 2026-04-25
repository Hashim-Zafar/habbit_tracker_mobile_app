import { z } from "zod";

export const addHabitValidator = z.object({
  title: z.string(),
  description: z.string().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isActive: z.boolean(),
  frequency: z.enum(["weekly", "daily"]),
});

export const deleteHabitValidator = z.object({
  habbitName: z.string(),
});

export const editHabitValidator = z.object({
  habbitName: z.string(),
  updates: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      frequency: z.string().optional(),
      reminderTime: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "No fields to update",
    }),
});
