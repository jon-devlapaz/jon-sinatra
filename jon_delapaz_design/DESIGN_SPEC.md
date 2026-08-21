# DESIGN SPEC — Aurelian Gallery (Jon Delapaz)

> Extracted from `DESIGN.md`, `code.html`, and `screen.png`. This is the **source of truth** for the pixel-faithful implementation. Every value below is explicit — no "looks similar to."

---

## 1. Color System (Material 3 tokens → Tailwind v4 `@theme`)

| Token | Hex | Role | WCAG on Surface |
|-------|-----|------|-----------------|
| `--color-surface` | `#fcf9f8` | Page background (pristine white) | — |
| `--color-surface-dim` | `#dcd9d9` | Disabled/muted surfaces | — |
| `--color-surface-bright` | `#fcf9f8` | Bright surface variant | — |
| `--color-surface-container-lowest` | `#ffffff` | Cards on surface (pure white) | — |
| `--color-surface-container-low` | `#f6f3f2` | Subtle container | — |
| `--color-surface-container` | `#f0eded` | Default container | — |
| `--color-surface-container-high` | `#eae7e7` | Elevated container | — |
| `--color-surface-container-highest` | `#e5e2e1` | Highest container | — |
| `--color-on-surface` | `#1c1b1b` | Primary text (onyx) | 13.38:1 |
| `--color-on-surface-variant` | `#4d4635` | Secondary text / placeholder | 6.58:1 |
| `--color-outline` | `#7f7663` | Hairline borders (0.5px) | — |
| `--color-outline-variant` | `#d0c5af` | Subtle borders / dividers | — |
| `--color-primary` | `#735c00` | Gold (deep) — focus states, active | 7.23:1 |
| `--color-on-primary` | `#ffffff` | Text on primary | — |
| `--color-primary-container` | `#d4af37` | Brushed gold — buttons, highlights | 5.15:1 |
| `--color-on-primary-container` | `#554300` | Text on primary container | — |
| `--color-secondary` | `#5d5f5f` | Neutral accent | — |
| `--color-tertiary` | `#5d5f5f` | Same as secondary | — |
| `--color-error` | `#ba1a1a` | Error states | — |
| `--color-surface-variant` | `#e5e2e1` | Input underline, subtle dividers | — |

**Semantic aliases for components:**
- `bg-background` → `surface`
- `text-on-background` → `on-surface`
- `border-outline-variant` → `outline-variant`
- `bg-primary-container` → `primary-container`
- `text-primary` → `primary`
- `border-primary` → `primary`
- `text-on-surface-variant` → `on-surface-variant`

---

## 2. Typography (Tailwind v4 `@theme`)

| Token | Font Family | Size / Line Height / Weight / Tracking | Usage |
|-------|-------------|----------------------------------------|-------|
| `display-lg` | `Bodoni Moda` | `72px / 80px / 200 / -0.02em` | Desktop hero |
| `display-lg-mobile` | `Bodoni Moda` | `48px / 52px / 200 / -0.01em` | Mobile hero |
| `headline-md` | `Bodoni Moda` | `32px / 40px / 300` | Section titles |
| `subheading-caps` | `DM Sans` | `12px / 16px / 500 / 0.3em` | Nav, eyebrows, labels |
| `body-lg` | `DM Sans` | `18px / 32px / 300` | Hero body, about copy |
| `body-md` | `DM Sans` | `16px / 28px / 400` | Standard body |
| `label-sm` | `DM Sans` | `11px / 14px / 600 / 0.1em` | Form labels, chips, copyright |

**Font loading:** Self-hosted via `@fontsource-variable/bodoni-moda` and `@fontsource/dm-sans` (already in `package.json` — need to add DM Sans).

---

## 3. Spacing & Layout (Tailwind v4 `@theme`)

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-unit` | `8px` | Base unit |
| `--spacing-gutter` | `32px` | Column gap |
| `--spacing-margin-desktop` | `80px` | Outer margin (desktop) |
| `--spacing-margin-mobile` | `24px` | Outer margin (mobile) |
| `--spacing-section-gap` | `160px` | Vertical gap between major sections |
| `--container-max` | `1440px` | Max content width |

**Grid:** 12-column, asymmetrical compositions encouraged. Hero uses `md:col-span-7` + `md:col-span-5` with negative margin (`-ml-12`) on image.

---

## 4. Elevation & Depth

1. **No shadows** — use 0.5px hairline borders (`outline-variant` / `tertiary`).
2. **Tonal layering** — white cards (`surface-container-lowest`) on marble (`surface-container-low`).
3. **Glassmorphism** — `backdrop-blur-[30px]` + `bg-surface/80` + `border-b-[0.5px] border-outline-variant/30` for fixed header.
4. **Zero border-radius** — all corners `0px` (sharp). Only circles for literal records/play buttons.

---

## 5. Component Specs

### 5.1 Header / TopNavBar
- Fixed, full-width, glassmorphism (`backdrop-blur-[30px] bg-surface/80 border-b-[0.5px] border-outline-variant/30`)
- Brand: `display-lg-mobile` / `display-lg`, `text-primary`, `tracking-widest`
- Desktop nav: `subheading-caps`, `text-on-surface-variant`, hover `text-primary`, underline animation
- Trailing CTA: `subheading-caps`, `text-primary`, `border-b-[0.5px] border-primary pb-1`, hover opacity
- Mobile: hamburger (Material Symbols `menu`)

### 5.2 Hero Section
- Asymmetrical grid: text `col-span-7`, image `col-span-5 -ml-12`
- Headline: `display-lg` / `display-lg-mobile`, `text-on-surface`, `tracking-tighter`, `leading-tight`
- Accent span: `text-primary italic`
- Body: `body-lg`, `text-on-surface-variant`, `font-light`, `leading-relaxed`, `max-w-lg`
- CTA: `subheading-caps`, `border border-primary`, `px-8 py-4`, hover `bg-primary text-on-primary`
- Image: metallic accent backdrop (`absolute inset-0 bg-primary-container/10 -translate-x-4 translate-y-4 border-[0.5px] border-primary`), image `object-cover` with `gallery-img` filter (grayscale 15% sepia 5% → 0% on hover)

### 5.3 Horizontal Booking Bar
- Full-width, `border-y-[0.5px] border-outline-variant/30`, `bg-surface-container-lowest`, `py-16`
- 4 columns on desktop: Date, Type, Location, Submit
- Inputs: underline-only (`bg-transparent border-b-[0.5px] border-outline-variant focus:border-primary outline-none py-2`), labels `label-sm` `text-on-surface-variant`
- Submit: `subheading-caps`, `border border-primary bg-primary text-on-primary px-8 py-3`, hover `bg-transparent text-primary`

### 5.4 About / Framed Gallery
- 2-col grid: framed image (left), text (right)
- Frame: `relative p-6 border-[0.5px] border-primary-container h-[700px]` with corner accents (top-left & bottom-right `w-2 h-2 border-t border-l border-primary`)
- Image: `object-cover w-full h-full gallery-img`
- Headline: `display-lg` / `display-lg-mobile`, `text-on-surface`, `tracking-tighter`
- Divider: `w-12 border-t border-primary`
- Body: `body-md`, `text-on-surface-variant`, `font-light`, `leading-loose`
- Link: `subheading-caps`, `text-primary`, inline-flex with Material Symbols `arrow_forward`, hover `translate-x-1`

### 5.5 Footer
- `border-t-[0.5px] border-outline-variant/20`, `bg-background`, `py-section-gap`
- Brand: `display-lg` / `display-lg-mobile`, `text-primary`, `tracking-widest`
- Links: `label-sm`, `text-on-surface-variant`, hover `text-primary`
- Copyright: `label-sm`, `text-on-surface-variant`, centered mobile / right desktop

---

## 6. Interaction States

| Element | Hover | Focus | Active | Reduced Motion |
|---------|-------|-------|--------|----------------|
| Nav links | `text-primary` + underline | outline | — | no transition |
| Primary buttons | `bg-primary text-on-primary` | `outline-primary` | scale 0.98 | no transition |
| Ghost buttons | opacity 0.7 | outline | — | no transition |
| Inputs | — | `border-primary` | — | — |
| Gallery images | grayscale 0% | — | — | no transition |
| Footer links | `text-primary` | outline | — | no transition |

---

## 7. Responsive Breakpoints

- Mobile: `< 768px` (Tailwind `md:`)
- Tablet: `768px – 1024px`
- Desktop: `> 1024px`
- Container max: `1440px` with `margin-desktop: 80px` / `margin-mobile: 24px`

---

## 8. Assets & Iconography

- **Fonts:** Bodoni Moda Variable (200–900, italic), DM Sans Variable (100–1000, italic) — self-hosted via `@fontsource`
- **Icons:** Material Symbols Outlined (Google Fonts CDN in design; recommend self-host or inline SVG for production)
- **Images:** Design uses external URLs. Production needs local assets in `public/` or `src/assets/` with `gallery-img` filter applied.

---

## 9. New Content Fields Implied

| Section | Current Fields | New Fields Needed |
|---------|----------------|-------------------|
| Profile | name, tagline, bio, quote, facts[], packages[], gallery[], contact, socials | heroSubtitle, heroBody, heroImage, bookingBar (enabled?), aboutImage, aboutHeadline, aboutBody[], aboutLink, footerLinks[] |
| Repertoire | title, era, notes, duration | — (design doesn't show repertoire section) |
| Testimonials | quote, name, venue, eventType | — (design doesn't show testimonials) |

**Action:** Extend `src/data/profile.ts` `Profile` interface. Update collection JSON files. Schemas in `src/data/schemas.ts` may need new fields.

---

## 10. Test Impact (must update)

| Test | Current Expectation | New Expectation |
|------|---------------------|-----------------|
| `tests/unit/index.test.ts` | `Jon Delapaz`, `Classic Oldies Crooner`, `id="marquee"`, `id="about"`, `id="music"`, `id="booking"`, `id="contact"`, OG metadata | New section IDs (`hero`, `booking-bar`, `about`, `footer`), new copy, new OG title/desc |
| `tests/unit/style-guide.test.ts` | `paper`, `ink`, `accent`, `accent-deep`, `Inter`, `ticket-stub`, `gatefold`, `facts-strip`, `media-frame` | New tokens (`surface*`, `on-surface*`, `primary*`, `outline*`), `Bodoni Moda`, `DM Sans`, new components (Header, BookingBar, FramedGallery) |
| `src/app.test.ts` | `Jon Sinatra`, `Lounge Singer`, `id="marquee"`, `id="booking"` | `Jon Delapaz`, new copy, new section IDs |
| E2E (`tests/e2e/*.spec.ts`) | Various selectors | All new selectors, new visual regression baselines |

---

## 11. Migration Checklist (for implementation order)

1. **Tokens** — Replace `theme.css` entirely with new `@theme` block.
2. **Fonts** — Add `@fontsource/dm-sans`, remove `eb-garamond`, `ibm-plex-mono`.
3. **BaseLayout** — Replace noir shell with glassmorphism header + white page background.
4. **Primitives** — Rewrite `GatefoldCard`, `TicketStub`, `FilmGrain` (remove), add `Header`, `FramedImage`, `UnderlineInput`, `GalleryImage`.
5. **Sections** — Rewrite `Marquee`→`Hero`, `Bio`→`About`, remove `Repertoire`/`Packages`/`Gallery`/`Testimonials`/`CalendarShell`, rewrite `BookingShell`→`BookingBar` + `BookingForm`, rewrite `Footer`.
6. **Data** — Update `profile.ts` with new fields, update JSON files.
7. **Tests** — Update all unit + e2e tests to match new structure.
8. **Visual regression** — Add Playwright snapshots against design.