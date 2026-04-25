import * as jose from "jose";
import bcrypt from "bcryptjs";

// to hash and verify password , (don't need env variables so keeping them out of wrapper function)
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
// to hash and verify refresh tokens
export async function hashRefreshToken(token: string): Promise<string> {
  //this will help us convert string into bytes as SHA-256 works on bytes
  const encoder = new TextEncoder();
  //convert string into bytes
  const data = encoder.encode(token);
  //uses run time web crypto API , no matter the token size  SHA-256 will always calculate a 256-bit digest
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  //converting to byte array , e.g:['99',''92','81',...]
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  //convert each byte to hex decimal , e.g: 108 -> "6c"
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
