# RESIDUALS Design System

Planhat-inspired B2B marketing + product UI for the RESIDUALS A2MCP agent.

## Design read

B2B SaaS marketing + product landing for hackathon judges, with Planhat-style premium language, leaning toward Tailwind v4 + Outfit + motion.

## Dials

| Dial | Value | Notes |
|------|-------|-------|
| DESIGN_VARIANCE | 6 | Centered cinematic hero (Planhat OK); alternate section rhythms below |
| MOTION_INTENSITY | 6 | Scroll fades, hero stagger, restrained CTA hover |
| VISUAL_DENSITY | 3 | Airy; `py-32`+ section padding; sparse copy |

## Color tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-canvas` | `#ffffff` | Light sections, trust strip |
| `--color-ink` | `#0a0a0a` | Near-black sections, primary text on light |
| `--color-ink-muted` | `#5c5c5c` | Secondary body on light |
| `--color-ink-inverse` | `#f5f5f5` | Body on dark |
| `--color-amber` | `#C48A3A` | Accent only (icons, focus, sparse highlights) |
| `--color-amber-soft` | `#E8C48A` | Soft amber on dark |
| `--color-hairline` | `#e8e8e8` | Borders on light |
| `--color-hairline-dark` | `#222222` | Borders on dark |
| `--color-scrim` | `rgba(0,0,0,0.55)` | Hero readability over photography |

Accent rule: amber is sparingly used. Never purple gradients. Never Inter.

## Typography

- **Family:** Outfit (`@fontsource/outfit`), weights 300-700
- **Display:** large, tight tracking (`tracking-tight`), 1.05-1.15 line-height
- **Body:** 16-18px, relaxed leading, max ~60ch
- **No em-dashes** in UI copy. Prefer periods or commas.
- **Eyebrows:** max 1 per 3 sections; no section-number eyebrows

## Layout language

1. Transparent nav over hero photography
2. Full-bleed hero image at `/hero-reeded.png` with dark scrim
3. Brand name **RESIDUALS** is hero-level (display scale)
4. Logo / trust strip sits **under** the hero, never inside it
5. Alternating white / `#0a0a0a` sections with huge vertical padding
6. Soft UI panels for product chrome only (not fake dashboards as hero art)
7. Prefer photography + typographic sections over synthetic metric walls
8. Live stats only from `GET /health` or `GET /ledger` when available

## Components

### Buttons

- Primary on dark/photo: solid white, ink text
- Primary on light: solid ink, white text
- Secondary: ghost / outline matching surface
- Radius: 9999px (pill) for CTAs; 12px for panels/inputs

### Panels

- Soft border, light shadow tinted to surface, radius 12-16px
- Used for Ask / Ledger / Contribute / Withdraw product surfaces

### Forms

- Label above input
- Error below input
- Loading / empty / error states required for every data view

## Motion

- Hero: staggered fade/slide for brand, headline, subtext, CTAs (~0.5-0.8s)
- Sections: `whileInView` opacity + slight Y, once
- Reduced motion: honor `prefers-reduced-motion`

## Do

- Keep hero in first viewport: brand, one headline, short subtext, two CTAs
- Format money from integer micros via `@residuals/shared` helpers
- Wire real `VITE_API_BASE_URL` fetches; show paywall messaging on `/ask` 402

## Do not

- Invent vanity stats (e.g. unlabeled 900%)
- Use Inter, purple AI gradients, or em-dashes
- Put trust logos or fake dashboards inside the hero
- Hide citations; they are the product argument
