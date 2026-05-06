import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// ベクトル検索の対象となるラベル付き画像 (学習データ)
// 「料理」ではなくカテゴリ付きの食品画像で、CLIP 埋め込みを保存しておき
// アップロードされた画像との類似度検索に使う
export const trainingImages = pgTable("training_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  imageUrl: text("image_url"),
  embedding: vector("embedding", { dimensions: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ユーザーがアップロードした画像とその埋め込みを永続化するテーブル
// (データ資産として蓄積される)
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  storagePath: text("storage_path").notNull(),
  publicUrl: text("public_url").notNull(),
  size: integer("size"),
  mimeType: text("mime_type"),
  embedding: vector("embedding", { dimensions: 512 }),
  // どの training_images にマッチしたかの参照 (top-1)
  matchedTrainingImageId: uuid("matched_training_image_id").references(
    () => trainingImages.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type TrainingImage = typeof trainingImages.$inferSelect;
export type NewTrainingImage = typeof trainingImages.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
