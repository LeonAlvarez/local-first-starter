import { eq, getTableColumns, sql } from "drizzle-orm";
import {
  AnyPgSelect,
  PgDatabase,
  PgQueryResultHKT,
  PgSelect,
} from "drizzle-orm/pg-core";
import groups from "../schemas/groups";
import users, { type User } from "../schemas/users";
import { expenses, ExpenseShare, expenseShares } from "../schema";

export const categories = [
  { label: "Miscellaneous", color: "#6B7280", name: "miscellaneous" },
  { label: "Groceries", color: "#4CAF50", name: "groceries" },
  { label: "Rent", color: "#2196F3", name: "rent" },
  { label: "Utilities", color: "#FFC107", name: "utilities" },
  { label: "Entertainment", color: "#E91E63", name: "entertainment" },
  { label: "Transportation", color: "#9C27B0", name: "transportation" },
  { label: "Restaurants", color: "#FF5722", name: "restaurants" },
  { label: "Healthcare", color: "#00BCD4", name: "healthcare" },
  { label: "Education", color: "#3F51B5", name: "education" },
  { label: "Shopping", color: "#FF9800", name: "shopping" },
  { label: "Travel", color: "#8BC34A", name: "travel" },
  { label: "Fitness", color: "#CDDC39", name: "fitness" },
  { label: "Personal Care", color: "#795548", name: "personal_care" },
  { label: "Home Improvement", color: "#607D8B", name: "home_improvement" },
  { label: "Gifts", color: "#F44336", name: "gifts" },
  { label: "Subscriptions", color: "#009688", name: "subscriptions" },
] as const;

export const categoriesMap: Record<string, (typeof categories)[number]> =
  categories.reduce((acc, category) => {
    acc[category.name] = category;
    return acc;
  }, {} as Record<string, (typeof categories)[number]>);

type expensesSchema = {
  groups: typeof groups;
  users: typeof users;
  expenses: typeof expenses;
  expenseShares: typeof expenseShares;
};

export type DbType = PgDatabase<PgQueryResultHKT, expensesSchema>;

export function expensesQuery(db: DbType) {
  function getUserExpenses(userId: User["id"]) {
    return db
      .select({
        share: {
          ...getTableColumns(expenseShares),
          id: sql`${expenseShares.id}`.as("share_id"),
          groupId: sql`${expenseShares.groupId}`.as("share_groupId"),
          createdAt: sql`${expenseShares.createdAt}`.as("share_createdAt"),
          updatedAt: sql`${expenseShares.updatedAt}`.as("share_updatedAt"),
        },
        ...getTableColumns(expenses),
      })
      .from(expenseShares)
      .leftJoin(expenses, eq(expenseShares.expenseId, expenses.id))
      .where(eq(expenseShares.userId, userId));
  }

  return {
    getUserExpenses,
  };
}