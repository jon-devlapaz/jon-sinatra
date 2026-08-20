import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import GatefoldCard from './GatefoldCard.astro';

describe('GatefoldCard primitive (C4/C6)', () => {
  it('renders a section with a title and slotted content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(GatefoldCard, {
      props: { title: 'Gatefold panel' },
      slots: { default: '<p>slotted body</p>' },
    });
    expect(html).toContain('class="gatefold"');
    expect(html).toContain('class="gatefold__title"');
    expect(html).toContain('Gatefold panel');
    expect(html).toContain('<p>slotted body</p>');
  });

  it('renders without a heading when no title is given and merges a class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(GatefoldCard, {
      props: { class: 'extra' },
      slots: { default: '<p>untitled body</p>' },
    });
    expect(html).toContain('class="gatefold extra"');
    expect(html).not.toContain('gatefold__title');
    expect(html).toContain('<p>untitled body</p>');
  });
});
