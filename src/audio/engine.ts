import { Howl, Howler } from 'howler';

type Track = 'day' | 'night';

const SFX_NAMES = [
  'tap',
  'collect',
  'place',
  'buy',
  'cook',
  'harvest',
  'door',
  'meow',
  'purr',
  'bark',
  'chirp',
  'splash',
  'camera',
  'error',
  'levelup',
  'page',
] as const;

export type SfxName = (typeof SFX_NAMES)[number];

// Keep the tuple at runtime for future playlist/debug tooling.
void SFX_NAMES;

const sfxCache = new Map<SfxName, Howl>();
const musicCache = new Map<Track, Howl>();

let sfxVolume = 0.6;
let musicVolume = 0.35;
let currentTrack: Track | null = null;

function sfx(name: SfxName): Howl | null {
  if (typeof window === 'undefined') return null;
  let sound = sfxCache.get(name);
  if (!sound) {
    sound = new Howl({ src: [`/audio/${name}.wav`], volume: sfxVolume, preload: true });
    sfxCache.set(name, sound);
  }
  return sound;
}

export function playSfx(name: SfxName): void {
  try {
    const sound = sfx(name);
    if (!sound) return;
    sound.volume(sfxVolume);
    sound.play();
  } catch {
    /* audio is a nice-to-have */
  }
}

export function setSfxVolume(value: number): void {
  sfxVolume = Math.max(0, Math.min(1, value));
  sfxCache.forEach((sound) => sound.volume(sfxVolume));
}

export function setMusicVolume(value: number): void {
  musicVolume = Math.max(0, Math.min(1, value));
  musicCache.forEach((sound) => sound.volume(musicVolume));
}

export function playMusic(track: Track): void {
  if (typeof window === 'undefined') return;
  if (currentTrack === track) {
    musicCache.get(track)?.volume(musicVolume);
    return;
  }
  const previous = currentTrack ? musicCache.get(currentTrack) : null;
  if (previous) {
    previous.fade(previous.volume() as number, 0, 700);
    setTimeout(() => previous.pause(), 760);
  }
  let sound = musicCache.get(track);
  if (!sound) {
    sound = new Howl({ src: [`/audio/${track}.wav`], loop: true, volume: 0, preload: true });
    musicCache.set(track, sound);
  }
  currentTrack = track;
  sound.play();
  sound.fade(0, musicVolume, 900);
}

export function stopMusic(): void {
  musicCache.forEach((sound) => sound.pause());
  currentTrack = null;
}

export function muteAll(muted: boolean): void {
  try {
    Howler.mute(muted);
  } catch {
    /* ignore */
  }
}

export function unlockAudio(): void {
  try {
    Howler.ctx?.resume?.();
  } catch {
    /* ignore */
  }
}
