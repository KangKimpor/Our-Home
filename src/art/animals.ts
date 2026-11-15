/** Storybook-illustrated animal characters & articulated rig parts. Side view, bottom baseline. */

import { INK, c, el, line, p, r, shadedPath, svgDoc, type ArtResult } from './svg';

export type AnimalPose = 'idle' | 'walk' | 'sleep' | 'special';

export interface AnimalOptions {
  species: string;
  coat?: string;
  pose?: AnimalPose;
  accessory?: string;
  scale?: number;
}

export interface RigPart {
  id: string;
  w: number;
  h: number;
  pivotX: number;
  pivotY: number;
  body: string;
}

export interface AnimalRigParts {
  kind: 'quadruped' | 'bird' | 'flutter' | 'simple';
  w: number;
  h: number;
  shadow: RigPart;
  backTail?: RigPart;
  farLegs?: RigPart;
  body: RigPart;
  nearLegBack?: RigPart;
  nearLegFront?: RigPart;
  wing?: RigPart;
  wingL?: RigPart;
  wingR?: RigPart;
  head?: RigPart;
  eyesOpen?: RigPart;
  eyesClosed?: RigPart;
  extraOverlay?: RigPart;
}

interface Coat {
  body: string;
  patch: string;
  belly: string;
  nose: string;
  ear: string;
}

const COATS: Record<string, Coat> = {
  ginger: { body: '#DF9B5D', patch: '#B9753D', belly: '#F7DFC2', nose: '#C95A4C', ear: '#EEAAB4' },
  cream: { body: '#F2E5CC', patch: '#D9C6A3', belly: '#FFFDF6', nose: '#C78A7C', ear: '#EDB6B6' },
  grey: { body: '#ACB1B5', patch: '#878E94', belly: '#E7E9EA', nose: '#7A6868', ear: '#DBB2B2' },
  charcoal: { body: '#5D5D5A', patch: '#43433F', belly: '#9F9F98', nose: '#2E2A26', ear: '#B48D8D' },
  brown: { body: '#AD7E5A', patch: '#865D3F', belly: '#EBD6BD', nose: '#5B4130', ear: '#CE9D9D' },
  white: { body: '#FAF6EC', patch: '#E6DEC9', belly: '#FFFFFF', nose: '#DE9D9D', ear: '#EEB9B9' },
  calico: { body: '#F4E8D1', patch: '#CA7A4A', belly: '#FFFFFF', nose: '#C68A7B', ear: '#EDB6B6' },
  golden: { body: '#E5B669', patch: '#C49248', belly: '#F9E7C2', nose: '#5B4130', ear: '#CE9D9D' },
  blue: { body: '#91AAC9', patch: '#708DB0', belly: '#E7F0FA', nose: '#4A5A74', ear: '#DBB2B2' },
  rose: { body: '#EAABB6', patch: '#CE8996', belly: '#FDE7EB', nose: '#A85A68', ear: '#F6CAD0' },
  rust: { body: '#CE7D4C', patch: '#A85D34', belly: '#F6DBC0', nose: '#7A4A32', ear: '#EEAAB4' },
  butter: { body: '#ECC85D', patch: '#CFA73E', belly: '#FDF3CF', nose: '#A87A3A', ear: '#EDB6B6' },
  green: { body: '#708E57', patch: '#56703F', belly: '#DFECD0', nose: '#4A5A3A', ear: '#DBB2B2' },
  olive: { body: '#8E8E50', patch: '#72723B', belly: '#EFEFD2', nose: '#5A5A32', ear: '#DBB2B2' },
  mint: { body: '#9EC4A7', patch: '#7DA387', belly: '#E6F5EA', nose: '#55745E', ear: '#EDB6B6' },
  sky: { body: '#ACD0E5', patch: '#88B1CB', belly: '#ECF7FD', nose: '#5A7A90', ear: '#EDB6B6' },
};

function coatOf(name?: string): Coat {
  return COATS[name ?? 'ginger'] ?? COATS.ginger;
}

/** Curved tapered paw/leg path anchored from hip/shoulder (x, y). */
function pawLeg(x: number, y: number, h: number, fill: string, pawFill: string, w = 10): string {
  const rX = x + w / 2;
  const bot = y + h;
  return (
    `<path d="M ${x + 1} ${y} C ${x - 1} ${y + h * 0.48} ${x + 0.5} ${bot - 5} ${x + 1.5} ${bot - 2} C ${x + 2} ${bot + 1} ${x + w + 2} ${bot + 1} ${x + w + 2.5} ${bot - 2.5} C ${x + w + 2.5} ${bot - 6} ${x + w} ${y + h * 0.45} ${x + w - 0.5} ${y} Z" fill="${fill}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<ellipse cx="${rX + 1.5}" cy="${bot - 2}" rx="${w * 0.42}" ry="2.6" fill="${pawFill}" opacity="0.8"/>`
  );
}

interface SpeciesVisual {
  ears: string;
  tail: string;
  tailPivot: [number, number];
  bodyMarkings?: string;
  headMarkings?: string;
  snout?: string;
  snoutSize?: [number, number];
}

function speciesVisual(species: string, o: AnimalOptions, coat: Coat): SpeciesVisual {
  const isSleep = o.pose === 'sleep';
  switch (species) {
    case 'dog':
      return {
        ears:
          shadedPath('M 86 50 C 73 48 70 74 82 74 C 89 74 91 60 88 50 Z', coat.patch, INK, 2.5) +
          shadedPath('M 115 48 C 127 50 128 74 117 72 C 112 71 112 58 115 48 Z', coat.patch, INK, 2.5),
        tail:
          p('M 42 86 C 24 80 22 60 32 54 C 37 51 42 56 38 62 C 34 69 36 77 45 81 Z', coat.body, INK, 2.5) +
          p('M 29 58 C 31 53 37 54 37 59', 'none', coat.patch, 3),
        tailPivot: [42, 84],
        snout: coat.belly,
        snoutSize: [12, 8.5],
      };

    case 'rabbit':
      return {
        ears:
          `<g transform="rotate(-12 94 34)">${el(94, 30, 7.5, 22, coat.body, INK, 2.5)}${el(94, 31, 3.5, 14, coat.ear, 'none', 0)}</g>` +
          `<g transform="rotate(8 111 32)">${el(111, 29, 7.5, 22, coat.body, INK, 2.5)}${el(111, 30, 3.5, 14, coat.ear, 'none', 0)}</g>`,
        tail: c(38, 92, 10, coat.belly, INK, 2.5),
        tailPivot: [42, 92],
        snout: coat.belly,
        snoutSize: [9.5, 6.5],
      };

    case 'fox':
      return {
        ears:
          shadedPath('M 86 52 L 87 24 L 104 42 Z', coat.body, INK, 2.5) +
          shadedPath('M 108 42 L 124 24 L 122 52 Z', coat.body, INK, 2.5) +
          p('M 91 45 L 91 31 L 100 42 Z', coat.ear, 'none', 0) +
          p('M 112 42 L 119 31 L 118 45 Z', coat.ear, 'none', 0),
        tail:
          shadedPath('M 42 88 C 12 96 10 52 34 48 C 44 46 46 66 36 76 C 39 81 44 82 46 84 Z', coat.body, INK, 2.5) +
          p('M 25 56 C 27 49 34 47 38 51 C 34 56 30 59 25 56 Z', coat.belly, 'none', 0),
        tailPivot: [42, 86],
        bodyMarkings: p('M 88 70 C 98 76 102 92 90 98 C 82 94 82 78 88 70 Z', coat.belly, 'none', 0),
        snout: coat.belly,
        snoutSize: [11.5, 7],
      };

    case 'otter':
      return {
        ears: c(93, 47, 6.2, coat.patch, INK, 2.4) + c(114, 47, 6.2, coat.patch, INK, 2.4),
        tail: shadedPath('M 42 90 C 14 96 6 82 22 76 C 32 72 38 78 44 84 Z', coat.body, INK, 2.5),
        tailPivot: [42, 88],
        snout: coat.belly,
        snoutSize: [11, 7.5],
      };

    case 'raccoon':
      return {
        ears:
          shadedPath('M 88 52 L 87 32 L 102 45 Z', coat.body, INK, 2.5) +
          shadedPath('M 109 44 L 123 32 L 122 52 Z', coat.body, INK, 2.5),
        tail:
          shadedPath('M 42 88 C 14 96 10 62 30 54 C 37 51 42 58 38 68 C 36 74 39 80 45 83 Z', coat.body, INK, 2.5) +
          line(22, 82, 32, 84, coat.belly, 4) +
          line(25, 68, 34, 70, coat.belly, 4),
        tailPivot: [42, 86],
        headMarkings: `<path d="M 88 59 q 16 -8 32 2" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" opacity="0.52"/>`,
        snout: coat.belly,
        snoutSize: [10.5, 7],
      };

    case 'hedgehog':
      return {
        ears: c(94, 50, 5.5, coat.ear, INK, 2.2) + c(112, 50, 5.5, coat.ear, INK, 2.2),
        tail: '',
        tailPivot: [42, 90],
        bodyMarkings: Array.from({ length: 10 }, (_, i) => {
          const a = Math.PI * (0.12 + (i / 10) * 0.72);
          return line(62 - Math.cos(a) * 28, 84 - Math.sin(a) * 20, 62 - Math.cos(a) * 42, 85 - Math.sin(a) * 32, coat.patch, 3.2);
        }).join(''),
        snout: coat.belly,
        snoutSize: [11, 7],
      };

    case 'cow':
      return {
        ears:
          `<g transform="rotate(-18 92 52)">${el(92, 52, 9, 4.2, coat.patch, INK, 2.2)}</g>` +
          `<g transform="rotate(18 113 52)">${el(113, 52, 9, 4.2, coat.patch, INK, 2.2)}</g>` +
          p('M 94 44 C 91 36 95 34 98 42', 'none', '#EDE6D6', 3.5) +
          p('M 111 44 C 114 36 110 34 107 42', 'none', '#EDE6D6', 3.5),
        tail: p('M 40 86 C 24 92 22 106 30 110', 'none', coat.body, 4) + el(31, 112, 4.5, 6.5, coat.patch, INK, 2),
        tailPivot: [40, 86],
        bodyMarkings: c(65, 76, 8.5, coat.patch, 'none', 0) + c(86, 90, 6.5, coat.patch, 'none', 0),
        snout: '#F3C6CC',
        snoutSize: [12, 8],
      };

    case 'squirrel':
      return {
        ears:
          shadedPath('M 91 50 L 90 32 L 101 45 Z', coat.body, INK, 2.4) +
          shadedPath('M 109 45 L 122 32 L 120 50 Z', coat.body, INK, 2.4),
        tail:
          shadedPath('M 44 90 C 8 98 6 42 38 38 C 48 37 50 54 40 66 C 36 73 42 80 48 84 Z', coat.body, INK, 2.5) +
          p('M 36 44 C 42 48 43 56 40 62', 'none', coat.patch, 4),
        tailPivot: [44, 88],
        snout: coat.belly,
        snoutSize: [9.5, 6.5],
      };

    default: {
      // Cat with rich markings (tabby stripes / calico patches)
      const isCalico = o.coat === 'calico';
      const isTabby = o.coat === 'ginger' || o.coat === 'grey' || o.coat === 'rust' || o.coat === 'cream';
      const stripes = isSleep
        ? ''
        : isCalico
          ? c(64, 78, 8, coat.patch, 'none', 0) + c(86, 82, 6.5, '#4A4A46', 'none', 0)
          : isTabby
            ? line(62, 66, 62, 74, coat.patch, 2.6) +
              line(71, 65, 71, 75, coat.patch, 2.6) +
              line(80, 66, 80, 74, coat.patch, 2.6)
            : '';
      const foreheadStripes = isTabby
        ? line(99, 47, 99, 52, coat.patch, 2.2) + line(104, 46, 104, 52, coat.patch, 2.2) + line(109, 47, 109, 52, coat.patch, 2.2)
        : '';
      return {
        ears:
          shadedPath('M 87 52 L 89 28 L 104 43 Z', coat.body, INK, 2.5) +
          shadedPath('M 108 43 L 121 28 L 123 52 Z', coat.body, INK, 2.5) +
          p('M 91 47 L 92 35 L 100 43 Z', coat.ear, 'none', 0) +
          p('M 111 43 L 119 35 L 118 46 Z', coat.ear, 'none', 0),
        tail:
          p('M 42 88 C 16 92 16 58 34 54 C 40 53 43 59 39 64 C 31 68 32 82 45 84 Z', coat.body, INK, 2.5) +
          p('M 29 59 C 32 55 37 56 38 60', 'none', coat.patch, 3),
        tailPivot: [42, 86],
        bodyMarkings: stripes,
        headMarkings: foreheadStripes,
        snout: coat.belly,
        snoutSize: [10, 6.8],
      };
    }
  }
}

function accessoryArt(kind: string, x: number, y: number): string {
  switch (kind) {
    case 'scarf':
      return r(x + 16, y + 10, 26, 7.5, '#C4483B', 3.5) + r(x + 31, y + 14, 7.5, 16, '#C4483B', 3.5);
    case 'hat':
      return el(x + 24, y - 22, 16, 4, '#4E6B3E') + r(x + 16, y - 38, 16, 16, '#4E6B3E', 4);
    case 'flower':
      return c(x + 40, y - 20, 5.5, '#E8A6B0') + c(x + 40, y - 20, 2.2, '#E9C65B');
    case 'glasses':
      return c(x + 24, y - 8, 6, 'none', INK, 2) + c(x + 40, y - 8, 6, 'none', INK, 2) + line(x + 30, y - 8, x + 34, y - 8, INK, 2);
    case 'bow':
      return p(`M ${x + 18} ${y - 24} l -9 -6 0 12 z`, '#E8A6B0') + p(`M ${x + 26} ${y - 24} l 9 -6 0 12 z`, '#E8A6B0') + c(x + 22, y - 24, 3, '#C4483B');
    default:
      return '';
  }
}

function renderQuadrupedHead(o: AnimalOptions, coat: Coat, vis: SpeciesVisual, sleeping: boolean, includeEyes: boolean, eyesClosed = false): string {
  const headY = sleeping ? 106 : 64;
  const headX = sleeping ? 98 : 102;
  const [sw, sh] = vis.snoutSize ?? [10, 6.8];
  const mouth = sleeping
    ? ''
    : `<path d="M ${headX + 10} ${headY + 9} q 3 3 6 0 q 3 3 6 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  const eyes = !includeEyes
    ? ''
    : eyesClosed || sleeping
      ? `<path d="M ${headX - 3} ${headY - 3} q 4.5 3.5 9 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`
      : `<ellipse cx="${headX + 4}" cy="${headY - 5}" rx="3.4" ry="3.8" fill="${INK}"/>` +
        `<circle cx="${headX + 5.2}" cy="${headY - 6.4}" r="1.35" fill="#FFFDF8"/>` +
        `<circle cx="${headX + 3.2}" cy="${headY - 3.6}" r="0.65" fill="#FFFDF8"/>`;

  return (
    (sleeping
      ? el(headX, headY, 21, 17.5, coat.body, INK, 2.7)
      : el(headX, headY, 22, 20.5, coat.body, INK, 2.7)) +
    (sleeping ? '' : vis.ears) +
    (vis.headMarkings ?? '') +
    (vis.snout ? el(headX + 14, headY + 7, sw, sh, vis.snout, INK, 1.8) : '') +
    `<ellipse cx="${headX + 1}" cy="${headY + 5}" rx="4.5" ry="2.5" fill="#E89CA8" opacity="0.48"/>` +
    mouth +
    eyes +
    c(headX + (sleeping ? 16 : 19), headY + (sleeping ? 3 : 4), 3.4, coat.nose, INK, 1.6) +
    (sleeping
      ? ''
      : `<path d="M ${headX + 13} ${headY + 5} l 17 -2.5 M ${headX + 13} ${headY + 9} l 15 3" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" opacity="0.52"/>`) +
    (o.accessory && !sleeping ? accessoryArt(o.accessory, 70, 60) : '')
  );
}

function quadrupedBody(o: AnimalOptions, coat: Coat, vis: SpeciesVisual): string {
  const pose = o.pose ?? 'idle';
  const sleeping = pose === 'sleep';
  const walking = pose === 'walk';
  const y = sleeping ? 104 : 86;

  const legs = sleeping
    ? pawLeg(50, 113, 12, coat.body, coat.belly, 9) + pawLeg(74, 113, 12, coat.body, coat.belly, 9)
    : walking
      ? pawLeg(44, 102, 21, coat.patch, coat.belly, 9) +
        pawLeg(63, 102, 17, coat.patch, coat.belly, 9) +
        pawLeg(82, 102, 21, coat.body, coat.belly, 9.5) +
        pawLeg(97, 102, 16, coat.body, coat.belly, 9)
      : pawLeg(45, 102, 23, coat.patch, coat.belly, 9) +
        pawLeg(62, 102, 23, coat.body, coat.belly, 9.5) +
        pawLeg(80, 102, 23, coat.patch, coat.belly, 9) +
        pawLeg(95, 102, 23, coat.body, coat.belly, 9.5);

  return (
    (sleeping
      ? `<ellipse cx="72" cy="124" rx="40" ry="6.5" fill="#2B2521" opacity="0.14"/>`
      : `<ellipse cx="72" cy="126" rx="36" ry="6" fill="#2B2521" opacity="0.14"/>`) +
    (sleeping ? el(72, 113, 40, 16, coat.body) : el(71, y, 36, 22, coat.body)) +
    (sleeping ? '' : el(75, y + 9, 23, 12, coat.belly, 'none', 0)) +
    (vis.bodyMarkings ?? '') +
    legs +
    (sleeping ? '' : vis.tail) +
    renderQuadrupedHead(o, coat, vis, sleeping, true, false) +
    (sleeping
      ? `<text x="120" y="86" font-family="Fredoka, sans-serif" font-size="14" font-weight="700" fill="${INK}" opacity="0.65">z</text><text x="130" y="74" font-family="Fredoka, sans-serif" font-size="10" font-weight="700" fill="${INK}" opacity="0.5">z</text>`
      : '') +
    (pose === 'special' ? `<path d="M 126 30 l 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#E9C65B" stroke="${INK}" stroke-width="1.6"/>` : '')
  );
}

function birdPartsSvg(o: AnimalOptions, coat: Coat, kind: 'duck' | 'swan' | 'hen' | 'owl') {
  const sleeping = o.pose === 'sleep';
  const shadow = `<ellipse cx="66" cy="124" rx="34" ry="5.5" fill="#2B2521" opacity="0.14"/>`;
  const legs = sleeping
    ? ''
    : line(58, 105, 58, 121, '#C98A3E', 3.4) +
      line(74, 105, 74, 121, '#C98A3E', 3.4) +
      p('M 52 121 L 60 121 M 68 121 L 76 121', 'none', '#C98A3E', 3.2);
  const extras =
    kind === 'swan'
      ? p('M 70 84 C 52 66 44 50 54 38', 'none', coat.body, 9) + el(58, 88, 24, 16, coat.body)
      : kind === 'hen'
        ? p('M 44 84 C 28 78 24 66 34 62', 'none', coat.patch, 3.5)
        : '';

  const headTop =
    kind === 'hen'
      ? p('M 92 40 C 88 28 96 24 96 34 C 100 22 108 26 104 36', 'none', '#C4483B', 6)
      : kind === 'owl'
        ? shadedPath('M 83 41 L 79 27 L 92 36 Z', coat.patch) + shadedPath('M 101 36 L 113 27 L 110 41 Z', coat.patch)
        : kind === 'duck'
          ? p('M 88 41 C 92 29 102 29 100 41', 'none', coat.patch, 4)
          : '';

  const body = extras + el(66, 86, 30, 22, coat.body);
  const wing = el(60, 84, 19, 14, coat.patch) + p('M 48 84 q 10 5 22 0', 'none', coat.belly, 2);

  const beak =
    kind === 'swan'
      ? p('M 111 57 L 126 51 L 111 63 Z', '#E9A94B')
      : kind === 'hen'
        ? p('M 111 55 L 124 59 L 111 65 Z', '#E9A94B')
        : p('M 111 57 L 128 61 L 111 67 Z', '#E9A94B');

  const head =
    headTop +
    c(96, 56, 17.5, coat.body) +
    `<ellipse cx="94" cy="61" rx="4" ry="2.2" fill="#E89CA8" opacity="0.45"/>` +
    beak +
    (o.accessory === 'scarf' ? r(90, 70, 24, 7, '#C4483B', 3) + r(104, 74, 7, 18, '#C4483B', 3) : '') +
    (o.accessory === 'hat' ? el(96, 40, 20, 5, '#4E6B3E') + r(86, 20, 20, 20, '#4E6B3E', 4) : '') +
    (o.accessory === 'flower' ? c(112, 42, 5, '#E8A6B0') + c(112, 42, 2, '#E9C65B') : '');

  const eyesOpen =
    kind === 'owl'
      ? c(92, 56, 6.2, '#FBF7EC') +
        c(102, 56, 6.2, '#FBF7EC') +
        c(92, 56, 2.8, INK, 'none', 0) +
        c(102, 56, 2.8, INK, 'none', 0) +
        `<circle cx="93" cy="54.6" r="1.15" fill="#FFFDF8"/><circle cx="103" cy="54.6" r="1.15" fill="#FFFDF8"/>`
      : c(100, 54, 3, INK, 'none', 0) + `<circle cx="101.2" cy="52.8" r="1.1" fill="#FFFDF8"/>`;

  const eyesClosed =
    kind === 'owl'
      ? c(92, 56, 6.2, '#FBF7EC') +
        c(102, 56, 6.2, '#FBF7EC') +
        `<path d="M 88 56 q 4 3 8 0 M 98 56 q 4 3 8 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`
      : `<path d="M 96 54 q 4 3 8 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;

  return { shadow, legs, body, wing, head, eyesOpen, eyesClosed };
}

const BIRD_SPECIES = new Set(['bird', 'duck', 'swan', 'hen', 'owl']);
const BIRD_KIND: Record<string, 'duck' | 'swan' | 'hen' | 'owl'> = {
  bird: 'duck',
  duck: 'duck',
  swan: 'swan',
  hen: 'hen',
  owl: 'owl',
};

const QUADRUPED_SPECIES = new Set(['cat', 'dog', 'rabbit', 'fox', 'otter', 'raccoon', 'hedgehog', 'cow', 'squirrel']);

/** Multi-part articulated sprite pieces in 140x140 coordinates for 60fps PixiJS animation. */
export function animalRigParts(o: AnimalOptions): AnimalRigParts {
  const coat = coatOf(o.coat);
  const w = 140;
  const h = 140;

  if (BIRD_SPECIES.has(o.species)) {
    const bp = birdPartsSvg(o, coat, BIRD_KIND[o.species]);
    const sleeping = o.pose === 'sleep';
    return {
      kind: 'bird',
      w,
      h,
      shadow: { id: 'shadow', w, h, pivotX: 66, pivotY: 124, body: bp.shadow },
      farLegs: { id: 'legs', w, h, pivotX: 66, pivotY: 106, body: bp.legs },
      body: { id: 'body', w, h, pivotX: 66, pivotY: 96, body: bp.body },
      wing: { id: 'wing', w, h, pivotX: 72, pivotY: 82, body: bp.wing },
      head: { id: 'head', w, h, pivotX: 94, pivotY: 70, body: bp.head },
      eyesOpen: { id: 'eyesOpen', w, h, pivotX: 94, pivotY: 70, body: sleeping ? bp.eyesClosed : bp.eyesOpen },
      eyesClosed: { id: 'eyesClosed', w, h, pivotX: 94, pivotY: 70, body: bp.eyesClosed },
    };
  }

  if (o.species === 'butterfly' || o.species === 'bee') {
    const isBee = o.species === 'bee';
    const bodySvg =
      el(70, 88, 7.5, 14, isBee ? '#E9C65B' : coat.patch) +
      (isBee ? line(64, 83, 76, 83, INK, 2.8) + line(63, 91, 77, 91, INK, 2.8) : '') +
      c(70, 72, 6, isBee ? '#E9C65B' : coat.body) +
      c(68, 70, 1.8, INK, 'none', 0) +
      line(66, 64, 62, 56, INK, 2) +
      line(74, 64, 78, 56, INK, 2) +
      c(62, 56, 2, INK, 'none', 0) +
      c(78, 56, 2, INK, 'none', 0);
    const wingLSvg =
      el(54, 80, 18, 13, isBee ? '#EAF5FB' : coat.body, INK, 2.5, -18) +
      (isBee ? '' : c(53, 80, 5.5, coat.patch, 'none', 0));
    const wingRSvg =
      el(86, 80, 18, 13, isBee ? '#EAF5FB' : coat.body, INK, 2.5, 18) +
      (isBee ? '' : c(87, 80, 5.5, coat.patch, 'none', 0));
    return {
      kind: 'flutter',
      w,
      h,
      shadow: { id: 'shadow', w, h, pivotX: 70, pivotY: 122, body: `<ellipse cx="70" cy="122" rx="18" ry="4" fill="#2B2521" opacity="0.1"/>` },
      wingL: { id: 'wingL', w, h, pivotX: 68, pivotY: 82, body: wingLSvg },
      wingR: { id: 'wingR', w, h, pivotX: 72, pivotY: 82, body: wingRSvg },
      body: { id: 'body', w, h, pivotX: 70, pivotY: 84, body: bodySvg },
    };
  }

  if (QUADRUPED_SPECIES.has(o.species)) {
    const vis = speciesVisual(o.species, o, coat);
    const sleeping = o.pose === 'sleep';
    if (sleeping) {
      return {
        kind: 'quadruped',
        w,
        h,
        shadow: { id: 'shadow', w, h, pivotX: 72, pivotY: 124, body: `<ellipse cx="72" cy="124" rx="40" ry="6.5" fill="#2B2521" opacity="0.14"/>` },
        body: {
          id: 'body',
          w,
          h,
          pivotX: 72,
          pivotY: 118,
          body:
            el(72, 113, 40, 16, coat.body) +
            pawLeg(50, 113, 12, coat.body, coat.belly, 9) +
            pawLeg(74, 113, 12, coat.body, coat.belly, 9) +
            renderQuadrupedHead(o, coat, vis, true, true, true),
        },
      };
    }

    const headX = 102;
    const headY = 64;
    const [tailPx, tailPy] = vis.tailPivot;
    const headNoEyes = renderQuadrupedHead(o, coat, vis, false, false);
    const eyesOpen =
      `<ellipse cx="${headX + 4}" cy="${headY - 5}" rx="3.4" ry="3.8" fill="${INK}"/>` +
      `<circle cx="${headX + 5.2}" cy="${headY - 6.4}" r="1.35" fill="#FFFDF8"/>` +
      `<circle cx="${headX + 3.2}" cy="${headY - 3.6}" r="0.65" fill="#FFFDF8"/>`;
    const eyesClosed = `<path d="M ${headX - 1} ${headY - 4} q 4.5 3.5 9 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;

    return {
      kind: 'quadruped',
      w,
      h,
      shadow: { id: 'shadow', w, h, pivotX: 72, pivotY: 126, body: `<ellipse cx="72" cy="126" rx="36" ry="6" fill="#2B2521" opacity="0.14"/>` },
      backTail: { id: 'tail', w, h, pivotX: tailPx, pivotY: tailPy, body: vis.tail },
      farLegs: {
        id: 'farLegs',
        w,
        h,
        pivotX: 70,
        pivotY: 102,
        body: pawLeg(45, 102, 23, coat.patch, coat.belly, 9) + pawLeg(80, 102, 23, coat.patch, coat.belly, 9),
      },
      body: {
        id: 'body',
        w,
        h,
        pivotX: 72,
        pivotY: 96,
        body: el(71, 86, 36, 22, coat.body) + el(75, 95, 23, 12, coat.belly, 'none', 0) + (vis.bodyMarkings ?? ''),
      },
      nearLegBack: {
        id: 'nearLegBack',
        w,
        h,
        pivotX: 66,
        pivotY: 102,
        body: pawLeg(62, 102, 23, coat.body, coat.belly, 9.5),
      },
      nearLegFront: {
        id: 'nearLegFront',
        w,
        h,
        pivotX: 99,
        pivotY: 102,
        body: pawLeg(95, 102, 23, coat.body, coat.belly, 9.5),
      },
      head: { id: 'head', w, h, pivotX: 96, pivotY: 74, body: headNoEyes },
      eyesOpen: { id: 'eyesOpen', w, h, pivotX: 96, pivotY: 74, body: eyesOpen },
      eyesClosed: { id: 'eyesClosed', w, h, pivotX: 96, pivotY: 74, body: eyesClosed },
    };
  }

  // Fallback for frog / turtle
  const art = animalArt(o);
  return {
    kind: 'simple',
    w: art.w,
    h: art.h,
    shadow: { id: 'shadow', w: art.w, h: art.h, pivotX: 70, pivotY: 120, body: `<ellipse cx="70" cy="116" rx="34" ry="5" fill="#2B2521" opacity="0.14"/>` },
    body: { id: 'body', w: art.w, h: art.h, pivotX: 70, pivotY: 112, body: art.body },
  };
}

export function animalArt(o: AnimalOptions): ArtResult {
  const coat = coatOf(o.coat);
  let body: string;
  if (BIRD_SPECIES.has(o.species)) {
    const bp = birdPartsSvg(o, coat, BIRD_KIND[o.species]);
    const sleeping = o.pose === 'sleep';
    body = bp.shadow + bp.body + bp.wing + bp.legs + bp.head + (sleeping ? bp.eyesClosed : bp.eyesOpen);
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
      `<ellipse cx="70" cy="116" rx="32" ry="5" fill="#2B2521" opacity="0.14"/>` +
      el(70, 96, 34, 20, coat.body) +
      el(70, 102, 22, 11, coat.belly, 'none', 0) +
      c(60, 76, 12, coat.body) +
      c(82, 76, 12, coat.body) +
      c(60, 76, 5.5, '#FBF7EC') +
      c(82, 76, 5.5, '#FBF7EC') +
      c(60, 77, 2.4, INK, 'none', 0) +
      c(82, 77, 2.4, INK, 'none', 0) +
      `<circle cx="61" cy="75.8" r="0.9" fill="#FFFDF8"/><circle cx="83" cy="75.8" r="0.9" fill="#FFFDF8"/>` +
      `<path d="M 58 100 q 12 6 24 0" fill="none" stroke="${INK}" stroke-width="2.4"/>` +
      el(44, 112, 10, 6, coat.patch) +
      el(96, 112, 10, 6, coat.patch);
  } else if (o.species === 'turtle') {
    body =
      `<ellipse cx="70" cy="116" rx="40" ry="5.5" fill="#2B2521" opacity="0.14"/>` +
      shadedPath('M 26 106 C 26 64 106 60 114 102 Z', coat.body) +
      p('M 38 96 C 48 76 92 76 102 96', 'none', coat.patch, 3) +
      line(64, 82, 64, 102, coat.patch, 3) +
      line(84, 82, 84, 102, coat.patch, 3) +
      c(118, 92, 11, '#9BC0A4') +
      c(122, 90, 2.5, INK, 'none', 0) +
      `<circle cx="123" cy="89" r="0.9" fill="#FFFDF8"/>` +
      el(42, 112, 9, 5, '#9BC0A4') +
      el(92, 112, 9, 5, '#9BC0A4');
  } else {
    const vis = speciesVisual(o.species, o, coat);
    body = quadrupedBody(o, coat, vis);
  }

  const accessory = !QUADRUPED_SPECIES.has(o.species) && !BIRD_SPECIES.has(o.species) && o.accessory
    ? accessoryArt(o.accessory, 70, 60)
    : '';
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

export function animalSvg(o: AnimalOptions): string {
  return svgDoc(animalArt(o));
}

/** A square portrait crop used on visitor and pet cards. */
export function animalPortrait(o: AnimalOptions): string {
  const art = animalArt({ ...o, pose: 'idle' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="18" fill="#FBF7EC"/><rect x="8" y="8" width="144" height="144" rx="14" fill="#EDE6D6"/><g transform="translate(10 8)">${art.body}</g></svg>`;
}
