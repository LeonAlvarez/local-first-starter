import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "hono-pino";
export type { PinoLogger } from "hono-pino";

import { logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import { isProduction, LOG_LEVEL } from "../../process";

export function pinoLogger() {
  return ((c, next) =>
    logger({
      pino: pino(
        {
          level: LOG_LEVEL || "info",
        },
        isProduction ? undefined : pretty()
      ),
      http: {
        reqId: () => crypto.randomUUID(),
      },
    })(c as unknown as Context<Env>, next)) satisfies MiddlewareHandler;
}

