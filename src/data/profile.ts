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
  /** "In his own words" pull quote (F02). */
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
  name: 'Jon Sinatra',
  tagline: 'Lounge singer &amp; keeper of the great American songbook',
  marqueeSubtitle: 'Now appearing — lounge &amp; supper club',
  bio: 'Jon Sinatra channels the intimacy of the Rat Pack era with a voice cut for cedar-panelled rooms, low lights, and a single spotlight. He performs classic standards, swinging mid-tempo numbers, and late-night ballads — arranged for small combo or small orchestra. Available for supper clubs, private galas, corporate gatherings, and intimate in-house concerts.',
  quote: 'The best sets are the ones where you can hear a pin drop between the notes.',
  portraitAlt: 'Jon Sinatra in a tuxedo, microphone at waist',
  portraitLabel: 'Portrait — Jon Sinatra',
  facts: [
    { dt: 'Range', dd: 'Baritone, two octaves' },
    { dt: 'Venue', dd: 'Supper clubs, galas, in-house concerts' },
    { dt: 'Bookings', dd: 'Open — tell me your date' },
  ],
  packages: [
    {
      id: 'cocktail',
      eyebrow: 'Cocktail Hour',
      title: 'Intimate lounge set',
      blurb:
        'A 45-minute trio set of standards — perfect for arrivals, cocktails, or a quiet corner table.',
      stubValue: '$1,200',
      status: 'On request',
      ctaHref: '#booking?package=cocktail',
    },
    {
      id: 'standard',
      eyebrow: 'The Standard',
      title: 'Full two-hour show',
      blurb:
        'A full programme of swing, bossa nova and ballads, with interval — the signature evening.',
      stubValue: '$3,200',
      status: 'Most requested',
      ctaHref: '#booking?package=standard',
    },
    {
      id: 'gala',
      eyebrow: 'Gala',
      title: 'Orchestra night',
      blurb:
        'A twelve-piece set list for larger rooms and headliner billing, including a signature closing number.',
      stubValue: '$ — on request',
      status: 'On request',
      ctaHref: '#booking?package=gala',
    },
  ],
  gallery: [
    { alt: 'Jon Sinatra at the mic, low-lit', label: 'On stage' },
    { alt: 'Trio in a supper club, warm lamplight', label: 'Supper club' },
    { alt: 'Headshot, black and white, tuxedo', label: 'Headshot' },
    { alt: 'Piano and upright bass, late night', label: 'The rhythm section' },
  ],
  blockedDates: [
    '2026-09-12',
    '2026-09-26',
    '2026-10-03',
    '2026-10-17',
    '2026-11-07',
    '2026-11-21',
  ],
  contact: { email: 'bookings@example.com', phone: '+1 (212) 555 0199' },
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/example' },
    { label: 'YouTube', href: 'https://youtube.com/example' },
  ],
};
