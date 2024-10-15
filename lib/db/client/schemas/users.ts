import { pgTable } from "drizzle-orm/pg-core";
import { columns } from "../../schemas/users";

const { password: _, ...usersColumns } = columns;
export const users = pgTable("users", usersColumns);

export default users;