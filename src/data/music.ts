/**
 * Music — a small placeholder setlist until Jon's recordings land.
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  note: string;
  src?: string;
}

export const tracks: Track[] = [
  {
    id: 'fly-me-to-the-moon',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    note: 'A bright, familiar opener for cocktails and arrivals.',
    src: '/audio/sample.mp3',
  },
  {
    id: 'thats-amore',
    title: "That's Amore",
    artist: 'Dean Martin',
    note: 'Warm Italian charm for a room ready to loosen up.',
  },
  {
    id: 'the-way-you-look-tonight',
    title: 'The Way You Look Tonight',
    artist: 'Frank Sinatra',
    note: 'A timeless first-dance or dinner-hour standard.',
  },
  {
    id: 'my-way',
    title: 'My Way',
    artist: 'Frank Sinatra',
    note: 'A confident closing number with a little more weight.',
  },
];
