import { expect, test } from '@playwright/test';

/**
 * D01 F1 regression guard.
 *
 * The shipped build must deliver noir/ivory/gold typefaces from self-hosted
 * font files (no remote Google Fonts request). Runs against `astro preview`
 * of the real `astro build` output (per playwright.webServer).
 */

/** Gather the raw CSS text of every same-origin stylesheet linked/inline on the page. */
async function allCssText(page: import('@playwright/test').Page): Promise<string> {
  return await page.evaluate(() => {
    const chunks: string[] = [];
    const push = (s: StyleSheet) => {
      try {
        const css = (s as CSSStyleSheet).cssRules;
        if (css)
          chunks.push(
            Array.from(css)
              .map((r) => r.cssText)
              .join('\n'),
          );
      } catch {
        /* cross-origin sheet — skipped */
      }
    };
    // Inline <style> sheets.
    document.querySelectorAll('style').forEach((s) => chunks.push(s.textContent || ''));
    // Linked <link rel=stylesheet> sheets (served from the same origin by preview).
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((l) => {
      if (l.href && (l.href.startsWith('/') || new URL(l.href).origin === location.origin)) {
        const sheet = document.styleSheets;
        for (const s of sheet) if ((s as CSSStyleSheet).href === l.href) push(s as CSSStyleSheet);
      }
    });
    return chunks.join('\n').toLowerCase();
  });
}

/** Gather every stylesheet href on the page. */
function stylesheetHrefs(page: import('@playwright/test').Page) {
  return page.$$eval('link[rel="stylesheet"]', (links) =>
    links.map((l) => (l as HTMLLinkElement).href),
  );
}

test.describe('D01 font delivery (F1 guard)', () => {
  test('no remote Google Fonts request leaks into the built site', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const hrefs = await stylesheetHrefs(page);
    expect(hrefs.some((h) => /fonts\.googleapis\.com/.test(h))).toBe(false);
    expect(hrefs.some((h) => /googleusercontent\.com/.test(h))).toBe(false);
  });

  test('self-hosted @font-face woff2 faces ship in preview', async ({ page }) => {
    await page.goto('/style-guide');
    const css = await allCssText(page);
    // At least one @font-face defined and it references a local woff2 asset.
    expect(css).toContain('@font-face');
    expect(css).toMatch(/src:\s*url\([^)]*\.woff2/i);
    expect(css).not.toContain('googleapis');
  });
});
