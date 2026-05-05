-- recipes テーブルを training_images にリネームする。
-- 中身は「料理」ではなくラベル付き画像 (学習・検索の対象データ) のため
-- 名前を実態に合わせる。

ALTER TABLE recipes RENAME TO training_images;

-- 外部キーカラムも対応する名前に
ALTER TABLE images
  RENAME COLUMN matched_recipe_id TO matched_training_image_id;

-- HNSW インデックスもリネーム
ALTER INDEX recipes_embedding_idx RENAME TO training_images_embedding_idx;
