import { users, type User } from "./schemas/users";
import { groups, type Group } from "./schemas/groups";
import { userGroups, type UserGroup } from "./schemas/users-groups";
import { expenses, type Expense } from "./schemas/expenses";
import { expenseShares, type ExpenseShare } from "./schemas/expense-shares";

export const schema = {
  users,
  groups,
  userGroups,
  expenses,
  expenseShares
}

export {
  users,
  groups,
  userGroups,
  expenses,
  expenseShares,
  UserGroup,
  User,
  Group,
  Expense,
  ExpenseShare,
}

export default schema;