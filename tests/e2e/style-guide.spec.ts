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
  test('style guide is visible at /style-guide with tokens, grain and ticket-stub CTA', async ({
    page,
  }) => {
    const response = await page.goto('/style-guide');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Style Guide/);

    // C1 — design tokens exist as CSS variables on :root (build emits lowercased hex).
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        noir: style.getPropertyValue('--color-noir').trim(),
        gold: style.getPropertyValue('--color-gold').trim(),
        ivory: style.getPropertyValue('--color-ivory').trim(),
      };
    });
    expect(tokens.noir).toBe('#141414');
    expect(tokens.gold).toBe('#c9a84c');
    expect(tokens.ivory).toBe('#f2f0eb');

    // C5 — ticket-stub CTA renders a real, labelled anchor.
    const cta = page.getByRole('link', { name: /book the/i });
    await expect(cta).toHaveAttribute('href', '#booking');

    // C3 — grain overlay is composable and hidden from assistive tech.
    const grain = page.locator('.film-grain').first();
    await expect(grain).toHaveAttribute('aria-hidden', 'true');
  });

  test('gold/ivory text pairs on noir pass WCAG AA in computed styles', async ({ page }) => {
    await page.goto('/style-guide');
    const result = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const noir = style.getPropertyValue('--color-noir').trim();
      const pairs = [
        [style.getPropertyValue('--color-ivory').trim(), noir],
        [style.getPropertyValue('--color-ivory-dim').trim(), noir],
        [style.getPropertyValue('--color-gold').trim(), noir],
        [style.getPropertyValue('--color-gold-bright').trim(), noir],
        [style.getPropertyValue('--color-gold-deep').trim(), noir],
      ];
      const eyebrow = document.querySelector('.eyebrow');
      return {
        pairs,
        renderedGold: eyebrow ? getComputedStyle(eyebrow).color : null,
      };
    });
    for (const [fg, bg] of result.pairs) {
      expect(contrast(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    // The rendered gold accent resolves from the brass token (rgb(201, 168, 76)).
    expect(result.renderedGold).toBe('rgb(201, 168, 76)');
  });

  test('type scale stays within the viewport at 360px–1440px and the stub stacks on small screens', async ({
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

    // C5 — below ~420px the ticket stub wraps: stub panel stacks under the main panel.
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/style-guide');
    const stub = page.locator('.ticket-stub').first();
    const main = await stub.locator('.ticket-stub__main').boundingBox();
    const stubPanel = await stub.locator('.ticket-stub__stub').boundingBox();
    expect(main).not.toBeNull();
    expect(stubPanel).not.toBeNull();
    expect(stubPanel!.y).toBeGreaterThan(main!.y + main!.height / 2);
  });
});
