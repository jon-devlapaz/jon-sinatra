import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import IndexPage from '../../src/pages/index.astro';

/**
 * LG2 acceptance: the single-page profile renders every section
 * (F01–F09) server-side, data-driven from the content collections.
 */
describe('index page (LG2 single-page profile)', () => {
  it('renders the full marquee→voice→repertoire→show→stage→word→calendar→booking→encore flow', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IndexPage);

    // F01 — marquee headline + primary booking CTA.
    expect(html).toContain('id="marquee"');
    expect(html).toContain('>Jon Sinatra<');
    expect(html).toContain('href="#booking?package=standard"');

    // F02 — voice fact strip + quote.
    expect(html).toContain('id="voice"');
    expect(html).toContain('Range');
    expect(html).toContain('Baritone, two octaves');
    expect(html).toContain('Open — tell me your date');
    expect(html).toContain('The best sets are the ones where you can hear a pin drop');

    // F03 — repertory driven from the collection.
    expect(html).toContain('id="repertoire"');
    expect(html).toContain('Fly Me to the Moon');
    expect(html).toContain('1960s');

    // F04 — package tiers with prefilled CTAs.
    expect(html).toContain('id="show"');
    expect(html).toContain('href="#booking?package=cocktail"');
    expect(html).toContain('href="#booking?package=gala"');

    // F05 — gallery frames.
    expect(html).toContain('id="stage"');

    // F06 — testimonial collection.
    expect(html).toContain('id="word"');
    expect(html).toContain('The room went silent the moment he opened his mouth');

    // F07 — calendar shell.
    expect(html).toContain('id="calendar"');

    // F08 — booking shell with a real no-JS form.
    expect(html).toContain('id="booking"');
    expect(html).toContain('data-testid="booking-form"');
    expect(html).toContain('name="email"');
    expect(html).toContain('action="mailto:');

    // F09 — encore footer.
    expect(html).toContain('id="encore"');
    expect(html).toContain('tel:');
  });
});
