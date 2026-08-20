import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const builtIndex = new URL('../dist/index.html', import.meta.url);

describe('placeholder home page (static build output)', () => {
  it('renders the site name, title, and scaffold notice', async () => {
    const html = await readFile(builtIndex, 'utf8');
    expect(html).toContain('Lounge Singer');
    expect(html).toMatch(/<h1[^>]*>Jon Sinatra<\/h1>/);
    expect(html).toContain('Scaffold placeholder (B01)');
  });
});
