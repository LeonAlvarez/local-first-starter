"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  getSignedSessionToken,
  getExpireAt,
} from "core/auth";

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