/**
 * LG2 — profile content model (static, zero-JS).
 * The single source of truth consumed by F01–F09 sections.
 * Portrait/gallery assets are not provided in this scaffold: each media surface
 * renders a themed placeholder frame (media-frame) so the profile is shippable
 * and zero-dependency until real assets are dropped in.
 */

export interface Fact {
  dt: string;
  dd: string;
}

export interface Package {
  id: string;
  eyebrow: string;
  title: string;
  blurb: string;
  stubValue: string;
  status: string;
  /** Anchors the package CTA into the booking form. */
  ctaHref: string;
}

export interface GalleryItem {
  alt: string;
  /** Placeholder label rendered in the media-frame until a real img src lands. */
  label: string;
}

export interface Social {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  tagline: string;
  marqueeSubtitle: string;
  /** Short third-person bio (F02). */
  bio: string;
  /** Pull quote — the site's voice, not a client testimonial (F02). */
  quote: string;
  portraitAlt: string;
  portraitLabel: string;
  facts: Fact[];
  packages: Package[];
  /** Evening gallery placeholders (F05). */
  gallery: GalleryItem[];
  /** ISO dates already booked — struck through on the F07 calendar (LG3). */
  blockedDates: string[];
  contact: { email: string; phone: string };
  socials: Social[];
}

export const profile: Profile = {
  name: 'Jon Delapaz',
  tagline: 'Classic oldies crooner — Sinatra-style',
  marqueeSubtitle: 'Now appearing — weddings, bar mitzvahs & late-night bars',
  bio: 'Jon Delapaz sings the classic oldies — the songs of Sinatra, Martin, Bennett, and the songbook that made them timeless. From a quiet first-dance ballad to a swing number the whole room knows by heart, his voice suits weddings, bar mitzvahs, engagement parties, and long nights in bars and clubs. Available solo for the evening, or with a band hired to fit the room.',
  quote: "The classic songs aren't old — they're waiting for the right room.",
  portraitAlt: 'Jon Delapaz — classic oldies crooner',
  portraitLabel: 'Portrait — Jon Delapaz',
  facts: [
    { dt: 'Range', dd: 'Baritone' },
    { dt: 'Venue', dd: 'Weddings, bar mitzvahs, bars & clubs' },
    { dt: 'Bookings', dd: 'Open — tell me your date' },
  ],
  packages: [
    {
      id: 'cocktail',
      eyebrow: 'Cocktail Hour',
      title: 'Intimate lounge set',
      blurb:
        'A 45-minute set of classic oldies and standards — perfect for arrivals, cocktails, or a quiet corner table.',
      stubValue: 'Enquire',
      status: 'On request',
      ctaHref: '#booking?package=cocktail',
    },
    {
      id: 'standard',
      eyebrow: 'The Standard',
      title: 'The full evening',
      blurb:
        'Two sets with an interval — first-dance ballads, swing numbers, and everything in between. The signature evening.',
      stubValue: 'Enquire',
      status: 'Most requested',
      ctaHref: '#booking?package=standard',
    },
    {
      id: 'gala',
      eyebrow: 'Gala',
      title: 'Ceremony & celebration',
      blurb:
        'A tailored programme for weddings and bar mitzvahs — the ceremony song, the first dance, and a reception set the room will sing along to.',
      stubValue: 'Enquire',
      status: 'On request',
      ctaHref: '#booking?package=gala',
    },
  ],
  gallery: [
    { alt: 'Audio sample — coming soon', label: 'Audio' },
    { alt: 'Video sample — coming soon', label: 'Video' },
    { alt: 'Stage photos — coming soon', label: 'Photos' },
    { alt: 'Live set — coming soon', label: 'Live' },
  ],
  blockedDates: [],
  contact: { email: 'jonathan10620@gmail.com', phone: '+1 (830) 237-3964' },
  socials: [],
};
