import { Redis } from "@upstash/redis/cloudflare";
import type { AppEnv } from "./types";
export const getRedis = (env: AppEnv["Bindings"]) => {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
};
