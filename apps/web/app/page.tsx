import Image from "next/image";

const steps = [
  {
    title: "写真をアップロード",
    icon: "/icon-photo.svg",
    desc: "レシピを知りたい写真を下記からアップロードしてください",
  },
  {
    title: "類似レシピを検索",
    icon: "/icon-search.svg",
    desc: "アップロードされた画像から推測されるレシピを紹介します",
  },
  {
    title: "レシピで料理を再現",
    icon: "/icon-dishes.svg",
    desc: "アップロードされた画像から推測されるレシピを紹介します",
  },
];

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
                <h2 className="text-[#FE7210] font-semibold text-2xl">料理写真をアップロードしてレシピを検索</h2>
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
        <section className="bg-[#FFF9EB] py-20">
          <div className="flex flex-col items-center justify-center gap-6 w-250 mx-auto">
            <div className="flex flex-col items-center justify-center gap-2 w-250">
              <h2 className="text-3xl font-bold text-[#FE8C12]">写真からレシピを見つけよう</h2>
              <div className="text-center">
                <p>気になる料理の写真をアップロードするだけで、類似したレシピを簡単に検索できます。</p>
                <p>旅行先で食べた料理や、人気のカフェメニューを自宅で再現してみませんか？</p>
              </div>
            </div>
            <ol className="flex gap-10 w-full">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="
                      relative flex flex-1 min-w-0 flex-col border border-[#E97D35] rounded-lg
                      after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-8.5 after:w-6 after:h-12 after:bg-[#FCBB15]
                      after:[clip-path:polygon(0_0,100%_50%,0_100%)]
                      last:after:hidden
                    "
                >
                  <span className="w-full bg-[#E97D35] text-white text-center text-xl font-semibold rounded-t-lg py-2">
                    STEP {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="bg-white rounded-b-lg p-4 flex flex-col items-center gap-4">
                    <div className="grid place-items-center h-24 w-24 bg-[#FFF5EB] rounded-full">
                      <Image src={step.icon} alt={step.title} width={40} height={40} />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <p className="font-semibold text-[#E97D35] text-xl">{step.title}</p>
                      <p className="text-center">{step.desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section >
      </main >
    </>
  );
}
