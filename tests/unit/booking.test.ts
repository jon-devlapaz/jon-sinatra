/**
 * F08 — submission adapter: fetch POST to a configured endpoint, mailto
 * handoff when unset, and error propagation on a failed response.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitBooking, type SubmitOptions } from '../../src/lib/booking';
import type { BookingValues } from '../../src/lib/validation';

const valid: BookingValues = {
  name: 'Avery Booker',
  email: 'avery@example.com',
  date: '2026-12-20',
  package: 'The Standard',
  message: 'A gala of 120.',
};

const options: SubmitOptions = { mailto: 'bookings@example.com' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitBooking', () => {
  it('POSTs JSON to the configured endpoint and returns ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitBooking(valid, {
      ...options,
      endpoint: 'https://form.example/send',
    });

    expect(result).toEqual({ status: 'ok' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://form.example/send');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({
      name: 'Avery Booker',
      date: '2026-12-20',
      _subject: 'Booking inquiry — The Standard',
    });
  });

  it('POSTs mapped fields to Google Forms', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ type: 'opaque' });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitBooking(valid, {
      ...options,
      googleForm: {
        action: 'https://docs.google.com/forms/d/e/form-id/viewform',
        fields: {
          name: '111',
          email: '222',
          date: '333',
          package: '444',
          message: '555',
        },
      },
    });

    expect(result).toEqual({ status: 'ok' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://docs.google.com/forms/d/e/form-id/formResponse');
    expect(init.mode).toBe('no-cors');
    expect(String(init.body)).toContain('entry.111=Avery+Booker');
    expect(String(init.body)).toContain('entry.222=avery%40example.com');
    expect(String(init.body)).toContain('entry.333=2026-12-20');
  });

  it('throws when the endpoint responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(
      submitBooking(valid, { ...options, endpoint: 'https://form.example/send' }),
    ).rejects.toThrow(/500/);
  });

  it('falls back to a mailto handoff when no endpoint is configured', async () => {
    const result = await submitBooking(valid, options);
    expect(result.status).toBe('handoff');
    if (result.status === 'handoff') {
      expect(result.url.startsWith('mailto:bookings@example.com')).toBe(true);
    }
  });
});
