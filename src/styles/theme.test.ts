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

/** Extract `--name: value;` pairs from the @theme block of theme.css.
 * Values may wrap across lines (prettier), so parse the whole block at once. */
function parseThemeTokens(source: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const block = source.match(/@theme\s*{([\s\S]*?)}/);
  expect(block, 'theme.css must contain an @theme token block').not.toBeNull();
  for (const m of block![1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

describe('D01 design tokens (theme.css snapshot)', () => {
  it('defines the noir/ivory/brass token set prescribed by evidence C1', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    for (const name of [
      '--color-noir',
      '--color-noir-soft',
      '--color-noir-lift',
      '--color-ivory',
      '--color-ivory-dim',
      '--color-gold',
      '--color-gold-bright',
      '--color-gold-dim',
      '--color-gold-deep',
    ]) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
    // Brass ramp, not yellow gold: exact values from evidence C1 delta #1.
    expect(tokens.get('--color-noir')).toBe('#141414');
    expect(tokens.get('--color-noir-soft')).toBe('#0c0c0e');
    expect(tokens.get('--color-ivory')).toBe('#f2f0eb');
    expect(tokens.get('--color-gold')).toBe('#c9a84c');
    expect(tokens.get('--color-gold-bright')).toBe('#ffe033');
    expect(tokens.get('--color-gold-dim')).toBe('#8a7038');
    expect(tokens.get('--color-gold-deep')).toBe('#bfa100');
  });

  it('defines the display serif / body serif / mono label type scale from evidence C2', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    for (const name of ['--font-display', '--font-body', '--font-mono']) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
    expect(tokens.get('--font-display')).toContain('Bodoni Moda');
    expect(tokens.get('--font-body')).toContain('EB Garamond');
    expect(tokens.get('--font-mono')).toContain('IBM Plex Mono');
  });

  it('brass/ivory text pairs on noir meet WCAG AA (4.5:1+)', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    const noir = tokens.get('--color-noir');
    expect(noir).toBeDefined();
    for (const name of [
      '--color-ivory',
      '--color-ivory-dim',
      '--color-gold',
      '--color-gold-bright',
      '--color-gold-deep',
    ]) {
      const fg = tokens.get(name);
      expect(fg, `missing token ${name}`).toBeDefined();
      expect(contrast(fg!, noir!), `${name} vs noir`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('exposes grain + hairline governance tokens (evidence C3/C6)', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    expect(tokens.get('--grain-opacity')).toBeDefined();
    expect(tokens.get('--hairline-width')).toBeDefined();
  });
});

describe('C2 webfont delivery (F1 — fonts ship in preview AND production)', () => {
  it('self-hosts the typefaces via @fontsource, not a remote Google Fonts import', async () => {
    const css = await readFile(themeUrl, 'utf8');
    // No remote font dependency: theme.css must not pull fonts.googleapis.com.
    expect(css).not.toContain('fonts.googleapis.com');
    // All three C2 families are delivered from local @fontsource packages.
    for (const pkg of [
      '@fontsource-variable/bodoni-moda',
      '@fontsource-variable/eb-garamond',
      '@fontsource/ibm-plex-mono',
    ]) {
      expect(css, `missing fontsource import ${pkg}`).toContain(`@import '${pkg}`);
    }
    // The type-scale tokens reference the shipped fontsource family names.
    const tokens = parseThemeTokens(css);
    expect(tokens.get('--font-display')).toContain('Bodoni Moda Variable');
    expect(tokens.get('--font-body')).toContain('EB Garamond Variable');
    expect(tokens.get('--font-mono')).toContain('IBM Plex Mono');
  });

  it('emits @font-face rules + woff2 assets in the built CSS (real delivery)', async () => {
    const distDir = new URL('../../dist/_astro/', import.meta.url);
    const distFiles = await readdir(distDir);
    const cssBundles = distFiles.filter((f) => f.endsWith('.css'));
    expect(cssBundles.length).toBeGreaterThan(0);
    const bundle = (
      await Promise.all(cssBundles.map((f) => readFile(new URL(f, distDir), 'utf8')))
    ).join('\n');

    // Real @font-face rules for every family + at least one emitted woff2 per family.
    expect(bundle).toContain('@font-face');
    for (const [family, slug] of [
      ['Bodoni Moda Variable', 'bodoni-moda'],
      ['EB Garamond Variable', 'eb-garamond'],
      ['IBM Plex Mono', 'ibm-plex-mono'],
    ]) {
      expect(bundle, `missing @font-face family ${family}`).toContain(family);
      const familyRefs = [...bundle.matchAll(/url\(\/_astro\/([\w.-]+\.woff2)\)/g)]
        .map((m) => m[1])
        .filter((f) => f.includes(slug));
      expect(familyRefs.length, `no ${family} woff2 referenced in built CSS`).toBeGreaterThan(0);
      for (const asset of familyRefs) {
        expect(distFiles, `missing emitted asset ${asset}`).toContain(asset);
      }
    }

    // Production build is fully self-hosted — zero remote font requests remain.
    expect(bundle).not.toContain('fonts.googleapis.com');
  });
});
