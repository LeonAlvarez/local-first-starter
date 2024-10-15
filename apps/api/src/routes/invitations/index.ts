import { createRoute } from "@hono/zod-openapi";
import { status as HttpCode } from "utils/http/status";
import db from "db";
import {
  createResponses,
  dataListSchema,
  dataSchema,
  JsonBody,
  errorResponse,
  validationError,
} from "utils/hono/open-api/schema";
import invitations, {
  insertInviteSchema,
  selectInviteSchema,
} from "db/schemas/invitations";
import {
  DbType as invitationsDB,
  invitationsQuery,
} from "db/query/invitations";
import { DbType as groupsDB, groupsQuery } from "db/query/groups";

export const InvitationSchema = selectInviteSchema.openapi("Invitation");

export const CreateInvitationSchema = insertInviteSchema
  .omit({ status: true })
  .openapi("CreateInvitation");

import { createRouter } from "@/app";

const ALREADY_INVITED_ERROR = {
  code: "USER_ALREADY_INVITED",
  message: "User is already invited to the group",
  details: "The user is already a member or invited to the group",
};

const tags = ["Invitations"];

const router = createRouter()
  .openapi(
    createRoute({
      tags,
      method: "get",
      path: "/invitations",
      responses: createResponses({
        [HttpCode.OK]: {
          schema: dataListSchema(InvitationSchema),
          description: "Retrieve all inviations",
        },
      }),
    }),
    async (c) => {
      const data = await db.select().from(invitations);
      return c.json({ data }, HttpCode.OK);
    }
  )
  .openapi(
    createRoute({
      tags,
      method: "post",
      path: "/invitations",
      request: JsonBody({
        schema: CreateInvitationSchema,
        description: "Invite a user to a group",
      }),
      responses: createResponses({
        [HttpCode.OK]: {
          schema: dataSchema(InvitationSchema),
          description: "Retrieve all users",
        },
        [HttpCode.UNPROCESSABLE_ENTITY]: {
          schema: validationError(CreateInvitationSchema),
          description: "Validation error(s)",
        },
        [HttpCode.CONFLICT]: {
          schema: errorResponse(ALREADY_INVITED_ERROR),
          description: "User is already invited to the group",
        },
      }),
    }),
    async (c) => {
      const data = c.req.valid("json");

      const { isMemberber } = groupsQuery(db as unknown as groupsDB);

      if ((await isMemberber(data.userId, data.groupId))?.at(0)) {
        return c.json(ALREADY_INVITED_ERROR, HttpCode.CONFLICT);
      }

      const { isInvited, createInvite } = invitationsQuery(
        db as unknown as invitationsDB
      );

      if ((await isInvited(data.userId, data.groupId)).at(0)) {
        return c.json(ALREADY_INVITED_ERROR, HttpCode.CONFLICT);
      }

      const [newInvite] = await createInvite(data);

      return c.json(
        {
          data: {
            ...newInvite,
            createdAt: newInvite.createdAt!.toISOString(),
            updatedAt: newInvite.createdAt!.toISOString(),
          },
        },
        HttpCode.OK
      );
    }
  );

export default router;
