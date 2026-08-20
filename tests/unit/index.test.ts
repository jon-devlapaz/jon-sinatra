import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import IndexPage from '../../src/pages/index.astro';

describe('home page render (B01 placeholder)', () => {
  it('renders the site name and scaffold notice', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IndexPage);
    expect(html).toMatch(/<h1[^>]*>Jon Sinatra<\/h1>/);
    expect(html).toContain('Scaffold placeholder (B01)');
  });
});
