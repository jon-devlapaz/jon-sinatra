/**
 * F08 — booking form validation and mailto handoff helpers.
 * Pure, framework-free so Vitest can cover them without a DOM.
 */

export interface BookingValues {
  name: string;
  email: string;
  date: string; // 'yyyy-MM-dd'
  package: string; // resolved display label, may be ''
  message: string;
}

export interface BookingFieldErrors {
  name?: string;
  email?: string;
  date?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_MESSAGE_LENGTH = 1000;

/** Validate a booking submission; returns only the fields that failed. */
export function validateBooking(values: BookingValues): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Please add your name.';
  }
  const email = values.email.trim();
  if (!email) {
    errors.email = 'Please add an email so I can reply.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "That email doesn't look right — mind checking it?";
  }
  if (!values.date) {
    errors.date = 'Pick an event date.';
  } else if (!ISO_DATE_PATTERN.test(values.date)) {
    errors.date = 'Use the date picker for a clear date.';
  }
  if (values.message.trim().length > MAX_MESSAGE_LENGTH) {
    errors.message = `Keep the note under ${MAX_MESSAGE_LENGTH} characters.`;
  }
  return errors;
}

export function isValidBooking(values: BookingValues): boolean {
  return Object.keys(validateBooking(values)).length === 0;
}

/**
 * Build a mailto: URL carrying the booking fields — the zero-dependency
 * handoff path when no FORM_ENDPOINT is configured (evidence #9: fallback,
 * not primary).
 */
export function buildMailtoUrl(email: string, values: BookingValues): string {
  const subject = `Booking inquiry — ${values.package || 'Your date'}`;
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Event date: ${values.date}`,
    values.package ? `Package: ${values.package}` : null,
    `Message: ${values.message}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
