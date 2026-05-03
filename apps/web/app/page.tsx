import Image from "next/image";

export default function Home() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/90 shadow-md z-50">
        <div className="flex justify-between items-center max-w-250 p-2 mx-auto">
          <h1>
            <a href="#">
              <Image src="/logo.svg" alt="みんなのレシピ" width={200} height={40} />
            </a>
          </h1>
          <a className="rounded-full bg-[#FE8C12] text-white px-6 py-2 hover:opacity-80 transition" href="">
            レシピを探す
          </a>
        </div>
      </header>
      <main>
        <section className="bg-[url('/bg-search.webp')] bg-cover bg-center bg-no-repeat pt-41 pb-20">
          <div className="flex flex-col items-center justify-center gap-7 w-250 mx-auto">
            <form className="flex flex-col items-center justify-center w-full gap-6 bg-white/90 border border-dashed border-[#886D74] rounded-2xl p-10">
              <label className="before:block before:content-[''] before:h-17.5 before:w-25 before:bg-[url(/icon-upload.svg)] before:bg-center before:bg-no-repeat">
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="sr-only"
                />
              </label>
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-[#FE7210] font-semibold text-2xl">料理写真をアップロードしてレシピを検索</p>
                <p>ドラッグ&ドロップまたはクリックして選択</p>
              </div>
            </form>
            <button
              className="rounded-full bg-[#FE8C12] px-16 py-1 font-semibold text-[32px] text-white disabled:opacity-50 shadow-md"
              type="submit"
            >
              検索する
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
