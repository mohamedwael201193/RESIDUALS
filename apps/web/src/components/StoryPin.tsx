import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const beats = [
  {
    title: "AI answers. Humans disappear.",
    body: "Models train on human expertise, then ship replies with no path back to the people who knew.",
  },
  {
    title: "Nobody gets paid for being right.",
    body: "Citations are decoration. Fees stay with platforms. The practical how-to stays invisible.",
  },
  {
    title: "RESIDUALS flips the loop.",
    body: "Every paid query retrieves from a human corpus, then accrues a share of the fee to cited contributors.",
  },
  {
    title: "Knowledge becomes settleable.",
    body: "Royalties batch into ResidualsVault on X Layer. Contributors withdraw USD₮0 when ready.",
  },
];

export function StoryPin() {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduce || !wrap.current) return;
      const panels = gsap.utils.toArray<HTMLElement>(".story-panel");
      const last = panels[panels.length - 1];
      if (!last) return;
      panels.forEach((panel, i) => {
        const next = panels[i + 1];
        if (!next) return;
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          endTrigger: last,
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(panel, {
          scale: 0.94,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    },
    { dependencies: [reduce], scope: wrap },
  );

  return (
    <section ref={wrap} className="relative">
      {beats.map((b) => (
        <div
          key={b.title}
          className="story-panel sticky top-0 flex min-h-[100dvh] items-center justify-center px-5 py-24 md:px-8"
        >
          <div className="glass-panel w-full max-w-3xl rounded-[28px] p-8 md:p-14">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-5xl md:leading-[1.1]">
              {b.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              {b.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
