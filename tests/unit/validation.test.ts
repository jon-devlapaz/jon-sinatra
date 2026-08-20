/**
 * F08 — booking validation + mailto handoff helpers.
 */
import { describe, expect, it } from 'vitest';
import {
  buildMailtoUrl,
  isValidBooking,
  validateBooking,
  type BookingValues,
} from '../../src/lib/validation';

const valid: BookingValues = {
  name: 'Avery Booker',
  email: 'avery@example.com',
  date: '2026-12-20',
  package: 'The Standard',
  message: 'A gala of 120 in the main ballroom.',
};

describe('validateBooking', () => {
  it('accepts a well-formed enquiry', () => {
    expect(validateBooking(valid)).toEqual({});
    expect(isValidBooking(valid)).toBe(true);
  });

  it('requires a name', () => {
    expect(validateBooking({ ...valid, name: '   ' }).name).toBeTruthy();
  });

  it('requires an email and rejects malformed ones', () => {
    expect(validateBooking({ ...valid, email: '' }).email).toBeTruthy();
    expect(validateBooking({ ...valid, email: 'nope' }).email).toBeTruthy();
    expect(validateBooking({ ...valid, email: 'a@b' }).email).toBeTruthy();
  });

  it('requires a clear ISO date', () => {
    expect(validateBooking({ ...valid, date: '' }).date).toBeTruthy();
    expect(validateBooking({ ...valid, date: 'sometime in spring' }).date).toBeTruthy();
  });

  it('flags an over-long message only', () => {
    expect(validateBooking({ ...valid, message: 'x'.repeat(1001) }).message).toBeTruthy();
    expect(validateBooking({ ...valid, message: 'x'.repeat(1000) }).message).toBeUndefined();
  });

  it('is invalid when any field fails', () => {
    expect(isValidBooking({ ...valid, email: 'bad' })).toBe(false);
  });
});

describe('buildMailtoUrl', () => {
  it('composes subject and body carrying every field', () => {
    const url = buildMailtoUrl('bookings@example.com', valid);
    expect(url.startsWith('mailto:bookings@example.com?')).toBe(true);
    expect(decodeURIComponent(url)).toContain('Name: Avery Booker');
    expect(decodeURIComponent(url)).toContain('Event date: 2026-12-20');
    expect(decodeURIComponent(url)).toContain('Package: The Standard');
  });

  it('uses "Your date" when no package is chosen', () => {
    const url = buildMailtoUrl('bookings@example.com', { ...valid, package: '' });
    expect(decodeURIComponent(url)).toContain('subject=Booking inquiry — Your date');
  });
});
