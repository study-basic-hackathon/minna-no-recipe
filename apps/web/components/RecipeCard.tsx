import Image from "next/image";

type RecipeStep = {
  title: string;
  icon: string;
  desc: string;
};

const RecipeCard = ({ step, i }: { step: RecipeStep; i: number }) => {
  return (
    <li
      key={step.title}
      className="relative flex min-w-0 flex-1 flex-col rounded-lg border border-[#E97D35] after:absolute after:top-1/2 after:-right-8.5 after:h-12 after:w-6 after:-translate-y-1/2 after:bg-[#FCBB15] after:content-[''] after:[clip-path:polygon(0_0,100%_50%,0_100%)] last:after:hidden"
    >
      <span className="w-full rounded-t-lg bg-[#E97D35] py-2 text-center text-xl font-semibold text-white">
        STEP {String(i + 1).padStart(2, "0")}
      </span>
      <div className="flex flex-col items-center gap-4 rounded-b-lg bg-white p-4">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-[#FFF5EB]">
          <Image src={step.icon} alt={step.title} width={40} height={40} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-semibold text-[#E97D35]">{step.title}</p>
          <p className="text-center">{step.desc}</p>
        </div>
      </div>
    </li>
  );
};

export default RecipeCard;
