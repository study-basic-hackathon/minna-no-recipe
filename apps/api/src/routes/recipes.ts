import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

export const recipes = new Hono();

recipes.get("/", async (c) => {
  const category = c.req.query("category");

  if (!category) {
    return c.json({ error: "category is required" }, 400);
  }

  //recipesテーブルをcategoryで検索
  const { data: recipes, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("category", category);

  //データ取得時に異常がある場合エラー
  if (recipeError) {
    console.error("recipes API error:", recipeError);
    return c.json({ error: "Internal server error" }, 500);
  }

  //該当レシピがない場合は 200 + 空配列を返す (フロント側で「該当なし」UI を表示)
  if (!recipes || recipes.length === 0) {
    return c.json({ response: [] });
  }

  //レシピの材料と手順を取得するためのIDを用意 (recipe_id は UUID 文字列)
  const recipeIdList: string[] = recipes.map((r) => r.recipe_id);

  //材料取得 (0件でもエラーにしない — 材料を持たないレシピも許容)
  const { data: ingredients, error: ingredientsError } = await supabase
    .from("ingredients")
    .select("*")
    .in("recipe_id", recipeIdList)
    .order("recipe_id")
    .order("ingredient_id");

  if (ingredientsError) {
    console.error("ingredients API error:", ingredientsError);
    return c.json({ error: "Internal server error" }, 500);
  }

  //手順取得 (0件でもエラーにしない)
  const { data: steps, error: stepsError } = await supabase
    .from("steps")
    .select("*")
    .in("recipe_id", recipeIdList)
    .order("recipe_id", { ascending: true })
    .order("step_number", { ascending: true });

  if (stepsError) {
    console.error("steps API error:", stepsError);
    return c.json({ error: "Internal server error" }, 500);
  }

  //材料をrecipe_idごとにグルーピング
  const ingredientsMap = (ingredients ?? []).reduce(
    (accumulator, ingredient) => {
      (accumulator[ingredient.recipe_id] ??= []).push(ingredient);
      return accumulator;
    },
    {} as Record<string, any[]>,
  );

  //手順をrecipe_idごとにグルーピング
  const stepsMap = (steps ?? []).reduce(
    (accumulator, step) => {
      (accumulator[step.recipe_id] ??= []).push(step);
      return accumulator;
    },
    {} as Record<string, any[]>,
  );

  //レシピ配列を生成
  //recipe_id はフロントが詳細ページへのリンクに使うため残す。timestamp のみ除外
  //destructure で破棄するキーは '_' プレフィックスで未使用宣言とする (lint 対応)
  const response = recipes.map((recipe) => {
    const {
      created_at: _created_at,
      updated_at: _updated_at,
      ...rest
    } = recipe;
    const recipe_id = recipe.recipe_id;

    return {
      ...rest,
      ingredients: (ingredientsMap[recipe_id] ?? []).map(
        ({
          recipe_id: _recipe_id,
          ingredient_id: _ingredient_id,
          created_at: _created_at,
          updated_at: _updated_at,
          ...rest
        }: any) => rest,
      ),
      steps: (stepsMap[recipe_id] ?? []).map(
        ({
          recipe_id: _recipe_id,
          step_id: _step_id,
          created_at: _created_at,
          updated_at: _updated_at,
          ...rest
        }: any) => rest,
      ),
    };
  });

  return c.json({ response });
});

// 最近追加されたレシピ一覧 (= ユーザーが投稿した料理セクション用)。
// 単純に created_at DESC で limit 件返すだけ。
//
// 静的セグメントなので "/:id" より前に定義する必要がある。
recipes.get("/recent", async (c) => {
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 7, 1), 50);

  const { data: recipesData, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (recipesError) {
    console.error("recent recipes API error:", recipesError);
    return c.json({ error: "Internal server error" }, 500);
  }

  // 一覧用なので ingredients/steps はネストせず、recipe_id + 基本フィールドのみ
  const response = (recipesData ?? []).map((recipe) => {
    const {
      created_at: _created_at,
      updated_at: _updated_at,
      ...rest
    } = recipe;
    return rest;
  });

  return c.json({ response });
});

// 最近検索されたメニュー一覧。
// 直近にアップロード/マッチした画像のカテゴリを集めて、
// それらのカテゴリに属するレシピを最新順で返す。
//
// 注意: このルートは "/:id" よりも前に定義する必要がある。
// Hono は定義順に評価するため、/:id が先だと "/recent-searches" が id 扱いされてしまう。
recipes.get("/recent-searches", async (c) => {
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 10, 1), 50);

  // 1. マッチ済みの最近のアップロード画像を取得 (matched_training_image_id でグループ化はせず素直に時系列)
  const { data: matchedImages, error: imagesError } = await supabase
    .from("images")
    .select("matched_training_image_id, created_at")
    .not("matched_training_image_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (imagesError) {
    console.error("recent-searches images API error:", imagesError);
    return c.json({ error: "Internal server error" }, 500);
  }

  if (!matchedImages || matchedImages.length === 0) {
    return c.json({ response: [] });
  }

  // 2. training_images の category を引く
  const trainingIds = matchedImages
    .map((m) => m.matched_training_image_id)
    .filter((id): id is string => Boolean(id));

  const { data: trainingImagesData, error: tiError } = await supabase
    .from("training_images")
    .select("id, category")
    .in("id", trainingIds);

  if (tiError) {
    console.error("recent-searches training_images API error:", tiError);
    return c.json({ error: "Internal server error" }, 500);
  }

  const idToCategory = new Map<string, string>(
    (trainingImagesData ?? [])
      .filter((t) => t.category)
      .map((t) => [t.id, t.category as string]),
  );

  // 3. 検索ヒット時系列に沿ってユニークなカテゴリ順を作る
  const orderedCategories: string[] = [];
  const seenCategories = new Set<string>();
  for (const img of matchedImages) {
    const cat = idToCategory.get(img.matched_training_image_id as string);
    if (cat && !seenCategories.has(cat)) {
      seenCategories.add(cat);
      orderedCategories.push(cat);
    }
  }

  if (orderedCategories.length === 0) {
    return c.json({ response: [] });
  }

  // 4. それらのカテゴリに属するレシピを取得 (一覧用なので ingredients/steps はネストしない)
  const { data: recipesData, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .in("category", orderedCategories)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (recipesError) {
    console.error("recent-searches recipes API error:", recipesError);
    return c.json({ error: "Internal server error" }, 500);
  }

  // recipe_id は維持、timestamps のみ除外
  const response = (recipesData ?? []).map((recipe) => {
    const {
      created_at: _created_at,
      updated_at: _updated_at,
      ...rest
    } = recipe;
    return rest;
  });

  return c.json({ response });
});

// recipe_id (UUID) で単一レシピを取得する詳細用エンドポイント。
// 一覧用 ("/" + ?category=...) とは別経路。Hono は静的セグメント vs 動的セグメントを区別する。
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

recipes.get("/:id", async (c) => {
  const id = c.req.param("id");

  // 不正な UUID は Supabase に投げる前に 400 で弾く
  // (DB に投げると "invalid input syntax for type uuid" の 500 になり原因が分かりづらい)
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "invalid id format" }, 400);
  }

  // 単一レシピ取得
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("recipe_id", id)
    .maybeSingle(); // 0 件なら null を返す (1 件以上だと PostgrestError)

  if (recipeError) {
    console.error("recipes detail API error:", recipeError);
    return c.json({ error: "Internal server error" }, 500);
  }

  if (!recipe) {
    return c.json({ error: "recipe not found" }, 404);
  }

  // 関連する材料・手順
  const [ingredientsResult, stepsResult] = await Promise.all([
    supabase
      .from("ingredients")
      .select("*")
      .eq("recipe_id", id)
      .order("ingredient_id"),
    supabase
      .from("steps")
      .select("*")
      .eq("recipe_id", id)
      .order("step_number", { ascending: true }),
  ]);

  if (ingredientsResult.error) {
    console.error("ingredients API error:", ingredientsResult.error);
    return c.json({ error: "Internal server error" }, 500);
  }
  if (stepsResult.error) {
    console.error("steps API error:", stepsResult.error);
    return c.json({ error: "Internal server error" }, 500);
  }

  // 不要カラム (timestamps, FK) を取り除いてネスト構造で返す
  const { created_at: _created_at, updated_at: _updated_at, ...rest } = recipe;

  const data = {
    ...rest,
    ingredients: (ingredientsResult.data ?? []).map(
      ({
        recipe_id: _recipe_id,
        ingredient_id: _ingredient_id,
        created_at: _created_at,
        updated_at: _updated_at,
        ...rest
      }: any) => rest,
    ),
    steps: (stepsResult.data ?? []).map(
      ({
        recipe_id: _recipe_id,
        step_id: _step_id,
        created_at: _created_at,
        updated_at: _updated_at,
        ...rest
      }: any) => rest,
    ),
  };

  return c.json({ data });
});
