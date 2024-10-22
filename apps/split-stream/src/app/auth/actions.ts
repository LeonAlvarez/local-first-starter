"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  getSignedSessionToken,
  getExpireAt,
  verifyToken,
} from "core/auth";
import users from "db/schemas/users";
import db, { eq } from "db";

export async function logout(redirectTo: string = "") {
  cookies().delete("authToken");
  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function login(email: string, password: string) {
  const user = await authenticateUser(email, password);

  if (user) {
    const expiresAt = getExpireAt();

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
