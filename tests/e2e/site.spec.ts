import { expect, test } from '@playwright/test';

/**
 * LG2 site gate — the profile must be fully browsable with no client JS.
 */
test.describe('LG2 static profile (no JS)', () => {
  test.use({ javaScriptEnabled: false });

  test('renders every section with real content in DOM order', async ({ page }) => {
    await page.goto('/');
    expect(await page.title()).toMatch(/Jon Sinatra/);

    const ids = [
      'marquee',
      'voice',
      'repertoire',
      'show',
      'stage',
      'word',
      'calendar',
      'booking',
      'encore',
    ];
    const sections = page.locator('section[id]');
    const count = await sections.count();
    const present: string[] = [];
    for (let i = 0; i < count; i++) {
      present.push((await sections.nth(i).getAttribute('id')) || '');
    }
    for (const id of ids) expect(present).toContain(id);

    // DOM order: marquee first, encore last.
    expect(present[0]).toBe('marquee');
    expect(present[present.length - 1]).toBe('encore');
  });

  test('marquee and package CTAs target the booking form', async ({ page }) => {
    await page.goto('/');
    const ctaLocator = page.locator('a[href^="#booking"]');
    const n = await ctaLocator.count();
    expect(n).toBeGreaterThan(0);
    const hrefs: string[] = [];
    for (let i = 0; i < n; i++) {
      hrefs.push((await ctaLocator.nth(i).getAttribute('href')) || '');
    }
    expect(hrefs.some((h: string) => h.includes('package=standard'))).toBe(true);
  });

  test('repertoire is data-driven (songs render from the collection)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Songs in the set list/i })).toBeVisible();
    await expect(page.getByText('Fly Me to the Moon')).toBeVisible();
  });

  test('testimonials render verbatim from the collection', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/The room went silent/)).toBeVisible();
  });
});
