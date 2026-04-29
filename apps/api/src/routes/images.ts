import { Hono } from "hono";
import { STORAGE_BUCKET, supabase } from "../lib/supabase.js";

export const images = new Hono();

images.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json({ error: "file field is required" }, 400);
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File size exceeds limit" }, 400);
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return c.json({ error: "Invalid file type" }, 400);
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return c.json({ error: uploadError.message }, 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  // TODO: 임베딩 생성 + DB insert + 벡터 검색
  return c.json({
    path,
    url: publicUrl,
    size: file.size,
    type: file.type,
  });
});
