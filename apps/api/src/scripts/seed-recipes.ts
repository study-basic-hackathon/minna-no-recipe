/**
 * シードスクリプト: apps/api/data/train_data/<category>/*.jpg を読み込んで、
 * Supabase Storage にアップロード + CLIP 埋め込み生成 + recipes テーブルに INSERT を行う。
 *
 * 実行: pnpm --filter @minna-no-recipe/api seed
 *   apps/api ディレクトリを cwd として tsx で実行される
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "../db/index.js";
import { recipes } from "../db/schema.js";
import { embedImage, initEmbedder } from "../lib/embedder.js";
import { STORAGE_BUCKET, supabase } from "../lib/supabase.js";

// データセットの場所 (apps/api/data/train_data/<カテゴリ名>/*.jpg)
const DATA_DIR = path.resolve(process.cwd(), "data/train_data");

// 拡張子から MIME タイプを決めるためのマップ (Storage の contentType に必要)
const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * 1 枚の画像を Supabase Storage にアップロードして、公開 URL を返す。
 * パスは `recipes/<category>/<filename>` の形式で整理する。
 * 同じパスがあれば上書き (upsert: true) するので、再シードしても安全。
 */
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

  // 公開 URL は文字列の組み立てだけ (API コールではない)
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return publicUrl;
}

async function main() {
  // データセットが存在しないと何もできないので最初に確認
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[seed] Data directory not found: ${DATA_DIR}`);
    console.error(
      `[seed] Copy your dataset into apps/api/data/train_data/<category>/*.jpg first.`,
    );
    process.exit(1);
  }

  // train_data 直下のディレクトリ名 = カテゴリ名 として扱う
  const categories = fs
    .readdirSync(DATA_DIR)
    .filter((d) => fs.statSync(path.join(DATA_DIR, d)).isDirectory());

  if (categories.length === 0) {
    console.error(`[seed] No category directories found in ${DATA_DIR}`);
    process.exit(1);
  }

  console.log(`[seed] Found categories: ${categories.join(", ")}`);
  console.log("[seed] Initializing embedder...");
  // CLIP モデルをロード (初回は ~150MB ダウンロード)
  await initEmbedder();

  let total = 0;
  let failed = 0;

  // カテゴリ単位 → ファイル単位でループ
  for (const category of categories) {
    const dir = path.join(DATA_DIR, category);
    // 拡張子で画像ファイルだけに絞る
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

    console.log(`[seed] Processing ${category}: ${files.length} images`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const ext = path.extname(file).toLowerCase();
      const contentType = EXT_TO_MIME[ext] ?? "image/jpeg";

      try {
        // ① ファイル読み込み → ② Storage アップロード → ③ 埋め込み生成 → ④ DB INSERT
        const buffer = fs.readFileSync(filePath);
        const publicUrl = await uploadToStorage(
          category,
          file,
          buffer,
          contentType,
        );
        const embedding = await embedImage(buffer);

        // onConflictDoNothing: 同じ row が既に存在してもエラーで止まらない
        // (再シード時の安全装置)
        await db
          .insert(recipes)
          .values({
            name: `${category} - ${file}`,
            category,
            description: `${category} 料理`,
            imageUrl: publicUrl,
            embedding,
          })
          .onConflictDoNothing();

        total++;
        // 10 件ごとに進捗をログ (大量データの時に便利)
        if (total % 10 === 0) {
          console.log(`[seed]   ...${total} inserted`);
        }
      } catch (err) {
        // 1 ファイル失敗してもループ全体は止めず、最後に件数だけ集計
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
