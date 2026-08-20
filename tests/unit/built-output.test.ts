import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const distIndex = resolve(process.cwd(), 'dist/index.html');

/**
 * I01 regression guard — the built home page must ship its stylesheet.
 * global.css (Tailwind v4 + theme tokens) is imported by BaseLayout; if that
 * wiring breaks, dist/index.html carries no <link rel="stylesheet"> and the
 * site renders unstyled. The global-setup builds dist/ before these tests.
 */
describe('built home page ships styling', () => {
  it('dist/index.html exists and links a stylesheet for the home page', () => {
    expect(existsSync(distIndex), `${distIndex} missing — global-setup builds dist/`).toBe(true);
    const html = readFileSync(distIndex, 'utf8');
    const href = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
    expect(href, 'expected a <link rel="stylesheet"> in dist/index.html').toBeTruthy();
    const cssPath = resolve(process.cwd(), `dist/${href!.replace(/^\/+/, '')}`);
    expect(existsSync(cssPath), `stylesheet ${href} missing from dist/`).toBe(true);
  });

  it('the built stylesheet declares the noir design tokens', () => {
    const html = readFileSync(distIndex, 'utf8');
    const href = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
    const css = readFileSync(resolve(process.cwd(), `dist/${href!.replace(/^\/+/, '')}`), 'utf8');
    expect(css).toContain('--color-noir');
    expect(css).toContain('--color-gold');
    expect(css).toContain('--font-display');
  });
});
