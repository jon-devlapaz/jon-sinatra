/**
 * F05 — gallery media frame: both the asset path (real <img>) and the
 * placeholder path (no asset) must render without layout shift.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Gallery from '../../src/components/sections/Gallery.astro';
import { profile, type GalleryItem, type Profile } from '../../src/data/profile';

async function renderGallery(customProfile: Profile): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Gallery, { props: { profile: customProfile } });
}

describe('Gallery (F05)', () => {
  it('renders the themed placeholder when no asset is present', async () => {
    const html = await renderGallery(profile);
    expect(html).toContain('media-frame');
    expect(html).not.toContain('<img');
  });

  it('renders a real <img> with alt when an asset src is provided', async () => {
    const base: GalleryItem = { alt: 'Headshot, black and white', label: 'Headshot' };
    const item = { ...base, src: '/images/headshot.jpg' };
    const withAsset: Profile = {
      ...profile,
      gallery: [item],
    };
    const html = await renderGallery(withAsset);
    expect(html).toContain('<img');
    expect(html).toContain('src="/images/headshot.jpg"');
    expect(html).toContain('alt="Headshot, black and white"');
  });
});
