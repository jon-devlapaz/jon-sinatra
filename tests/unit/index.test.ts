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
 * rendering engine — so the container can SSR the BookingForm island and
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
 * (marquee → about → music → booking → contact) server-side, data-driven,
 * with the F08 booking island SSR'd on top of its shell.
 */
describe('index page (single-page profile)', () => {
  it('renders the full marquee→about→music→booking→contact flow', async () => {
    const container = await AstroContainer.create();
    container.addServerRenderer({ renderer: reactRenderer });
    const html = await container.renderToString(IndexPage);

    // Marquee headline + primary booking CTA.
    expect(html).toContain('id="marquee"');
    expect(html).toContain('>Jon Delapaz<');
    expect(html).toContain('href="#booking?package=standard"');

    // About — fact strip + quote.
    expect(html).toContain('id="about"');
    expect(html).toContain('Range');
    expect(html).toContain('Baritone');
    expect(html).toContain('Open — tell me your date');
    expect(html).toContain('waiting for the right room');

    // Music — honest empty state until Jon's MP3s land.
    expect(html).toContain('id="music"');
    expect(html).toContain('No recordings yet');

    // Booking — island mounted on its shell (internals covered by
    // booking-form.test.tsx via jsdom).
    expect(html).toContain('id="booking"');
    expect(html).toContain(
      'component-url="/Users/jondev/dev/sandbox/jon-sinatra/src/components/booking/BookingForm',
    );

    // Contact — footer recap with a real tel: link.
    expect(html).toContain('id="contact"');
    expect(html).toContain('tel:');
  });

  it('emits I01 head metadata: canonical, OG/Twitter, favicon, description', async () => {
    const container = await AstroContainer.create();
    container.addServerRenderer({ renderer: reactRenderer });
    const html = await container.renderToString(IndexPage);

    // Canonical is absolute and driven by the configured site origin.
    expect(html).toContain('<link rel="canonical" href="https://jonsinatra.example/">');

    // Open Graph + Twitter cards, with an absolute OG image.
    expect(html).toContain('<meta property="og:type" content="website">');
    expect(html).toContain(
      '<meta property="og:title" content="Jon Delapaz — Classic Oldies Crooner">',
    );
    expect(html).toContain(
      '<meta property="og:image" content="https://jonsinatra.example/og.jpg">',
    );
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain(
      '<meta name="twitter:image" content="https://jonsinatra.example/og.jpg">',
    );

    // SEO essentials.
    expect(html).toContain('<title>Jon Delapaz — Classic Oldies Crooner</title>');
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expect(html).toContain(
      '<meta name="description" content="Classic oldies crooner — Sinatra-style">',
    );
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
  });
});
