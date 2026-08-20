import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import StyleGuide from '../../src/pages/style-guide.astro';

describe('style-guide page (D01 acceptance: visible guide)', () => {
  it('renders every token, the type scale, grain, ticket-stub and layout primitives', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StyleGuide);
    // C1 — every color token is shown with its role.
    for (const name of ['noir', 'ivory', 'gold', 'gold-bright', 'gold-deep']) {
      expect(html).toContain(`--color-${name}`);
    }
    // C1 — measured contrast table renders all six claimed pairs.
    for (const pair of ['ivory / noir', 'gold / noir', 'gold-dim / noir']) {
      expect(html).toContain(pair);
    }
    for (const ratio of ['16.18:1', '8.06:1', '3.91:1']) {
      expect(html).toContain(ratio);
    }
    // C2 — type scale sections present.
    expect(html).toContain('Type scale');
    expect(html).toContain('Bodoni Moda');
    // C3 — grain + vignette composables rendered.
    expect(html).toMatch(/film-grain[^>]*aria-hidden="true"/);
    expect(html).toContain('film-vignette');
    // C4 — hero title-card demo rendered.
    expect(html).toContain('title-card');
    expect(html).toContain('marquee-name');
    // C5 — ticket-stub CTA rendered with real status text.
    expect(html).toContain('ticket-stub');
    expect(html).toContain('On request');
    // C6 — hairline gold rules + gold-outline button.
    expect(html).toContain('hairline-gold-underline');
    expect(html).toContain('Gold-outline CTA');
    // C7 — facts strip + media frame.
    expect(html).toContain('facts-strip');
    expect(html).toContain('media-frame');
  });
});
