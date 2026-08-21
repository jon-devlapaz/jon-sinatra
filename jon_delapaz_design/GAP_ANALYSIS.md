# GAP ANALYSIS — Current (Noir) → Target (Aurelian Gallery)

> Read this alongside `DESIGN_SPEC.md`. This maps every delta between what exists and what the design requires.

---

## 1. Token Diff (theme.css)

| Current Token | Target Token | Action |
|---------------|--------------|--------|
| `noir` `#141414` | — | **REMOVE** |
| `noir-soft` `#0c0c0e` | — | **REMOVE** |
| `noir-lift` `#1d1a16` | — | **REMOVE** |
| `ivory` `#f2f0eb` | `surface` `#fcf9f8` | **REPLACE** |
| `ivory-dim` `#ece7dd` | `surface-container-low` `#f6f3f2` | **REPLACE** |
| `gold` `#c9a84c` | `primary-container` `#d4af37` | **REPLACE** (warmer) |
| `gold-bright` `#ffe033` | `primary-fixed` `#ffe088` | **REPLACE** |
| `gold-dim` `#8a7038` | `outline-variant` `#d0c5af` | **REPLACE** |
| `gold-deep` `#bfa100` | `primary` `#735c00` | **REPLACE** |
| `font-display` Bodoni Moda | `font-display` Bodoni Moda | **KEEP** |
| `font-body` EB Garamond | `font-body` DM Sans | **REPLACE** |
| `font-mono` IBM Plex Mono | `font-label` DM Sans | **REPLACE** (no mono in new design) |
| `text-hero` clamp(...) | `display-lg` 72px/80px/200 | **REPLACE** (fixed sizes) |
| `text-display` clamp(...) | `display-lg-mobile` 48px/52px/200 | **REPLACE** |
| `text-title` clamp(...) | `headline-md` 32px/40px/300 | **REPLACE** |
| `text-body` clamp(...) | `body-lg` 18px/32px/300 + `body-md` 16px/28px/400 | **REPLACE** |
| `text-mono` 0.8125rem | `label-sm` 11px/14px/600/0.1em + `subheading-caps` 12px/16px/500/0.3em | **REPLACE** |
| `shadow-warm` | — | **REMOVE** (no shadows) |
| `shadow-card` | — | **REMOVE** |
| `grain-opacity` 0.16 | — | **REMOVE** |
| `grain-step` 0.45s | — | **REMOVE** |
| `hairline-width` max(1px, 0.0625rem) | `0.5px` explicit | **REPLACE** |
| `hairline-gold` | `outline-variant` / `primary` | **REPLACE** |
| `film-grain` class | — | **REMOVE** |
| `film-vignette` class | — | **REMOVE** |
| `title-card` / `marquee` | Hero section (asymmetrical grid) | **REPLACE** |
| `facts-strip` | Keep for About? Design uses simple `<p>` | **SIMPLIFY** |
| `media-frame` | `FramedImage` (sharp corners, corner accents) | **REPLACE** |
| `btn` (gold border) | Primary: `border-primary bg-primary` / Ghost: `border-primary` | **REPLACE** |
| `gatefold` (rounded, gradient) | Sharp white card (`surface-container-lowest`) + hairline | **REPLACE** |
| `ticket-stub` (notch, barcode) | Simple CTA button / underline input bar | **REPLACE** |
| `@media prefers-reduced-motion` | Keep, apply to new transitions | **KEEP** |

**Verdict:** ~90% of `theme.css` is replaced. Only `prefers-reduced-motion` and CSS custom property syntax survive.

---

## 2. Component Diff

| Current Component | Target Component | Reuse? | Notes |
|-------------------|------------------|--------|-------|
| `FilmGrain.astro` | — | **DELETE** | No grain in new design |
| `GatefoldCard.astro` | `GlassyCard.astro` (sharp, white, hairline) | **REWRITE** | Same slot API, new visual |
| `TicketStub.astro` | `BookingCTA.astro` (simple button) | **REWRITE** | Different visual, simpler props |
| `Marquee.astro` | `Hero.astro` | **REWRITE** | Asymmetrical grid, new copy, image |
| `Bio.astro` | `About.astro` | **REWRITE** | Framed gallery + concise text |
| `Repertoire.astro` | — | **DELETE** | Not in new design |
| `Packages.astro` | — | **DELETE** | Not in new design (merged into BookingBar) |
| `Gallery.astro` | — | **DELETE** | Not in new design |
| `Testimonials.astro` | — | **DELETE** | Not in new design |
| `CalendarShell.astro` | — | **DELETE** | Not in new design |
| `BookingShell.astro` | `BookingBar.astro` + `BookingForm` (existing) | **REWRITE** | Horizontal bar + existing React island |
| `Footer.astro` | `Footer.astro` | **REWRITE** | Simpler, new links, brand lockup |

**New primitives needed:**
- `Header.astro` (glassmorphism nav)
- `FramedImage.astro` (corner accents, gallery filter)
- `UnderlineInput.astro` / `.tsx` (for BookingBar)
- `GalleryImage.astro` (grayscale→color hover filter)

---

## 3. Schema / Data Diff

### Current `Profile` interface (`src/data/profile.ts`)
```typescript
interface Profile {
  name: string;
  tagline: string;
  marqueeSubtitle: string;
  bio: string;
  quote: string;
  portraitAlt: string;
  portraitLabel: string;
  facts: Fact[];
  packages: Package[];
  gallery: GalleryItem[];
  contact: { email: string; phone: string };
  socials: Social[];
}
```

### Target `Profile` interface (from design)
```typescript
interface Profile {
  // Brand
  name: 'Jon Delapaz';
  // Hero
  heroSubtitle: 'An Elegant Legacy';           // NEW
  heroBody: string;                            // NEW (replaces tagline)
  heroImage: { src: string; alt: string };     // NEW
  // Booking Bar
  bookingBarEnabled: boolean;                  // NEW
  // About / Framed Gallery
  aboutImage: { src: string; alt: string };    // NEW
  aboutHeadline: string;                       // NEW ("The Voice of a Golden Era")
  aboutBody: string[];                         // NEW (2 paragraphs)
  aboutLink: { label: string; href: string };  // NEW ("READ FULL BIOGRAPHY")
  // Footer
  footerLinks: { label: string; href: string }[]; // NEW (Privacy, Terms, Press, Contact)
  // Contact (keep)
  contact: { email: string; phone: string };
  // Socials (keep, but design doesn't show in footer)
  socials: Social[];
}
```

**Removed fields:** `tagline`, `marqueeSubtitle`, `bio`, `quote`, `portraitAlt`, `portraitLabel`, `facts`, `packages`, `gallery`.

**Collections impact:**
- `repertoire` collection: **keep** (may be used elsewhere / future) but not rendered on index.
- `testimonials` collection: **keep** but not rendered on index.
- `content.config.ts`: no changes needed (loaders unchanged).

---

## 4. Page Structure Diff

| Current (index.astro) | Target (index.astro) |
|-----------------------|----------------------|
| `<BaseLayout>` | `<BaseLayout>` (rewritten) |
| `Marquee` | `Hero` |
| `Bio` | `About` |
| `Repertoire` | — (removed) |
| `Packages` | — (removed) |
| `Gallery` | — (removed) |
| `Testimonials` | — (removed) |
| `CalendarShell` | — (removed) |
| `BookingShell` | `BookingBar` + `BookingForm` (island) |
| `Footer` | `Footer` (rewritten) |

**New wrapper:** `Header` (outside `<main>`, fixed).

---

## 5. Test Impact (breaking changes)

### `tests/unit/index.test.ts`
| Line | Current Assertion | Will Break? | New Assertion |
|------|-------------------|-------------|---------------|
| 48 | `id="marquee"` | YES | `id="hero"` |
| 48 | `>Jon Delapaz<` | NO (name same) | — |
| 49 | `href="#booking?package=standard"` | YES | `href="#booking"` (BookingBar) |
| 52 | `id="about"` | YES | `id="about"` (but different content) |
| 53-56 | `Range`, `Baritone`, `Open — tell me your date`, `waiting for the right room` | YES | New about copy |
| 59-60 | `id="music"`, `No recordings yet` | YES | Section removed |
| 64-67 | `id="booking"`, island mount | YES | `id="booking-bar"` + island |
| 70-71 | `id="contact"`, `tel:` | YES | `id="footer"` |
| 80 | `og:title` "Jon Delapaz — Classic Oldies Crooner" | YES | New OG title |
| 88 | `og:image` `https://jonsinatra.example/og.jpg` | YES | New OG image |
| 96 | `<title>Jon Delapaz — Classic Oldies Crooner</title>` | YES | New title |
| 99 | `description` "Classic oldies crooner — Sinatra-style" | YES | New description |

### `tests/unit/style-guide.test.ts`
| Line | Current Assertion | Will Break? |
|------|-------------------|-------------|
| 10-12 | `--color-paper`, `--color-ink`, `--color-accent`, `--color-accent-deep` | YES (all renamed) |
| 14-16 | Contrast pairs `ink / paper`, `accent-deep / paper`, `ink-soft / paper` | YES |
| 17-19 | Ratios `13.38:1`, `7.23:1`, `6.58:1` | YES (new ratios) |
| 21-22 | `Inter` font | YES (now Bodoni Moda + DM Sans) |
| 24-27 | `Primary pill`, `Ghost pill`, `btn--circle`, `Disabled` | YES (new button styles) |
| 29-30 | `ticket-stub`, `On request` | YES |
| 32-33 | `facts-strip`, `media-frame` | YES |

### `src/app.test.ts`
| Line | Current Assertion | Will Break? |
|------|-------------------|-------------|
| 9 | `<title>Jon Sinatra</title>` | YES |
| 10 | `<h1>Jon Sinatra</h1>` | YES |
| 12 | `Lounge Singer` | YES |
| 13 | `id="marquee"` | YES |
| 14 | `id="booking"` | YES |
| 15 | `href="#booking?package=standard"` | YES |

### E2E tests (`tests/e2e/*.spec.ts`)
- All selectors change. Need full rewrite or visual regression baselines.

---

## 6. Risk Callouts

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Font swap** — EB Garamond → DM Sans, IBM Plex Mono removed | HIGH | Add `@fontsource/dm-sans` to deps; audit all `font-mono` usages (nav, buttons, labels) |
| **Color inversion** — dark→light breaks all contrast assumptions | HIGH | Run `astro check` + manual contrast audit; update `style-guide.astro` with new measured ratios |
| **Removed sections** — Repertoire, Packages, Gallery, Testimonials, Calendar | MEDIUM | Keep collections + components in codebase (commented) in case client wants them back; or delete cleanly |
| **BookingBar + BookingForm** — new horizontal bar is static Astro; form is React island | MEDIUM | Ensure `BookingBar` passes `package`/`date` to island via same hash/URL mechanism |
| **Image assets** — design uses external URLs; production needs local assets | LOW | Add placeholder images to `public/` with `gallery-img` filter; document asset pipeline |
| **Material Symbols** — CDN in design; should self-host for CSP/performance | LOW | Use `@iconify-json/material-symbols-outlined` + `unplugin-icons` or inline SVGs |
| **Test debt** — 4 unit tests + 4 e2e tests + app.test.ts all break | HIGH | Update tests **in lockstep** with each component (layered build) |
| **`astro check` / `tsc`** — interface changes propagate everywhere | MEDIUM | Run typecheck after every layer; fix before next layer |

---

## 7. Recommended Build Order (Layered)

| Layer | Files | Gate |
|-------|-------|------|
| **0. Tokens & Fonts** | `src/styles/theme.css`, `package.json` (add dm-sans), `astro.config.mjs` (verify fonts) | `npm run check` passes; `style-guide.astro` renders new tokens |
| **1. Primitives** | `Header.astro`, `FramedImage.astro`, `UnderlineInput.astro`, `GalleryImage.astro`, `GlassyCard.astro`, `BookingCTA.astro`, delete `FilmGrain`, `TicketStub`, `GatefoldCard` | Unit tests for each primitive pass; visual check in style guide |
| **2. Sections** | `Hero.astro`, `About.astro`, `BookingBar.astro`, `Footer.astro`, delete `Marquee`, `Bio`, `Repertoire`, `Packages`, `Gallery`, `Testimonials`, `CalendarShell`, `BookingShell` | `index.astro` renders all sections; no console errors |
| **3. Data** | `src/data/profile.ts` (new interface), `src/data/profile.json` (or update TS const), repertoire/testimonial JSONs untouched | `astro check` passes; `index.astro` consumes new profile |
| **4. Page & Layout** | `BaseLayout.astro` (glass header, white bg), `index.astro` (new section order), `style-guide.astro` (new tokens/components) | Full build succeeds; `dist/index.html` matches design structure |
| **5. Tests** | Update `tests/unit/index.test.ts`, `tests/unit/style-guide.test.ts`, `src/app.test.ts`, `tests/e2e/*.spec.ts` | `npm run test` + `npm run test:e2e` pass |
| **6. Visual Regression** | Add Playwright snapshot tests against design reference | Pixel-fidelity gate |

---

## 8. Open Questions for You

1. **Repertoire / Testimonials / Packages** — Delete entirely, or keep as hidden/disabled code for future?
2. **Images** — Do you have local assets for hero, about, and gallery images? Or use placeholders?
3. **Material Symbols** — Self-host via `unplugin-icons` or inline SVGs? (CDN is easiest for dev, not for prod)
4. **BookingBar** — Should it be a static Astro component with the form as a separate island, or merge into one?
5. **Analytics / Tracking** — Any events to wire up (CTA clicks, form submits)?
6. **CSP** — If self-hosting fonts + icons, need `font-src 'self'` and `script-src 'self'` for islands.
7. **SEO / OG** — New `og:image`, `og:title`, `description` values? (Design doesn't specify)

---

## 9. Sign-Off

Review the above. If approved, I'll proceed **layer by layer** with review gates between each. No code changes until you confirm.

**Next step:** You say "Approved" (or request changes), then I start **Layer 0**.