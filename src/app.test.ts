import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const builtIndex = new URL('../dist/index.html', import.meta.url);

describe('home page (static build output)', () => {
  it('renders the site name, hero, music, booking form shell, and footer from the built index', async () => {
    const html = await readFile(builtIndex, 'utf8');

    // Title + brand name.
    expect(html).toMatch(/<title>[^<]*Jon Delapaz[^<]*<\/title>/);
    expect(html).toMatch(/<h1[^>]*>\s*Jon Delapaz/);

    // Aurelian Gallery section IDs.
    expect(html).toContain('id="hero"');
    expect(html).toContain('id="about"');
    expect(html).toContain('id="music"');
    expect(html).toContain('id="booking-form-shell"');

    // Hero copy.
    expect(html).toContain('An Elegant Legacy');

    // Music sample.
    expect(html).toContain('Fly Me to the Moon');

    // Footer brand.
    expect(html).toContain('ALL RIGHTS RESERVED');
  });
});