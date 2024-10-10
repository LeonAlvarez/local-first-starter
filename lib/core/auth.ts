import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import db from "db";
import { users } from "db/schema";
import { User } from "db/schemas/users";
import { eq } from 'drizzle-orm';

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return null;

  if (!await verifyPassword(user.password, password)) {
    return null
  }

  return user;
}


export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = storedHash.split(':');
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey));
    });
  });
}

