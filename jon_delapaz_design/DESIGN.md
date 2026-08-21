---
name: Aurelian Gallery
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4635'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#b2b3b3'
  on-tertiary-container: '#444546'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 72px
    fontWeight: '200'
    lineHeight: 80px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '200'
    lineHeight: 52px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 40px
  subheading-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.3em
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '300'
    lineHeight: 32px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  section-gap: 160px
---

## Brand & Style

This design system embodies the "Gold Record" aesthetic—a tribute to timeless vocal artistry through the lens of modern high-end minimalism. It is designed for a classic crooner whose digital presence must feel like an invitation to an exclusive, high-society gallery.

The style is **Ultra-Luxury Minimalism**. It relies on vast expanses of white space, precision-engineered typography, and the strategic use of metallic textures to convey value. The emotional response is one of calm, reverence, and sophistication. Every element is treated as a curated artifact, prioritizing breathability and "expensive" emptiness over information density.

## Colors

The palette is restricted to a triad of luxury:
- **Pristine White (#FFFFFF):** The dominant foundation. Used for backgrounds to create a sense of infinite space.
- **Soft Marble (#F5F5F5):** Used for subtle section differentiation and container backgrounds. It provides a tactile, stone-like quality without breaking the minimalist flow.
- **Brushed Metallic Gold (#D4AF37):** Reserved for interactive elements, highlights, and "Gold Record" iconography. It should be applied sparingly to maintain its premium impact.
- **Onyx Neutral (#1A1A1A):** Used exclusively for typography and hairline strokes to ensure legibility against the light background.

## Typography

The typographic system contrasts two distinct voices:
- **The Modern Serif (Bodoni Moda):** Set in ultra-thin weights for headlines. It evokes the elegance of high-fashion editorial and classical sheet music.
- **The Functional Sans (DM Sans):** Used for body copy and metadata. Secondary labels and subheadings utilize wide-tracked uppercase styling to create a "gallery label" effect.

Strict adherence to wide letter-spacing for all uppercase labels is mandatory to maintain the high-end aesthetic.

## Layout & Spacing

This design system employs a **Fixed Grid** model with extreme margins. On desktop, content is constrained to a 1440px max-width, but the visual field is defined by generous 80px outer margins.

The spacing rhythm is intentional and slow. Vertical gaps between sections (`section-gap`) are intentionally large (160px+) to force the user to focus on one piece of content at a time. The layout favors asymmetrical compositions, mimicking the hanging of art in a physical gallery. Elements should rarely feel crowded; if in doubt, increase the whitespace.

## Elevation & Depth

To maintain the minimalist gallery aesthetic, this design system avoids heavy shadows. 

1.  **Low-Contrast Outlines:** Instead of shadows, use 0.5px hairline borders in `tertiary_color_hex` to define interactive areas.
2.  **Tonal Layering:** Depth is achieved by placing `white` cards on `marble` backgrounds. 
3.  **Glassmorphism:** For overlays or navigation bars, use a high-refraction backdrop blur (30px+) with a 50% transparent white tint. This mimics the look of high-end frosted glass or acrylic displays found in luxury boutiques.

## Shapes

The shape language is **Sharp (0)**. To reflect the precision of a vinyl edge and the architectural lines of a grand piano, all corners are kept at 0px. This lack of rounding communicates a formal, serious, and uncompromisingly modern luxury. Circular elements are only permitted for literal representations of records or specific iconography (e.g., play buttons).

## Components

- **Buttons:** Primary buttons use a 1px solid `neutral_color_hex` border with a white background and wide-tracked uppercase text. On hover, the background transitions to `primary_color_hex` (Gold) with a white text shift.
- **Input Fields:** Minimalist underlines only. 1px thickness in `tertiary_color_hex`, turning `primary_color_hex` on focus. No bounding box.
- **Cards (Gallery Tiles):** Content is housed in sharp-edged containers. Images should have a slight desaturation or "film grain" overlay. Titles are placed below the image in wide-tracked `label-sm` typography.
- **Audio Player:** A custom, thin-line seeker bar in Gold. All icons (Play, Skip, Volume) are ultra-fine 1px strokes.
- **Discography Lists:** Numerals should be set in large, low-opacity `Bodoni Moda` (e.g., "01", "02") to serve as a background element for the track title.
- **Chips/Tags:** Small, sharp-edged boxes with `marble` backgrounds and `neutral` text, used for genre or year tagging.