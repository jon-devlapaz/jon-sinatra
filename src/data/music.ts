/**
 * Music — tracks for the MP3 player.
 * Drop a recorded MP3 into public/audio/ and add one entry here:
 *   { id: 'fly-me-to-the-moon', title: 'Fly Me to the Moon (live)', src: '/audio/fly-me-to-the-moon.mp3' }
 * Empty until Jon's first recordings land.
 */
export interface Track {
  id: string;
  title: string;
  src: string;
}

export const tracks: Track[] = [];
