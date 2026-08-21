import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import NotFound from '../../src/pages/404.astro';

describe('404 page (Aurelian Gallery)', () => {
  it('renders a themed off-night message and a primary CTA home', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NotFound);

    expect(html).toContain('<title>404 — The wrong door</title>');
    expect(html).toContain('The wrong door.');
    expect(html).toContain("isn't in the set list");
    expect(html).toContain('href="/"');
    expect(html).toContain('Back to the main stage');
    expect(html).toContain('btn-primary');
  });
});
