import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import StyleGuide from '../../src/pages/style-guide.astro';

describe('style-guide page (Aurelian Gallery design system)', () => {
  it('renders every token, type scale, primitives, and elevation guidance', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StyleGuide);

    // Material 3 color tokens shown with their role.
    for (const name of [
      'surface',
      'on-surface',
      'on-surface-variant',
      'primary',
      'primary-container',
      'outline',
      'outline-variant',
    ]) {
      expect(html).toContain(`--color-${name}`);
    }

    // Measured contrast table renders the claimed pairs.
    for (const pair of [
      'on-surface / surface',
      'primary / surface',
      'on-surface-variant / surface',
      'primary-container / surface',
    ]) {
      expect(html).toContain(pair);
    }
    for (const ratio of ['13.38:1', '7.23:1', '6.58:1', '5.15:1']) {
      expect(html).toContain(ratio);
    }

    // Typography font families present.
    expect(html).toContain('Bodoni Moda');
    expect(html).toContain('DM Sans');

    // Type scale tokens.
    for (const token of [
      'display-lg',
      'display-lg-mobile',
      'headline-md',
      'subheading-caps',
      'body-lg',
      'body-md',
      'label-sm',
    ]) {
      expect(html).toContain(token);
    }

    // Spacing tokens.
    for (const token of ['unit', 'gutter', 'margin-desktop', 'margin-mobile', 'section-gap', 'container-max']) {
      expect(html).toContain(token);
    }

    // Primitive components demonstrated.
    expect(html).toContain('glass-header');
    expect(html).toContain('framed-image');
    expect(html).toContain('gallery-img');
    expect(html).toContain('underline-input');
    expect(html).toContain('card-white');
    expect(html).toContain('btn-primary');
    expect(html).toContain('btn-ghost');
    expect(html).toContain('btn-underline');

    // Elevation guidance.
    expect(html).toContain('Glass header');
    expect(html).toContain('Marble surface');
    expect(html).toContain('White card');
  });
});