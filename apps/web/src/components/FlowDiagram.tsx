import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { useId, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { id: "knowledge", label: "Human knowledge", x: 70, y: 48 },
  { id: "retrieval", label: "Retrieval", x: 220, y: 48 },
  { id: "payment", label: "Payment", x: 370, y: 48 },
  { id: "split", label: "Royalty split", x: 520, y: 48 },
  { id: "vault", label: "Residuals Vault", x: 670, y: 48 },
  { id: "withdraw", label: "Withdraw", x: 820, y: 48 },
];

export function FlowDiagram({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");

  useGSAP(
    () => {
      if (reduce || !root.current) return;
      const ctx = gsap.context(() => {
        const path = root.current!.querySelector<SVGPathElement>(".flow-path");
        const nodes = gsap.utils.toArray<SVGElement>(".flow-node");
        const pulses = gsap.utils.toArray<SVGCircleElement>(".flow-pulse");
        if (path) {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              end: "bottom 55%",
              scrub: 0.8,
            },
          });
        }
        gsap.from(nodes, {
          opacity: 0,
          scale: 0.7,
          transformOrigin: "center",
          stagger: 0.08,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
          },
        });
        pulses.forEach((p, i) => {
          gsap.to(p, {
            opacity: 0.9,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            delay: i * 0.25,
            ease: "sine.inOut",
          });
        });
      }, root);
      return () => ctx.revert();
    },
    { dependencies: [reduce], scope: root },
  );

  return (
    <div ref={root} className={className} aria-hidden>
      <svg
        viewBox="0 0 900 140"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Knowledge to withdrawal royalty flow"
      >
        <defs>
          <linearGradient id={`g-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c48a3a" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#e8c48a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c48a3a" stopOpacity="0.35" />
          </linearGradient>
          <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="flow-path"
          d="M70 48 H820"
          fill="none"
          stroke={`url(#g-${uid})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {steps.map((s, i) => (
          <g key={s.id} className="flow-node" transform={`translate(${s.x}, ${s.y})`}>
            <circle
              className="flow-pulse"
              r="18"
              fill="none"
              stroke="#c48a3a"
              strokeOpacity="0.35"
              opacity={0.35}
            />
            <circle
              r="10"
              fill="#101012"
              stroke="#c48a3a"
              strokeWidth="1.5"
              filter={`url(#glow-${uid})`}
            />
            <circle r="3.5" fill="#e8c48a" />
            <text
              y="36"
              textAnchor="middle"
              fill="#8a8a90"
              fontSize="11"
              fontFamily="Outfit, sans-serif"
            >
              {s.label}
            </text>
            {i < steps.length - 1 ? (
              <path
                d="M14 0 H38"
                stroke="#c48a3a"
                strokeOpacity="0.25"
                strokeWidth="1"
                fill="none"
              />
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
