/**
 * I01 — one-shot OG poster generator. Renders a themed 1200×630 poster with
 * Playwright's bundled Chromium and writes public/og.jpg. Run manually after
 * changing poster copy; the generated image is the committed build asset.
 *
 *   node scripts/generate-og.mjs
 */
import { chromium } from '@playwright/test';

const OUT = 'public/og.jpg';

const html = `<!doctype html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden;
    background: radial-gradient(70rem 32rem at 50% -8%, rgba(201,166,107,.35), transparent 70%),
      radial-gradient(rgba(80,66,45,.10) 1.2px, transparent 1.6px) 0 0/22px 22px;
    background-color: #F4EFE6; }
  .card { position: absolute; inset: 44px 72px; border-radius: 20px;
    background: rgba(255,253,248,.72); border: 1px solid rgba(80,66,45,.18);
    backdrop-filter: blur(14px) saturate(1.1); }
  .wrap { position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    color: #2B241B; font-family: 'Inter', sans-serif; }
  .eyebrow { font-size: 20px; font-weight: 600; letter-spacing: .35em; text-transform: uppercase;
    color: #6F4510; margin-bottom: 24px; }
  .name { font-size: 92px; font-weight: 300; letter-spacing: -.02em; line-height: 1; }
  .rule { width: 96px; height: 1px; background: #C9A66B; margin: 28px auto; }
  .tag { font-size: 24px; font-weight: 400; color: #5D5344; }
  .foot { position: absolute; left: 0; right: 0; bottom: 40px; font-size: 16px;
    font-weight: 600; letter-spacing: .3em; text-transform: uppercase; color: #8A5A1B;
    text-align: center; }
</style>
</head>
<body>
  <div class="card"></div>
  <div class="wrap">
    <p class="eyebrow">Now appearing</p>
    <h1 class="name">Jon Delapaz</h1>
    <div class="rule"></div>
    <p class="tag">Classic oldies crooner &mdash; Sinatra-style</p>
  </div>
  <p class="foot">Book your date</p>
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
