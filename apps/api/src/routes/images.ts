import { Hono } from "hono";
import { STORAGE_BUCKET, supabase } from "../lib/supabase.js";

export const images = new Hono();

images.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json({ error: "file field is required" }, 400);
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
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
