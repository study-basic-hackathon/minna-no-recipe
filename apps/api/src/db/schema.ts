import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
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

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  storagePath: text("storage_path").notNull(),
  publicUrl: text("public_url").notNull(),
  size: integer("size"),
  mimeType: text("mime_type"),
  embedding: vector("embedding", { dimensions: 512 }),
  matchedRecipeId: uuid("matched_recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
