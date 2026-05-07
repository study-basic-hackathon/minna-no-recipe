import Image from "next/image";

const Step = ({ step, i }: { step: any; i: number }) => {
  return (
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
  );
};

export default Step;