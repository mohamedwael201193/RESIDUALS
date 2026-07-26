# DESIGN.md — RESIDUALS

## Brand Identity
- **Personality**: precise, cinematic, trustworthy, operator-grade
- **Voice**: direct, concrete, no yield/APY language
- **Core metaphor**: residual royalty streams from human knowledge into a vault
- **Inspiration**: Planhat spacing/story rhythm, Linear precision, Vercel restraint (never cloned)

## Dials
- DESIGN_VARIANCE: 8
- MOTION_INTENSITY: 7
- VISUAL_DENSITY: 4

## Color System (dark theme lock)
- **Canvas / bg**: `#070708`
- **Surface**: `#101012`
- **Surface raised**: `#16161a`
- **Border**: `rgba(255,255,255,0.08)`
- **Text**: `#f2f2f0`
- **Text muted**: `#8a8a90`
- **Accent**: `#c48a3a` (amber)
- **Accent soft**: `#e8c48a`
- **Accent glow**: `rgba(196,138,58,0.28)`
- **Danger / warn**: same amber family (no rainbow status palette)

## Typography
- **Display / Body**: Outfit
- **Mono**: JetBrains Mono (addresses, amounts, ledger)
- **Hero**: clamp(2.75rem, 5.5vw, 5rem), weight 600, tracking -0.04em, max 2–3 lines
- **Section**: 2–3xl, tracking tight

## Spacing
- Base: 8px
- Section vertical: `py-24 md:py-36 lg:py-48`
- Content max: 1400px marketing / 1100px product

## Shape
- Buttons: full pill
- Panels / inputs: 16px radius
- No mixed radius systems

## Motion
- Ease out: `cubic-bezier(0.16, 1, 0.3, 1)`
- Spring interactive: stiffness 220, damping 20
- Animate only transform + opacity
- Respect `prefers-reduced-motion`
- GSAP ScrollTrigger isolated in leaf components; Motion elsewhere

## Components
- Nav: glass floating bar, ≤72px
- Hero: asymmetric split + animated flow diagram (not fake dashboard)
- CTAs: primary solid amber-on-dark or ink-on-amber; secondary ghost border
- Cards: only for interactive product panels; marketing prefers rules + space

## Do
- Tell the royalty story on every scroll
- Unique layout per section
- Real API-wired product surfaces unchanged in logic

## Don't
- Purple AI glow defaults
- Em-dashes
- Section-number eyebrows
- Custom cursor hiding
- Inter as display
- Fake yield / forever earn copy
- Change API / vault / wallet contracts
