import { getRedis } from "./redis";
import type { AppEnv } from "./types";

const HABIT_TTL = 60 * 60;

export const setCachedHabits = async (
  env: AppEnv["Bindings"],
  userID: string,
  habbits: unknown[],
) => {
  const redis = getRedis(env);
  await redis.setex(`habits:${userID}`, HABIT_TTL, habbits);
};

export const getCachedHabits = async (
  env: AppEnv["Bindings"],
  userID: string,
) => {
  const redis = getRedis(env);
  const data = await redis.get(`habits:${userID}`);
  if (!data) return null;
  return data;
};

export const delCachedHabits = async (
  env: AppEnv["Bindings"],
  userID: string,
) => {
  const redis = getRedis(env);
  await redis.del(`habits:${userID}`);
};
