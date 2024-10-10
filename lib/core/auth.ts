import { scryptAsync } from '@noble/hashes/scrypt';
import { SignJWT, jwtVerify } from "jose";
import db, { eq } from "db";
import users, { type User } from "db/schemas/users";
import { randomBytes } from '@noble/hashes/utils';

const key = new TextEncoder().encode(process.env.AUTH_KEY_SECRET);

const SESION_DURATION = 24 * 60 * 60 * 1000;
export const getExpireAt = (start = Date.now()) => new Date(start + SESION_DURATION);

export type SessionData = {
  user: {
    id: User["id"];
  };
  expiresAt: string;
};

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  if (!(await verifyPassword(user.password, password))) {
    return null;
  } 

  return user;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, { N: 2 ** 16, r: 8, p: 1, dkLen: 64 });
  return Buffer.from(salt).toString('hex') + ':' + Buffer.from(derivedKey).toString('hex');
}

export async function verifyPassword(
  storedHash: string,
  password: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const derivedKey = await scryptAsync(password, Buffer.from(salt, 'hex'), { N: 2 ** 16, r: 8, p: 1, dkLen: 64 });
  return Buffer.from(hash, 'hex').equals(Buffer.from(derivedKey));
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
