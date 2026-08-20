import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const builtIndex = new URL('../dist/index.html', import.meta.url);

describe('home page (static build output)', () => {
  it('renders the site name, title, and marquee booking CTA from the built index', async () => {
    const html = await readFile(builtIndex, 'utf8');
    expect(html).toMatch(/<title>[^<]*Jon Sinatra[^<]*<\/title>/);
    expect(html).toMatch(/<h1[^>]*>\s*Jon Sinatra\s*<\/h1>/);
    // LG2 surfaces present in the static build.
    expect(html).toContain('Lounge Singer');
    expect(html).toContain('id="marquee"');
    expect(html).toContain('id="booking"');
    expect(html).toContain('href="#booking?package=standard"');
  });
});
