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
    wall('#DCEAF0', '#7B9954', 214) +
    // House with red tile roof, white walls & green bush behind yellow moving truck (IMG_2708 card 1)
    r(12, 92, 396, 122, '#F7F3E6', 2) +
    p('M 12 96 L 76 58 L 368 58 L 408 96 Z', '#E46A56') +
    r(36, 16, 198, 42, '#EFE8D6', 2) +
    r(120, 26, 48, 22, '#BFD6E0', 2) +
    r(296, 128, 72, 86, '#9B754E', 3) +
    c(268, 134, 34, '#6A9455') +
    c(296, 140, 26, '#567E45') +
    // Yellow flatbed moving truck loaded with boxes
    r(132, 114, 178, 52, '#C8A578', 4) +
    r(148, 96, 48, 36, '#B88F5E', 3) +
    r(200, 104, 42, 28, '#D7B587', 3) +
    r(246, 98, 46, 34, '#8A7E72', 3) +
    r(120, 152, 200, 22, '#F3CA3E', 4) +
    p('M 42 184 L 42 114 L 116 114 L 116 184 Z', '#F3CA3E') +
    p('M 46 122 L 88 122 L 88 148 L 46 148 Z', '#B7DCE8') +
    r(34, 174, 294, 14, '#5E5B58', 4) +
    c(92, 192, 20, '#3B3632') +
    c(92, 192, 9, '#B8C1C4') +
    c(244, 192, 20, '#3B3632') +
    c(244, 192, 9, '#B8C1C4'),

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
    // Plump white cat sleeping belly-up on warm wood floor with yarn ball & fish toy (IMG_2708 card 3)
    wall('#D2AD7D', '#C59C68', 92) +
    line(0, 148, SCENE_W, 148, INK, 1.5) +
    line(0, 214, SCENE_W, 214, INK, 1.5) +
    line(118, 92, 164, 148, INK, 1.4) +
    line(276, 148, 326, 214, INK, 1.4) +
    c(324, 108, 24, '#C6523C') +
    p('M 310 100 q 14 -6 28 2 M 310 112 q 14 6 28 -2', 'none', INK, 1.8) +
    c(368, 174, 9, '#E9C65B') +
    el(96, 224, 14, 6, '#9AAAB8') +
    p('M 82 224 L 72 218 L 72 230 Z', '#9AAAB8') +
    // White sleeping cat curled belly-up
    el(196, 176, 76, 44, '#FFFDF7') +
    c(116, 164, 34, '#FFFDF7') +
    p('M 92 140 L 88 122 L 106 132 Z', '#FFFDF7') +
    p('M 122 132 L 136 120 L 138 140 Z', '#FFFDF7') +
    p('M 102 160 q 6 4 12 0 M 120 158 q 6 4 12 0', 'none', INK, 2.4) +
    p('M 110 170 q 4 4 8 0 q 4 4 8 0', 'none', INK, 2) +
    // Outstretched paws with pink toe beans & long white tail
    el(148, 118, 12, 18, '#FFFDF7', INK, 2.5, -24) +
    el(172, 198, 16, 11, '#FFFDF7') +
    c(170, 198, 3.5, '#EFA8B2', 'none', 0) +
    el(248, 144, 15, 11, '#FFFDF7') +
    c(250, 144, 3.5, '#EFA8B2', 'none', 0) +
    p('M 270 184 C 312 184 358 202 360 228 C 362 246 340 248 330 232 C 318 212 288 206 266 206 Z', '#FFFDF7'),

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
    // White cat curled in ceramic sink with green soap bottle, yellow sponge & blue tile wall (IMG_2708 card 4)
    r(0, 0, SCENE_W, SCENE_H, '#7FB2CA', 0, INK, 4) +
    line(276, 0, 276, 156, INK, 1.5) +
    line(348, 0, 348, 156, INK, 1.5) +
    line(220, 68, SCENE_W, 68, INK, 1.5) +
    p('M 0 112 L 240 0 L 420 90 L 420 300 L 0 300 Z', '#FFFDF8') +
    p('M 42 126 L 210 40 L 372 124 L 210 238 Z', '#EAECEF') +
    // Green hand soap dispenser & yellow sponge
    r(54, 46, 26, 54, '#8CB668', 8) +
    r(62, 34, 10, 12, '#DCE2E4', 2) +
    r(304, 186, 54, 34, '#E7DC72', 6) +
    // Chrome faucet
    r(218, 22, 16, 46, '#9AA4A8', 4) +
    p('M 234 36 L 288 18 L 296 28 L 234 52 Z', '#BAC2C6') +
    // White cat curled inside sink
    el(190, 134, 58, 38, '#FFFDF7') +
    c(208, 174, 24, '#FFFDF7') +
    p('M 184 166 L 178 148 L 196 158 Z', '#FFFDF7') +
    p('M 222 160 L 236 146 L 234 168 Z', '#FFFDF7') +
    p('M 196 174 q 4 3 8 0 M 212 174 q 4 3 8 0', 'none', INK, 2.2) +
    p('M 140 124 C 122 106 122 80 144 74 C 158 70 164 88 150 104', 'none', '#FFFDF7', 14),

  drawer: () =>
    // Ginger tabby cat diving into open brown dresser drawer with clothes & sock (IMG_2708 card 5)
    wall('#C79B68', '#BC915E', 180) +
    p('M 28 24 L 194 12 L 212 184 L 28 198 Z', '#6B584E') +
    p('M 64 114 L 214 96 L 348 168 L 196 206 Z', '#7D6A5E') +
    p('M 76 116 L 198 184 L 198 248 L 76 176 Z', '#8B776A') +
    // Folded orange sweater, blue shirt, yellow cuff & white sock
    el(178, 132, 46, 26, '#DF8B4D') +
    el(264, 118, 42, 20, '#BFD2DC') +
    r(122, 152, 44, 22, '#E9C65B', 6) +
    p('M 164 202 L 192 190 L 216 238 L 182 248 Z', '#F7F4EC') +
    // Ginger tabby cat hindquarters & striped tail sticking out of drawer
    el(248, 172, 42, 26, '#DF9D4E') +
    line(226, 156, 232, 176, '#B8722E', 4) +
    line(246, 154, 252, 176, '#B8722E', 4) +
    p('M 276 184 L 282 242 L 298 242 L 296 180 Z', '#DF9D4E') +
    p('M 290 166 C 322 146 356 178 344 218 C 338 236 322 230 326 210 C 330 188 308 176 286 180 Z', '#DF9D4E'),

  snackBag: () =>
    // Ginger tabby cat head-first inside tipped-over blue fish-kibble bag on wood floor (IMG_2708 card 6)
    wall('#D2AE7D', '#C49A64', 100) +
    line(0, 166, SCENE_W, 166, INK, 1.5) +
    line(0, 232, SCENE_W, 232, INK, 1.5) +
    // Tipped blue-and-cream pet kibble bag
    p('M 84 186 L 190 120 L 266 196 L 176 254 Z', '#B7DCE6') +
    p('M 176 254 L 266 196 L 236 168 L 146 226 Z', '#F3E3B6') +
    el(164, 178, 16, 11, '#E4C368') +
    el(192, 160, 14, 9, '#E4C368') +
    // Ginger tabby cat with head buried inside bag opening + scattered kibble
    el(276, 156, 50, 28, '#DF9D4E') +
    line(252, 134, 258, 156, '#B8722E', 3.5) +
    line(272, 132, 278, 154, '#B8722E', 3.5) +
    line(292, 136, 296, 156, '#B8722E', 3.5) +
    p('M 298 176 L 312 224 L 328 224 L 320 170 Z', '#DF9D4E') +
    p('M 318 148 C 344 134 358 164 342 186 C 332 198 320 190 328 174 C 332 162 326 156 314 156 Z', '#DF9D4E') +
    [[256, 218], [272, 232], [290, 224], [308, 240], [344, 214]].map(([x, y]) => c(x, y, 3.4, '#A97343')).join(''),

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
    // Packed room of cardboard boxes, quilted carrier, backpack & white cat on plastic bin (IMG_2708 card 2)
    wall('#E7E0D0', '#CFA778', 110) +
    r(18, 42, 76, 62, '#A7B8C4', 8) +
    r(86, 56, 76, 58, '#F7F2E4', 8) +
    r(206, 28, 72, 56, '#C8A578', 4) +
    r(292, 36, 86, 66, '#A3A8AC', 4) +
    r(322, 104, 84, 72, '#8E9499', 4) +
    r(262, 134, 52, 62, '#DFC478', 10) +
    r(108, 168, 94, 62, '#C7D3DA', 8) +
    r(104, 160, 102, 14, '#E7EEF2', 4) +
    r(18, 162, 82, 58, '#536A7E', 16) +
    r(218, 164, 44, 48, '#A97C50', 6) +
    animalGroup('cat', 'white', 120, 136, 0.62, 'idle'),

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
