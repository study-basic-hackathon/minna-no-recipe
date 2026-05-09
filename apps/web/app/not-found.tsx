import Link from "next/link";

/**
 * Next.js App Router の標準 404 ページ。
 *
 * `notFound()` が呼ばれたとき、または存在しないルートへのアクセス時に描画される。
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex flex-1 max-w-xl flex-col items-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-semibold">ページが見つかりませんでした</h1>
      <p className="text-zinc-700">
        お探しのレシピやページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="rounded-full bg-orange-500 px-8 py-2 font-semibold text-white hover:bg-orange-600"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
