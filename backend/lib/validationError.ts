// lib/validationError.ts
export const validationError = (result: any, c: any) => {
  if (!result.success) {
    return c.json(
      {
        error: "Invalid request body",
        issues: result.error.issues.map((i: any) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  }
};
