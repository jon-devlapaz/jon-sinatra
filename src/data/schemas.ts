import { z } from 'zod';

/**
 * B01 scaffold sample collection schemas (pure zod, unit-testable).
 * NOTE: F03 (repertoire) and F06 (testimonials) own the production schemas
 * and may extend or replace these in place.
 */

export const repertoireEntrySchema = z.object({
  title: z.string().min(1),
  era: z.string().min(1),
  notes: z.string().optional(),
  duration: z.string().optional(),
});

export const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  venue: z.string().optional(),
  eventType: z.string().optional(),
});

export type RepertoireEntry = z.infer<typeof repertoireEntrySchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
