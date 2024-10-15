import { z } from "@hono/zod-openapi";
import { HttpStatusCode } from "@/http/status/codes";

const APLITCATION_JSON = "application/json";

export type ZodSchema =
  | z.ZodUnion<any>
  | z.AnyZodObject
  | z.ZodArray<z.AnyZodObject>;

export const paginatedSchema = (schema: z.AnyZodObject) =>
  dataListSchema(schema).extend({
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
    }),
  });

export const dataListSchema = (schema: z.AnyZodObject) =>
  z.strictObject({
    data: z.array(schema),
  });

export const dataSchema = (schema: z.AnyZodObject) =>
  z.strictObject({
    data: schema,
  });

type ResponseParams = {
  [key in HttpStatusCode]: {
    schema: ZodSchema;
    description: string;
  };
};

export const createResponses = (data: ResponseParams) => {
  return Object.entries(data).reduce(
    (responses, [code, { schema, description }]) => {
      responses[parseInt(code)] = JsonContent({
        schema,
        description,
      });
      return responses;
    },
    {} as Record<number, ReturnType<typeof JsonContent>>
  );
};

export function JsonContent<T extends ZodSchema>({
  schema,
  description,
}: {
  schema: T;
  description: string;
  type?: string;
}) {
  return {
    content: {
      [APLITCATION_JSON]: {
        schema,
      },
    },
    description,
  };
}

export function JsonBody<T extends ZodSchema>({
  schema,
  description,
}: {
  schema: T;
  description: string;
}) {
  return {
    body: {
      content: {
        [APLITCATION_JSON]: {
          schema,
        },
      },
      description,
    },
  };
}

export function validationError<T extends ZodSchema>(schema: T) {
  const { error } = schema.safeParse(
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {}
  );

  return z.object({
    success: z.boolean().openapi({
      example: false,
    }),
    error: z
      .object({
        issues: z.array(
          z.object({
            code: z.string(),
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string().optional(),
          })
        ),
      })
      .openapi({
        example: error,
      }),
  });
}

export function errorResponse({
  code,
  message = "",
  details = "",
}: {
  code: string;
  message?: string;
  details?: string;
}) {
  return z.object({
    success: z.boolean().openapi({
      example: false,
    }),
    error: z
      .object({
        code: z.string().default(code),
        message: z.optional(z.string().default(message)),
        details: z.optional(z.string().default(details)),
      })
      .openapi({
        example: {
          code,
          message,
          details,
        },
      }),
  });
}
