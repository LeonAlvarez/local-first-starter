
import { cookies } from "next/headers";
import {
  verifyToken,
} from "core/auth";
import db, { eq } from "db";
import { users } from "db/schema";

export async function getUser() {
  const userId = await getUserId();
  
  if (!userId) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(userId.toString())))
    .limit(1);

  return user;
}

export async function getUserId() {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return null;
    }
    const parsed = await verifyToken(sessionCookie);

    if (new Date(parsed.expiresAt) < new Date()) {
      return null;
    }
    return parsed.user.id;
  } catch (e) {
    console.log(e);
    return null;
  }
}
