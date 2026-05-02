import { and, cosineDistance, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { images, recipes } from "../db/schema.js";
import { embedImage } from "../lib/embedder.js";
import { STORAGE_BUCKET, supabase } from "../lib/supabase.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SIMILARITY_THRESHOLD = 0.7;
const CATEGORY_LIMIT = 50;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const search = new Hono();

search.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json({ error: "file field is required" }, 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File size exceeds limit" }, 400);
  }
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return c.json({ error: "Invalid file type" }, 400);
  }

  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 5, 1), 20);

  const buffer = Buffer.from(await file.arrayBuffer());

  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return c.json({ error: uploadError.message }, 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  const embedding = await embedImage(buffer);

  const similarity = sql<number>`1 - (${cosineDistance(recipes.embedding, embedding)})`;
  const matched = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      description: recipes.description,
      category: recipes.category,
      imageUrl: recipes.imageUrl,
      similarity,
    })
    .from(recipes)
    .where(
      and(isNotNull(recipes.embedding), gt(similarity, SIMILARITY_THRESHOLD)),
    )
    .orderBy(desc(similarity))
    .limit(limit);

  const topCategory = matched[0]?.category ?? null;

  const categoryRecipes = topCategory
    ? await db
        .select({
          id: recipes.id,
          name: recipes.name,
          description: recipes.description,
          category: recipes.category,
          imageUrl: recipes.imageUrl,
        })
        .from(recipes)
        .where(eq(recipes.category, topCategory))
        .limit(CATEGORY_LIMIT)
    : [];

  const [saved] = await db
    .insert(images)
    .values({
      storagePath: path,
      publicUrl,
      size: file.size,
      mimeType: file.type,
      embedding,
      matchedRecipeId: matched[0]?.id,
    })
    .returning({ id: images.id });

  return c.json({
    image: {
      id: saved?.id,
      path,
      url: publicUrl,
    },
    matches: matched,
    category: topCategory,
    categoryRecipes,
  });
});
