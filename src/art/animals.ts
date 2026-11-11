/** Original animal characters, drawn parametrically. Side view, bottom baseline. */

import { INK, c, el, line, p, r, svgDoc, type ArtResult } from './svg';

export type AnimalPose = 'idle' | 'walk' | 'sleep' | 'special';

export interface AnimalOptions {
  species: string;
  coat?: string;
  pose?: AnimalPose;
  accessory?: string;
  scale?: number;
}

interface Coat {
  body: string;
  patch: string;
  belly: string;
  nose: string;
  ear: string;
}

const COATS: Record<string, Coat> = {
  ginger: { body: '#D9975A', patch: '#B9783F', belly: '#F3D8B8', nose: '#C4483B', ear: '#E8A6B0' },
  cream: { body: '#EFE2C8', patch: '#D8C7A6', belly: '#FBF7EC', nose: '#C48A7A', ear: '#E8B6B6' },
  grey: { body: '#A9ADB0', patch: '#8A9094', belly: '#E4E6E6', nose: '#7A6A6A', ear: '#D8B0B0' },
  charcoal: { body: '#5D5D5A', patch: '#4A4A46', belly: '#9A9A94', nose: '#2E2A26', ear: '#B08A8A' },
  brown: { body: '#A97B57', patch: '#8A6042', belly: '#E8D2B8', nose: '#5B4130', ear: '#C99A9A' },
  white: { body: '#F7F2E6', patch: '#E6DDCB', belly: '#FFFFFF', nose: '#D89A9A', ear: '#E8B6B6' },
  calico: { body: '#F1E5CE', patch: '#C97A4A', belly: '#FFFFFF', nose: '#C48A7A', ear: '#E8B6B6' },
  golden: { body: '#E0B266', patch: '#C2934B', belly: '#F5E3BE', nose: '#5B4130', ear: '#C99A9A' },
  blue: { body: '#8EA7C6', patch: '#7490B2', belly: '#E4EDF7', nose: '#4A5A74', ear: '#D8B0B0' },
  rose: { body: '#E7A7B2', patch: '#CE8A97', belly: '#FBE4E8', nose: '#A85A68', ear: '#F3C6CC' },
  rust: { body: '#C97A4A', patch: '#A96038', belly: '#F3D8B8', nose: '#7A4A32', ear: '#E8A6B0' },
  butter: { body: '#E9C65B', patch: '#D1AA41', belly: '#FBF0CB', nose: '#A87A3A', ear: '#E8B6B6' },
  green: { body: '#6E8A55', patch: '#587041', belly: '#DCE8CC', nose: '#4A5A3A', ear: '#D8B0B0' },
  olive: { body: '#8B8B4E', patch: '#73733E', belly: '#ECECCF', nose: '#5A5A32', ear: '#D8B0B0' },
  mint: { body: '#9BC0A4', patch: '#7FA38A', belly: '#E4F2E8', nose: '#55745E', ear: '#E8B6B6' },
  sky: { body: '#A9CBE0', patch: '#8AB2CB', belly: '#EAF5FB', nose: '#5A7A90', ear: '#E8B6B6' },
};

function coatOf(name?: string): Coat {
  return COATS[name ?? 'ginger'] ?? COATS.ginger;
}

function face(ink = INK) {
  return `<path d="M 102 66 q 4 3 8 0" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
}

function quadrupedBody(o: AnimalOptions, coat: Coat, opts: { ears: string; tail: string; snout?: string }): string {
  const pose = o.pose ?? 'idle';
  const sleeping = pose === 'sleep';
  const walking = pose === 'walk';
  const y = sleeping ? 100 : 86;
  const headY = sleeping ? 108 : 64;
  const headX = sleeping ? 98 : 102;
  const legs = sleeping
    ? r(50, 112, 9, 8, coat.body, 3) + r(74, 112, 9, 8, coat.body, 3)
    : walking
      ? r(44, 104, 9, 18, coat.body, 3) + r(64, 104, 8, 14, coat.patch, 3) + r(82, 104, 9, 18, coat.patch, 3) + r(98, 104, 8, 14, coat.body, 3)
      : r(46, 104, 9, 20, coat.body, 3) + r(62, 104, 9, 20, coat.patch, 3) + r(80, 104, 9, 20, coat.patch, 3) + r(96, 104, 9, 20, coat.body, 3);

  return (
    (sleeping ? el(72, 124, 34, 4, INK, 'none', 0).replace('/>', ' opacity="0.10"/>') : el(72, 126, 30, 4, INK, 'none', 0).replace('/>', ' opacity="0.10"/>')) +
    (sleeping ? '' : el(72, y, 36, 22, coat.body)) +
    (sleeping ? el(72, 114, 40, 16, coat.body) : '') +
    (sleeping ? '' : el(76, y + 8, 22, 12, coat.belly, 'none', 0)) +
    legs +
    opts.tail +
    (sleeping
      ? el(headX, headY, 20, 17, coat.body)
      : c(headX, headY, 21, coat.body)) +
    opts.ears +
    (opts.snout ? el(headX + 14, headY + 8, 10, 7, opts.snout) : '') +
    (sleeping
      ? `<path d="M 92 106 q 5 3 10 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`
      : face()) +
    c(sleeping ? 94 : 104, sleeping ? 104 : 58, 2.4, INK, 'none', 0) +
    c(headX + (sleeping ? 16 : 18), headY + (sleeping ? 4 : 6), 3.4, coat.nose, INK, 1.6) +
    (sleeping ? '' : `<path d="M ${headX + 12} ${headY + 6} l 18 -2 M ${headX + 12} ${headY + 10} l 16 3" stroke="${INK}" stroke-width="1.4" opacity="0.6"/>`) +
    (sleeping ? `<text x="120" y="86" font-family="sans-serif" font-size="13" fill="${INK}" opacity="0.65">z</text><text x="130" y="74" font-family="sans-serif" font-size="9" fill="${INK}" opacity="0.5">z</text>` : '') +
    (pose === 'special' ? `<path d="M 126 30 l 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#E9C65B" stroke="${INK}" stroke-width="1.6"/>` : '')
  );
}

const speciesBuilders: Record<string, (o: AnimalOptions, coat: Coat) => string> = {
  cat: (o, coat) =>
    quadrupedBody(o, coat, {
      ears:
        p('M 88 52 L 90 30 L 104 44 Z', coat.body) +
        p('M 108 44 L 120 30 L 122 52 Z', coat.body) +
        p('M 92 47 L 93 36 L 100 44 Z', coat.ear, 'none', 0) +
        p('M 112 44 L 118 36 L 118 46 Z', coat.ear, 'none', 0),
      tail:
        p('M 38 90 C 16 92 18 62 34 58', 'none', coat.body, 7) +
        p('M 34 58 C 42 56 44 64 40 68', 'none', coat.patch, 4),
      snout: coat.belly,
    }) +
    (o.coat === 'calico' ? c(66, 78, 7, coat.patch, 'none', 0) + c(86, 80, 6, coat.patch, 'none', 0) : ''),

  dog: (o, coat) =>
    quadrupedBody(o, coat, {
      ears:
        p('M 86 52 C 72 50 72 74 84 72 Z', coat.patch) +
        p('M 114 50 C 128 50 126 74 116 70 Z', coat.patch),
      tail:
        p('M 40 88 C 22 82 22 66 30 60', 'none', coat.body, 7) +
        p('M 30 60 C 36 56 42 60 40 66', 'none', coat.patch, 4),
      snout: coat.belly,
    }),

  rabbit: (o, coat) =>
    quadrupedBody(o, coat, {
      ears:
        el(96, 30, 7, 22, coat.body, INK, 3, -12) +
        el(112, 28, 7, 22, coat.body, INK, 3, 8) +
        el(96, 30, 3, 14, coat.ear, 'none', 0, -12) +
        el(112, 28, 3, 14, coat.ear, 'none', 0, 8),
      tail: c(38, 92, 9, coat.belly),
      snout: coat.belly,
    }),

  fox: (o, coat) =>
    quadrupedBody(o, coat, {
      ears:
        p('M 88 50 L 88 26 L 104 42 Z', coat.body) +
        p('M 108 42 L 124 26 L 122 50 Z', coat.body) +
        p('M 93 44 L 93 32 L 100 42 Z', coat.ear, 'none', 0) +
        p('M 113 42 L 118 32 L 117 44 Z', coat.ear, 'none', 0),
      tail:
        p('M 40 90 C 10 96 12 56 34 54 C 28 68 34 82 44 84 Z', coat.body) +
        c(30, 56, 6, coat.belly, 'none', 0),
      snout: coat.belly,
    }),

  otter: (o, coat) =>
    quadrupedBody(o, coat, {
      ears: c(94, 46, 6, coat.patch) + c(114, 46, 6, coat.patch),
      tail: p('M 40 94 C 12 100 6 82 22 76', 'none', coat.body, 9),
      snout: coat.belly,
    }),

  raccoon: (o, coat) =>
    quadrupedBody(o, coat, {
      ears:
        p('M 90 52 L 88 34 L 102 46 Z', coat.body) +
        p('M 110 44 L 122 32 L 122 52 Z', coat.body),
      tail: p('M 40 92 C 14 98 10 66 30 58', 'none', coat.body, 8) + line(24, 82, 32, 84, coat.belly, 4),
      snout: coat.belly,
    }) +
    `<path d="M 90 60 q 18 -8 30 2" fill="none" stroke="${INK}" stroke-width="7" opacity="0.55"/>`,

  hedgehog: (o, coat) =>
    quadrupedBody(o, coat, {
      ears: c(94, 50, 5, coat.ear) + c(112, 50, 5, coat.ear),
      tail: '',
      snout: coat.belly,
    }) +
    Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * (0.15 + (i / 9) * 0.7);
      return line(60 - Math.cos(a) * 30, 84 - Math.sin(a) * 22, 62 - Math.cos(a) * 42, 86 - Math.sin(a) * 32, coat.patch, 3);
    }).join(''),

  cow: (o, coat) =>
    quadrupedBody(o, coat, {
      ears: el(94, 52, 9, 4, coat.patch, INK, 2, -20) + el(112, 52, 9, 4, coat.patch, INK, 2, 20),
      tail: p('M 38 90 C 24 94 22 106 30 110', 'none', coat.body, 4) + el(31, 112, 4, 6, coat.patch),
      snout: coat.belly,
    }) +
    c(66, 76, 8, coat.patch, 'none', 0) +
    c(86, 90, 6, coat.patch, 'none', 0),

  squirrel: (o, coat) =>
    quadrupedBody(o, coat, {
      ears:
        p('M 92 50 L 90 34 L 101 46 Z', coat.body) + p('M 110 46 L 122 34 L 120 52 Z', coat.body),
      tail: p('M 42 92 C 10 98 8 46 38 42 C 26 58 30 80 48 82 Z', coat.body) + p('M 38 42 C 44 46 46 54 44 60', 'none', coat.patch, 4),
      snout: coat.belly,
    }),
};

function birdArt(o: AnimalOptions, coat: Coat, kind: 'duck' | 'swan' | 'hen' | 'owl'): string {
  const sleeping = o.pose === 'sleep';
  const body = el(66, 86, 30, 22, coat.body);
  const head = c(96, 56, 17, coat.body);
  const wing = el(60, 84, 18, 14, coat.patch);
  const eye = sleeping ? `<path d="M 92 54 q 4 3 8 0" fill="none" stroke="${INK}" stroke-width="2.4"/>` : c(100, 54, 2.6, INK, 'none', 0);
  const beak =
    kind === 'swan'
      ? p('M 112 58 L 126 52 L 112 64 Z', '#E9A94B')
      : kind === 'hen'
        ? p('M 112 56 L 124 60 L 112 66 Z', '#E9A94B')
        : p('M 112 58 L 128 62 L 112 68 Z', '#E9A94B');
  const legs = sleeping
    ? ''
    : line(58, 106, 58, 120, '#C98A3E', 3) +
      line(74, 106, 74, 120, '#C98A3E', 3) +
      p('M 54 120 L 58 120 M 70 120 L 74 120', 'none', '#C98A3E', 3);
  const extras =
    kind === 'swan'
      ? p('M 70 84 C 52 66 44 50 54 38', 'none', coat.body, 9) + el(58, 88, 24, 16, coat.body)
      : kind === 'hen'
        ? p('M 92 38 C 88 26 96 22 96 32 C 100 20 108 24 104 34', 'none', '#C4483B', 6) +
          p('M 44 84 C 28 78 24 66 34 62', 'none', coat.patch, 3)
        : kind === 'owl'
          ? p('M 84 36 L 80 24 L 92 32 Z', coat.patch) + p('M 104 32 L 114 24 L 110 38 Z', coat.patch)
          : p('M 88 40 C 92 28 102 28 100 40', 'none', coat.patch, 4);
  const eyeBig = kind === 'owl' ? c(92, 56, 6, '#FBF7EC') + c(102, 56, 6, '#FBF7EC') + c(92, 56, 2.4, INK, 'none', 0) + c(102, 56, 2.4, INK, 'none', 0) : eye;
  return (
    el(64, 124, 34, 5, INK, 'none', 0).replace('/>', ' opacity="0.10"/>') +
    extras +
    body +
    wing +
    head +
    eyeBig +
    beak +
    legs +
    (o.accessory === 'scarf'
      ? r(90, 70, 24, 7, '#C4483B', 3) + r(104, 74, 7, 18, '#C4483B', 3)
      : '') +
    (o.accessory === 'hat'
      ? el(96, 40, 20, 5, '#4E6B3E') + r(86, 20, 20, 20, '#4E6B3E', 4)
      : '') +
    (o.accessory === 'flower' ? c(112, 42, 5, '#E8A6B0') + c(112, 42, 2, '#E9C65B') : '')
  );
}

const BIRD_SPECIES = new Set(['bird', 'duck', 'swan', 'hen', 'owl']);
const BIRD_KIND: Record<string, 'duck' | 'swan' | 'hen' | 'owl'> = {
  bird: 'duck',
  duck: 'duck',
  swan: 'swan',
  hen: 'hen',
  owl: 'owl',
};

export function animalArt(o: AnimalOptions): ArtResult {
  const coat = coatOf(o.coat);
  let body: string;
  if (BIRD_SPECIES.has(o.species)) {
    body = birdArt(o, coat, BIRD_KIND[o.species]);
  } else if (o.species === 'butterfly' || o.species === 'bee') {
    const isBee = o.species === 'bee';
    body =
      el(70, 90, 5, 9, INK, 'none', 0) +
      el(62, 82, 22, 16, isBee ? '#E9C65B' : coat.body, INK, 3, -18) +
      el(88, 82, 22, 16, isBee ? '#E9C65B' : coat.body, INK, 3, 18) +
      (isBee
        ? line(52, 74, 58, 90, INK, 3) + line(64, 70, 70, 88, INK, 3) + line(76, 70, 82, 88, INK, 3)
        : c(62, 82, 7, coat.patch, 'none', 0) + c(88, 82, 7, coat.patch, 'none', 0)) +
      el(70, 88, 7, 14, isBee ? '#E9C65B' : coat.patch) +
      c(70, 72, 6, isBee ? '#E9C65B' : coat.body) +
      c(68, 70, 1.8, INK, 'none', 0) +
      line(66, 64, 62, 56, INK, 2) +
      line(74, 64, 78, 56, INK, 2) +
      c(62, 56, 2, INK, 'none', 0) +
      c(78, 56, 2, INK, 'none', 0);
  } else if (o.species === 'frog') {
    body =
      el(70, 96, 34, 20, coat.body) +
      c(60, 76, 12, coat.body) +
      c(82, 76, 12, coat.body) +
      c(60, 76, 5, '#FBF7EC') +
      c(82, 76, 5, '#FBF7EC') +
      c(60, 77, 2, INK, 'none', 0) +
      c(82, 77, 2, INK, 'none', 0) +
      `<path d="M 58 100 q 12 6 24 0" fill="none" stroke="${INK}" stroke-width="2.4"/>` +
      el(44, 112, 10, 6, coat.patch) +
      el(96, 112, 10, 6, coat.patch);
  } else if (o.species === 'turtle') {
    body =
      p('M 26 106 C 26 66 106 62 114 102 Z', coat.body) +
      p('M 38 96 C 48 76 92 76 102 96', 'none', coat.patch, 3) +
      line(64, 82, 64, 102, coat.patch, 3) +
      line(84, 82, 84, 102, coat.patch, 3) +
      c(118, 92, 11, '#9BC0A4') +
      c(122, 90, 2.2, INK, 'none', 0) +
      el(42, 112, 9, 5, '#9BC0A4') +
      el(92, 112, 9, 5, '#9BC0A4');
  } else {
    body = (speciesBuilders[o.species] ?? speciesBuilders.cat)(o, coat);
  }

  const accessory = o.accessory ? accessoryArt(o.accessory, 70, 60) : '';
  const result = {
    w: 140,
    h: 140,
    body: body + accessory,
  };
  if (o.scale && o.scale !== 1) {
    return {
      w: Math.round(result.w * o.scale),
      h: Math.round(result.h * o.scale),
      body: `<g transform="scale(${o.scale})">${result.body}</g>`,
    };
  }
  return result;
}

function accessoryArt(kind: string, x: number, y: number): string {
  switch (kind) {
    case 'scarf':
      return r(x + 18, y + 10, 24, 7, '#C4483B', 3) + r(x + 32, y + 14, 7, 16, '#C4483B', 3);
    case 'hat':
      return el(x + 24, y - 22, 16, 4, '#4E6B3E') + r(x + 16, y - 38, 16, 16, '#4E6B3E', 4);
    case 'flower':
      return c(x + 40, y - 20, 5, '#E8A6B0') + c(x + 40, y - 20, 2, '#E9C65B');
    case 'glasses':
      return c(x + 24, y - 8, 6, 'none', INK, 2) + c(x + 40, y - 8, 6, 'none', INK, 2) + line(x + 30, y - 8, x + 34, y - 8, INK, 2);
    case 'bow':
      return p(`M ${x + 18} ${y - 24} l -9 -6 0 12 z`, '#E8A6B0') + p(`M ${x + 26} ${y - 24} l 9 -6 0 12 z`, '#E8A6B0') + c(x + 22, y - 24, 3, '#C4483B');
    default:
      return '';
  }
}

export function animalSvg(o: AnimalOptions): string {
  return svgDoc(animalArt(o));
}

/** A square portrait crop used on visitor and pet cards. */
export function animalPortrait(o: AnimalOptions): string {
  const art = animalArt({ ...o, pose: 'idle' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="18" fill="#FBF7EC"/><rect x="8" y="8" width="144" height="144" rx="14" fill="#EDE6D6"/><g transform="translate(10 8)">${art.body}</g></svg>`;
}
