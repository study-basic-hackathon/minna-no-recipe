import { and, cosineDistance, desc, gte, isNotNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { images, trainingImages } from "../db/schema.js";
import { embedImage } from "../lib/embedder.js";
import { STORAGE_BUCKET, supabase } from "../lib/supabase.js";

// アップロードできるファイルサイズの上限 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 類似度がこの値未満は「マッチなし」として除外する
// (CLIP-base での経験値: 同じ料理 0.85+ / 似た系統 0.75+ / 別物 ~0.65)
const SIMILARITY_THRESHOLD = 0.7;

// 受け付ける画像 MIME と拡張子の対応表
// ファイル名の拡張子ではなく MIME から拡張子を決めることで、
// 偽装ファイル名 (例: "evil.png" だが中身は別物) を防ぐ
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const search = new Hono();

/**
 * POST /api/search
 *
 * 画像をアップロードして、類似する training_images を検索する。
 *  1. multipart で画像を受信
 *  2. Supabase Storage にアップロード
 *  3. CLIP で埋め込みを生成
 *  4. pgvector で training_images を類似度検索 (閾値以上のみ)
 *  5. images テーブルに保存
 *  6. JSON で結果を返却
 */
search.post("/", async (c) => {
  // ── 1. multipart フォームから画像ファイルを取り出してバリデーション ──
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json({ error: "file field is required" }, 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File size exceeds limit" }, 400);
  }
  // MIME ホワイトリストでチェックすると同時に拡張子を取得
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return c.json({ error: "Invalid file type" }, 400);
  }

  // クエリパラメータ ?limit=N (1〜20、既定値 5)
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 5, 1), 20);

  // 埋め込み生成と Storage アップロード両方で使うので Buffer 化
  const buffer = Buffer.from(await file.arrayBuffer());

  // ── 2. Supabase Storage にアップロード ──
  // ファイル名は UUID で生成。元のファイル名は信用しない (衝突 / 偽装の回避)
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return c.json({ error: uploadError.message }, 500);
  }

  // 公開 URL を取得 (これは API コールではなく文字列の組み立てだけ)
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  // ── 3. CLIP で埋め込みベクトルを生成 ──
  // 重い処理なので失敗の可能性あり。失敗したら直前にアップロードした
  // ファイルを Storage から削除して、孤立ファイルが残らないようにする
  let embedding;
  try {
    embedding = await embedImage(buffer);
  } catch (err) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    throw err;
  }

  // ── 4. pgvector でコサイン類似度検索 ──
  // `<=>` はコサイン距離 (0=同じ / 2=正反対) なので、
  // `1 - cosineDistance` でコサイン類似度 (1=同じ / -1=正反対) に変換する
  const similarity = sql<number>`1 - (${cosineDistance(trainingImages.embedding, embedding)})`;
  const searchResults = await db
    .select({
      id: trainingImages.id,
      name: trainingImages.name,
      description: trainingImages.description,
      category: trainingImages.category,
      imageUrl: trainingImages.imageUrl,
      similarity,
    })
    .from(trainingImages)
    .where(
      // 埋め込みがある かつ 閾値を超える行だけが対象
      and(
        isNotNull(trainingImages.embedding),
        gte(similarity, SIMILARITY_THRESHOLD),
      ),
    )
    .orderBy(desc(similarity))
    .limit(limit);

  // 一番類似度が高い結果のカテゴリを「推論されたカテゴリ」とする
  // (該当なし = 閾値を超えるレシピがなかった場合は null)
  const topCategory = searchResults[0]?.category ?? null;

  // ── 5. images テーブルに保存 (アップロード画像をデータ資産として永続化) ──
  // 失敗時は Storage の孤立ファイルを掃除してから 500 を返す
  let saved: { id: string } | undefined;
  try {
    [saved] = await db
      .insert(images)
      .values({
        storagePath: path,
        publicUrl,
        size: file.size,
        mimeType: file.type,
        embedding,
        matchedTrainingImageId: searchResults[0]?.id,
      })
      .returning({ id: images.id });
  } catch (err) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    console.error("[search] Failed to save image record:", err);
    return c.json({ error: "Failed to save image record" }, 500);
  }

  // returning() が空配列を返すエッジケース対策 (理論上ほぼ起きない)
  if (!saved) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return c.json({ error: "Failed to save image record" }, 500);
  }

  // ── 6. レスポンス ──
  // image: 今回アップロードした画像の ID と URL
  // searchResults: ベクトル類似度のヒット一覧 (各項目に similarity スコア)
  // category: 推論されたカテゴリ (フロントから /recipes に渡す)
  return c.json({
    image: {
      id: saved.id,
      path,
      url: publicUrl,
    },
    searchResults,
    category: topCategory,
  });
});
