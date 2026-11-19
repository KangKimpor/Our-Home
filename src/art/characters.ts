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
      shadedPath('M 39 54 C 31 82 34 134 45 148 L 95 148 C 106 134 109 82 101 54 Z', o.hair, INK, 2.9) +
      p('M 45 72 C 42 98 44 122 49 138', 'none', INK, 1.8, 'opacity="0.35"') +
      p('M 95 72 C 98 98 96 122 91 138', 'none', INK, 1.8, 'opacity="0.35"')
    );
  }
  if (o.hairStyle === 'bun') {
    return (
      c(70, 22, 14.5, o.hair, INK, 2.9) +
      r(57, 31, 26, 7, '#E8A6B0', 3.5, INK, 2.4) +
      shadedPath('M 41 58 C 37 82 43 92 49 95 L 91 95 C 97 92 103 82 99 58 Z', o.hair, INK, 2.9)
    );
  }
  return shadedPath('M 42 56 C 38 74 42 84 48 88 L 92 88 C 98 84 102 74 98 56 Z', o.hair, INK, 2.9);
}

function legsSvg(): string {
  return (
    // Relaxed cozy pants/shorts + ankles + house slippers (matching IMG_2703)
    r(52, 152, 15, 58, '#E7E0D0', 5.5, INK, 2.7) +
    r(73, 152, 15, 58, '#E7E0D0', 5.5, INK, 2.7) +
    // Pant cuffs
    r(51, 198, 17, 7, '#D8CEBA', 2.5, INK, 2.3) +
    r(72, 198, 17, 7, '#D8CEBA', 2.5, INK, 2.3) +
    // Cozy rounded house slippers
    r(45, 206, 23, 14, '#7E868C', 7, INK, 2.7) +
    r(72, 206, 23, 14, '#7E868C', 7, INK, 2.7) +
    line(47, 218, 66, 218, INK, 2.4) +
    line(74, 218, 93, 218, INK, 2.4) +
    el(54, 210, 4.5, 2, '#FFFDF8', 'none', 0).replace('/>', ' opacity="0.32"/>') +
    el(81, 210, 4.5, 2, '#FFFDF8', 'none', 0).replace('/>', ' opacity="0.32"/>')
  );
}

function backArmSvg(o: CharacterArtOptions, skinShade: string): string {
  return (
    r(40, 108, 13, 38, o.outfit, 6.5, INK, 2.7) +
    r(40, 140, 13, 6, '#FBF7EC', 2.5, INK, 2.3) +
    c(46.5, 151, 6.8, skinShade, INK, 2.4)
  );
}

function torsoSvg(o: CharacterArtOptions): string {
  const isCook = o.pose === 'cook';
  const collar =
    p('M 57 106 C 63 116 77 116 83 106', 'none', '#FBF7EC', 4.5) +
    p('M 57 106 C 63 116 77 116 83 106', 'none', INK, 2);
  const apron = isCook
    ? r(52, 120, 36, 44, '#FBF7EC', 6, INK, 2.6) +
      r(58, 136, 24, 16, '#E8DEC8', 4, INK, 2.2) +
      line(56, 108, 56, 122, '#FBF7EC', 3) +
      line(84, 108, 84, 122, '#FBF7EC', 3)
    : r(58, 134, 24, 16, o.outfit, 5, INK, 2.2) +
      line(60, 140, 80, 140, '#FFFDF8', 1.5).replace('/>', ' opacity="0.4"/>') +
      line(48, 160, 92, 160, INK, 1.8).replace('/>', ' opacity="0.22"/>');

  return (
    shadedPath('M 48 106 C 41 120 41 153 46 165 L 94 165 C 99 153 99 120 92 106 Z', o.outfit, INK, 2.9) +
    r(60, 92, 20, 18, o.skin, 6, INK, 2.6) +
    `<rect x="62" y="96" width="16" height="5.5" rx="2" fill="#2B2521" opacity="0.12"/>` +
    collar +
    apron
  );
}

function frontArmSvg(o: CharacterArtOptions, skinShade: string): string {
  if (o.pose === 'read') {
    return (
      p('M 93 114 C 106 128 110 142 102 150', 'none', INK, 15) +
      p('M 93 114 C 106 128 110 142 102 150', 'none', o.outfit, 10) +
      c(101, 151, 6.5, skinShade, INK, 2.4) +
      // Cozy hardcover open book
      r(84, 138, 36, 24, '#B08A5E', 3.5, INK, 2.6) +
      r(87, 140, 14, 19, '#FBF7EC', 2, INK, 2) +
      r(103, 140, 14, 19, '#FBF7EC', 2, INK, 2) +
      line(90, 146, 98, 146, INK, 1.5) +
      line(90, 151, 97, 151, INK, 1.5) +
      line(106, 146, 114, 146, INK, 1.5)
    );
  }
  const baseSleeve = r(87, 108, 13, 38, o.outfit, 6.5, INK, 2.7) + r(87, 140, 13, 6, '#FBF7EC', 2.5, INK, 2.3);
  if (o.pose === 'cook') {
    return (
      baseSleeve +
      c(94, 149, 6.8, skinShade, INK, 2.4) +
      // Wooden spoon
      line(96, 146, 118, 128, '#8C6B4C', 3.6) +
      el(120, 126, 6, 4.5, '#8C6B4C', INK, 2.2, -25)
    );
  }
  if (o.pose === 'paint') {
    return (
      baseSleeve +
      c(94, 149, 6.8, skinShade, INK, 2.4) +
      // Wooden palette with paint dabs + brush
      el(108, 149, 14, 9.5, '#DFC49B', INK, 2.4) +
      c(103, 147, 2.8, '#E8A6B0', 'none', 0) +
      c(110, 145, 2.8, '#E9C65B', 'none', 0) +
      c(114, 150, 2.8, '#7F9B5C', 'none', 0) +
      line(92, 152, 122, 134, '#8C6B4C', 3.2) +
      c(123, 133, 2.5, '#E8A6B0', INK, 1.2)
    );
  }
  return baseSleeve + c(93.5, 150, 6.8, skinShade, INK, 2.4);
}

function headSvg(o: CharacterArtOptions, includeEyes: boolean, eyesClosed = false): string {
  const skinShade = shade(o.skin);
  const ears = c(44.5, 68, 4.6, skinShade, INK, 2.5) + c(95.5, 68, 4.6, skinShade, INK, 2.5);
  const bangs =
    p('M 45 57 C 44 34 57 24 70 24 C 83 24 96 34 95 57 C 89 47 81 43 70 43 C 59 43 51 47 45 57 Z', o.hair, INK, 2.8) +
    line(57, 42, 56, 51, INK, 1.7) +
    line(67, 41, 67, 50, INK, 1.7) +
    line(77, 41, 78, 50, INK, 1.7) +
    (o.hairStyle === 'long'
      ? p('M 45 56 C 40 74 42 86 46 90 L 52 84 C 48 77 47 68 48 58 Z', o.hair, INK, 2.6) +
        p('M 95 56 C 100 74 98 86 94 90 L 88 84 C 92 77 93 68 92 58 Z', o.hair, INK, 2.6)
      : '') +
    (o.hairStyle === 'bun' ? c(70, 23, 6.2, o.hair, INK, 2.4) : '');

  const faceFeatures =
    p('M 69 68 q 1.8 2.8 0 4.8', 'none', skinShade, 2) +
    p('M 65 78 q 5 3.6 10 0', 'none', INK, 2.3) +
    p('M 57 59 q 4.5 -1.8 9 0', 'none', INK, 1.9) +
    p('M 74 59 q 4.5 -1.8 9 0', 'none', INK, 1.9) +
    `<ellipse cx="54" cy="74" rx="4.4" ry="2.2" fill="#E89CA8" opacity="0.48"/>` +
    `<ellipse cx="86" cy="74" rx="4.4" ry="2.2" fill="#E89CA8" opacity="0.48"/>`;

  const eyes = !includeEyes
    ? ''
    : eyesClosed
      ? characterEyesClosedSvg()
      : characterEyesOpenSvg();

  return ears + el(70, 67, 25, 27.5, o.skin, INK, 2.8) + bangs + faceFeatures + eyes;
}

function characterEyesOpenSvg(): string {
  return (
    `<ellipse cx="61" cy="66" rx="2.6" ry="3.1" fill="${INK}"/>` +
    `<ellipse cx="79" cy="66" rx="2.6" ry="3.1" fill="${INK}"/>` +
    `<circle cx="62" cy="64.9" r="1.05" fill="#FFFDF8"/>` +
    `<circle cx="80" cy="64.9" r="1.05" fill="#FFFDF8"/>`
  );
}

function characterEyesClosedSvg(): string {
  return p('M 57 67 q 4 3.2 8 0 M 75 67 q 4 3.2 8 0', 'none', INK, 2.4);
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

function babyBodySvg(o: { skin: string; outfit: string; hair: string }): string {
  // Cozy onesie romper + cute stubby arms + bear-ear booties (inspired by IMG_2703.jpeg)
  return (
    r(26, 70, 10, 20, o.outfit, 5, INK, 2.5) +
    c(29, 91, 4.8, o.skin, INK, 2.3) +
    r(64, 70, 10, 20, o.outfit, 5, INK, 2.5) +
    c(71, 91, 4.8, o.skin, INK, 2.3) +
    r(35, 86, 11, 20, o.outfit, 5, INK, 2.5) +
    r(54, 86, 11, 20, o.outfit, 5, INK, 2.5) +
    r(31, 98, 17, 10, '#E9C65B', 5, INK, 2.4) +
    r(52, 98, 17, 10, '#E9C65B', 5, INK, 2.4) +
    shadedPath('M 32 67 C 29 77 32 92 40 97 L 60 97 C 68 92 71 77 68 67 Z', o.outfit, INK, 2.8) +
    r(42, 74, 16, 11, '#FBF7EC', 4, INK, 2.2)
  );
}

function babyHeadSvg(o: { skin: string; outfit: string; hair: string }, includeEyes: boolean): string {
  // Adorable cozy bear-eared hood / soft hair tuft inspired by IMG_2703.jpeg baby
  const hood =
    c(33, 35, 7, o.outfit, INK, 2.5) +
    c(67, 35, 7, o.outfit, INK, 2.5) +
    c(33, 35, 3, '#FBF7EC', 'none', 0) +
    c(67, 35, 3, '#FBF7EC', 'none', 0) +
    p('M 27 52 C 27 28 73 28 73 52 C 66 41 58 38 50 38 C 42 38 34 41 27 52 Z', o.outfit, INK, 2.7) +
    p('M 42 40 q 4 -6 10 -4', 'none', o.hair, 3.2);
  const eyes = includeEyes
    ? `<ellipse cx="42" cy="54" rx="2.7" ry="3" fill="${INK}"/>` +
      `<ellipse cx="58" cy="54" rx="2.7" ry="3" fill="${INK}"/>` +
      `<circle cx="43" cy="52.8" r="1" fill="#FFFDF8"/>` +
      `<circle cx="59" cy="52.8" r="1" fill="#FFFDF8"/>`
    : '';
  return (
    c(50, 52, 22, o.skin, INK, 2.8) +
    hood +
    p('M 46 62 q 4 4 8 0', 'none', INK, 2.3) +
    `<ellipse cx="37" cy="59.5" rx="4.2" ry="2.4" fill="#E89CA8" opacity="0.58"/>` +
    `<ellipse cx="63" cy="59.5" rx="4.2" ry="2.4" fill="#E89CA8" opacity="0.58"/>` +
    eyes
  );
}

export function babyArt(o: { skin: string; outfit: string; hair: string }): ArtResult {
  return {
    w: 100,
    h: 120,
    body:
      `<ellipse cx="50" cy="114" rx="28" ry="5.5" fill="#2B2521" opacity="0.14"/>` +
      babyBodySvg(o) +
      babyHeadSvg(o, true),
  };
}

export function babyRigParts(o: { skin: string; outfit: string; hair: string }): CharacterRigParts {
  const w = 100;
  const h = 120;
  const eyesOpen =
    `<ellipse cx="42" cy="54" rx="2.7" ry="3" fill="${INK}"/>` +
    `<ellipse cx="58" cy="54" rx="2.7" ry="3" fill="${INK}"/>` +
    `<circle cx="43" cy="52.8" r="1" fill="#FFFDF8"/>` +
    `<circle cx="59" cy="52.8" r="1" fill="#FFFDF8"/>`;
  const eyesClosed = p('M 38 54 q 4 3 8 0 M 54 54 q 4 3 8 0', 'none', INK, 2.3);

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
    body: { id: 'body', w, h, pivotX: 50, pivotY: 98, body: babyBodySvg(o) },
    head: { id: 'head', w, h, pivotX: 50, pivotY: 68, body: babyHeadSvg(o, false) },
    eyesOpen: { id: 'eyesOpen', w, h, pivotX: 50, pivotY: 68, body: eyesOpen },
    eyesClosed: { id: 'eyesClosed', w, h, pivotX: 50, pivotY: 68, body: eyesClosed },
  };
}

export function babySvg(o: { skin: string; outfit: string; hair: string }): string {
  return svgDoc(babyArt(o));
}
