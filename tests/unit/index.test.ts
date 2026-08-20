import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import IndexPage from '../../src/pages/index.astro';

/**
 * Minimal AstroContainer renderer for React islands. Astro's official
 * `getContainerRenderer()` defers to `@astrojs/react/server.js`, which imports
 * the build-time-only `astro:react:opts` virtual module and can't load inside
 * Vitest's Node ESM loader. This uses react-dom/server directly — the same
 * rendering engine — so the container can SSR CalendarWidget/BookingForm and
 * the page's component code is exercised under coverage.
 */
const reactRenderer = {
  name: '@astrojs/react',
  supportsAstroStaticSlot: true,
  check: async (Component: unknown) => typeof Component === 'function',
  renderToStaticMarkup: async (
    Component: React.ComponentType<Record<string, unknown>>,
    props: Record<string, unknown>,
    slotted: Record<string, string>,
  ) => ({
    html: renderToStaticMarkup(React.createElement(Component, props, slotted.default ?? null)),
  }),
  renderToString: async (
    Component: React.ComponentType<Record<string, unknown>>,
    props: Record<string, unknown>,
    slotted: Record<string, string>,
  ) => ({
    html: renderToString(React.createElement(Component, props, slotted.default ?? null)),
  }),
};

/**
 * LG2/LG3 acceptance: the single-page profile renders every section
 * (F01–F09) server-side, data-driven from the content collections, with the
 * F07/F08 React islands SSR'd on top of their shells.
 */
describe('index page (single-page profile)', () => {
  it('renders the full marquee→voice→repertoire→show→stage→word→calendar→booking→encore flow', async () => {
    const container = await AstroContainer.create();
    container.addServerRenderer({ renderer: reactRenderer });
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

    // F07 — calendar island mounted on its shell (internals covered by
    // calendar-widget.test.tsx via jsdom; container emits the island wrapper).
    expect(html).toContain('id="calendar"');
    expect(html).toContain('astro-island');
    expect(html).toContain(
      'component-url="/Users/jondev/dev/sandbox/jon-sinatra/src/components/calendar/CalendarWidget',
    );

    // F08 — booking island mounted on its shell (internals covered by
    // booking-form.test.tsx via jsdom).
    expect(html).toContain('id="booking"');
    expect(html).toContain(
      'component-url="/Users/jondev/dev/sandbox/jon-sinatra/src/components/booking/BookingForm',
    );

    // F09 — encore footer.
    expect(html).toContain('id="encore"');
    expect(html).toContain('tel:');
  });
});
