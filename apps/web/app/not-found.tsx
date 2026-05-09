import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FFF9EB] px-4 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-6xl font-bold text-[#FE8C12]">
          404
        </p>

        <h1 className="text-2xl font-bold">
          ページが見つかりません
        </h1>

        <p className="text-zinc-600">
          お探しのページは存在しないか、
          削除された可能性があります。
        </p>
      </div>

      <Link
        href="/"
        className="rounded-full bg-[#FE8C12] px-6 py-3 font-bold text-white transition hover:opacity-80"
      >
        トップページへ戻る
      </Link>
    </main>
  );
}