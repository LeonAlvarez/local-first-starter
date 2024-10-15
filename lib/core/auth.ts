import db from "db";
import { User, users } from "db/schema";
import { eq } from "db/client";
import { verifyPassword } from "utils/auth";
export * from "utils/auth";

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
