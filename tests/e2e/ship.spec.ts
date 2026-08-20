import { expect, test } from '@playwright/test';

/**
 * LG4/I01 gate — the ship artifacts: meta/canonical/OG in the shipped head,
 * sitemap + favicon + OG image served, and the themed 404 page for unknown
 * routes. Runs against `preview` (the built dist/), so these assert the real
 * deploy artifact — not the dev server.
 */
test.describe('I01 ship metadata', () => {
  test('head ships canonical, OG/Twitter and favicon with the configured origin', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://jonsinatra.example/',
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://jonsinatra.example/og.jpg',
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://jonsinatra.example/',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
      'href',
      '/favicon.svg',
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /keeper of the great American songbook/,
    );
  });

  test('sitemap, favicon and OG image are reachable on the built site', async ({ page }) => {
    const sitemapIndex = await page.goto('/sitemap-index.xml');
    expect(sitemapIndex?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('https://jonsinatra.example/');
    await expect(page.locator('body')).toContainText('sitemap-0.xml');

    const sitemap0 = await page.goto('/sitemap-0.xml');
    expect(sitemap0?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('https://jonsinatra.example/');
    await expect(page.locator('body')).toContainText('style-guide');

    const favicon = await page.goto('/favicon.svg');
    expect(favicon?.status()).toBe(200);
    expect(favicon?.headers()['content-type']).toContain('image/svg+xml');

    const og = await page.goto('/og.jpg');
    expect(og?.status()).toBe(200);
    expect(og?.headers()['content-type']).toContain('image/jpeg');
  });

  test('unknown routes render the themed 404 page with a 404 status', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The wrong door.');
    await expect(page.locator('a[href="/#marquee"]')).toHaveText('Back to the main stage');
  });
});
