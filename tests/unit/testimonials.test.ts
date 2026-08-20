/**
 * F06 — testimonials: the collection renders verbatim and the designed empty
 * state shows when the collection is empty.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => []),
}));

import Testimonials from '../../src/components/sections/Testimonials.astro';

afterEach(() => {
  vi.clearAllMocks();
});

describe('Testimonials (F06)', () => {
  it('renders the designed empty state when the collection is empty', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials);
    expect(html).toContain('id="word"');
    expect(html).toContain('No quotes yet — the mic is listening.');
  });
});
