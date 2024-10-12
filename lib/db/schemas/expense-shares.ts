import { pgTable, serial, integer, decimal, timestamp } from 'drizzle-orm/pg-core';
import { expenses } from './expenses';
import { users } from './users'; // Assuming you have a users table
import { groups } from './groups'; // Assuming you have a groups table
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const expenseShares = pgTable('expense_shares', {
  id: serial('id').primaryKey(),
  expenseId: integer('expense_id').references(() => expenses.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  groupId: integer('group_id').references(() => groups.id),
  shareAmount: integer('share_amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertExpenseSaresSchema = createInsertSchema(expenseShares);
export const selectExpenseSaresSchema = createSelectSchema(expenseShares);

export type InsertExpenseShare = z.infer<typeof insertExpenseSaresSchema>;
export type ExpenseShare = z.infer<typeof selectExpenseSaresSchema>;


export default expenseShares;