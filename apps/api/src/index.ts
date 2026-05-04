import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { initEmbedder } from "./lib/embedder.js";
import { images } from "./routes/images.js";
import { search } from "./routes/search.js";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.text("みんなのレシピ API"));
app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/images", images);
app.route("/api/search", search);

const port = Number(process.env.PORT) || 8080;

async function main() {
  await initEmbedder();

  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
