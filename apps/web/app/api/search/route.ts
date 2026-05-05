/**
 * Next.js の Route Handler (BFF プロキシ)
 *
 * クライアント (`/api/search`) → ここ → Hono バックエンド (`${API_URL}/api/search`)
 *
 * これにより:
 *  - クライアントは同一オリジンの相対パスだけ叩けば良い (CORS 不要)
 *  - バックエンドの URL や認証情報をクライアントに露出しない
 *  - 必要なら認証ヘッダ追加・キャッシング等をここで挟める
 */
import type { NextRequest } from "next/server";

// /api/search のレスポンスを構成する training_images 1 件
export type TrainingImage = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
};

// 類似度スコア付きの検索結果 1 件
export type SearchResultItem = TrainingImage & { similarity: number };

// /api/search のレスポンス全体
export type SearchResult = {
  image: { id: string; path: string; url: string }; // アップロード画像の保存先
  searchResults: SearchResultItem[]; // 類似度の高い順のヒット一覧
  category: string | null; // 推論されたカテゴリ (該当なし時は null)
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  // クライアントから送られた multipart をそのまま Hono に転送する
  const formData = await request.formData();

  const upstream = await fetch(`${API_URL}/api/search`, {
    method: "POST",
    body: formData,
  });

  // バックエンドのレスポンスをそのままクライアントに返す
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
