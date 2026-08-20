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
  it('defines the paper/ink/bronze token set', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    for (const name of [
      '--color-paper',
      '--color-paper-deep',
      '--color-paper-lift',
      '--color-ink',
      '--color-ink-soft',
      '--color-ink-faint',
      '--color-accent',
      '--color-accent-deep',
      '--color-accent-soft',
      '--color-card',
      '--color-card-border',
    ]) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
    expect(tokens.get('--color-paper')).toBe('#f4efe6');
    expect(tokens.get('--color-ink')).toBe('#2b241b');
    expect(tokens.get('--color-ink-soft')).toBe('#5d5344');
    expect(tokens.get('--color-accent')).toBe('#8a5a1b');
    expect(tokens.get('--color-accent-deep')).toBe('#6f4510');
  });

  it('defines the Inter type scale and motion/card tokens', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    expect(tokens.get('--font-sans')).toContain('Inter');
    for (const name of ['--motion-fast', '--radius-card', '--tracking-brand']) {
      expect(tokens.has(name), `missing token ${name}`).toBe(true);
    }
  });

  it('ink/bronze text pairs on paper meet WCAG AA (4.5:1+)', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    const paper = tokens.get('--color-paper');
    expect(paper).toBeDefined();
    for (const name of [
      '--color-ink',
      '--color-ink-soft',
      '--color-accent',
      '--color-accent-deep',
    ]) {
      const fg = tokens.get(name);
      expect(fg, `missing token ${name}`).toBeDefined();
      expect(contrast(fg!, paper!), `${name} vs paper`).toBeGreaterThanOrEqual(4.5);
    }
    // Button pair: paper text on accent fill must also pass AA.
    const accent = tokens.get('--color-accent')!;
    expect(contrast(paper!, accent), 'paper vs accent').toBeGreaterThanOrEqual(4.5);
  });

  it('exposes card + motion governance tokens', async () => {
    const css = await readFile(themeUrl, 'utf8');
    const tokens = parseThemeTokens(css);
    expect(tokens.get('--radius-card')).toBeDefined();
    expect(tokens.get('--motion-fast')).toBeDefined();
    expect(tokens.get('--shadow-card')).toBeDefined();
  });
});

describe('webfont delivery (Inter ships in preview AND production)', () => {
  it('self-hosts Inter via @fontsource, not a remote Google Fonts import', async () => {
    const css = await readFile(themeUrl, 'utf8');
    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).toContain("@import '@fontsource-variable/inter");
    const tokens = parseThemeTokens(css);
    expect(tokens.get('--font-sans')).toContain('Inter Variable');
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
    expect(bundle).toContain('Inter Variable');
    const familyRefs = [...bundle.matchAll(/url\(\/_astro\/([\w.-]+\.woff2)\)/g)]
      .map((m) => m[1])
      .filter((f) => f.includes('inter'));
    expect(familyRefs.length, 'no Inter woff2 referenced in built CSS').toBeGreaterThan(0);
    for (const asset of familyRefs) {
      expect(distFiles, `missing emitted asset ${asset}`).toContain(asset);
    }

    // Production build is fully self-hosted — zero remote font requests remain.
    expect(bundle).not.toContain('fonts.googleapis.com');
  });
});
