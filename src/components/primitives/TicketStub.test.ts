import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import TicketStub from './TicketStub.astro';

const stubProps = {
  href: '#booking',
  label: 'Book the show',
  eyebrow: 'Cocktail Hour',
  title: 'Two-hour lounge set',
  stubValue: '$1,200',
  status: 'On request',
};

describe('TicketStub CTA primitive (C5)', () => {
  it('renders a real labelled anchor, status text, stub value and hidden barcode', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TicketStub, { props: stubProps });
    // C5: real <a> under the costume, labelled for assistive tech.
    expect(html).toContain('class="btn ticket-stub__cta"');
    expect(html).toContain('href="#booking"');
    expect(html).toContain('aria-label="Book the show: Two-hour lounge set"');
    expect(html).toContain('>Book the show</span>');
    // C5: eyebrow + headline + real status text (not a visual-only stamp).
    expect(html).toContain('class="eyebrow"');
    expect(html).toContain('Cocktail Hour');
    expect(html).toContain('class="ticket-stub__title"');
    expect(html).toContain('Two-hour lounge set');
    expect(html).toContain('class="ticket-stub__status" role="status"');
    expect(html).toContain('On request');
    // C5: mono stub value + decorative barcode hidden from assistive tech.
    expect(html).toContain('class="ticket-stub__value"');
    expect(html).toContain('$1,200');
    expect(html).toContain('class="ticket-stub__barcode" aria-hidden="true"');
    expect(html).toContain('class="ticket-stub__tear" aria-hidden="true"');
  });

  it('omits eyebrow and status when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TicketStub, {
      props: { href: '#pkg', label: 'Enquire', title: 'Gala evening', stubValue: 'GALA' },
    });
    expect(html).not.toContain('eyebrow');
    expect(html).not.toContain('ticket-stub__status');
    expect(html).toContain('class="btn ticket-stub__cta"');
    expect(html).toContain('href="#pkg"');
    expect(html).toContain('aria-label="Enquire: Gala evening"');
    expect(html).toContain('GALA');
  });
});
