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

const recentMenus = [
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-asparagus.png",
  },
];

export default function Home() {
  return (
    <>
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
      <main>
        <section className="bg-[url('/bg-search.webp')] bg-cover bg-center bg-no-repeat pt-41 pb-20">
          <div className="flex flex-col items-center justify-center gap-7 w-250 mx-auto">
            <form className="flex flex-col items-center justify-center w-full max-w-250 mx-auto gap-8 bg-white/90 rounded-2xl p-10">
              <label className="before:block before:content-[''] before:h-12.5 before:w-20 before:bg-[url(/icon-upload.svg)] before:bg-contain before:bg-center before:bg-no-repeat">
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="sr-only"
                />
              </label>
              <div className="flex flex-col items-center justify-center gap-2">
                <h2 className="text-[#FE7210] font-semibold text-3xl">料理写真をアップロードしてレシピを検索</h2>
                <p>ドラッグ&ドロップまたはクリックして選択</p>
              </div>
            </form>
            <button
              type="submit"
              className="rounded-full bg-[#FE8C12] px-16 py-2 font-semibold text-2xl text-white disabled:opacity-50 drop-shadow-md">
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
                    ">
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
        </section>
        <section className="py-30 flex flex-col w-full gap-20 mx-auto">
          <section>
            <div className="flex flex-col gap-4 w-250 mx-auto">
              <h2 className="flex items-end gap-2 text-2xl font-bold
              before:content-[''] before:block before:w-11 before:h-10 before:bg-[url('/title-crown.svg')] before:bg-contain before:bg-no-repeat">
                今月のおすすめメニュー
              </h2>
              <div className="flex items-center gap-8 w-full">
                <div className="relative w-100 h-72 rounded-lg overflow-hidden drop-shadow-lg">
                  <Image className="object-cover object-center" src="/img-asparagus.png" alt={"今月のおすすめメニュー"} width={400} height={287} />
                  <span className="absolute bottom-0 left-0 w-full p-4 bg-white/90">
                    ベーコンのアスパラ巻き
                  </span>
                </div>
                <div
                  className="flex-1 py-6 px-1"
                  style={{
                    borderTop: '1px solid transparent',
                    borderBottom: '1px solid transparent',
                    borderImage: 'repeating-linear-gradient(to right, #E97D35 0 8px, transparent 8px 16px) 1'
                  }}
                >
                  <p className="leading-[1.8]">
                    春から初夏にかけて旬を迎えるアスパラガスは、みずみずしく甘みが強いのが特徴です。特に北海道や長野県産が有名で、昼夜の寒暖差によってやわらかく風味豊かに育ちます。ベーコンで巻いて焼くことで、アスパラのシャキッとした食感と自然な甘さに、ベーコンの塩気と旨みが重なり、シンプルながら満足感のある一品に仕上がります。旬の味わいをぜひ楽しんでみてください。
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className="flex flex-col gap-4 w-250 mx-auto">
              <h2 className="flex items-end gap-2 text-2xl font-bold
              before:content-[''] before:block before:w-11 before:h-10 before:bg-[url('/title-cutlery.svg')] before:bg-contain before:bg-no-repeat">
                最近検索されたメニュー
              </h2>
              <ul className="
              grid gap-6 w-full overflow-x-auto
              grid-flow-col
              auto-cols-[296px]
              p-2
              pb-8
              snap-x snap-mandatory
            ">
                {recentMenus.map((menu, index) => (
                  <li key={index} className="grid grid-rows-[auto_1fr] drop-shadow-lg">
                    <a className="contents" href={menu.link}>
                      <div className="relative w-full h-58 rounded-t-xl overflow-hidden">
                        <Image className="object-cover object-center" src={menu.image} alt={menu.name} fill />
                      </div>
                      <span className="bg-white rounded-b-xl p-4">{menu.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </main >
    </>
  );
}
