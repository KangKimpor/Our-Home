/** Storybook-illustrated adult and baby character art & articulated 60fps rig parts. */

import type { RigPart } from './animals';
import { INK, c, el, line, p, r, shadedPath, svgDoc, type ArtResult } from './svg';

export interface CharacterArtOptions {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun';
  outfit: string;
  pose?: 'idle' | 'read' | 'cook' | 'paint';
  scale?: number;
}

export interface CharacterRigParts {
  kind: 'adult' | 'baby';
  w: number;
  h: number;
  shadow: RigPart;
  hairBack?: RigPart;
  legs?: RigPart;
  backArm?: RigPart;
  body: RigPart;
  head: RigPart;
  eyesOpen: RigPart;
  eyesClosed: RigPart;
  frontArm?: RigPart;
}

const SKIN_SHADOW: Record<string, string> = {
  '#F2D3B6': '#E0B893',
  '#E0B48E': '#C99A72',
  '#C98D62': '#B0744B',
  '#9A6440': '#82512F',
  '#6E4529': '#5A361D',
  '#F7E0CB': '#E8C9AF',
};

function shade(skin: string): string {
  return SKIN_SHADOW[skin] ?? '#C99A72';
}

function hairBackSvg(o: CharacterArtOptions): string {
  if (o.hairStyle === 'long') {
    return (
      shadedPath('M 39 54 C 29 82 33 138 46 152 L 94 152 C 107 138 111 82 101 54 Z', o.hair) +
      p('M 42 74 C 38 102 42 126 48 142', 'none', '#FFFDF8', 2, 'opacity="0.16"')
    );
  }
  if (o.hairStyle === 'bun') {
    return (
      c(70, 26, 16, o.hair) +
      r(57, 34, 26, 7, '#E8A6B0', 3.5) +
      shadedPath('M 41 58 C 37 82 43 92 49 96 L 91 96 C 97 92 103 82 99 58 Z', o.hair)
    );
  }
  return shadedPath('M 41 58 C 37 78 41 88 47 92 L 93 92 C 99 88 103 78 99 58 Z', o.hair);
}

function legsSvg(): string {
  return (
    r(52, 152, 15, 64, '#E2D7C0', 5.5) +
    r(73, 152, 15, 64, '#E2D7C0', 5.5) +
    // Pant cuffs
    r(51, 202, 17, 7, '#D4C7AE', 2.5) +
    r(72, 202, 17, 7, '#D4C7AE', 2.5) +
    // Cozy rounded shoes with sole & highlight
    r(46, 208, 22, 13, '#5B4130', 6) +
    r(72, 208, 22, 13, '#5B4130', 6) +
    line(48, 219, 66, 219, INK, 2.2) +
    line(74, 219, 92, 219, INK, 2.2) +
    el(54, 212, 4, 1.8, '#FFFDF8', 'none', 0).replace('/>', ' opacity="0.28"/>') +
    el(80, 212, 4, 1.8, '#FFFDF8', 'none', 0).replace('/>', ' opacity="0.28"/>')
  );
}

function backArmSvg(o: CharacterArtOptions, skinShade: string): string {
  return (
    r(41, 108, 13, 44, o.outfit, 6.5) +
    r(41, 144, 13, 6, '#FBF7EC', 2.5) +
    c(47.5, 154, 6.8, skinShade, INK, 2.2)
  );
}

function torsoSvg(o: CharacterArtOptions): string {
  const isCook = o.pose === 'cook';
  const collar =
    p('M 58 106 C 64 117 76 117 82 106', 'none', '#FBF7EC', 4.5) +
    p('M 58 106 C 64 117 76 117 82 106', 'none', INK, 1.8);
  const apron = isCook
    ? r(52, 120, 36, 44, '#FBF7EC', 6) +
      r(58, 136, 24, 16, '#E8DEC8', 4) +
      line(56, 108, 56, 122, '#FBF7EC', 3) +
      line(84, 108, 84, 122, '#FBF7EC', 3)
    : r(58, 134, 24, 18, o.outfit, 5) +
      line(60, 140, 80, 140, '#FFFDF8', 1.6).replace('/>', ' opacity="0.4"/>') +
      line(48, 161, 92, 161, '#FFFDF8', 2.2).replace('/>', ' opacity="0.28"/>');

  return (
    shadedPath('M 48 106 C 40 120 40 154 46 166 L 94 166 C 100 154 100 120 92 106 Z', o.outfit) +
    r(59, 92, 22, 19, o.skin, 6) +
    `<rect x="61" y="96" width="18" height="6" rx="2" fill="#2B2521" opacity="0.12"/>` +
    collar +
    apron
  );
}

function frontArmSvg(o: CharacterArtOptions, skinShade: string): string {
  if (o.pose === 'read') {
    return (
      p('M 93 114 C 106 128 110 142 102 150', 'none', INK, 15) +
      p('M 93 114 C 106 128 110 142 102 150', 'none', o.outfit, 10) +
      c(101, 151, 6.5, skinShade, INK, 2.2) +
      // Cozy hardcover open book
      r(84, 138, 36, 24, '#B08A5E', 3.5) +
      r(87, 140, 14, 19, '#FBF7EC', 2) +
      r(103, 140, 14, 19, '#FBF7EC', 2) +
      line(90, 146, 98, 146, INK, 1.5) +
      line(90, 151, 97, 151, INK, 1.5) +
      line(106, 146, 114, 146, INK, 1.5)
    );
  }
  const baseSleeve = r(87, 108, 13, 38, o.outfit, 6.5) + r(87, 140, 13, 6, '#FBF7EC', 2.5);
  if (o.pose === 'cook') {
    return (
      baseSleeve +
      c(94, 149, 6.8, skinShade, INK, 2.2) +
      // Wooden spoon & warm pan
      line(96, 146, 118, 128, '#8C6B4C', 3.6) +
      el(120, 126, 6, 4.5, '#8C6B4C', INK, 2, -25)
    );
  }
  if (o.pose === 'paint') {
    return (
      baseSleeve +
      c(94, 149, 6.8, skinShade, INK, 2.2) +
      // Wooden palette with paint dabs + brush
      el(108, 149, 14, 9.5, '#DFC49B', INK, 2.2) +
      c(103, 147, 2.8, '#E8A6B0', 'none', 0) +
      c(110, 145, 2.8, '#E9C65B', 'none', 0) +
      c(114, 150, 2.8, '#7F9B5C', 'none', 0) +
      line(92, 152, 122, 134, '#8C6B4C', 3.2) +
      c(123, 133, 2.5, '#E8A6B0', INK, 1.2)
    );
  }
  return baseSleeve + c(93.5, 150, 6.8, skinShade, INK, 2.2);
}

function headSvg(o: CharacterArtOptions, includeEyes: boolean, eyesClosed = false): string {
  const skinShade = shade(o.skin);
  const ears = c(40, 68, 5.5, skinShade) + c(100, 68, 5.5, skinShade);
  const hairFront =
    p('M 41 56 C 39 32 56 20 70 20 C 86 20 101 32 99 56 C 92 45 84 39 70 39 C 58 39 48 45 41 56 Z', o.hair) +
    p('M 54 31 C 64 26 78 26 86 32', 'none', '#FFFDF8', 2.4, 'opacity="0.22"') +
    (o.hairStyle === 'long'
      ? p('M 41 56 C 37 74 39 85 43 89 L 51 85 C 45 77 43 68 45 58 Z', o.hair) +
        p('M 99 56 C 103 74 101 85 97 89 L 89 85 C 95 77 97 68 95 58 Z', o.hair)
      : '') +
    (o.hairStyle === 'bun' ? c(70, 22, 6.5, o.hair) : '');

  const faceFeatures =
    // Nose & soft smile
    p('M 69 69 q 2.5 3.5 0 6', 'none', skinShade, 2) +
    p('M 64 80 q 6 4.5 12 0', 'none', INK, 2.3) +
    // Eyebrows
    p('M 55 59 q 5 -2.5 10 0', 'none', INK, 2) +
    p('M 75 59 q 5 -2.5 10 0', 'none', INK, 2) +
    // Rosy cheeks
    `<ellipse cx="53" cy="75" rx="5" ry="2.8" fill="#E89CA8" opacity="0.52"/>` +
    `<ellipse cx="87" cy="75" rx="5" ry="2.8" fill="#E89CA8" opacity="0.52"/>`;

  const eyes = !includeEyes
    ? ''
    : eyesClosed
      ? p('M 55 68 q 5 3.8 10 0 M 75 68 q 5 3.8 10 0', 'none', INK, 2.4)
      : characterEyesOpenSvg();

  return ears + el(70, 66, 30, 34, o.skin) + hairFront + faceFeatures + eyes;
}

function characterEyesOpenSvg(): string {
  return (
    `<ellipse cx="60" cy="67" rx="3.4" ry="3.8" fill="${INK}"/>` +
    `<ellipse cx="80" cy="67" rx="3.4" ry="3.8" fill="${INK}"/>` +
    `<circle cx="61.2" cy="65.6" r="1.3" fill="#FFFDF8"/>` +
    `<circle cx="81.2" cy="65.6" r="1.3" fill="#FFFDF8"/>` +
    `<circle cx="59.2" cy="68.5" r="0.65" fill="#FFFDF8"/>` +
    `<circle cx="79.2" cy="68.5" r="0.65" fill="#FFFDF8"/>`
  );
}

function characterEyesClosedSvg(): string {
  return p('M 55 68 q 5 3.8 10 0 M 75 68 q 5 3.8 10 0', 'none', INK, 2.4);
}

export function characterArt(o: CharacterArtOptions): ArtResult {
  const skinShade = shade(o.skin);
  return {
    w: 140,
    h: 236,
    body:
      `<ellipse cx="70" cy="228" rx="36" ry="6.5" fill="#2B2521" opacity="0.14"/>` +
      hairBackSvg(o) +
      legsSvg() +
      backArmSvg(o, skinShade) +
      torsoSvg(o) +
      frontArmSvg(o, skinShade) +
      headSvg(o, true, false),
  };
}

export function characterRigParts(o: CharacterArtOptions): CharacterRigParts {
  const skinShade = shade(o.skin);
  const w = 140;
  const h = 236;
  return {
    kind: 'adult',
    w,
    h,
    shadow: {
      id: 'shadow',
      w,
      h,
      pivotX: 70,
      pivotY: 228,
      body: `<ellipse cx="70" cy="228" rx="36" ry="6.5" fill="#2B2521" opacity="0.14"/>`,
    },
    hairBack: { id: 'hairBack', w, h, pivotX: 70, pivotY: 64, body: hairBackSvg(o) },
    legs: { id: 'legs', w, h, pivotX: 70, pivotY: 162, body: legsSvg() },
    backArm: { id: 'backArm', w, h, pivotX: 48, pivotY: 112, body: backArmSvg(o, skinShade) },
    body: { id: 'body', w, h, pivotX: 70, pivotY: 162, body: torsoSvg(o) },
    frontArm: { id: 'frontArm', w, h, pivotX: 94, pivotY: 112, body: frontArmSvg(o, skinShade) },
    head: { id: 'head', w, h, pivotX: 70, pivotY: 96, body: headSvg(o, false) },
    eyesOpen: { id: 'eyesOpen', w, h, pivotX: 70, pivotY: 96, body: characterEyesOpenSvg() },
    eyesClosed: { id: 'eyesClosed', w, h, pivotX: 70, pivotY: 96, body: characterEyesClosedSvg() },
  };
}

export function characterSvg(o: CharacterArtOptions): string {
  return svgDoc(characterArt(o));
}

export function babyArt(o: { skin: string; outfit: string; hair: string }): ArtResult {
  return {
    w: 100,
    h: 120,
    body:
      `<ellipse cx="50" cy="114" rx="28" ry="5.5" fill="#2B2521" opacity="0.14"/>` +
      r(34, 78, 12, 30, o.skin, 5.5) +
      r(54, 78, 12, 30, o.skin, 5.5) +
      r(30, 94, 18, 11, '#E9C65B', 5) +
      r(52, 94, 18, 11, '#E9C65B', 5) +
      shadedPath('M 31 68 C 27 78 31 94 40 99 L 60 99 C 69 94 73 78 69 68 Z', o.outfit) +
      r(41, 76, 18, 12, '#FBF7EC', 4) +
      c(50, 52, 22, o.skin) +
      p('M 28 50 C 30 29 70 29 72 50 C 64 42 56 38 50 38 C 44 38 36 42 28 50 Z', o.hair) +
      `<ellipse cx="42" cy="54" rx="2.8" ry="3.1" fill="${INK}"/>` +
      `<ellipse cx="58" cy="54" rx="2.8" ry="3.1" fill="${INK}"/>` +
      `<circle cx="43" cy="52.8" r="1.1" fill="#FFFDF8"/>` +
      `<circle cx="59" cy="52.8" r="1.1" fill="#FFFDF8"/>` +
      p('M 46 62 q 4 4 8 0', 'none', INK, 2.2) +
      `<ellipse cx="37" cy="60" rx="4.2" ry="2.4" fill="#E89CA8" opacity="0.58"/>` +
      `<ellipse cx="63" cy="60" rx="4.2" ry="2.4" fill="#E89CA8" opacity="0.58"/>` +
      p('M 34 45 q 4 -8 12 -8 M 66 45 q -4 -8 -12 -8', 'none', o.hair, 2.8),
  };
}

export function babyRigParts(o: { skin: string; outfit: string; hair: string }): CharacterRigParts {
  const w = 100;
  const h = 120;
  const bodySvg =
    r(34, 78, 12, 30, o.skin, 5.5) +
    r(54, 78, 12, 30, o.skin, 5.5) +
    r(30, 94, 18, 11, '#E9C65B', 5) +
    r(52, 94, 18, 11, '#E9C65B', 5) +
    shadedPath('M 31 68 C 27 78 31 94 40 99 L 60 99 C 69 94 73 78 69 68 Z', o.outfit) +
    r(41, 76, 18, 12, '#FBF7EC', 4);
  const headPart =
    c(50, 52, 22, o.skin) +
    p('M 28 50 C 30 29 70 29 72 50 C 64 42 56 38 50 38 C 44 38 36 42 28 50 Z', o.hair) +
    p('M 46 62 q 4 4 8 0', 'none', INK, 2.2) +
    `<ellipse cx="37" cy="60" rx="4.2" ry="2.4" fill="#E89CA8" opacity="0.58"/>` +
    `<ellipse cx="63" cy="60" rx="4.2" ry="2.4" fill="#E89CA8" opacity="0.58"/>` +
    p('M 34 45 q 4 -8 12 -8 M 66 45 q -4 -8 -12 -8', 'none', o.hair, 2.8);
  const eyesOpen =
    `<ellipse cx="42" cy="54" rx="2.8" ry="3.1" fill="${INK}"/>` +
    `<ellipse cx="58" cy="54" rx="2.8" ry="3.1" fill="${INK}"/>` +
    `<circle cx="43" cy="52.8" r="1.1" fill="#FFFDF8"/>` +
    `<circle cx="59" cy="52.8" r="1.1" fill="#FFFDF8"/>`;
  const eyesClosed = p('M 38 54 q 4 3 8 0 M 54 54 q 4 3 8 0', 'none', INK, 2.2);

  return {
    kind: 'baby',
    w,
    h,
    shadow: {
      id: 'shadow',
      w,
      h,
      pivotX: 50,
      pivotY: 114,
      body: `<ellipse cx="50" cy="114" rx="28" ry="5.5" fill="#2B2521" opacity="0.14"/>`,
    },
    body: { id: 'body', w, h, pivotX: 50, pivotY: 98, body: bodySvg },
    head: { id: 'head', w, h, pivotX: 50, pivotY: 68, body: headPart },
    eyesOpen: { id: 'eyesOpen', w, h, pivotX: 50, pivotY: 68, body: eyesOpen },
    eyesClosed: { id: 'eyesClosed', w, h, pivotX: 50, pivotY: 68, body: eyesClosed },
  };
}

export function babySvg(o: { skin: string; outfit: string; hair: string }): string {
  return svgDoc(babyArt(o));
}
