import { expect, test } from '@playwright/test';

/**
 * LG3 gate — the interactive booking flow on the built static site:
 * pick a date in the calendar → the form prefills → a validated submit
 * succeeds against the configured endpoint (intercepted here).
 */
async function waitForHydration(page: import('@playwright/test').Page) {
  await page.goto('/');
  // The SSR form/calendar render before hydration; wait until every island
  // has re-rendered its client content so React state owns the DOM.
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
}
test.describe('LG3 booking flow', () => {
  test('calendar date selection prefills the booking form date', async ({ page }) => {
    await waitForHydration(page);

    const calendar = page.getByRole('grid', { name: /availability calendar/i });
    await expect(calendar).toBeVisible();

    // Pick an open day in the visible month (August 2026 — none of the
    // sample blocked dates fall in it).
    await calendar.getByRole('gridcell', { name: '5', exact: true }).click();

    const dateInput = page.getByLabel('Event date');
    await expect(dateInput).toHaveValue(/^\d{4}-\d{2}-05$/);

    // The selection is committed to the URL for deep-linking.
    await expect(page).toHaveURL(/#booking$/);
    expect(new URL(page.url()).searchParams.get('date')).toMatch(/-\d{2}-05$/);
  });

  test('a package CTA prefills the package field and the form submits successfully', async ({
    page,
  }) => {
    // Intercept the configured form endpoint and answer a success.
    await page.route('**/example.invalid/booking', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    await waitForHydration(page);

    await page.locator('a[href="#booking?package=standard"]').first().click();
    const packageInput = page.getByLabel('Package');
    await expect(packageInput).toHaveValue('The Standard');

    await page.getByLabel('Name').fill('Avery Booker');
    await page.getByLabel('Email').fill('avery@example.com');
    await page.getByLabel('Event date').fill('2026-12-20');
    await page.getByRole('button', { name: /send the booking/i }).click();

    await expect(page.getByText(/date is pencilled in/i)).toBeVisible();
  });

  test('invalid submissions stay on the form with inline errors', async ({ page }) => {
    await waitForHydration(page);
    await page.getByRole('button', { name: /send the booking/i }).click();
    await expect(page.getByText(/please add your name/i)).toBeVisible();
    await expect(page.getByText(/add an email/i)).toBeVisible();
    const name = page.getByLabel('Name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
  });

  test('a failed endpoint shows an inline error and a retry succeeds', async ({ page }) => {
    let fail = true;
    await page.route('**/example.invalid/booking', (route) => {
      if (fail) {
        fail = false;
        return route.fulfill({ status: 500, contentType: 'application/json', body: 'err' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await waitForHydration(page);
    await page.getByLabel('Name').fill('Avery Booker');
    await page.getByLabel('Email').fill('avery@example.com');
    await page.getByLabel('Event date').fill('2026-12-20');

    const submit = page.getByRole('button', { name: /send the booking/i });
    await submit.click();
    await expect(page.getByText(/didn't go through/i)).toBeVisible();

    await submit.click();
    await expect(page.getByText(/date is pencilled in/i)).toBeVisible();
  });
});
