// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical site origin. `.example` is RFC 2606 reserved — a deploy-ready
// placeholder that can never be a real domain; override with PUBLIC_SITE_URL.
const site = process.env.PUBLIC_SITE_URL || 'https://jonsinatra.example';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site,
  // Pin the deploy base so subpath hosts never break hashed asset URLs.
  base: '/',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: { port: 4321 },
  preview: { port: 4321 },
});
