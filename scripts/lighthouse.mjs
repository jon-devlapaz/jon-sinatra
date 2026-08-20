/**
 * I01 gate (roadmap verification #9) — Lighthouse against the built site,
 * performance / accessibility / best-practices / SEO each ≥90.
 *
 * Run the preview server first, then:
 *   npm run lighthouse [url]
 * Defaults to http://localhost:4321/.
 */
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const url = process.argv[2] ?? 'http://localhost:4321/';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const FLOOR = 90;

const browser = await chromium.launch({ args: ['--remote-debugging-port=9222'] });
let failed = false;
try {
  const result = await lighthouse(url, {
    port: 9222,
    output: 'json',
    logLevel: 'error',
    onlyCategories: CATEGORIES,
  });
  if (!result) throw new Error('lighthouse returned no result');
  const { lhr } = result;
  console.log(`Lighthouse for ${lhr.finalDisplayedUrl}`);
  for (const name of CATEGORIES) {
    const score = Math.round(lhr.categories[name].score * 100);
    const mark = score >= FLOOR ? 'PASS' : 'FAIL';
    if (score < FLOOR) failed = true;
    console.log(`  ${mark} ${name.padEnd(17)} ${score}`);
  }
} finally {
  await browser.close();
}
if (failed) {
  console.error(`\nOne or more categories scored below ${FLOOR}.`);
  process.exit(1);
}
