import Image from "next/image";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 shadow-md z-50">
      <div className="flex justify-between items-center max-w-250 py-3 mx-auto">
        <h1>
          <a href="#">
            <Image src="/logo.svg" alt="みんなのレシピ" width={200} height={40} />
          </a>
        </h1>
        <a className="rounded-full bg-[#FE8C12] text-white font-semibold px-6 py-2 hover:opacity-80 transition" href="">
          レシピを探す
        </a>
      </div>
    </header>

  )
}

export default Header