import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FilmGrain from './FilmGrain.astro';

describe('FilmGrain overlay (C3)', () => {
  it('renders a composable, empty overlay hidden from assistive tech', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FilmGrain);
    expect(html).toContain('class="film-grain"');
    expect(html).toContain('aria-hidden="true"');
    // C3: the overlay element is empty (only dev-only source attributes).
    const el = html.match(/<div class="film-grain"[^>]*>(.*?)<\/div>/);
    expect(el).not.toBeNull();
    expect(el![1].trim()).toBe('');
  });

  it('accepts a static freeze flag and merges an extra class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FilmGrain, {
      props: { class: 'extra-grain', static: true },
    });
    expect(html).toContain('film-grain film-grain--static extra-grain');
    expect(html).toContain('aria-hidden="true"');
  });

  it('keeps the default (animated) variant when only a class is passed', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FilmGrain, { props: { class: 'x' } });
    expect(html).toContain('film-grain x');
    expect(html).not.toContain('film-grain--static');
  });
});
