/**
 * Aurelian Gallery — profile content model (static, zero-JS).
 * Single source of truth consumed by Hero, About, BookingBar, Footer.
 * Images use placeholder URLs until real assets are provided.
 */

export interface Package {
  id: string;
  eyebrow: string;
  title: string;
  blurb: string;
  stubValue: string;
  status: string;
  ctaHref: string;
}

export interface Profile {
  name: string;
  // Hero
  heroSubtitle: string;
  heroBody: string;
  heroImage: { src: string; alt: string };
  // Booking Bar (static shell; React island handles form)
  bookingBarEnabled: boolean;
  // About / Framed Gallery
  aboutEyebrow: string;
  aboutHeadline: { lead: string; accent: string };
  aboutBody: string[];
  aboutLink: { label: string; href: string };
  // Footer
  footerLinks: { label: string; href: string }[];
  // Contact
  contact: { email: string; phone: string };
  // Socials (kept for potential future use)
  socials: { label: string; href: string }[];
  // Packages (for BookingForm island)
  packages: Package[];
}

export const profile: Profile = {
  name: 'Jon Delapaz',

  // Hero
  heroSubtitle: 'Songs with a little swing',
  heroBody:
    'I sing the standards that make a room feel warmer: Sinatra, Dean Martin, and the great American songbook. For weddings, dinners, galas, and private evenings, I shape the set around the moment you want to create.',
  heroImage: {
    src: '/singshot.jpg',
    alt: 'Jon Delapaz — classic crooner in a minimalist art gallery, high-key lighting, brushed gold accents',
  },

  // Booking Bar
  bookingBarEnabled: true,

  // About / Framed Gallery
  aboutEyebrow: 'A little about me',
  aboutHeadline: {
    lead: 'I love singing for',
    accent: 'a room',
  },
  aboutBody: [
    'I have sung in bands and spent time working with jazz arrangements, but what I enjoy most is the connection between a singer, a song, and the people listening. The right performance should give a room a feeling without taking it over.',
    'My repertoire draws from Sinatra, Dean Martin, and other classic crooners: familiar songs, thoughtful arrangements, and enough flexibility to move from cocktails to dinner to a final number everyone knows.',
  ],
  aboutLink: { label: 'INQUIRE ABOUT YOUR DATE', href: '#booking-form-shell' },

  // Footer
  footerLinks: [
    { label: 'PRIVACY', href: '#privacy' },
    { label: 'TERMS', href: '#terms' },
    { label: 'PRESS', href: '#press' },
    { label: 'CONTACT', href: `mailto:jonathan10620@gmail.com` },
  ],

  // Contact
  contact: { email: 'jonathan10620@gmail.com', phone: '+1 (830) 237-3964' },

  // Socials
  socials: [],

  // Packages (for BookingForm island)
  packages: [
    {
      id: 'cocktail',
      eyebrow: 'Cocktail Hour',
      title: 'Cocktail hour set',
      blurb: 'A relaxed set of standards for arrivals, cocktails, dinner, or a smaller gathering.',
      stubValue: '$1,200',
      status: 'On request',
      ctaHref: '#booking?package=cocktail',
    },
    {
      id: 'standard',
      eyebrow: 'A full evening',
      title: 'Two hours of classics',
      blurb: 'A flexible evening of swing, ballads, and familiar favorites, shaped around your schedule.',
      stubValue: '$3,200',
      status: 'Let’s talk through it',
      ctaHref: '#booking?package=standard',
    },
    {
      id: 'gala',
      eyebrow: 'A bigger celebration',
      title: 'A larger band setup',
      blurb: 'For larger rooms and bigger celebrations, we can talk through the right musicians and arrangements.',
      stubValue: '$ — on request',
      status: 'On request',
      ctaHref: '#booking?package=gala',
    },
  ],
};