import * as jose from "jose";
import bcrypt from "bcryptjs";

// These don't need secrets  keep them outside
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function hashRefreshToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function verifyRefreshTokenHash(
  token: string,
  storedHash: string,
): Promise<boolean> {
  const tokenHash = await hashRefreshToken(token);
  return tokenHash === storedHash;
}

// Only secret-dependent functions go in the factory
export function createAuth(env: {
  JWT_SECRET: string;
  REFRESH_SECRET: string;
}) {
  const jwtKey = new TextEncoder().encode(env.JWT_SECRET);
  const refreshKey = new TextEncoder().encode(env.REFRESH_SECRET);

  return {
    generateAccessToken: (userId: string) =>
      new jose.SignJWT({ user_id: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("15m")
        .sign(jwtKey),
    generateRefreshToken: (userId: string) =>
      new jose.SignJWT({
        user_id: userId,
        jti: crypto.randomUUID(),
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(refreshKey),
    verifyAccessToken: async (token: string) => {
      const { payload } = await jose.jwtVerify(token, jwtKey);
      return payload as { user_id: string };
    },

    verifyRefreshToken: async (token: string) => {
      const { payload } = await jose.jwtVerify(token, refreshKey);
      return payload as { user_id: string };
    },
  };
}
