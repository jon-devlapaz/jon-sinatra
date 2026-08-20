/**
 * F06 — testimonials: the collection renders verbatim and the designed empty
 * state shows when the collection is empty.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { getCollection } from 'astro:content';
import Testimonials from '../../src/components/sections/Testimonials.astro';

beforeEach(() => {
  vi.mocked(getCollection).mockReset();
});

describe('Testimonials (F06)', () => {
  it('renders the designed empty state when the collection is empty', async () => {
    vi.mocked(getCollection).mockResolvedValue([]);
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials);
    expect(html).toContain('id="word"');
    expect(html).toContain('No quotes yet');
  });

  it('renders every quote verbatim with attribution when the collection has entries', async () => {
    vi.mocked(getCollection).mockResolvedValue([
      {
        id: 'lake-house',
        collection: 'testimonials',
        data: {
          quote: 'A real client said this after the last note.',
          name: 'J. Alvarez',
          venue: 'The Rosedale',
          eventType: 'Wedding',
        },
      },
    ] as never);
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials);
    expect(html).toContain('A real client said this after the last note.');
    expect(html).toContain('J. Alvarez');
    expect(html).toContain('The Rosedale');
    expect(html).toContain('Wedding');
  });
});
