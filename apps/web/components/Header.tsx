"use client";

import Image from "next/image";
import Link from "next/link";

const Header = () => {
  // 「レシピを探す」クリック時:
  //  - 別ページにいる場合は href="/" によりホームへ遷移 (デフォルトでページ上部に着地)
  //  - 既にホームの場合はナビゲーションが起きないので onClick でページ上部へスクロール
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white/90 shadow-md">
      <div className="mx-auto flex max-w-250 items-center justify-between py-3">
        <h1>
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="みんなのレシピ"
              width={200}
              height={40}
            />
          </Link>
        </h1>
        <Link
          href="/"
          onClick={scrollToTop}
          className="rounded-full bg-[#FE8C12] px-6 py-2 font-semibold text-white transition hover:opacity-80"
        >
          レシピを探す
        </Link>
      </div>
    </header>
  );
};

export default Header;
