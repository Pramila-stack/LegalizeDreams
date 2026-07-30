# Beauty Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-theme the entire LEGALIZE DREAMS storefront from blue to an elegant rose-and-burgundy beauty aesthetic, changing only the visual layer (colors, backgrounds, accents) with no logic changes.

**Architecture:** Token-first. Remap the `brand-*` design tokens in `frontend/src/index.css` (`@theme` block) from blue to a rose→wine scale so most of the app re-themes automatically; then make targeted edits only where colors are hardcoded outside tokens (Header, Footer, product "Add to Cart" fill, heading `text-black`), and add one new burgundy promo band on the homepage.

**Tech Stack:** React 19, Vite, Tailwind CSS v4 (`@theme` tokens in CSS), react-router-dom 7.

## Global Constraints

- **No logic changes.** Do not touch state, routing, API calls, cart context, or animation timing. Only class names, style values, and one new presentational section.
- **Keep brand name & logo.** "LEGALIZE DREAMS" and the existing logo stay.
- **Fonts unchanged.** Playfair Display (`font-display`) + Poppins (body) stay.
- **No fabricated marketing claims.** Any promo copy must reuse offers already present on the site (e.g. the existing "Free shipping on orders over Rs 3,000" line). Do not invent discount percentages.
- **Verification is build/lint/grep/visual**, not unit tests — this is a visual redesign. Run frontend commands from the `frontend/` folder.
- **Palette reference (rose→wine scale):**
  `brand-50 #fdf5f5`, `brand-100 #f9e7ea`, `brand-200 #f2ccd3`, `brand-300 #e3a7b1`, `brand-400 #cf8291`, `brand-500 #bd6476`, `brand-600 #a44e61`, `brand-700 #873d4f`, `brand-800 #5f2838`, `brand-900 #421b28`. Cream page background `#fdf9f6`.

---

### Task 1: Palette foundation (`index.css`)

Remap the `@theme` tokens, warm the page background to cream, and recolor the two hardcoded blue values (`::selection`, underline gradient). Because the app references `brand-*` tokens widely, this alone re-themes most surfaces.

**Files:**
- Modify: `frontend/src/index.css:7-27` (the `@theme` block), `:33-37` (`body`), `:43-46` (`::selection`), `:204` (underline gradient)

**Interfaces:**
- Consumes: nothing (foundation task).
- Produces: the rose→wine `brand-*` scale and a `--color-cream` token consumed by every later task. Token names are unchanged (`brand-50`…`brand-900`); only their hex values change. New token: `--color-cream: #fdf9f6`.

- [ ] **Step 1: Replace the `@theme` color block**

In `frontend/src/index.css`, replace lines 11-27 (the `--color-brand-*` and `--color-blush-*` declarations) with:

```css
  --color-brand-50: #fdf5f5;
  --color-brand-100: #f9e7ea;
  --color-brand-200: #f2ccd3;
  --color-brand-300: #e3a7b1;
  --color-brand-400: #cf8291;
  --color-brand-500: #bd6476;
  --color-brand-600: #a44e61;
  --color-brand-700: #873d4f;
  --color-brand-800: #5f2838;
  --color-brand-900: #421b28;

  --color-cream: #fdf9f6;

  --color-blush-50: #fdf1f4;
  --color-blush-100: #fbdfe6;
  --color-blush-200: #f6c0cd;
  --color-blush-300: #ef99ae;
  --color-blush-400: #e6708e;
```

- [ ] **Step 2: Warm the body background**

Replace the `body` rule (lines 33-37) with:

```css
body {
  font-family: var(--font-sans);
  color: var(--color-brand-900);
  background-color: var(--color-cream);
}
```

- [ ] **Step 3: Recolor the selection highlight**

Replace the `::selection` rule (lines 43-46) with:

```css
::selection {
  background-color: var(--color-brand-200);
  color: var(--color-brand-900);
}
```

(Token names are unchanged, so this rule's text is identical — confirm it now points at rose values. If the file already matches, no edit is needed for this step.)

- [ ] **Step 4: Recolor the underline animation gradient**

Replace line 204:

```css
  background: linear-gradient(90deg, #2196f3, #1976d2);
```

with:

```css
  background: linear-gradient(90deg, #bd6476, #421b28);
```

- [ ] **Step 5: Verify no blue hex remains in CSS**

Run from `frontend/`:

```bash
grep -nE "#2196f3|#1976d2|#0a3d91|#0d47a1" src/index.css
```

Expected: no output (exit code 1).

- [ ] **Step 6: Verify the build succeeds**

Run from `frontend/`:

```bash
npm run build
```

Expected: build completes, `dist/` produced, no CSS errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: remap brand tokens to rose/wine palette with cream background"
```

---

### Task 2: Header re-theme (`Header.jsx`)

Turn the solid-blue header into a soft blush bar with wine text and rose hovers, and a burgundy announcement strip. Replace all six `blue-*` classes.

**Files:**
- Modify: `frontend/src/components/layout/Header.jsx` (lines 35, 36, 42, 51-60, 62-107, 115, 121, 138-165)

**Interfaces:**
- Consumes: `brand-*` rose→wine tokens from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Recolor the header shell and announcement bar**

Replace line 35:

```jsx
    <header className="sticky top-0 z-40 border-b border-brand-200 bg-brand-50/95 backdrop-blur">
```

Replace line 36:

```jsx
      <div className="bg-brand-800 py-1.5 text-center text-xs tracking-wide text-white">
```

- [ ] **Step 2: Recolor the mobile-menu toggle and logo text**

Replace line 42 (`text-white` → wine so it shows on the blush bar):

```jsx
          className="p-1 text-brand-900 lg:hidden"
```

Replace line 52 (logo circle border) and line 59 (logo wordmark):

```jsx
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-300 bg-white overflow-hidden">
```

```jsx
          <span className="hidden font-display text-lg font-semibold tracking-wide text-brand-900 sm:inline">LEGALIZE DREAMS</span>
```

- [ ] **Step 2b: Recolor the shop dropdown chevron button (line 78)**

```jsx
            <button className="flex items-center gap-1 text-sm font-medium text-brand-800 hover:text-brand-600">
```

- [ ] **Step 3: Recolor the desktop nav links**

Replace the two NavLink `className` callbacks (lines 66-68 and 101-103, both identical) so both occurrences read:

```jsx
              `text-sm font-medium transition-colors ${isActive ? 'text-brand-900 font-bold' : 'text-brand-800 hover:text-brand-600'}`
```

- [ ] **Step 4: Recolor the search inputs (desktop line 115 and mobile line 145, identical)**

Both occurrences become:

```jsx
            className="w-full rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-900 placeholder:text-brand-400 outline-none focus:border-brand-400"
```

- [ ] **Step 5: Recolor the cart icon button (line 121)**

```jsx
          className="relative ml-auto flex items-center justify-center rounded-full p-2 text-brand-900 hover:bg-brand-100 lg:ml-3"
```

- [ ] **Step 6: Recolor the mobile menu panel (lines 138, 149-165)**

Replace line 138:

```jsx
        <div className="border-t border-brand-200 bg-brand-50 px-4 pb-4 lg:hidden">
```

Replace the mobile "Home" and "Cart" links (lines 149-154) so each reads:

```jsx
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-brand-900 hover:bg-brand-100">
              Home
            </Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-brand-900 hover:bg-brand-100">
              Cart
            </Link>
```

Replace the "Shop by category" label (line 155):

```jsx
            <p className="mt-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-500">Shop by category</p>
```

Replace the mobile category links (lines 157-162) so the `className` reads:

```jsx
                className="rounded-lg px-2 py-2 text-sm text-brand-800 hover:bg-brand-100"
```

- [ ] **Step 7: Verify no blue classes remain in Header**

Run from `frontend/`:

```bash
grep -nE "blue-" src/components/layout/Header.jsx
```

Expected: no output (exit code 1).

- [ ] **Step 8: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/layout/Header.jsx
git commit -m "style: re-theme header to blush/wine beauty palette"
```

---

### Task 3: Footer re-theme (`Footer.jsx`)

Turn the mid-blue footer into a deep burgundy footer with cream text and rose-outline social pills. Replace all thirteen `blue-*` classes and the `bg-brand-500` background.

**Files:**
- Modify: `frontend/src/components/layout/Footer.jsx` (lines 27, 31, 39, 52, 63-76, 81)

**Interfaces:**
- Consumes: `brand-*` tokens from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Recolor the footer background and intro (lines 27, 31)**

```jsx
    <footer className="bg-brand-900 text-brand-200">
```

```jsx
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-100">
            Fashion accessories, skincare and makeup curated for your everyday glow.
          </p>
```

- [ ] **Step 2: Recolor the social pills (line 39)**

```jsx
                className="rounded-full border border-brand-400 px-3 py-1.5 text-xs text-brand-100 hover:border-white hover:text-white hover:bg-brand-700 transition-colors"
```

- [ ] **Step 3: Recolor all footer links**

There are nine link elements using `text-blue-50 hover:text-white` (line 52, and lines 63-76). Replace every `text-blue-50` with `text-brand-100` (keep `hover:text-white`). After this step, no `text-blue-50` remains.

- [ ] **Step 4: Recolor the copyright bar (line 81)**

```jsx
      <div className="border-t border-brand-700 py-5 text-center text-xs text-brand-100">
```

- [ ] **Step 5: Verify no blue classes remain in Footer**

Run from `frontend/`:

```bash
grep -nE "blue-" src/components/layout/Footer.jsx
```

Expected: no output (exit code 1).

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/layout/Footer.jsx
git commit -m "style: re-theme footer to deep burgundy with rose accents"
```

---

### Task 4: Hero & product-card polish

The Hero video-card gradient (`from-blush-100 to-brand-200`) and CTAs already re-theme via tokens, but make two deliberate improvements matching the reference: give the primary "Add to Cart" a solid rose fill (reference uses filled rose buttons, not outlines), and confirm the Hero reads correctly. No blue exists in these files — this is a polish task.

**Files:**
- Modify: `frontend/src/components/product/ProductCard.jsx:24-29` (Add to Cart button)

**Interfaces:**
- Consumes: `brand-*` tokens from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Give "Add to Cart" a solid rose fill**

Replace lines 24-29 of `ProductCard.jsx`:

```jsx
        <button
          onClick={() => addToCart(product, 1)}
          className="mt-2 w-full rounded-full bg-brand-500 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-600"
        >
          Add to Cart
        </button>
```

- [ ] **Step 2: Verify Hero gradient uses tokens (read-only check)**

Run from `frontend/`:

```bash
grep -n "from-blush-100 to-brand-200" src/components/home/Hero.jsx
```

Expected: one match on the video-card `div` (line ~132). This confirms the gradient is token-driven and now renders blush→rose automatically — no edit needed.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/product/ProductCard.jsx
git commit -m "style: solid rose fill for add-to-cart buttons"
```

---

### Task 5: Homepage burgundy promo band

Add the reference's dark burgundy promo band to the homepage, between `FeaturedProducts` and `FaqAccordion`. Reuse the site's existing real offer (free shipping over Rs 3,000) and link to the existing `/shop` route — no fabricated discounts.

**Files:**
- Create: `frontend/src/components/home/PromoBand.jsx`
- Modify: `frontend/src/pages/HomePage.jsx` (import + place the band)

**Interfaces:**
- Consumes: `brand-*` tokens from Task 1; `react-router-dom` `Link` (already a project dependency).
- Produces: default-exported `PromoBand` React component (no props), imported by `HomePage.jsx`.

- [ ] **Step 1: Create the PromoBand component**

Create `frontend/src/components/home/PromoBand.jsx`:

```jsx
import { Link } from 'react-router-dom'

export default function PromoBand() {
  return (
    <section className="bg-brand-900 py-16 text-center animate-on-scroll">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
          The New Season Edit
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Free shipping on orders over Rs 3,000
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-100">
          Skincare, makeup and fashion accessories curated for your everyday glow —
          fresh picks added every week.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-100"
        >
          Shop New Arrivals
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Place the band on the homepage**

Replace the contents of `frontend/src/pages/HomePage.jsx` with:

```jsx
import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import PromoBand from '../components/home/PromoBand'
import FaqAccordion from '../components/home/FaqAccordion'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <PromoBand />
      <FaqAccordion />
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds; no unresolved-import error for `PromoBand`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/home/PromoBand.jsx frontend/src/pages/HomePage.jsx
git commit -m "feat: add burgundy promo band to homepage"
```

---

### Task 6: Heading `text-black` → wine sweep

Convert the scattered `text-black` headings/prices to `text-brand-900` (wine) so headings read on-brand instead of pure black. These are spread across pages and two components.

**Files:**
- Modify (replace `text-black` → `text-brand-900` in each):
  - `frontend/src/pages/ShopPage.jsx:38`
  - `frontend/src/pages/CheckoutSuccessPage.jsx:11,17`
  - `frontend/src/pages/CategoryPage.jsx:46,74`
  - `frontend/src/pages/NotFoundPage.jsx:8`
  - `frontend/src/pages/CheckoutPage.jsx:82,93,107,112,126`
  - `frontend/src/pages/ProductPage.jsx:46,86,124`
  - `frontend/src/pages/SearchPage.jsx:29`
  - `frontend/src/pages/CartPage.jsx:49,60,100`
  - `frontend/src/components/common/Price.jsx:8`
  - `frontend/src/components/product/ProductCard.jsx:18`
  - `frontend/src/components/home/FeaturedProducts.jsx:29`
  - `frontend/src/components/home/FaqAccordion.jsx:35,44`
  - `frontend/src/components/home/Hero.jsx:109`
  - `frontend/src/components/home/CategoryGrid.jsx:47,156`

**Interfaces:**
- Consumes: `brand-*` tokens from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace every `text-black` occurrence with `text-brand-900`**

In each file listed above, change `text-black` to `text-brand-900`. Preserve all surrounding classes (e.g. `hover:text-brand-600`, `group-hover:text-brand-600`, `font-semibold`) exactly — only the token `text-black` changes. For example, `ProductCard.jsx:18` becomes:

```jsx
          <h3 className="line-clamp-2 text-sm font-medium text-brand-900 hover:text-brand-600">
```

and `CategoryGrid.jsx:156` becomes:

```jsx
                <span className="text-sm font-medium text-brand-900 group-hover:text-brand-600 transition-colors duration-300">
```

- [ ] **Step 2: Verify no `text-black` remains anywhere in src**

Run from `frontend/`:

```bash
grep -rnE "text-black" src
```

Expected: no output (exit code 1).

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src
git commit -m "style: convert black headings to wine for on-brand typography"
```

---

### Task 7: Final verification sweep

Prove no blue palette survives anywhere, lint passes, the production build is clean, and the site renders correctly in the browser.

**Files:**
- None modified (verification only). Fix any stragglers found, then re-commit.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a verified, fully re-themed storefront.

- [ ] **Step 1: Global blue-palette grep (source of truth)**

Run from `frontend/`:

```bash
grep -rnE "blue-|indigo-|sky-|cyan-|#2196f3|#1976d2|text-black" src
```

Expected: no output (exit code 1). If anything appears, convert it to the nearest rose/wine token, then commit before continuing.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: passes with no new errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Visual check in the browser**

Start the dev server (`npm run dev`) and load http://localhost:5173. Confirm:
  - Page background is warm cream, not white.
  - Header: blush bar, burgundy announcement strip, wine nav, rose cart badge.
  - Hero: cream background, wine serif headline, rose/burgundy CTAs, blush→rose video card.
  - Bestsellers: white cards, solid rose "Add to Cart", wine titles/prices.
  - Burgundy promo band renders between bestsellers and FAQ.
  - Footer: deep burgundy, cream text, rose social pills.
  - Visit `/shop`, `/cart`, a product page, and `/checkout` — all read rose/wine with no blue.

- [ ] **Step 5: Final commit (only if stragglers were fixed in Step 1)**

```bash
git add frontend/src
git commit -m "style: final palette sweep — remove remaining blue references"
```

---

## Self-Review Notes

- **Spec coverage:** Color system → Task 1. Header → Task 2. Footer → Task 3. Hero + product cards → Task 4. Sale band → Task 5. Inner-page/`text-black` sweep → Task 6. Global CSS (selection, underline, cream body) → Task 1. Success criteria (no blue, build, lint, visual) → Task 7. All spec sections mapped.
- **No fabricated claims:** Promo band (Task 5) reuses the existing free-shipping offer already shown in the Header; no invented discounts.
- **Token consistency:** All tasks use the same `brand-50…brand-900` names defined in Task 1; only hex values changed, so existing token references stay valid.
- **Verification model:** Adapted from unit-test TDD to build + lint + grep + visual, appropriate for a pure visual redesign; each task ends with a grep/build gate and a commit.
