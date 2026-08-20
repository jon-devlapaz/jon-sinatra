import { expect, test } from '@playwright/test';

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

test.describe('D01 style guide', () => {
  test('style guide is visible at /style-guide with tokens, glassy card and stub CTA', async ({
    page,
  }) => {
    const response = await page.goto('/style-guide');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Style Guide/);

    // C1 — design tokens exist as CSS variables on :root (build emits lowercased hex).
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        paper: style.getPropertyValue('--color-paper').trim(),
        accent: style.getPropertyValue('--color-accent').trim(),
        ink: style.getPropertyValue('--color-ink').trim(),
      };
    });
    expect(tokens.paper).toBe('#f4efe6');
    expect(tokens.accent).toBe('#8a5a1b');
    expect(tokens.ink).toBe('#2b241b');

    // C5 — ticket-stub CTA renders a real, labelled anchor.
    const cta = page.locator('.ticket-stub').getByRole('link', { name: /book the/i });
    await expect(cta).toHaveAttribute('href', '#booking');

    // Shell — the page renders inside a glassy card.
    await expect(page.locator('.card').first()).toBeVisible();
  });

  test('ink/bronze text pairs on paper pass WCAG AA in computed styles', async ({ page }) => {
    await page.goto('/style-guide');
    const result = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const paper = style.getPropertyValue('--color-paper').trim();
      const pairs = [
        [style.getPropertyValue('--color-ink').trim(), paper],
        [style.getPropertyValue('--color-ink-soft').trim(), paper],
        [style.getPropertyValue('--color-accent').trim(), paper],
        [style.getPropertyValue('--color-accent-deep').trim(), paper],
      ];
      const eyebrow = document.querySelector('.eyebrow');
      return {
        pairs,
        renderedAccent: eyebrow ? getComputedStyle(eyebrow).color : null,
      };
    });
    for (const [fg, bg] of result.pairs) {
      expect(contrast(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    // The rendered eyebrow resolves from the deep bronze token (rgb(111, 69, 16)).
    expect(result.renderedAccent).toBe('rgb(111, 69, 16)');
  });

  test('type scale stays within the viewport at 360px–1440px and the minimal CTA card renders', async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/style-guide');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    }

    // C5 — the card is one quiet column: headline, status/value, labelled CTA.
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/style-guide');
    const stub = page.locator('.ticket-stub').first();
    await expect(stub.locator('.ticket-stub__title')).toContainText('Two-hour lounge set');
    await expect(stub.locator('.ticket-stub__status')).toContainText('On request');
    await expect(stub.locator('.ticket-stub__value')).toContainText('Enquire');
    await expect(stub.getByRole('link', { name: /book the/i })).toHaveAttribute('href', '#booking');
    await expect(stub.locator('.ticket-stub__barcode')).toHaveCount(0);
    await expect(stub.locator('.ticket-stub__tear')).toHaveCount(0);
  });
});
