/**
 * Generates original music loops and sound effects as WAV files.
 * No samples, no third-party audio: every note is synthesised here.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'audio');
mkdirSync(outDir, { recursive: true });

const RATE = 22050;

function wav(samples, name) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(join(outDir, name), Buffer.concat([header, data]));
  console.log('wrote', name, `${(data.length / 1024).toFixed(0)} KiB`);
}

const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
};

function env(t, dur, attack = 0.02, release = 0.3) {
  if (t < 0 || t > dur) return 0;
  const a = Math.min(1, t / attack);
  const r = t > dur - release ? Math.max(0, (dur - t) / release) : 1;
  return a * r;
}

function addNote(buf, start, dur, freq, gain, type = 'sine', vibrato = 0) {
  const from = Math.floor(start * RATE);
  const to = Math.min(buf.length, Math.floor((start + dur) * RATE));
  for (let i = from; i < to; i++) {
    const t = (i - from) / RATE;
    const phase = 2 * Math.PI * freq * t + (vibrato ? Math.sin(2 * Math.PI * 5.2 * t) * vibrato : 0);
    let wave;
    if (type === 'sine') wave = Math.sin(phase);
    else if (type === 'triangle') wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else if (type === 'pluck') wave = Math.sin(phase) * Math.exp(-2.4 * t) + 0.35 * Math.sin(phase * 2) * Math.exp(-4 * t);
    else wave = Math.sin(phase) + 0.3 * Math.sin(phase * 2);
    buf[i] += wave * gain * env(t, dur, 0.02, Math.min(0.4, dur * 0.6));
  }
}

function addNoise(buf, start, dur, gain, lowpass = 0.1) {
  const from = Math.floor(start * RATE);
  const to = Math.min(buf.length, Math.floor((start + dur) * RATE));
  let last = 0;
  for (let i = from; i < to; i++) {
    const t = (i - from) / RATE;
    last = last * (1 - lowpass) + (Math.random() * 2 - 1) * lowpass;
    buf[i] += last * gain * env(t, dur, 0.005, dur * 0.8);
  }
}

function music(name, chords, melody, seconds = 12, tempo = 0.5) {
  const buf = new Float32Array(seconds * RATE);
  const beats = seconds / tempo;
  for (let b = 0; b < beats; b++) {
    const chord = chords[Math.floor(b / 4) % chords.length];
    const t = b * tempo;
    // soft pad
    for (const f of chord) addNote(buf, t, tempo * 2.1, f / 2, 0.035, 'sine');
    // gentle pluck arpeggio
    const arp = chord[(b % 3) + 0];
    addNote(buf, t, tempo * 1.4, arp, 0.055, 'pluck');
    addNote(buf, t + tempo * 0.5, tempo * 0.9, arp * 1.5, 0.032, 'pluck');
    if (b % 2 === 0) addNote(buf, t + tempo * 1.5, tempo * 0.8, arp * 2, 0.02, 'sine');
  }
  melody.forEach(([start, freq, dur, gain]) => addNote(buf, start, dur, freq, gain, 'triangle', 0.004));
  // soft room echo
  const echo = new Float32Array(buf.length);
  const delay = Math.floor(0.28 * RATE);
  for (let i = delay; i < buf.length; i++) echo[i] = buf[i - delay] * 0.18;
  for (let i = 0; i < buf.length; i++) buf[i] = Math.max(-0.9, Math.min(0.9, buf[i] + echo[i]));
  // fade loop edges
  const fade = Math.floor(0.05 * RATE);
  for (let i = 0; i < fade; i++) {
    buf[i] *= i / fade;
    buf[buf.length - 1 - i] *= i / fade;
  }
  wav(buf, name);
}

const dayChords = [
  [N.C4, N.E4, N.G4],
  [N.A3, N.C4, N.E4],
  [N.F3, N.A3, N.C4],
  [N.G3, N.B3, N.D4],
];
music(
  'day.wav',
  dayChords,
  [
    [0.5, N.E5, 1.0, 0.05], [2.0, N.G5, 1.2, 0.04], [4.0, N.C5, 1.0, 0.05],
    [6.5, N.D5, 1.4, 0.04], [8.0, N.E5, 1.0, 0.045], [10.0, N.G5, 1.6, 0.035],
  ],
  12,
);

const nightChords = [
  [N.A3, N.C4, N.E4],
  [N.F3, N.A3, N.C4],
  [N.C4, N.E4, N.G4],
  [N.G3, N.B3, N.D4],
];
music(
  'night.wav',
  nightChords,
  [
    [1.0, N.A4, 1.6, 0.035], [3.0, N.E5, 1.8, 0.03], [5.5, N.C5, 1.4, 0.03],
    [8.0, N.B4, 1.6, 0.028], [10.0, N.A4, 1.8, 0.025],
  ],
  12,
);

function sfx(name, seconds, build) {
  const buf = new Float32Array(Math.ceil(seconds * RATE));
  build(buf);
  wav(buf, name);
}

sfx('tap.wav', 0.12, (b) => {
  addNote(b, 0, 0.09, 660, 0.2, 'pluck');
  addNoise(b, 0, 0.03, 0.05, 0.4);
});
sfx('collect.wav', 0.5, (b) => {
  addNote(b, 0, 0.18, N.E5, 0.18, 'sine');
  addNote(b, 0.08, 0.2, N.A5, 0.16, 'sine');
  addNote(b, 0.18, 0.3, N.C5, 0.1, 'triangle');
});
sfx('place.wav', 0.22, (b) => {
  addNote(b, 0, 0.16, 180, 0.3, 'sine');
  addNoise(b, 0, 0.08, 0.08, 0.2);
});
sfx('buy.wav', 0.55, (b) => {
  [N.C5, N.E5, N.G5, N.C5 * 2].forEach((f, i) => addNote(b, i * 0.07, 0.24, f, 0.12, 'triangle'));
});
sfx('cook.wav', 0.6, (b) => {
  addNoise(b, 0, 0.5, 0.06, 0.04);
  addNote(b, 0.05, 0.3, 220, 0.06, 'sine');
  addNote(b, 0.25, 0.3, 330, 0.05, 'sine');
});
sfx('harvest.wav', 0.35, (b) => {
  addNote(b, 0, 0.12, 523, 0.16, 'pluck');
  addNote(b, 0.08, 0.2, 784, 0.12, 'pluck');
});
sfx('door.wav', 0.6, (b) => {
  addNoise(b, 0, 0.35, 0.07, 0.03);
  addNote(b, 0.05, 0.4, 160, 0.12, 'triangle', 0.01);
});
sfx('meow.wav', 0.65, (b) => {
  const from = Math.floor(0.02 * RATE);
  const to = Math.floor(0.6 * RATE);
  for (let i = from; i < to; i++) {
    const t = (i - from) / RATE;
    const freq = 540 + 260 * Math.sin(Math.PI * Math.min(1, t / 0.5)) - 120 * t;
    b[i] += Math.sin(2 * Math.PI * freq * t) * 0.16 * env(t, 0.6, 0.05, 0.3);
  }
});
sfx('purr.wav', 0.9, (b) => {
  addNoise(b, 0, 0.85, 0.05, 0.03);
  for (let t = 0; t < 0.85; t += 0.09) addNote(b, t, 0.08, 70, 0.12, 'sine');
});
sfx('bark.wav', 0.3, (b) => {
  addNoise(b, 0, 0.16, 0.12, 0.15);
  addNote(b, 0, 0.18, 190, 0.22, 'triangle');
});
sfx('chirp.wav', 0.28, (b) => {
  addNote(b, 0, 0.1, 1400, 0.12, 'sine');
  addNote(b, 0.11, 0.12, 1800, 0.1, 'sine');
});
sfx('splash.wav', 0.4, (b) => {
  addNoise(b, 0, 0.35, 0.1, 0.12);
});
sfx('camera.wav', 0.4, (b) => {
  addNoise(b, 0, 0.05, 0.16, 0.5);
  addNoise(b, 0.12, 0.08, 0.1, 0.5);
  addNote(b, 0.12, 0.16, 900, 0.07, 'sine');
});
sfx('error.wav', 0.25, (b) => {
  addNote(b, 0, 0.2, 160, 0.12, 'triangle');
  addNote(b, 0.02, 0.18, 150, 0.1, 'triangle');
});
sfx('levelup.wav', 0.8, (b) => {
  [N.C5, N.E5, N.G5, N.C5 * 2, N.E5 * 2].forEach((f, i) => addNote(b, i * 0.09, 0.3, f, 0.1, 'triangle'));
});
sfx('page.wav', 0.18, (b) => {
  addNoise(b, 0, 0.12, 0.05, 0.2);
});
console.log('audio assets generated');
