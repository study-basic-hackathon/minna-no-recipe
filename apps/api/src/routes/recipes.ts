import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

export const recipes = new Hono();

recipes.get("/", async (c) => {
  const category = c.req.query("category");

  if (!category) {
    return c.json({ error: "category is required" }, 400);
  }

  //recipesテーブルをcategoryで検索
  const { data:recipes, error:recipeError } = await supabase
    .from("recipes")
    .select("*")
    .eq("category",category);

  //データ取得時に異常がある場合エラー
  if (recipeError) {
    console.error("recipes API error:",recipeError);
    return c.json({ error: "Internal server error"}, 500);
  }

  //該当レシピがない場合は 200 + 空配列を返す (フロント側で「該当なし」UI を表示)
  if(!recipes || recipes.length === 0){
    return c.json({ response: [] });
  }

  //レシピの材料と手順を取得するためのIDを用意 (recipe_id は UUID 文字列)
  const recipeIdList: string[] = recipes.map(r => r.recipe_id);

  //材料取得 (0件でもエラーにしない — 材料を持たないレシピも許容)
  const {data:ingredients,error:ingredientsError} = await supabase
    .from("ingredients")
    .select("*")
    .in("recipe_id",recipeIdList)
    .order("recipe_id")
    .order("ingredient_id");

  if (ingredientsError) {
    console.error("ingredients API error:",ingredientsError);
    return c.json({ error: "Internal server error"}, 500);
  }

  //手順取得 (0件でもエラーにしない)
  const {data:steps,error:stepsError} = await supabase
    .from("steps")
    .select("*")
    .in("recipe_id",recipeIdList)
    .order("recipe_id", { ascending: true })
    .order("step_number", { ascending: true });

  if (stepsError) {
    console.error("steps API error:",stepsError);
    return c.json({ error: "Internal server error"}, 500);
  }

  //材料をrecipe_idごとにグルーピング
  const ingredientsMap = (ingredients ?? []).reduce((accumulator, ingredient) => {
    (accumulator[ingredient.recipe_id] ??= []).push(ingredient);
    return accumulator;
  },{} as Record<string, any[]>);

  //手順をrecipe_idごとにグルーピング
  const stepsMap = (steps ?? []).reduce((accumulator, step) => {
    (accumulator[step.recipe_id] ??= []).push(step);
    return accumulator;
  },{} as Record<string, any[]>);

  //レシピ配列を生成
  const response = recipes.map(recipe => {
    //使用しないカラムはここで取り除く
    const { recipe_id,created_at,updated_at, ...rest } = recipe;

    return{
      ...rest,
      ingredients: (ingredientsMap[recipe_id] ?? []).map(({ recipe_id,ingredient_id,created_at,updated_at,...rest }: any) => rest),
      steps: (stepsMap[recipe_id] ?? []).map(({ recipe_id,step_id,created_at,updated_at,...rest }: any) => rest)
    };
  });

  return c.json({ response });
});