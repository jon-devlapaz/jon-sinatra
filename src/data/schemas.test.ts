import { describe, expect, it } from 'vitest';
import { repertoireEntrySchema, testimonialSchema } from './schemas';

describe('repertoireEntrySchema', () => {
  it('accepts a valid entry', () => {
    const entry = repertoireEntrySchema.parse({ title: 'Fly Me to the Moon', era: '1960s' });
    expect(entry).toEqual({ title: 'Fly Me to the Moon', era: '1960s' });
  });

  it('accepts optional notes and duration', () => {
    const entry = repertoireEntrySchema.parse({
      title: 'My Way',
      era: '1960s',
      notes: 'signature closer',
      duration: '3:02',
    });
    expect(entry.duration).toBe('3:02');
  });

  it('rejects a missing title', () => {
    expect(() => repertoireEntrySchema.parse({ era: '1960s' })).toThrow();
  });

  it('rejects a blank title', () => {
    expect(() => repertoireEntrySchema.parse({ title: '', era: '1960s' })).toThrow();
  });
});

describe('testimonialSchema', () => {
  it('accepts a valid testimonial', () => {
    const entry = testimonialSchema.parse({ quote: 'The room went silent.', name: 'A. Patron' });
    expect(entry.name).toBe('A. Patron');
  });

  it('accepts optional venue and event type', () => {
    const entry = testimonialSchema.parse({
      quote: 'Unforgettable.',
      name: 'B. Patron',
      venue: 'The Lake House',
      eventType: 'Gala',
    });
    expect(entry.eventType).toBe('Gala');
  });

  it('rejects a missing name', () => {
    expect(() => testimonialSchema.parse({ quote: 'Silence.' })).toThrow();
  });

  it('rejects a blank quote', () => {
    expect(() => testimonialSchema.parse({ quote: '', name: 'C. Patron' })).toThrow();
  });
});
