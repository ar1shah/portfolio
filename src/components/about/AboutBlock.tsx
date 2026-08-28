import { PhotoFrame } from "@/components/hero/PhotoFrame";
import { IntroTerminal } from "./IntroTerminal";

export function AboutBlock() {
  return (
    <section className="shell pb-20">
      <div className="hairline grid grid-cols-1 justify-center justify-items-center gap-10 pt-14 md:grid-cols-[300px_minmax(0,28rem)] md:gap-16 md:items-center">
        <PhotoFrame />

        <div className="w-full max-w-[28rem]">
          <IntroTerminal />
        </div>
      </div>
    </section>
  );
}
