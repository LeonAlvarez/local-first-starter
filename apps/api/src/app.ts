import { OpenAPIHono } from "@hono/zod-openapi";
import { Env } from "hono";
import { PinoLogger, pinoLogger } from "utils/hono/middlewares/pino-logger";
import { defaultHook } from "utils/hono/open-api";


export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use(pinoLogger());

  return app as OpenAPIHono<Env, {}, "/">;
} 