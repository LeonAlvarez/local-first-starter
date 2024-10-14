import { scryptAsync } from "@noble/hashes/scrypt";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "@noble/hashes/utils";

const key = new TextEncoder().encode(process.env.AUTH_KEY_SECRET);

type User = {
  id: number;
  email: string;
  phone: string;
  userName: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const SESION_DURATION = process.env.SESION_DURATION
  ? parseInt(process.env.SESION_DURATION)
  : 24 * 60 * 60 * 1000;

export const getExpireAt = (start = Date.now()) =>
  new Date(start + SESION_DURATION);

export type SessionData = {
  user: {
    id: User["id"];
  };
  expiresAt: string;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, {
    N: 2 ** 16,
    r: 8,
    p: 1,
    dkLen: 64,
  });
  return (
    Buffer.from(salt).toString("hex") +
    ":" +
    Buffer.from(derivedKey).toString("hex")
  );
}

export async function verifyPassword(
  storedHash: string,
  password: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  const derivedKey = await scryptAsync(password, Buffer.from(salt, "hex"), {
    N: 2 ** 16,
    r: 8,
    p: 1,
    dkLen: 64,
  });
  return Buffer.from(hash, "hex").equals(Buffer.from(derivedKey));
}

export async function getSignedSessionToken(
  payload: SessionData,
  expireAt: number | string | Date = "1 hour from now"
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expireAt)
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionData;
}
