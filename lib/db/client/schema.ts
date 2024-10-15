import { users } from "./schemas/users";
import { groups } from "./schemas/groups";
import { userGroups } from "./schemas/users-groups";
import { expenses } from "./schemas/expenses";
import { expenseShares } from "./schemas/expense-shares";


export const schema = {
  users,
  groups,
  userGroups,
  expenses,
  expenseShares,
};

export default schema;
