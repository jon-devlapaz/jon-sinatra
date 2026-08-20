/**
 * I01 — one-shot OG poster generator. Renders a themed 1200×630 poster with
 * Playwright's bundled Chromium and writes public/og.png. Run manually after
 * changing poster copy; the generated PNG is the committed build asset.
 *
 *   node scripts/generate-og.mjs
 */
import { chromium } from '@playwright/test';

const OUT = 'public/og.jpg';

const html = `<!doctype html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz@6..96&display=swap');
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden;
    background: radial-gradient(120% 120% at 50% 0%, #1d1c1a 0%, #141414 55%, #0e0e0d 100%); }
  .grain { position: absolute; inset: 0; opacity: .5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E"); }
  .hairline { position: absolute; left: 56px; right: 56px; height: 1px; background: #C9A84C; opacity: .55; }
  .hairline.top { top: 40px; } .hairline.bottom { bottom: 40px; }
  .inner { position: absolute; inset: 40px 56px; border: 1px solid rgba(201,168,76,.35); }
  .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #F2F0EB; font-family: 'Bodoni Moda', serif; }
  .eyebrow { font-size: 22px; letter-spacing: .45em; text-transform: uppercase; color: #C9A84C; margin-bottom: 28px; font-weight: 600; }
  .name { font-size: 96px; font-weight: 600; letter-spacing: .01em; line-height: 1; }
  .rule { width: 120px; height: 1px; background: #C9A84C; margin: 30px auto; }
  .tag { font-size: 26px; letter-spacing: .08em; color: rgba(242,240,235,.72); }
  .foot { position: absolute; left: 0; right: 0; bottom: 44px; font-size: 18px; letter-spacing: .4em; text-transform: uppercase; color: #C9A84C; text-align: center; }
</style>
</head>
<body>
  <div class="grain"></div>
  <div class="hairline top"></div>
  <div class="hairline bottom"></div>
  <div class="inner"></div>
  <div class="wrap">
    <p class="eyebrow">Now appearing</p>
    <h1 class="name">Jon Sinatra</h1>
    <div class="rule"></div>
    <p class="tag">Lounge singer &amp; keeper of the great American songbook</p>
  </div>
  <p class="foot">Enquire about a date</p>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: OUT, type: 'jpeg', quality: 88 });
await browser.close();
console.log(`wrote ${OUT}`);
