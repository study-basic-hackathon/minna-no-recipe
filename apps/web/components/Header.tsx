import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white/90 shadow-md">
      <div className="mx-auto flex max-w-250 items-center justify-between py-3">
        <h1>
          <Link href="#">
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
          className="rounded-full bg-[#FE8C12] px-6 py-2 font-semibold text-white transition hover:opacity-80"
        >
          レシピを探す
        </Link>
      </div>
    </header>
  );
};

export default Header;
