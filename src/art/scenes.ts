/** Storybook scene illustrations (420×300) and Moment photo-card lookup. */

import { getMomentPhotoCardUrl } from './assetPack';
import { animalArt } from './animals';
import { characterArt, babyArt } from './characters';
import { INK, c, el, line, p, r, svgDoc } from './svg';

export const SCENE_W = 420;
export const SCENE_H = 300;

export function momentPhotoUrl(momentId: string): string | null {
  return getMomentPhotoCardUrl(momentId);
}

function animalGroup(
  species: string,
  coat: string,
  x: number,
  y: number,
  scale = 1,
  pose: 'idle' | 'walk' | 'sleep' | 'special' = 'idle',
  flip = false,
): string {
  const art = animalArt({ species, coat, pose });
  return `<g transform="translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})">${art.body}</g>`;
}

function wall(color = '#F5F0E3', floor = '#D9B98E', top = 208): string {
  const planks = [top + 22, top + 46, top + 70]
    .filter((y) => y < SCENE_H - 6)
    .map((y) => line(0, y, SCENE_W, y, '#BA9668', 1.4))
    .join('');
  return (
    r(0, 0, SCENE_W, SCENE_H, color, 0, INK, 4) +
    r(0, top, SCENE_W, SCENE_H - top, floor, 0, INK, 4) +
    r(0, top - 10, SCENE_W, 10, '#E8DCC6', 0, INK, 2) +
    planks +
    line(0, top, SCENE_W, top, INK, 3)
  );
}

function windowFrame(x: number, y: number, w: number, h: number, night = false): string {
  return (
    r(x - 6, y - 6, w + 12, h + 12, '#B68E64', 8) +
    r(x, y, w, h, night ? '#384C6E' : '#C3DCE6', 4) +
    c(x + w * 0.72, y + h * 0.25, 10, night ? '#FBF7EC' : '#F3D275') +
    p(
      `M ${x + 4} ${y + h - 6} C ${x + w * 0.3} ${y + h * 0.56} ${x + w * 0.6} ${y + h * 0.62} ${x + w - 4} ${y + h - 6}`,
      night ? '#2A364B' : '#85A669',
      'none',
      0,
    ) +
    line(x + w / 2, y + 2, x + w / 2, y + h - 2, '#B68E64', 5) +
    line(x + w / 2, y + 2, x + w / 2, y + h - 2, INK, 1.5) +
    line(x + 2, y + h / 2, x + w - 2, y + h / 2, '#B68E64', 5) +
    line(x + 2, y + h / 2, x + w - 2, y + h / 2, INK, 1.5) +
    r(x - 10, y + h + 2, w + 20, 9, '#C7A074', 3)
  );
}

function sunOrMoon(x: number, y: number, night = false): string {
  return night ? c(x, y, 13, '#FBF7EC') + c(x + 6, y - 4, 10, '#384C6E', 'none', 0) : c(x, y, 15, '#F2CE6B');
}

function heart(x: number, y: number, s = 1, fill = '#E8A6B0'): string {
  return p(
    `M ${x} ${y + 8 * s} C ${x - 12 * s} ${y - 2 * s} ${x - 10 * s} ${y - 14 * s} ${x} ${y - 7 * s} C ${x + 10 * s} ${y - 14 * s} ${x + 12 * s} ${y - 2 * s} ${x} ${y + 8 * s} Z`,
    fill,
  );
}

function note(x: number, y: number): string {
  return el(x, y, 5.5, 4, INK, 'none', 0) + line(x + 5, y, x + 5, y - 18, INK, 2) + p(`M ${x + 5} ${y - 18} q 9 2 9 9`, 'none', INK, 2);
}

const SCENES: Record<string, () => string> = {
  truck: () =>
    wall('#DCEAF0', '#9FB97C', 194) +
    sunOrMoon(354, 52) +
    // Distant cozy cottage & clouds
    el(88, 56, 32, 12, '#FFFDF7') +
    el(246, 44, 38, 13, '#FFFDF7') +
    p('M 30 198 L 30 132 L 132 132 L 148 164 L 148 198 Z', '#FBF7EC') +
    p('M 24 132 L 82 94 L 140 132 Z', '#D65B4A') +
    r(68, 154, 28, 28, '#9CC0D4', 3) +
    // Yellow moving van & stacked cardboard boxes
    r(156, 144, 128, 56, '#EEC35A', 7) +
    p('M 284 200 L 284 146 L 326 128 L 348 148 L 348 200 Z', '#EEC35A') +
    r(292, 142, 34, 22, '#CFE3EC', 4) +
    c(196, 206, 16, '#3B3632') +
    c(196, 206, 7, '#B8C1C4') +
    c(312, 206, 16, '#3B3632') +
    c(312, 206, 7, '#B8C1C4') +
    r(166, 114, 36, 26, '#C9A272', 4) +
    r(206, 122, 32, 18, '#D7B284', 3) +
    animalGroup('cat', 'ginger', 120, 182, 0.75, 'idle') +
    heart(146, 108, 0.7),

  unboxing: () =>
    wall('#F5EFE2', '#CFA97A', 208) +
    windowFrame(42, 42, 120, 96) +
    el(248, 240, 124, 24, '#A9BE8C') +
    r(186, 142, 74, 58, '#C9A272', 5) +
    p('M 186 142 L 172 126 L 222 126 L 224 142 Z', '#DFBA8B') +
    p('M 260 142 L 274 126 L 224 126 L 224 142 Z', '#B88F5E') +
    r(276, 162, 54, 42, '#D7B284', 4) +
    animalGroup('cat', 'calico', 214, 146, 0.68, 'special') +
    heart(248, 86, 0.75),

  sofaNap: () =>
    wall('#F5F0E3', '#C9A274', 198) +
    windowFrame(38, 42, 130, 100) +
    el(266, 232, 118, 24, '#C9D8AF') +
    r(190, 128, 198, 68, '#9CB57D', 18) +
    r(204, 140, 82, 34, '#C4D6A8', 12) +
    r(292, 140, 82, 34, '#C4D6A8', 12) +
    r(202, 188, 174, 14, '#8C6B4C', 6) +
    r(214, 202, 10, 18, '#5B4130', 3) +
    r(360, 202, 10, 18, '#5B4130', 3) +
    animalGroup('cat', 'white', 274, 178, 0.82, 'sleep') +
    // Yarn ball & fish toy on rug
    c(150, 234, 13, '#E8A6B0') +
    p('M 138 238 C 122 246 110 236 96 244', 'none', '#D67C8A', 2.4) +
    heart(338, 126, 0.7) +
    heart(92, 156, 0.6, '#E9C65B'),

  visitorTea: () =>
    wall('#F3EBDC', '#D8B78A', 200) +
    windowFrame(38, 40, 140, 110) +
    r(206, 128, 176, 70, '#B08A5E', 8) +
    r(220, 196, 10, 40, '#5B4130', 3) +
    r(356, 196, 10, 40, '#5B4130', 3) +
    el(260, 142, 22, 7, '#FBF7EC') +
    el(260, 138, 16, 4, '#C9A97C') +
    el(330, 144, 20, 6, '#FBF7EC') +
    el(330, 140, 14, 4, '#C9A97C') +
    animalGroup('duck', 'cream', 150, 178, 0.7, 'idle') +
    animalGroup('bird', 'brown', 292, 130, 0.45, 'idle', true) +
    heart(242, 104, 0.6) +
    sunOrMoon(356, 50),

  harvest: () =>
    wall('#E7EBD9', '#9FB97C', 188) +
    sunOrMoon(348, 52) +
    p('M 30 200 C 30 150 120 150 120 200 Z', '#7F9B5C') +
    r(150, 146, 110, 62, '#C9A97C', 8) +
    line(150, 164, 260, 164, '#8C6B4C', 3) +
    line(150, 184, 260, 184, '#8C6B4C', 3) +
    r(172, 118, 16, 36, '#C97A4A', 6) +
    r(196, 108, 18, 42, '#C97A4A', 6) +
    r(224, 122, 14, 34, '#C97A4A', 6) +
    c(180, 116, 8, '#6E8A55') +
    c(205, 106, 8, '#6E8A55') +
    c(231, 120, 7, '#6E8A55') +
    animalGroup('rabbit', 'white', 276, 174, 0.7, 'special') +
    heart(322, 128, 0.7) +
    r(42, 214, 340, 12, '#84A06E', 3),

  kitchenPot: () =>
    wall('#EAEEDB', '#DDD0B2', 200) +
    r(80, 118, 200, 82, '#88A7C8', 10) +
    r(96, 134, 168, 46, '#4A4A46', 6) +
    r(250, 76, 54, 60, '#C7CFD4', 4) +
    r(94, 200, 12, 40, '#5B4130', 3) +
    r(254, 200, 12, 40, '#5B4130', 3) +
    el(156, 124, 40, 16, '#C4483B') +
    r(120, 108, 72, 16, '#C4483B', 6) +
    el(156, 108, 34, 9, '#8C6B4C') +
    p('M 156 92 q -8 -12 0 -22 q 8 -12 0 -24', 'none', '#FBF7EC', 4) +
    p('M 176 96 q -6 -10 0 -18 q 6 -10 0 -20', 'none', '#FBF7EC', 3) +
    animalGroup('cat', 'charcoal', 300, 188, 0.75, 'special') +
    r(40, 224, 340, 12, '#C9B794', 3),

  sink: () =>
    wall('#DCE7EA', '#C4D6DC', 216) +
    // Wooden vanity & white basin matching IMG_2704
    r(116, 132, 188, 90, '#A57E56', 8) +
    r(108, 124, 204, 18, '#FBF7EC', 8) +
    r(142, 136, 136, 18, '#DFEFF4', 8) +
    r(132, 158, 74, 54, '#8A6744', 4) +
    r(214, 158, 74, 54, '#8A6744', 4) +
    line(288, 128, 288, 86, '#9AA6A8', 6) +
    p('M 288 86 C 288 72 268 72 268 86', 'none', '#9AA6A8', 6) +
    animalGroup('cat', 'white', 206, 178, 0.78, 'sleep') +
    c(296, 114, 4, '#BFD8E3') +
    c(280, 120, 3, '#BFD8E3') +
    c(302, 126, 3, '#BFD8E3'),

  drawer: () =>
    wall('#F0E3DC', '#CCA77A', 208) +
    r(96, 86, 230, 150, '#8C6B4C', 10) +
    r(112, 102, 198, 38, '#FBF7EC', 4) +
    r(112, 148, 198, 38, '#FBF7EC', 4) +
    r(112, 178, 198, 46, '#E4D9C2', 4) +
    c(210, 121, 4, '#5B4130') +
    c(210, 167, 4, '#5B4130') +
    p('M 112 178 L 94 210 L 328 210 L 310 178 Z', '#C9A97C') +
    animalGroup('cat', 'ginger', 190, 212, 0.72, 'sleep') +
    heart(338, 116, 0.6) +
    r(40, 236, 340, 10, '#B08A5E', 3),

  snackBag: () =>
    wall('#E7EBD9', '#D9C9A8', 206) +
    r(72, 128, 278, 24, '#B08A5E', 5) +
    r(88, 152, 240, 64, '#F3EFE0', 4) +
    r(88, 152, 240, 10, '#9AA6A8', 2) +
    r(94, 196, 10, 42, '#5B4130', 3) +
    r(312, 196, 10, 42, '#5B4130', 3) +
    p('M 186 118 L 236 118 L 230 68 L 192 68 Z', '#E9C65B') +
    p('M 186 118 L 236 118 L 230 68 L 192 68 Z', 'none', INK, 3) +
    c(210, 92, 11, '#FBF7EC') +
    animalGroup('cat', 'charcoal', 176, 122, 0.6, 'special') +
    heart(272, 92, 0.6) +
    r(36, 240, 350, 10, '#C9B794', 3),

  windowOwl: () =>
    r(0, 0, SCENE_W, SCENE_H, '#2E3A50', 0, INK, 4) +
    r(40, 28, 340, 240, '#3F5578', 8) +
    sunOrMoon(330, 62, true) +
    c(90, 60, 2, '#FBF7EC') +
    c(140, 42, 1.6, '#FBF7EC') +
    c(300, 100, 1.6, '#FBF7EC') +
    c(230, 48, 2, '#FBF7EC') +
    line(210, 32, 210, 264, '#FBF7EC', 6) +
    line(44, 150, 376, 150, '#FBF7EC', 6) +
    r(40, 264, 340, 10, '#C9A97C', 3) +
    animalGroup('owl', 'brown', 156, 252, 1.1, 'idle') +
    heart(262, 200, 0.7, '#E8A6B0') +
    animalGroup('cat', 'grey', 42, 280, 0.4, 'idle'),

  gardenNap: () =>
    r(0, 0, SCENE_W, SCENE_H, '#CDE5EE', 0, INK, 4) +
    sunOrMoon(342, 54) +
    p('M 0 130 C 90 110 160 150 240 128 C 320 108 380 130 420 120 L 420 300 L 0 300 Z', '#9FB97C') +
    p('M 0 180 C 100 160 180 196 280 176 C 340 164 390 180 420 172 L 420 300 L 0 300 Z', '#8FB07A') +
    [40, 90, 340, 380].map((x) => line(x, 210, x, 190, '#6E8A55', 3) + c(x, 186, 7, x % 2 ? '#E8A6B0' : '#E9C65B')).join('') +
    animalGroup('cat', 'ginger', 160, 258, 0.95, 'sleep') +
    animalGroup('butterfly', 'golden', 300, 190, 0.5, 'idle') +
    heart(260, 160, 0.7),

  piano: () =>
    wall('#F3EFE0', '#C39A6B', 200) +
    r(74, 84, 214, 86, '#8C6B4C', 8) +
    r(88, 94, 186, 52, '#5B4130', 4) +
    r(74, 170, 214, 18, '#FBF7EC', 3) +
    Array.from({ length: 12 }, (_, i) => line(86 + i * 16, 170, 86 + i * 16, 188, INK, 2)).join('') +
    animalGroup('cat', 'charcoal', 284, 166, 0.55, 'special') +
    note(310, 92) +
    note(338, 76) +
    note(360, 112) +
    r(30, 218, 360, 12, '#B08A5E', 3),

  books: () =>
    wall('#F2EADB', '#CCA77A', 206) +
    r(118, 170, 190, 18, '#C4483B', 4) +
    r(130, 152, 168, 18, '#8EA7C6', 4) +
    r(110, 134, 196, 18, '#7F9B5C', 4) +
    r(142, 116, 150, 18, '#E9C65B', 4) +
    animalGroup('cat', 'calico', 160, 180, 0.7, 'sleep') +
    heart(300, 100, 0.7) +
    r(44, 232, 330, 12, '#B08A5E', 3),

  laundry: () =>
    wall('#DCE7EA', '#C9D3D4', 208) +
    p('M 116 132 L 304 132 L 282 232 L 138 232 Z', '#A8BE86') +
    r(106, 120, 208, 18, '#8C6B4C', 8) +
    r(150, 92, 70, 34, '#FBF7EC', 6) +
    r(178, 70, 84, 34, '#E8A6B0', 6) +
    animalGroup('cat', 'grey', 170, 224, 0.75, 'sleep') +
    c(260, 108, 4, '#BFD8E3') +
    c(300, 96, 3, '#BFD8E3') +
    r(40, 244, 340, 10, '#B7C4C6', 3),

  stars: () =>
    r(0, 0, SCENE_W, SCENE_H, '#2E3A50', 0, INK, 4) +
    c(70, 60, 2, '#FBF7EC') +
    c(120, 40, 1.6, '#FBF7EC') +
    c(190, 74, 2, '#FBF7EC') +
    c(300, 46, 1.8, '#FBF7EC') +
    c(360, 90, 2, '#FBF7EC') +
    sunOrMoon(330, 54, true) +
    heart(100, 100, 1) +
    heart(160, 70, 0.7, '#E9C65B') +
    heart(250, 96, 0.9) +
    p('M 0 216 C 90 190 170 220 260 198 C 330 180 380 200 420 190 L 420 300 L 0 300 Z', '#3E4F52') +
    animalGroup('cat', 'ginger', 120, 282, 0.8, 'sleep') +
    animalGroup('rabbit', 'white', 240, 284, 0.6, 'sleep'),

  firstHome: () =>
    wall('#F3EFE0', '#C39A6B', 210) +
    windowFrame(28, 38, 120, 96) +
    r(186, 128, 150, 62, '#A8BE86', 15) +
    r(196, 138, 58, 28, '#C9D8AF', 10) +
    r(260, 138, 58, 28, '#C9D8AF', 10) +
    r(186, 182, 150, 12, '#8C6B4C', 5) +
    r(348, 96, 44, 104, '#B08A5E', 4) +
    r(356, 108, 28, 30, '#E9C65B', 3) +
    r(356, 146, 28, 30, '#E8A6B0', 3) +
    animalGroup('cat', 'ginger', 250, 208, 0.7, 'idle') +
    heart(312, 112, 0.8) +
    r(20, 236, 380, 12, '#B08A5E', 3),

  crib: () =>
    wall('#F6EAE4', '#E0C7A5', 214) +
    // A-frame nursery crib matching IMG_2703
    p('M 122 198 L 122 108 L 160 80 L 260 80 L 298 108 L 298 198', 'none', '#A67C52', 7) +
    r(126, 108, 168, 86, '#EDE6D6', 8) +
    r(126, 104, 168, 12, '#B08A5E', 5) +
    Array.from({ length: 6 }, (_, i) => r(138 + i * 26, 118, 5, 66, '#B08A5E', 2)).join('') +
    r(120, 192, 180, 12, '#B08A5E', 5) +
    r(140, 204, 10, 22, '#5B4130', 3) +
    r(268, 204, 10, 22, '#5B4130', 3) +
    r(160, 156, 100, 36, '#FBF7EC', 12) +
    c(210, 174, 16, '#F2D3B6') +
    c(204, 174, 2, INK, 'none', 0) +
    c(216, 174, 2, INK, 'none', 0) +
    `<text x="304" y="82" font-family="sans-serif" font-size="18" fill="#E9C65B">★</text>` +
    `<text x="84" y="66" font-family="sans-serif" font-size="14" fill="#E8A6B0">★</text>` +
    animalGroup('rabbit', 'white', 320, 236, 0.5, 'idle'),

  cake: () =>
    wall('#F2EADB', '#D8B78A', 210) +
    r(106, 128, 210, 74, '#B08A5E', 8) +
    r(120, 198, 12, 44, '#5B4130', 3) +
    r(290, 198, 12, 44, '#5B4130', 3) +
    el(212, 130, 44, 10, '#FBF7EC') +
    r(174, 92, 78, 40, '#E8A6B0', 8) +
    p('M 174 104 C 190 96 206 112 218 104 C 230 96 244 108 252 102', 'none', '#FBF7EC', 7) +
    c(212, 84, 5, '#C4483B') +
    p('M 212 78 q -4 -8 2 -12', 'none', '#6E8A55', 3) +
    animalGroup('cat', 'cream', 304, 186, 0.6, 'special') +
    heart(120, 88, 0.6) +
    r(30, 244, 360, 10, '#B08A5E', 3),

  family: () =>
    wall('#F3EFE0', '#C39A6B', 208) +
    windowFrame(300, 34, 100, 84) +
    animalGroup('cat', 'ginger', 36, 214, 0.62, 'idle') +
    animalGroup('dog', 'golden', 108, 222, 0.68, 'idle') +
    animalGroup('rabbit', 'white', 196, 214, 0.55, 'idle') +
    animalGroup('bird', 'sky', 252, 196, 0.45, 'idle') +
    (() => {
      const a = characterArt({ skin: '#E0B48E', hair: '#3A332C', hairStyle: 'short', outfit: '#7F9B5C' });
      const b = characterArt({ skin: '#C98D62', hair: '#5B4130', hairStyle: 'long', outfit: '#C4483B' });
      return `<g transform="translate(280 130) scale(0.62)">${a.body}</g><g transform="translate(330 130) scale(0.62)">${b.body}</g>`;
    })() +
    heart(214, 104, 0.7) +
    r(14, 248, 392, 10, '#B08A5E', 3),
};

const MOMENT_SCENE_MAP: Record<string, string> = {
  moveIn: 'truck',
  firstBuy: 'unboxing',
  firstVisitor: 'visitorTea',
  firstHarvest: 'harvest',
  firstCook: 'kitchenPot',
  sofaNap: 'sofaNap',
  sinkCat: 'sink',
  drawerCat: 'drawer',
  snackBag: 'snackBag',
  windowOwl: 'windowOwl',
  gardenNap: 'gardenNap',
  pianoCat: 'piano',
  bookPile: 'books',
  laundry: 'laundry',
  fiveBubbles: 'stars',
  tenItems: 'firstHome',
  friendship: 'visitorTea',
  babyFirst: 'crib',
  sixPets: 'family',
  tenRecipes: 'cake',
};

export function momentSceneSvg(momentId: string): string {
  const scene = SCENES[MOMENT_SCENE_MAP[momentId] ?? 'firstHome'] ?? SCENES.firstHome;
  return svgDoc({ w: SCENE_W, h: SCENE_H, body: scene() });
}

export function momentSceneArt(momentId: string): { w: number; h: number; body: string } {
  const scene = SCENES[MOMENT_SCENE_MAP[momentId] ?? 'firstHome'] ?? SCENES.firstHome;
  return { w: SCENE_W, h: SCENE_H, body: scene() };
}

export { babyArt };
