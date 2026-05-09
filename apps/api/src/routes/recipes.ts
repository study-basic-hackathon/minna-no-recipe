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
