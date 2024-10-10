import "dotenv/config";
import { faker } from "@faker-js/faker";
import db from "./index";
import schema from "./schema";
import { type InsertUserGroup, TeamRole } from "./schemas/users_groups";
import type { InsertUser } from "./schemas/users";
import type { InsertGroup } from "./schemas/group";
import { hashPassword } from "core/auth";

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

async function seedDatabase() {
  const numberOfUsers = 30;
  const numberOfGroups = 100;

  console.log("Starting database seeding...");
  // Create users

  console.log(`Creating ${numberOfUsers + baseUsers.length} users...`);
  let userIds = await Promise.all(
    baseUsers.map(async ({ email, password }) => createUser(email, password))
  );

  userIds.push(
    ...(await Promise.all(
      Array.from({ length: numberOfUsers }, async () => createUser())
    ))
  );
  console.log("Users created successfully.");

  // Create groups
  console.log(`Creating ${numberOfGroups} groups...`);
  const groupIds = await Promise.all(
    Array.from({ length: numberOfGroups }, async () => {
      const group: InsertGroup = {
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
      };
      const [{ id }] = await db
        .insert(schema.groups)
        .values(group)
        .returning({ id: schema.groups.id });
      return id;
    })
  );
  console.log("Groups created successfully.");

  // Assign users to groups with roles
  console.log("Assigning users to groups...");
  await Promise.all(
    groupIds.map(async (groupId) => {
      const shuffledUserIds = faker.helpers.shuffle([...userIds]);
      const owner = shuffledUserIds.pop()!;

      await db.insert(schema.userGroups).values({
        userId: owner,
        groupId,
        role: TeamRole.OWNER,
      } as InsertUserGroup);

      const membersCount = faker.number.int({ min: 1, max: 10 });
      for (const userId of shuffledUserIds.slice(0, membersCount)) {
        const role = faker.helpers.arrayElement([
          TeamRole.ADMIN,
          TeamRole.USER,
        ]);
        await db.insert(schema.userGroups).values({
          userId,
          groupId,
          role,
        });
      }
    })
  );
  console.log("Users assigned to groups successfully.");
}

seedDatabase().catch(console.error);
