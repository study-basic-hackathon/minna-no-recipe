"use client";

/**
 * Next.js App Router の共通エラー境界。
 *
 * このルート以下のサーバー/クライアントコンポーネントで未捕捉の例外が
 * throw されたとき、Next.js が自動でこのコンポーネントを描画する。
 *
 * クライアント側のイベントハンドラーで投げた例外は自動では伝搬しないので、
 * 呼び出し側で `setError(err); throw err;` のような再 throw パターンか、
 * state にエラーを溜めてレンダー時に `if (err) throw err` する。
 *
 * 用途:
 *  - 4xx / 5xx のサーバー応答 (ネットワーク到達後の異常)
 *  - fetch そのものが失敗するネットワーク障害
 *  - 想定外の例外
 *
 * inline で出す方が良いケース (例: 該当レシピ 0 件、検索ヒットなし) は
 * 呼び出し側で state 表示する。ここに到達させない。
 */
type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: Props) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-semibold">エラーが発生しました</h1>
      <p className="text-zinc-700">{error.message || "予期しないエラーです。"}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-orange-500 px-8 py-2 font-semibold text-white hover:bg-orange-600"
      >
        再試行
      </button>
    </main>
  );
}
