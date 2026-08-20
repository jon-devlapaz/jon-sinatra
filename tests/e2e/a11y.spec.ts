import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * LG4/I01 gate (roadmap verification #10) — axe scan of the built site has
 * zero serious/critical violations. Scans the homepage (with the interactive
 * islands hydrated) and the 404 page.
 */
test.describe('I01 axe scan (zero serious)', () => {
  test('homepage has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('404 page has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/a/route/that/does/not/exist');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
