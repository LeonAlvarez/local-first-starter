"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  getSignedSessionToken,
  getExpireAt,
  verifyToken,
} from "core/auth";
import db, { eq } from "db";
import { users } from "db/schema";

export async function logout(redirectTo: string = "") {
  cookies().delete("authToken");
  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function login(email: string, password: string) {
  const user = await authenticateUser(email, password);

  if (user) {
    const expiresAt = getExpireAt()

    const sessionData = {
      user: {
        id: user.id,
      },
      expiresAt: expiresAt.toISOString(),
    };

    const encryptedSession = await getSignedSessionToken(
      sessionData,
      expiresAt
    );

    cookies().set("session", encryptedSession, {
      expires: expiresAt,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    redirect("/dashboard");
  }

  return {
    error: "Invalid email or password",
  };
}

export async function getUser() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  const sessionData = await verifyToken(sessionCookie);
  if (!sessionData?.user?.id || typeof sessionData.user.id !== 'number') return null;

  if (new Date(sessionData.expiresAt) < new Date()) return null;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionData.user.id))
    .limit(1)
    .then(results => results[0] || null);

  return user;
}