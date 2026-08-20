import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { repertoireEntrySchema, testimonialSchema } from './data/schemas';

const repertoire = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/repertoire' }),
  schema: repertoireEntrySchema,
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/testimonials' }),
  schema: testimonialSchema,
});

export const collections = { repertoire, testimonials };
