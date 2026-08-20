import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import StyleGuide from '../../src/pages/style-guide.astro';

describe('style-guide page (D01 acceptance: visible guide)', () => {
  it('renders every token, the type scale, glassy card, stub and layout primitives', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StyleGuide);
    // Color tokens shown with their role.
    for (const name of ['paper', 'ink', 'ink-soft', 'accent', 'accent-deep']) {
      expect(html).toContain(`--color-${name}`);
    }
    // Measured contrast table renders the claimed pairs.
    for (const pair of ['ink / paper', 'accent-deep / paper', 'ink-soft / paper']) {
      expect(html).toContain(pair);
    }
    for (const ratio of ['13.38:1', '7.23:1', '6.58:1']) {
      expect(html).toContain(ratio);
    }
    // Inter type scale sections present.
    expect(html).toContain('Type scale');
    expect(html).toContain('Inter');
    // Glassy card + pill button family rendered.
    expect(html).toContain('Primary pill');
    expect(html).toContain('Ghost pill');
    expect(html).toContain('btn--circle');
    expect(html).toContain('Disabled');
    // Ticket-stub CTA rendered with real status text.
    expect(html).toContain('ticket-stub');
    expect(html).toContain('On request');
    // Facts strip + media frame.
    expect(html).toContain('facts-strip');
    expect(html).toContain('media-frame');
  });
});
