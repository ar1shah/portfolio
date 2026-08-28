import { PhotoFrame } from "@/components/hero/PhotoFrame";
import { IntroTerminal } from "./IntroTerminal";

export function AboutBlock() {
  return (
    <section className="shell pb-20">
      <div className="hairline grid grid-cols-1 justify-center justify-items-center gap-10 pt-14 lg:grid-cols-[420px_minmax(340px,36rem)] lg:gap-16 lg:items-center">
        <PhotoFrame />

        <div className="w-full max-w-[36rem]">
          <IntroTerminal />
        </div>
      </div>
    </section>
  );
}
