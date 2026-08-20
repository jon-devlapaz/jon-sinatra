/**
 * F08 — submission adapter (roadmap F08 requiresDetailedPlan default):
 * endpoint-agnostic fetch POST to a configurable FORM_ENDPOINT, falling back
 * to a mailto: handoff when no endpoint is configured. No fabricated URL.
 */
import { buildMailtoUrl, type BookingValues } from './validation';

export type SubmitResult = { status: 'ok' } | { status: 'handoff'; url: string };

export interface SubmitOptions {
  /** Configurable form endpoint (e.g. Formspree/Formtorch). Omit to hand off. */
  endpoint?: string;
  /** Recipient for the mailto: handoff fallback. */
  mailto: string;
}

/** POST the booking to the configured endpoint; throw on a failed response. */
async function postToEndpoint(endpoint: string, values: BookingValues): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      date: values.date,
      package: values.package,
      message: values.message,
      _subject: `Booking inquiry — ${values.package || 'Your date'}`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Booking endpoint responded ${response.status}`);
  }
}

export async function submitBooking(
  values: BookingValues,
  options: SubmitOptions,
): Promise<SubmitResult> {
  if (options.endpoint) {
    await postToEndpoint(options.endpoint, values);
    return { status: 'ok' };
  }
  return { status: 'handoff', url: buildMailtoUrl(options.mailto, values) };
}
