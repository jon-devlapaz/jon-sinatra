import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const themeUrl = new URL('./theme.css', import.meta.url);

/** WCAG 2.x relative luminance of an sRGB hex color. */
function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG 2.x contrast ratio between two hex colors. */
function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Extract `--name: value;` pairs from the @theme block of theme.css. */
function parseThemeTokens(source: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const block = source.match(/@theme\s*{([\s\S]*?)}/);
  expect(block, 'theme.css must contain an @theme token block').not.toBeNull();
  for (const m of block![1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

describe('Aurelian Gallery design tokens (theme.css snapshot)', () => {
  it('defines the Material 3 surface/on-surface/primary/outline token set', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    for (const name of [
      '--color-surface',
      '--color-surface-dim',
      '--color-surface-bright',
      '--color-surface-container-lowest',
      '--color-surface-container-low',
      '--color-surface-container',
      '--color-surface-container-high',
      '--color-surface-container-highest',
      '--color-on-surface',
      '--color-on-surface-variant',
      '--color-outline',
      '--color-outline-variant',
      '--color-primary',
      '--color-on-primary',
      '--color-primary-container',
      '--color-on-primary-container',
      '--color-background',
      '--color-on-background',
      '--color-surface-variant',
    ]) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
    expect(tokens.get('--color-surface')).toBe('#fcf9f8');
    expect(tokens.get('--color-on-surface')).toBe('#1c1b1b');
    expect(tokens.get('--color-on-surface-variant')).toBe('#4d4635');
    expect(tokens.get('--color-primary')).toBe('#735c00');
    expect(tokens.get('--color-primary-container')).toBe('#d4af37');
  });

  it('defines the Bodoni Moda + DM Sans type scale tokens', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    expect(tokens.get('--font-display')).toContain('Bodoni Moda');
    expect(tokens.get('--font-body')).toContain('DM Sans');
    expect(tokens.get('--font-label')).toContain('DM Sans');
    for (const name of [
      '--text-display-lg',
      '--text-display-lg-mobile',
      '--text-headline-md',
      '--text-subheading-caps',
      '--text-body-lg',
      '--text-body-md',
      '--text-label-sm',
    ]) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
  });

  it('text pairs on surface meet WCAG AA (4.5:1+)', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    const surface = tokens.get('--color-surface');
    expect(surface).toBeDefined();
    for (const name of [
      '--color-on-surface',
      '--color-on-surface-variant',
      '--color-primary',
    ]) {
      const fg = tokens.get(name);
      expect(fg, `missing token ${name}`).toBeDefined();
      expect(contrast(fg!, surface!), `${name} vs surface`).toBeGreaterThanOrEqual(4.5);
    }
    // Button pair: on-primary text on primary fill must also pass AA.
    const primary = tokens.get('--color-primary')!;
    const onPrimary = tokens.get('--color-on-primary')!;
    expect(contrast(onPrimary, primary), 'on-primary vs primary').toBeGreaterThanOrEqual(4.5);
  });

  it('exposes spacing + layout governance tokens', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    for (const name of [
      '--spacing-unit',
      '--spacing-gutter',
      '--spacing-margin-desktop',
      '--spacing-margin-mobile',
      '--spacing-section-gap',
      '--container-max',
      '--hairline-width',
    ]) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
    expect(tokens.get('--spacing-section-gap')).toBe('160px');
    expect(tokens.get('--container-max')).toBe('1440px');
    expect(tokens.get('--spacing-margin-desktop')).toBe('80px');
  });
});

describe('webfont delivery (Aurelian Gallery ships in preview AND production)', () => {
  it('self-hosts Bodoni Moda + DM Sans via @fontsource, not remote Google Fonts', async () => {
    const css = await readFile(themeUrl, 'utf8');
    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).toContain('@fontsource-variable/bodoni-moda');
    expect(css).toContain('@fontsource/dm-sans');
  });

  it('emits @font-face rules + woff2 assets in the built CSS (real delivery)', async () => {
    const distDir = new URL('../../dist/_astro/', import.meta.url);
    const distFiles = await readdir(distDir);
    const cssBundles = distFiles.filter((f) => f.endsWith('.css'));
    expect(cssBundles.length).toBeGreaterThan(0);
    const bundle = (
      await Promise.all(cssBundles.map((f) => readFile(new URL(f, distDir), 'utf8')))
    ).join('\n');

    expect(bundle).toContain('@font-face');
    expect(bundle).toContain('Bodoni Moda');
    expect(bundle).toContain('DM Sans');
    const familyRefs = [...bundle.matchAll(/url\(\/_astro\/([\w.-]+\.woff2)\)/g)]
      .map((m) => m[1])
      .filter((f) => f.includes('bodoni') || f.includes('dm-sans'));
    expect(familyRefs.length, 'no Bodoni/DM Sans woff2 referenced in built CSS').toBeGreaterThan(0);
    for (const asset of familyRefs) {
      expect(distFiles, `missing emitted asset ${asset}`).toContain(asset);
    }

    // Production build is fully self-hosted — zero remote font requests remain.
    expect(bundle).not.toContain('fonts.googleapis.com');
  });
});