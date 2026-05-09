import Image from "next/image";
import Link from "next/link";
import { HomeUploadSection } from "../components/HomeUploadSection";

import RecipeCard from "../components/RecipeCard";

// 「今月のおすすめメニュー」のリンク先 recipe_id (運営キュレーションのため固定)
// DB に投入済み: name='ベーコンのアスパラ巻き', category='asparagus'
const MONTHLY_FEATURED_RECIPE_ID = "81fc2557-a3fb-4cd0-92b3-54b8ee847e15";
/**
 * @deprecated 仮データ。API 完成後に削除し、サーバーから取得するように差し替える。
 */
import recentMenusMock from "@/mock/recentMenus.json";

/**
 * @deprecated 仮データ。API 完成後に削除し、サーバーから取得するように差し替える。
 */
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
    desc: "再現してみた料理を投稿して他の人にもシェアしよう！",
  },
];

/**
 * @deprecated 仮データ。API 完成後に削除し、ユーザー投稿一覧をサーバーから取得するように差し替える。
 */
const works = [
  {
    name: "アスパラガスのベーコン巻き",
    link: "#",
    image: "/img-asparagus.png",
  },
  {
    name: "ステーキとポテトの鉄板焼き",
    link: "#",
    image: "/img-bakedpotato.jpg",
  },
  {
    name: "オートミールクッキー",
    link: "#",
    image: "/img-cookies.jpg",
  },
  {
    name: "リボンパスタのジェノベーゼ",
    link: "#",
    image: "/img-pasta.jpg",
  },
  {
    name: "5色野菜のサラダ",
    link: "#",
    image: "/img-salad.jpg",
  },
  {
    name: "ブルーベリーのフレンチトースト",
    link: "#",
    image: "/img-toast.jpg",
  },
  {
    name: "ツナとキャベツのホットサンド",
    link: "#",
    image: "/img-hotsand.jpg",
  },
  {
    name: "サンラータン",
    link: "#",
    image: "/img-noodle.jpg",
  },
  {
    name: "鶏胸肉のグリル",
    link: "#",
    image: "/img-chicken.jpg",
  },
];

type RecentMenu = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export default async function Home() {
  // TODO: API 完成後は下記の fetch を有効化してバックエンドから取得する。
  // 現状は self-fetch でビルド時 prerender が失敗する可能性があるため、
  // 一時的に import で代用している。
  // const res = await fetch(
  //   "http://localhost:3000/mock/recentMenus.json",
  //   {
  //     cache: "no-store",
  //   }
  // );
  //
  // if (!res.ok) {
  //   throw new Error("recentMenus の取得に失敗しました");
  // }
  //
  // const json = await res.json();
  const recentMenus: RecentMenu[] = recentMenusMock.data;

  return (
    <main>
      <section className="bg-[url('/bg-search.webp')] bg-cover bg-center bg-no-repeat pt-41 pb-20">
        <div className="flex flex-col items-center justify-center gap-7 w-250 mx-auto">
          <HomeUploadSection />
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
              <RecipeCard key={i} step={step} i={i} />))}
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
            {/* 今月のおすすめは表示自体は固定 (運営キュレーション扱い)。 */}
            {/* リンク先のみ DB に存在する実レシピ ID を指す。 */}
            {/* TODO: 月替わりで対象を入れ替える運用が決まったら featured フラグや別テーブルに置き換える */}
            <div className="flex items-center gap-8 w-full">
              <Link
                href={`/recipes/${MONTHLY_FEATURED_RECIPE_ID}`}
                className="relative cursor-pointer w-100 h-72 rounded-lg overflow-hidden drop-shadow-lg"
              >
                <Image className="object-cover object-center" src="/img-asparagus.png" alt={"今月のおすすめメニュー"} width={400} height={287} />
                <span className="absolute bottom-0 left-0 w-full p-4 bg-white/90">
                  ベーコンのアスパラ巻き
                </span>
              </Link>
              <div
                className="flex flex-col gap-6 items-end flex-1 py-6 px-1"
                style={{
                  borderTop: '1px solid transparent',
                  borderBottom: '1px solid transparent',
                  borderImage: 'repeating-linear-gradient(to right, #E97D35 0 8px, transparent 8px 16px) 1'
                }}
              >
                <p className="leading-[1.8]">
                  春から初夏にかけて旬を迎えるアスパラガスは、みずみずしく甘みが強いのが特徴です。特に北海道や長野県産が有名で、昼夜の寒暖差によってやわらかく風味豊かに育ちます。ベーコンで巻いて焼くことで、アスパラのシャキッとした食感と自然な甘さに、ベーコンの塩気と旨みが重なり、シンプルながら満足感のある一品に仕上がります。旬の味わいをぜひ楽しんでみてください。
                </p>
                <Link href={`/recipes/${MONTHLY_FEATURED_RECIPE_ID}`} className="text-[#E97D35] hover:underline transition-all duration-100 font-semibold">
                  →レシピを見る
                </Link>
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
                  <a className="contents" href={`/recipes/${menu.slug}`}>
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
        <section>
          <div className="flex flex-col gap-4 w-250 mx-auto">
            <h2 className="flex items-end gap-2 text-2xl font-bold
              before:content-[''] before:block before:w-11 before:h-10 before:bg-[url('/icon-dishes.svg')] before:bg-contain before:bg-no-repeat">
              ユーザーが投稿した料理たち
            </h2>
            {/* 3 列レイアウト (左:2 / 中央:3 / 右:2 = 計 7 件)。 */}
            {/* 自動分配 (columns-3) だと中央 3 件を保証できないため、列を明示的に作る。 */}
            <div className="grid grid-cols-3 gap-6 p-2 pb-8">
              {[
                works.slice(0, 2), // 左列 2 件
                works.slice(2, 5), // 中央列 3 件
                works.slice(5, 7), // 右列 2 件
              ].map((column, columnIndex) => (
                <ul
                  key={columnIndex}
                  className="flex flex-col gap-6"
                >
                  {column.map((menu, index) => (
                    <li key={index}>
                      <a href={menu.link} className="block drop-shadow-lg">
                        <div className="overflow-hidden rounded-t-xl bg-white">
                          <Image
                            src={menu.image}
                            alt={menu.name}
                            width={296}
                            height={200}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                        <span className="block bg-white rounded-b-xl p-4">
                          {menu.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main >
  );
}
