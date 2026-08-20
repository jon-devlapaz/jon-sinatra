/// <reference types="astro/client" />

/**
 * Ambient declaration so `tsc --noEmit` (part of `npm run check`) resolves
 * `.astro` component imports in `.ts` test files — same contract `astro check`
 * and Astro Container use. Type imported from Astro's shipped runtime surface.
 */
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/dist/runtime/server/index.js';
  const AstroComponent: AstroComponentFactory;
  export default AstroComponent;
  export const prerender: boolean;
}
