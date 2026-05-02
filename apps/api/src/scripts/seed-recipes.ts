import fs from "node:fs";
import path from "node:path";
import { db } from "../db/index.js";
import { recipes } from "../db/schema.js";
import { embedImage, initEmbedder } from "../lib/embedder.js";
import { STORAGE_BUCKET, supabase } from "../lib/supabase.js";

const DATA_DIR = path.resolve(process.cwd(), "data/train_data");

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function uploadToStorage(
  category: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const storagePath = `recipes/${category}/${filename}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return publicUrl;
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[seed] Data directory not found: ${DATA_DIR}`);
    console.error(
      `[seed] Copy your dataset into apps/api/data/train_data/<category>/*.jpg first.`,
    );
    process.exit(1);
  }

  const categories = fs
    .readdirSync(DATA_DIR)
    .filter((d) => fs.statSync(path.join(DATA_DIR, d)).isDirectory());

  if (categories.length === 0) {
    console.error(`[seed] No category directories found in ${DATA_DIR}`);
    process.exit(1);
  }

  console.log(`[seed] Found categories: ${categories.join(", ")}`);
  console.log("[seed] Initializing embedder...");
  await initEmbedder();

  let total = 0;
  let failed = 0;

  for (const category of categories) {
    const dir = path.join(DATA_DIR, category);
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

    console.log(`[seed] Processing ${category}: ${files.length} images`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const ext = path.extname(file).toLowerCase();
      const contentType = EXT_TO_MIME[ext] ?? "image/jpeg";

      try {
        const buffer = fs.readFileSync(filePath);
        const publicUrl = await uploadToStorage(
          category,
          file,
          buffer,
          contentType,
        );
        const embedding = await embedImage(buffer);

        await db.insert(recipes).values({
          name: `${category} - ${file}`,
          category,
          description: `${category} 料理`,
          imageUrl: publicUrl,
          embedding,
        });

        total++;
        if (total % 10 === 0) {
          console.log(`[seed]   ...${total} inserted`);
        }
      } catch (err) {
        failed++;
        console.error(`[seed]   ✗ ${category}/${file}:`, err);
      }
    }
  }

  console.log(`[seed] Done. ${total} inserted, ${failed} failed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
