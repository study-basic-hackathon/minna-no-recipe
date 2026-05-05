import Image from "next/image";

const recipe = {
  title: "ベーコンのアスパラ巻き",
  image: "/img-asparagus.png",
  ingredients: [
    {
      group: "材料",
      items: [
        { name: "アスパラガス", amount: "4本" },
        { name: "ベーコン", amount: "4枚" },
      ],
    },
    {
      group: "調味料",
      items: [
        { name: "オリーブオイル", amount: "大さじ1" },
        { name: "塩", amount: "少々" },
        { name: "黒胡椒", amount: "少々" },
      ],
    },
  ],
  instructions: [
    "アスパラガスは根元の硬い部分を切り落とし、必要に応じて皮をむく。",
    "ベーコンを広げ、アスパラガスを1本ずつ巻きつける。",
    "フライパンにオリーブオイルを熱し、ベーコンで巻いたアスパラガスを並べる。",
    "中火で約5分焼き、ベーコンがカリッとするまで焼く。",
    "焼きあがったら塩と黒胡椒で味を調える。",
  ],
};

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
        <section className="py-30 flex flex-col w-full gap-20 mx-auto">
          <section>
            <div className="flex flex-col gap-4 w-250 mx-auto">
              <div className="flex items-center gap-8 w-full">
                <a className="relative cursor-pointer w-100 h-72 rounded-lg overflow-hidden drop-shadow-lg">
                  <Image className="object-cover object-center" src="/img-asparagus.png" alt={"今月のおすすめメニュー"} width={400} height={287} />
                </a>
                <div
                  className="flex flex-col gap-6 flex-1 py-6 px-1"
                  style={{
                    borderTop: '1px solid transparent',
                    borderBottom: '1px solid transparent',
                    borderImage: 'repeating-linear-gradient(to right, #E97D35 0 8px, transparent 8px 16px) 1'
                  }}
                >
                  <h1 className="text-3xl font-bold">{recipe.title}</h1>
                  <p className="leading-[1.8]">
                    春から初夏にかけて旬を迎えるアスパラガスは、みずみずしく甘みが強いのが特徴です。特に北海道や長野県産が有名で、昼夜の寒暖差によってやわらかく風味豊かに育ちます。ベーコンで巻いて焼くことで、アスパラのシャキッとした食感と自然な甘さに、ベーコンの塩気と旨みが重なり、シンプルながら満足感のある一品に仕上がります。旬の味わいをぜひ楽しんでみてください。
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold border-b pb-2">材料</h2>

                {recipe.ingredients.map((group, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    {group.group && (
                      <h3 className="font-semibold text-[#E97D35]">
                        {group.group}
                      </h3>
                    )}

                    {/* 材料リスト */}
                    <ul className="flex flex-col divide-y border rounded-lg overflow-hidden">
                      {group.items.map((item, j) => (
                        <li
                          key={j}
                          className="flex justify-between px-4 py-2 bg-white"
                        >
                          <span>{item.name}</span>
                          <span className="text-gray-500">{item.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold border-b pb-2">作り方</h2>

                <ol className="flex flex-col gap-3">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-[#E97D35]">
                        {i + 1}.
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
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
      <footer className="w-full bg-[#FCBB15]">
        <div className="max-w-250 py-4 mx-auto">
          <p>みんなのレシピ</p>
        </div>
      </footer>
    </>
  );
}
