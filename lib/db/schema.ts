import { users, type User } from "./schemas/users";
import { groups, type Group } from "./schemas/groups";
import { userGroups, type UserGroup} from "./schemas/users-groups";

export const schema = {
  users,
  groups,
  userGroups
}

export {
  users,
  groups,
  userGroups,
  UserGroup,
  User,
  Group
}

export default schema;