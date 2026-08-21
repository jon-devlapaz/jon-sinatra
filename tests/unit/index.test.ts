import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import IndexPage from '../../src/pages/index.astro';

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

describe('index page (single-page profile)', () => {
  it('renders the full hero→about→music→booking-form-shell→footer flow', async () => {
    const container = await AstroContainer.create();
    container.addServerRenderer({ renderer: reactRenderer });
    const html = await container.renderToString(IndexPage);

    expect(html).toContain('id="hero"');
    expect(html).toContain('Jon Delapaz');
    expect(html).toContain('Songs with a little swing');
    expect(html).toContain('Talk about your event');

    expect(html).toContain('id="about"');
    expect(html).toContain('I love singing for');
    expect(html).toContain('a room');
    expect(html).toContain('INQUIRE ABOUT YOUR DATE');

    expect(html).toContain('id="music"');
    expect(html).toContain('Songs people know and love');
    expect(html).toContain('Fly Me to the Moon');
    expect(html).toContain("That's Amore");
    expect(html).toContain('The Way You Look Tonight');
    expect(html).toContain('<audio');
    expect(html).toContain('controls');

    expect(html).toContain('id="booking-form-shell"');
    expect(html).toContain(
      'component-url="/Users/jondev/dev/sandbox/jon-sinatra/src/components/booking/BookingForm',
    );

    expect(html).toContain('ALL RIGHTS RESERVED');
    expect(html).toContain('PRIVACY');
    expect(html).toContain('TERMS');
    expect(html).toContain('PRESS');
    expect(html).toContain('CONTACT');
  });

  it('emits I01 head metadata: canonical, OG/Twitter, favicon, description', async () => {
    const container = await AstroContainer.create();
    container.addServerRenderer({ renderer: reactRenderer });
    const html = await container.renderToString(IndexPage);

    expect(html).toContain('<link rel="canonical" href="https://jonsinatra.example/">');
    expect(html).toContain('<meta property="og:type" content="website">');
    expect(html).toContain('<meta property="og:title" content="Jon Delapaz — Lounge Singer &#38; Performer">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');

    expect(html).toContain('<title>Jon Delapaz — Lounge Singer &amp; Performer</title>');
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expect(html).toContain(
      '<meta name="description" content="Frank Sinatra tribute performances for weddings, galas, and private evenings. Expect the swing, warmth, and effortless charm of a classic supper club, shaped around your room and your guests."',
    );
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
  });
});