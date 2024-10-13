import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { expenseShares } from "./expense-shares";
import { users } from "./users";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  comment: varchar('description', { length: 255 }).notNull(),
  expenseShareId: integer("expense_share_id").references(
    () => expenseShares.id
  ),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
