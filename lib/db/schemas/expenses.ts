import { pgTable, serial, varchar, decimal, integer, timestamp } from 'drizzle-orm/pg-core';
import { groups } from './groups'; // Assuming you have a groups table
import users from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  description: varchar('description', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).default('misc').notNull(),
  amount: integer('amount').notNull(),
  payerId: integer('payer_id').references(() => users.id).notNull(),
  groupId: integer('group_id').references(() => groups.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses);
export const selectExpenseSchema = createSelectSchema(expenses);

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = z.infer<typeof selectExpenseSchema>;


export default expenses;