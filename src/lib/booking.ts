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
  /** Google Forms action and entry IDs. */
  googleForm?: GoogleFormConfig;
  /** Recipient for the mailto: handoff fallback. */
  mailto: string;
}

export interface GoogleFormConfig {
  action: string;
  fields: {
    name: string;
    email: string;
    date: string;
    package: string;
    message: string;
  };
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

async function postToGoogleForm(config: GoogleFormConfig, values: BookingValues): Promise<void> {
  const body = new URLSearchParams({
    [`entry.${config.fields.name}`]: values.name,
    [`entry.${config.fields.email}`]: values.email,
    [`entry.${config.fields.date}`]: values.date,
    [`entry.${config.fields.package}`]: values.package,
    [`entry.${config.fields.message}`]: values.message,
  });

  await fetch(config.action.replace('/viewform', '/formResponse'), {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function submitBooking(
  values: BookingValues,
  options: SubmitOptions,
): Promise<SubmitResult> {
  if (options.googleForm) {
    await postToGoogleForm(options.googleForm, values);
    return { status: 'ok' };
  }
  if (options.endpoint) {
    await postToEndpoint(options.endpoint, values);
    return { status: 'ok' };
  }
  return { status: 'handoff', url: buildMailtoUrl(options.mailto, values) };
}
