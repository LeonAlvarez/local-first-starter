import { faker } from "@faker-js/faker";
import { db } from "./index";
import schema, { groups, users } from "./schema";
import usersGroups, {
  type InsertUserGroup,
  TeamRole,
} from "./schemas/users-groups";
import type { InsertUser, User } from "./schemas/users";
import type { InsertGroup } from "./schemas/groups";
import { hashPassword } from "utils/auth";
import expenses from "./schemas/expenses";
import expenseShares from "./schemas/expense-shares";
import type { InsertExpense } from "./schemas/expenses";
import type { InsertExpenseShare } from "./schemas/expense-shares";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { categories } from "./query/expenses";

const baseUsers = [
  { email: "admin@example.com", password: "admin123" },
  { email: "user@example.com", password: "user123" },
];

async function createUser(email?: string, password?: string) {
  const user: InsertUser = {
    email: email || faker.internet.email(),
    phone: faker.phone.number(),
    userName: faker.internet.userName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    bio: faker.lorem.sentence(),
    password: await hashPassword(password || faker.internet.password()),
  };
  const [{ id }] = await db
    .insert(schema.users)
    .values(user)
    .returning({ id: schema.users.id });
  return id;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, (index + 1) * size)
  );
}

async function seedUsers(numberOfUsers: number) {
  console.log(`Creating ${numberOfUsers + baseUsers.length} users...`);
  await Promise.all(
    baseUsers.map(async ({ email, password }) => createUser(email, password))
  );

  // Create all user data with hashed passwords
  const allUserData = await Promise.all(
    Array(numberOfUsers)
      .fill(null)
      .map(async () => {
        const password = faker.internet.password();
        const hashedPassword = await hashPassword(password);
        return {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          userName: faker.internet.userName(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          bio: faker.lorem.sentence(),
          password: hashedPassword,
        };
      })
  );

  // Insert users in chunks
  await Promise.all(
    chunkArray(allUserData, 100).map((chunk) =>
      db.insert(schema.users).values(chunk)
    )
  );

  console.log("Users created successfully.");
}

async function seedGroups(numberOfGroups: number) {
  // Create groups
  console.log(`Creating ${numberOfGroups} groups...`);

  const groupData: InsertGroup[] = Array.from(
    { length: numberOfGroups },
    () => ({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
    })
  );

  const insertedGroups = await Promise.all(
    chunkArray(groupData, 100).map((chunk) =>
      db.insert(schema.groups).values(chunk).returning({ id: schema.groups.id })
    )
  );

  const groupIds = insertedGroups.flatMap((chunk) => chunk.map(({ id }) => id));
  console.log("Groups created successfully.");

  const userIds = (await db.select({ id: users.id }).from(users)).map(
    ({ id }) => id
  );

  // Prepare user-group assignments
  console.log("Preparing user-group assignments...");
  const userGroupAssignments: InsertUserGroup[] = groupIds.flatMap(
    (groupId) => {
      const shuffledUserIds = faker.helpers.shuffle([...userIds]);
      const owner = shuffledUserIds.pop()!;
      const membersCount = faker.number.int({ min: 1, max: 10 });

      return [
        { userId: owner, groupId, role: TeamRole.OWNER },
        ...shuffledUserIds
          .slice(0, membersCount)
          .map((userId) => ({
            userId,
            groupId,
            role: faker.helpers.arrayElement([TeamRole.ADMIN, TeamRole.USER]),
          })),
      ];
    }
  );

  // Insert user-group assignments in chunks
  console.log("Inserting user-group assignments...");
  const chunks = await Promise.all(
    chunkArray(userGroupAssignments, 100).map(chunk => db.insert(schema.userGroups).values(chunk))
  );

  console.log("Users assigned to groups successfully.");
}

async function seedIndivualExpenses({
  minExpensesPerUser,
  maxExpensesPerUser,
  minAmount,
  maxAmount,
}: {
  minExpensesPerUser: number;
  maxExpensesPerUser: number;
  minAmount: number;
  maxAmount: number;
}) {
  console.log("Creating Individual expenses...");

  const usersIds = (await db.select({ id: users.id }).from(users))?.map(
    ({ id }) => id
  );

  const createExpensesForUser = (userId: number) => {
    const numberOfExpenses = faker.number.int({
      min: minExpensesPerUser,
      max: maxExpensesPerUser,
    });
    return Array.from({ length: numberOfExpenses }, () => ({
      description: faker.finance.transactionDescription(),
      amount: faker.number.int({ min: minAmount, max: maxAmount }),
      type: faker.helpers.arrayElement(categories).name,
      payerId: userId,
    } as InsertExpense));
  };

  const allExpenses = usersIds.flatMap(createExpensesForUser);

  await Promise.all(
    chunkArray(allExpenses, 100).map((chunk) =>
      db.insert(expenses).values(chunk)
    )
  );

  console.log("Individual expenses created successfully.");
}

async function seedGroupExpenses({
  minExpensesPerGroup,
  maxExpensesPerGroup,
  minAmount,
  maxAmount,
}: {
  minExpensesPerGroup: number;
  maxExpensesPerGroup: number;
  minAmount: number;
  maxAmount: number;
}) {
  console.log("Creating group expenses...");
  const groupWithUsers = await db
    .select({
      ...getTableColumns(groups),
      members: sql<User[]>`json_agg(json_build_object(
        'id', ${users.id},
        'userName', ${users.userName},
        'firstName', ${users.firstName},
        'lastName', ${users.lastName},
        'role', ${usersGroups.role},
        'email', ${users.email}
      ))`.as("members"),
    })
    .from(groups)
    .leftJoin(usersGroups, eq(groups.id, usersGroups.groupId))
    .leftJoin(users, eq(usersGroups.userId, users.id))
    .groupBy(groups.id);

  // Generate all expense data
  const allExpenses: InsertExpense[] = groupWithUsers.flatMap(
    ({ id, members }) => {
      const numberOfExpenses = faker.number.int({
        min: minExpensesPerGroup,
        max: maxExpensesPerGroup,
      });
      return Array.from({ length: numberOfExpenses }, () => {
        const payer = faker.helpers.arrayElement(members);
        return {
          description: faker.finance.transactionDescription(),
          amount: faker.number.int({ min: minAmount, max: maxAmount }),
          type: faker.helpers.arrayElement(categories).name,
          payerId: payer.id,
          groupId: id,
        };
      });
    }
  );

  // Insert expenses in chunks
  await Promise.all(
    chunkArray(allExpenses, 100).map((chunk) =>
      db.insert(expenses).values(chunk)
    )
  );

  console.log(`${allExpenses.length} group expenses created successfully.`);
}

async function seedGroupExpensesShares() {
  console.log("Creating expense shares...");

  // Fetch all group expenses with their group members
  const groupExpenses = await db
    .select({
      expenseId: expenses.id,
      groupId: expenses.groupId,
      amount: expenses.amount,
      members: sql<User[]>`json_agg(json_build_object(
        'id', ${users.id},
        'userName', ${users.userName}
      ))`.as("members"),
    })
    .from(expenses)
    .innerJoin(usersGroups, eq(expenses.groupId, usersGroups.groupId))
    .innerJoin(users, eq(usersGroups.userId, users.id))
    .where(sql`${expenses.groupId} IS NOT NULL`)
    .groupBy(expenses.id);

  // Prepare all expense shares data
  const allExpenseShares: InsertExpenseShare[] = groupExpenses.flatMap(
    ({ expenseId, groupId, amount, members }) => {
      const isSharedAmongAll = faker.datatype.boolean();
      const selectedMembers = isSharedAmongAll
        ? members
        : faker.helpers.arrayElements(members, { min: 2, max: members.length });
      const shareAmount = Math.floor(amount / selectedMembers.length);

      return selectedMembers.map((member) => ({
        expenseId,
        userId: member.id,
        groupId,
        shareAmount,
      }));
    }
  );

  // Insert expense shares in chunks
  console.log(`Inserting ${allExpenseShares.length} expense shares...`);
  await Promise.all(
    chunkArray(allExpenseShares, 100).map((chunk) =>
      db.insert(expenseShares).values(chunk)
    )
  );

  console.log("Expense shares created successfully.");
}

async function seedDatabase() {
  console.log("Starting database seeding...");
  await seedUsers(50);
  await seedGroups(100);
  await seedIndivualExpenses({
    minExpensesPerUser: 20,
    maxExpensesPerUser: 30,
    minAmount: 500,
    maxAmount: 500000,
  });
  await seedGroupExpenses({
    minExpensesPerGroup: 3,
    maxExpensesPerGroup: 25,
    minAmount: 300,
    maxAmount: 100000,
  });
  await seedGroupExpensesShares()
  console.log("Completed database seeding");
}

seedDatabase().catch(console.error);
