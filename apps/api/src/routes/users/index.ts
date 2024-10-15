import { createRoute } from "@hono/zod-openapi";
import { status as HttpCode } from "utils/http/status";
import db, { getTableColumns } from "db";
import { dataListSchema } from "utils/hono/open-api/schema";
import users, { publicUserSchema } from "db/schemas/users";

export const PublicUserSchema = publicUserSchema.openapi("User");

import { createRouter } from "@/app";

const router = createRouter().openapi(
  createRoute({
    tags: ["Users"],
    method: "get",
    path: "/users",
    responses: {
      [HttpCode.OK]: {
        content: {
          "application/json": {
            schema: dataListSchema(PublicUserSchema),
          },
        },
        description: "Retrieve all users",
      },
    },
  }),
  async (c) => {
    const { password: _, ...select } = getTableColumns(users);

    const data = await db.select(select).from(users);
    return c.json(
      {
        data,
      },
      HttpCode.OK
    );
  }
);

export default router;
