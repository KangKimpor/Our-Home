/** Original adult and baby character art, customisable by skin/hair/outfit. */

import { INK, c, el, line, p, r, type ArtResult } from './svg';

export interface CharacterArtOptions {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun';
  outfit: string;
  pose?: 'idle' | 'read' | 'cook' | 'paint';
  scale?: number;
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

export function characterArt(o: CharacterArtOptions): ArtResult {
  const skinShade = shade(o.skin);
  const hairBack =
    o.hairStyle === 'long'
      ? p('M 40 54 C 30 80 34 136 46 150 L 92 150 C 104 136 108 80 98 54 Z', o.hair)
      : o.hairStyle === 'bun'
        ? c(70, 34, 16, o.hair) + p('M 42 58 C 38 82 44 92 50 96 L 92 96 C 98 92 104 82 100 58 Z', o.hair)
        : p('M 42 58 C 38 78 42 88 48 92 L 94 92 C 100 88 104 78 100 58 Z', o.hair);

  const poseArm =
    o.pose === 'read'
      ? p('M 94 118 C 108 126 112 142 104 150', 'none', o.outfit, 10) + r(86, 138, 34, 22, '#FBF7EC', 3)
      : o.pose === 'cook'
        ? p('M 94 120 C 112 124 118 136 112 146', 'none', o.outfit, 10) + el(116, 146, 13, 6, '#9AA6A8')
        : o.pose === 'paint'
          ? p('M 94 120 C 110 126 114 138 108 144', 'none', o.outfit, 10) + line(104, 138, 120, 152, '#B08A5E', 4)
          : p('M 94 118 C 102 130 100 144 94 150', 'none', o.outfit, 10);

  return {
    w: 140,
    h: 236,
    body:
      el(70, 228, 34, 6, INK, 'none', 0).replace('/>', ' opacity="0.12"/>') +
      hairBack +
      r(52, 154, 14, 64, '#E4D9C2', 5) +
      r(76, 154, 14, 64, '#E4D9C2', 5) +
      r(48, 208, 20, 12, '#5B4130', 5) +
      r(74, 208, 20, 12, '#5B4130', 5) +
      p('M 48 106 C 40 120 40 154 46 166 L 96 166 C 102 154 102 120 94 106 Z', o.outfit) +
      r(42, 108, 12, 48, o.outfit, 6) +
      r(88, 108, 12, 48, o.outfit, 6) +
      poseArm +
      c(48, 150, 7, skinShade, 'none', 0) +
      c(92, 150, 7, skinShade, 'none', 0) +
      r(60, 88, 20, 20, o.skin, 6) +
      el(70, 66, 30, 34, o.skin) +
      p('M 42 56 C 40 34 56 22 70 22 C 86 22 100 34 98 56 C 92 46 84 40 70 40 C 58 40 48 46 42 56 Z', o.hair) +
      (o.hairStyle === 'long' ? p('M 42 56 C 38 74 40 84 44 88 L 52 84 C 46 76 44 68 46 58 Z', o.hair) : '') +
      (o.hairStyle === 'long' ? p('M 98 56 C 102 74 100 84 96 88 L 88 84 C 94 76 96 68 94 58 Z', o.hair) : '') +
      c(61, 68, 2.4, INK, 'none', 0) +
      c(79, 68, 2.4, INK, 'none', 0) +
      p('M 64 78 q 6 5 12 0', 'none', INK, 2.4) +
      c(55, 76, 4, '#E8A6B0', 'none', 0).replace('/>', ' opacity="0.5"/>') +
      c(85, 76, 4, '#E8A6B0', 'none', 0).replace('/>', ' opacity="0.5"/>') +
      (o.hairStyle === 'bun' ? c(70, 30, 5, o.hair) : '') +
      r(64, 100, 12, 8, o.skin, 3),
  };
}

export function characterSvg(o: CharacterArtOptions): string {
  const art = characterArt(o);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${art.w}" height="${art.h}" viewBox="0 0 ${art.w} ${art.h}">${art.body}</svg>`;
}

export function babyArt(o: { skin: string; outfit: string; hair: string }): ArtResult {
  return {
    w: 100,
    h: 120,
    body:
      el(50, 114, 26, 5, INK, 'none', 0).replace('/>', ' opacity="0.12"/>') +
      r(34, 78, 12, 30, o.skin, 5) +
      r(54, 78, 12, 30, o.skin, 5) +
      r(30, 92, 18, 10, '#E9C65B', 4) +
      r(52, 92, 18, 10, '#E9C65B', 4) +
      p('M 32 68 C 28 78 32 94 40 98 L 60 98 C 68 94 72 78 68 68 Z', o.outfit) +
      c(50, 52, 22, o.skin) +
      p('M 28 50 C 30 30 70 30 72 50 C 64 42 56 38 50 38 C 44 38 36 42 28 50 Z', o.hair) +
      c(42, 54, 2.4, INK, 'none', 0) +
      c(58, 54, 2.4, INK, 'none', 0) +
      p('M 46 62 q 4 4 8 0', 'none', INK, 2.2) +
      c(37, 60, 4, '#E8A6B0', 'none', 0).replace('/>', ' opacity="0.55"/>') +
      c(63, 60, 4, '#E8A6B0', 'none', 0).replace('/>', ' opacity="0.55"/>') +
      p('M 34 46 q 4 -8 12 -8 M 66 46 q -4 -8 -12 -8', 'none', o.hair, 3),
  };
}

export function babySvg(o: { skin: string; outfit: string; hair: string }): string {
  const art = babyArt(o);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${art.w}" height="${art.h}" viewBox="0 0 ${art.w} ${art.h}">${art.body}</svg>`;
}
