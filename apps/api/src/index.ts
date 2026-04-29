import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { images } from "./routes/images.js";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.text("みんなのレシピ API"));
app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/images", images);

const port = Number(process.env.PORT) || 8080;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
