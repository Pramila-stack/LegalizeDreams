# Beauty Redesign — LEGALIZE DREAMS

**Date:** 2026-07-30
**Type:** Visual / theme redesign (no logic changes)

## Goal

Restyle the entire LEGALIZE DREAMS storefront from its current blue theme to an
elegant rose-and-burgundy beauty aesthetic, inspired by a "Nora Beauty" reference
landing page. Keep the existing brand name, logo, layout, routing, components,
API calls, and animations — change only the visual layer (colors, backgrounds,
accents).

## Decisions (confirmed with user)

- **Scope:** Whole site — homepage, shop, product, cart, checkout, header/footer,
  and admin accents.
- **Palette mood:** Pink + burgundy accents, faithful to the reference (airy blush
  backgrounds with rich burgundy section bands and buttons for contrast).
- **Branding:** Keep "LEGALIZE DREAMS" name and existing logo unchanged.
- **Page background:** Warm cream (not pure white).
- **Fonts:** Unchanged — Playfair Display (display/headings) + Poppins (body).
  They already match the elegant beauty look.

## Color system

Remap the existing `brand-*` design tokens in `frontend/src/index.css` (`@theme`
block) from the current blue scale to a rose → wine scale. Because most of the app
already references `brand-*` tokens, this cascades automatically across pages.

| Token | Hex | Role |
|---|---|---|
| `brand-50` | `#fdf5f5` | Lightest blush wash |
| `brand-100` | `#f9e7ea` | Section tint / hover |
| `brand-200` | `#f2ccd3` | Soft pink borders |
| `brand-300` | `#e3a7b1` | Dusty rose |
| `brand-400` | `#cf8291` | Rose |
| `brand-500` | `#bd6476` | Primary rose (buttons, links, cart badge) |
| `brand-600` | `#a44e61` | Rose hover |
| `brand-700` | `#873d4f` | Deep rose |
| `brand-800` | `#5f2838` | Burgundy (dark bands) |
| `brand-900` | `#421b28` | Darkest wine (footer, heading text) |

Additional semantic tokens:

- `--color-cream: #fdf9f6` — warm page background, replacing plain white on `body`.
- Keep existing `blush-*` accent tokens (they already harmonize with the new scale).

## Section-by-section changes

- **Header (`components/layout/Header.jsx`)** — Soft blush/white bar instead of solid
  blue. Wine-colored logo text and nav links; rose hover states. Replace hardcoded
  `text-blue-50`, `text-blue-100`, `bg-brand-*` blue-era usages with the new scale.
  Top announcement bar becomes burgundy (`brand-800`).
- **Hero (`components/home/Hero.jsx`)** — Cream background; wine serif headline
  (already Playfair); rose primary CTA; burgundy outline secondary. Change the video
  card's blue gradient (`from-blush-100 to-brand-200`) to a blush→rose gradient.
  Carousel logic untouched.
- **Bestsellers / product cards (`components/home/FeaturedProducts.jsx`,
  `components/product/ProductCard.jsx`)** — White cards on cream, rose "Add to Cart"
  button, burgundy price/title, soft pink borders, gentle hover lift.
- **Sale band (homepage)** — Add a dark burgundy promo band reusing existing homepage
  content/copy (no new marketing claims invented). Placed on `HomePage.jsx`.
- **Testimonials + Footer (`components/layout/Footer.jsx`)** — Deep burgundy background,
  cream text, rose social icons — matching the reference's dark footer.
- **Inner pages** (`ShopPage`, `ProductPage`, `CartPage`, `CheckoutPage`,
  `CategoryPage`, `SearchPage`, admin pages) — Inherit remapped tokens. Sweep for any
  remaining hardcoded `blue-*` / `text-black` / blue gradients and convert to the new
  palette.
- **Global CSS (`index.css`)** — Recolor `::selection` (currently blue) to rose/wine;
  recolor the `.animate-underline::after` gradient (currently `#2196f3 → #1976d2`) to
  a rose→wine gradient; set `body` background to cream and default text to wine.

## What stays the same

- Layout, routing, component structure.
- API service calls, cart context, toast logic.
- Animations / keyframes (only their colors change where applicable).
- Fonts (Playfair Display + Poppins).
- Brand name and logo.

## Approach

Token-first:

1. Edit the `@theme` block in `index.css` once (rose→wine scale + cream token +
   body/selection/underline recolor).
2. Targeted edits only where colors are hardcoded outside tokens — Header blues,
   Hero gradient, Footer, and any stray `blue-*` classes found via search.

This keeps the diff focused on the visual layer and avoids touching application logic.

## Success criteria

- No blue remains anywhere in the storefront or admin UI (verified by searching for
  `blue-` / `#2196f3` / `#1976d2` and reviewing in-browser).
- Homepage visually reads as the rose/burgundy beauty aesthetic: cream background,
  blush hero, rose buttons, burgundy sale band and footer.
- All pages render without layout regressions; cart, search, and checkout flows still
  work (no logic changed).
- `npm run build` succeeds and `npm run lint` passes.

## Out of scope

- No copy/content rewrite beyond recoloring (existing text stays).
- No new components, routes, or backend changes.
- No font changes.
