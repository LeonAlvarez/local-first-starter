import { serve } from "@hono/node-server";
import configureOpenApiDocs from "utils/hono/open-api";
import { version } from "../package.json";

import createApp from "@/app";
import usersRouter from "@/routes/users";
import invitationsRouter from "@/routes/invitations";

const port = process.env?.port || "4000";

const app = createApp();

configureOpenApiDocs(app, {
  version,
  title: "Local First API",
  showSidebar: true
});

app.route("/api/", usersRouter);
app.route("/api/", invitationsRouter);

export default app;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: parseInt(port),
});
