/** Storybook-illustrated furniture and outdoor item shapes. All drawn on a bottom baseline. */

import type { Palette } from './palettes';
import {
  c,
  cushion,
  dots,
  el,
  INK,
  leafSprig,
  leg,
  line,
  p as path,
  r,
  shadedPath,
  sheen,
  woodGrain,
  type ArtResult,
} from './svg';

type Shape = (p: Palette) => ArtResult;

export const FURNITURE_SHAPES: Record<string, Shape> = {
  sofa: (p) => {
    const m = p.main;
    const s = p.second;
    return {
      w: 260,
      h: 118,
      body:
        // Curved backrest & sloped side armrests (IMG_2699)
        cushion(18, 22, 224, 62, m, 18) +
        cushion(34, 32, 92, 42, s, 12) +
        cushion(134, 32, 92, 42, s, 12) +
        // Ribbed fabric stitching lines
        line(64, 36, 64, 70, p.leaf, 1.8) +
        line(96, 36, 96, 70, p.leaf, 1.8) +
        line(164, 36, 164, 70, p.leaf, 1.8) +
        line(196, 36, 196, 70, p.leaf, 1.8) +
        // Decorative throw pillows tucked in corners
        `<g transform="rotate(-12 46 56)">${cushion(32, 42, 28, 28, p.accent, 8)}</g>` +
        `<g transform="rotate(11 214 56)">${cushion(200, 42, 28, 28, p.paper, 8)}</g>` +
        // Rolled armrests
        cushion(8, 50, 38, 48, m, 15) +
        cushion(214, 50, 38, 48, m, 15) +
        // Deep 3-cushion seat deck with stitched seams
        cushion(32, 70, 66, 28, s, 9) +
        cushion(97, 70, 66, 28, s, 9) +
        cushion(162, 70, 66, 28, s, 9) +
        // Warm wood base rail & legs
        r(20, 95, 220, 11, p.wood, 5) +
        woodGrain(24, 95, 212, 11) +
        leg(32, 105, 11, p.dark) +
        leg(220, 105, 11, p.dark),
    };
  },

  armchair: (p) => ({
    w: 150,
    h: 132,
    body:
      cushion(24, 16, 102, 74, p.main, 20) +
      cushion(36, 28, 78, 46, p.second, 13) +
      // Grid tufting stitch lines & cozy cream sheepskin throw (IMG_2702)
      line(62, 32, 62, 70, p.dark, 1.5) +
      line(88, 32, 88, 70, p.dark, 1.5) +
      shadedPath('M 42 52 C 56 44 88 42 104 54 C 110 64 102 82 94 94 C 76 96 54 96 42 90 C 36 78 38 62 42 52 Z', '#FFFDF8') +
      cushion(12, 58, 30, 44, p.main, 12) +
      cushion(108, 58, 30, 44, p.main, 12) +
      r(24, 98, 102, 11, p.wood, 5) +
      woodGrain(26, 98, 98, 11) +
      leg(34, 108, 18, p.dark, 6.5) +
      leg(110, 108, 18, p.dark, 6.5),
  }),

  coffeeTable: (p) => ({
    w: 190,
    h: 78,
    body:
      // Lower shelf
      r(26, 54, 138, 10, p.second, 4) +
      // Small stacked art book on lower shelf
      r(44, 46, 34, 8, p.accent, 2) +
      r(48, 40, 26, 6, p.paper, 2) +
      // Tapered legs
      leg(26, 34, 42, p.dark, 7) +
      leg(156, 34, 42, p.dark, 7) +
      // Tabletop & apron
      r(10, 18, 170, 17, p.wood, 6.5) +
      woodGrain(12, 18, 166, 17) +
      r(22, 32, 146, 6, p.dark, 2) +
      // Cozy mug & tiny ceramic bud vase on top
      r(50, 7, 15, 12, p.paper, 3) +
      path('M 65 10 C 70 10 70 17 65 17', 'none', INK, 2.2) +
      path('M 90 18 L 87 6 L 103 6 L 100 18 Z', p.accent) +
      c(95, 2, 4.5, p.leaf),
  }),

  sideTable: (p) => ({
    w: 96,
    h: 82,
    body:
      // Pedestal column & tripod foot
      r(43, 28, 10, 38, p.dark, 3) +
      el(48, 70, 25, 7.5, p.dark) +
      el(48, 68, 22, 5, p.wood, 'none', 0) +
      // Round bevelled top
      el(48, 21, 39, 11.5, p.wood) +
      el(48, 19, 34, 8, p.second, 'none', 0) +
      // Book & mug on top
      r(26, 7, 26, 8, p.accent, 3) +
      r(56, 5, 13, 12, p.paper, 3) +
      c(40, 3, 3.5, p.leaf),
  }),

  diningTable: (p) => ({
    w: 250,
    h: 104,
    body:
      // Legs & stretchers
      leg(26, 36, 62, p.dark, 8.5) +
      leg(194, 36, 62, p.dark, 8.5) +
      r(32, 74, 166, 6, p.dark, 2) +
      // Grained tabletop & apron
      r(8, 20, 214, 17, p.wood, 6) +
      woodGrain(10, 20, 210, 17) +
      r(20, 36, 190, 7, p.dark, 3) +
      // Linen table runner & centerpiece bowl of fruit
      r(88, 20, 74, 17, p.paper, 2) +
      path('M 102 18 C 106 8 144 8 148 18 Z', p.second) +
      c(114, 9, 4.5, p.accent) +
      c(126, 11, 4.5, p.leaf) +
      c(137, 8, 4, p.main),
  }),

  chair: (p) => ({
    w: 86,
    h: 124,
    body:
      // Slatted oak backrest
      r(14, 10, 58, 62, p.wood, 12) +
      woodGrain(16, 12, 54, 16) +
      r(23, 20, 40, 40, p.second, 7) +
      line(36, 22, 36, 58, p.wood, 4) +
      line(50, 22, 50, 58, p.wood, 4) +
      // Cushioned seat & legs
      leg(16, 78, 40, p.dark, 6.5) +
      leg(63, 78, 40, p.dark, 6.5) +
      r(10, 66, 66, 14, p.wood, 6) +
      cushion(14, 60, 58, 10, p.main, 5),
  }),

  stool: (p) => ({
    w: 64,
    h: 64,
    body:
      path('M 28 24 L 14 60 M 36 24 L 50 60 M 32 24 L 32 60', 'none', INK, 5.5) +
      path('M 28 24 L 14 60 M 36 24 L 50 60 M 32 24 L 32 60', 'none', p.wood, 3) +
      el(32, 46, 15, 4, 'none', p.dark, 3) +
      el(32, 18, 24, 9, p.wood) +
      el(32, 14, 21, 7, p.main),
  }),

  bench: (p) => ({
    w: 180,
    h: 82,
    body:
      leg(20, 40, 38, p.dark, 7.5) +
      leg(152, 40, 38, p.dark, 7.5) +
      r(24, 54, 132, 7, p.wood, 3) +
      r(8, 26, 164, 15, p.wood, 6) +
      woodGrain(10, 26, 160, 15) +
      cushion(16, 12, 148, 17, '#FAF6EC', 7) +
      // Cozy grey knit throw draped across the center-right (IMG_2702)
      shadedPath('M 84 12 L 122 12 L 106 58 L 68 56 Z', '#9BA0A6') +
      line(76, 48, 98, 50, INK, 1.6),
  }),

  bed: (p) => ({
    w: 300,
    h: 176,
    body:
      // Slatted cream/timber headboard (IMG_2702)
      r(32, 4, 236, 84, p.paper, 8) +
      line(34, 24, 266, 24, INK, 2) +
      line(34, 44, 266, 44, INK, 2) +
      // Twin white sleeping pillows + front tan bolster pillows
      cushion(38, 24, 102, 40, '#FFFFFF', 10) +
      cushion(160, 24, 102, 40, '#FFFFFF', 10) +
      cushion(34, 54, 108, 22, '#D8BA8E', 8) +
      cushion(158, 54, 108, 22, '#D8BA8E', 8) +
      // Soft striped cozy comforter duvet
      cushion(18, 72, 264, 64, p.paper, 14) +
      r(24, 82, 252, 14, p.second, 6, 'none', 0) +
      r(24, 108, 252, 14, p.second, 6, 'none', 0) +
      path('M 54 114 q 10 4 20 0 M 214 110 q 12 -4 24 0 M 126 96 q 14 4 26 0', 'none', INK, 2) +
      // Timber bed rail & legs
      r(18, 128, 264, 14, p.wood, 6) +
      woodGrain(22, 128, 256, 14) +
      leg(26, 142, 28, p.dark, 8) +
      leg(264, 142, 28, p.dark, 8),
  }),

  crib: (p) => ({
    w: 220,
    h: 164,
    body:
      // Back wooden A-frame & vertical spindles
      path('M 24 132 L 24 44 L 68 16 L 152 16 L 196 44 L 196 132', 'none', INK, 8) +
      path('M 24 132 L 24 44 L 68 16 L 152 16 L 196 44 L 196 132', 'none', p.wood, 4.5) +
      line(68, 16, 68, 128, p.wood, 5) +
      line(152, 16, 152, 128, p.wood, 5) +
      Array.from({ length: 8 }, (_, i) => r(38 + i * 20, 48, 5, 76, p.wood, 2)).join('') +
      // Cozy quilted mattress & blanket
      cushion(28, 86, 164, 38, '#F6E8BA', 10) +
      cushion(32, 82, 54, 24, p.paper, 8) +
      // Front rail & A-frame beams
      r(20, 42, 180, 9, p.wood, 4) +
      r(18, 122, 184, 12, p.wood, 4) +
      woodGrain(22, 122, 176, 12) +
      leg(26, 134, 20, p.dark, 7) +
      leg(186, 134, 20, p.dark, 7) +
      // Hanging star & duck mobile
      line(110, 16, 110, 46, INK, 2) +
      line(136, 16, 136, 40, INK, 2) +
      c(110, 50, 7, '#E9C65B') +
      c(136, 44, 6, p.main),
  }),

  wardrobe: (p) => ({
    w: 164,
    h: 224,
    body:
      // Decorative storage hatbox & jar on roof
      r(32, 8, 34, 14, p.accent, 4) +
      c(116, 12, 6, p.second) +
      // Main tall cabinet with cornice crown
      r(8, 18, 148, 12, p.wood, 4) +
      r(12, 26, 140, 178, p.wood, 9) +
      woodGrain(16, 30, 132, 170) +
      // Shaker doors with inset trim
      r(22, 34, 56, 156, p.main, 6) +
      r(86, 34, 56, 156, p.main, 6) +
      r(28, 42, 44, 62, p.second, 4) +
      r(92, 42, 44, 62, p.second, 4) +
      line(82, 28, 82, 202, INK, 2.4) +
      // Brass pulls
      c(72, 116, 4.2, '#E9C65B') +
      c(92, 116, 4.2, '#E9C65B') +
      r(10, 202, 144, 11, p.wood, 4) +
      leg(22, 212, 11, p.dark, 7) +
      leg(133, 212, 11, p.dark, 7),
  }),

  dresser: (p) => ({
    w: 176,
    h: 122,
    body:
      r(10, 20, 156, 86, p.wood, 9) +
      woodGrain(14, 22, 148, 20) +
      r(22, 32, 132, 20, p.main, 5) +
      r(22, 58, 132, 20, p.main, 5) +
      r(22, 84, 132, 20, p.main, 5) +
      c(76, 42, 3.2, '#E9C65B') +
      c(100, 42, 3.2, '#E9C65B') +
      c(76, 68, 3.2, '#E9C65B') +
      c(100, 68, 3.2, '#E9C65B') +
      c(76, 94, 3.2, '#E9C65B') +
      c(100, 94, 3.2, '#E9C65B') +
      r(8, 18, 160, 8, p.wood, 4) +
      el(88, 18, 34, 5, p.paper) +
      r(10, 105, 156, 8, p.wood, 4) +
      leg(22, 112, 9, p.dark, 6.5) +
      leg(147, 112, 9, p.dark, 6.5),
  }),

  bookshelf: (p) => ({
    w: 132,
    h: 206,
    body:
      r(10, 8, 112, 192, p.wood, 7) +
      woodGrain(12, 10, 108, 16) +
      r(18, 20, 96, 170, p.dark, 4) +
      [20, 62, 104, 146].map((y) => r(18, y, 96, 7, p.wood, 2)).join('') +
      // Shelf 1 colorful upright & tilted books
      r(26, 30, 11, 32, p.accent, 2) +
      r(38, 35, 9, 27, p.main, 2) +
      r(48, 27, 10, 35, p.leaf, 2) +
      `<g transform="rotate(-14 70 46)">${r(64, 30, 10, 32, p.paper, 2)}</g>` +
      // Shelf 2 books & bookend
      r(26, 72, 10, 32, p.leaf, 2) +
      r(38, 76, 12, 28, p.accent, 2) +
      r(53, 70, 9, 34, p.main, 2) +
      r(65, 76, 10, 28, p.second, 2) +
      // Shelf 3 books
      r(26, 114, 12, 32, p.main, 2) +
      r(41, 119, 9, 27, p.accent, 2) +
      r(53, 113, 10, 33, p.leaf, 2) +
      r(82, 124, 24, 22, p.paper, 3) +
      // Bottom shelf planter & basket
      r(26, 162, 32, 26, p.second, 4) +
      el(86, 178, 15, 11, p.accent) +
      leafSprig(86, 172, 0.75, p.leaf),
  }),

  tv: (p) => ({
    w: 220,
    h: 132,
    body:
      r(10, 12, 200, 102, '#5E6469', 8) +
      r(18, 20, 184, 86, '#2C373B', 5) +
      // Cozy illustrated pastoral scene on TV screen (IMG_2697 / IMG_2699)
      `<rect x="22" y="24" width="176" height="78" rx="4" fill="#CBE0E6"/>` +
      shadedPath('M 22 102 L 22 72 Q 68 56 116 74 Q 160 58 198 76 L 198 102 Z', '#8BB174', INK, 1.8) +
      c(162, 42, 10, '#F5D36C', INK, 1.8) +
      c(74, 42, 12, '#FFFFFF', 'none', 0) +
      c(88, 44, 10, '#FFFFFF', 'none', 0) +
      c(190, 96, 2.5, '#A6D89A', INK, 1.2) +
      r(94, 114, 32, 7, p.dark, 2) +
      r(72, 120, 76, 6, p.dark, 3),
  }),

  tvcabinet: (p) => ({
    w: 230,
    h: 78,
    body:
      // 3-drawer oak/cream TV console cabinet with round wooden pulls (IMG_2697)
      leg(20, 62, 14, p.dark, 7) +
      leg(203, 62, 14, p.dark, 7) +
      r(10, 16, 210, 48, '#D7B46E', 6) +
      r(10, 14, 210, 10, '#E3C382', 4) +
      woodGrain(14, 18, 202, 10) +
      r(18, 30, 60, 26, '#C9A45A', 3) +
      r(85, 30, 60, 26, '#C9A45A', 3) +
      r(152, 30, 60, 26, '#C9A45A', 3) +
      c(48, 43, 3.4, p.paper) +
      c(115, 43, 3.4, p.paper) +
      c(182, 43, 3.4, p.paper),
  }),

  piano: (p) => ({
    w: 270,
    h: 210,
    body:
      // Upright body & crown ledge
      r(18, 12, 222, 100, p.wood, 8) +
      woodGrain(22, 16, 214, 20) +
      r(16, 6, 226, 10, p.second, 4) +
      r(32, 24, 194, 72, p.dark, 5) +
      // Framed upper soundboard & sheet music on desk
      r(44, 34, 170, 24, p.main, 3) +
      r(102, 62, 54, 42, p.paper, 3) +
      line(129, 64, 129, 102, INK, 1.5) +
      line(108, 74, 124, 74, INK, 1.5) +
      line(108, 82, 124, 82, INK, 1.5) +
      line(134, 74, 150, 74, INK, 1.5) +
      line(134, 82, 150, 82, INK, 1.5) +
      // Keybed with white & black keys
      r(16, 106, 226, 24, p.paper, 4) +
      Array.from({ length: 15 }, (_, i) => line(26 + i * 14, 106, 26 + i * 14, 130, INK, 1.8)).join('') +
      [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((k) => r(35 + k * 14, 106, 8, 14, INK, 1, INK, 0)).join('') +
      // Lower cabinet & brass pedals
      r(18, 130, 222, 44, p.wood, 6) +
      woodGrain(22, 134, 214, 34) +
      r(34, 140, 190, 22, p.second, 4) +
      leg(34, 174, 30, p.dark, 9) +
      leg(216, 174, 30, p.dark, 9) +
      r(110, 194, 38, 10, p.dark, 3) +
      r(118, 197, 5, 6, '#E9C65B', 1) +
      r(127, 197, 5, 6, '#E9C65B', 1) +
      r(136, 197, 5, 6, '#E9C65B', 1),
  }),

  pianoBench: (p) => ({
    w: 110,
    h: 62,
    body:
      leg(16, 30, 26, p.dark, 6.5) +
      leg(86, 30, 26, p.dark, 6.5) +
      line(20, 46, 88, 46, p.wood, 4) +
      r(8, 18, 94, 14, p.wood, 6) +
      cushion(12, 10, 86, 11, p.second, 5),
  }),

  floorLamp: (p) => ({
    w: 78,
    h: 220,
    body:
      // Soft ambient bulb glow around shade
      `<circle cx="39" cy="68" r="36" fill="url(#oh-glow)" pointer-events="none"/>` +
      el(39, 206, 28, 8.5, p.dark) +
      el(39, 203, 21, 5.5, p.wood, 'none', 0) +
      r(35, 96, 7, 107, p.wood, 3) +
      r(32, 92, 13, 10, '#E9C65B', 3) +
      // Finial & pleated fabric shade
      c(39, 36, 4.5, '#E9C65B') +
      shadedPath('M 24 94 L 54 94 L 64 46 L 14 46 Z', p.main) +
      line(26, 48, 22, 92, p.second, 2) +
      line(39, 48, 39, 92, p.second, 2) +
      line(52, 48, 56, 92, p.second, 2) +
      path('M 14 46 L 64 46 L 59 39 L 19 39 Z', p.second),
  }),

  tableLamp: (p) => ({
    w: 64,
    h: 96,
    body:
      `<circle cx="32" cy="30" r="28" fill="url(#oh-glow)" pointer-events="none"/>` +
      el(32, 88, 18, 6.5, p.dark) +
      r(28, 46, 8, 39, p.wood, 3) +
      c(32, 66, 9, p.second) +
      el(32, 11, 5, 4, '#E9C65B') +
      shadedPath('M 20 46 L 44 46 L 51 16 L 13 16 Z', p.main) +
      line(24, 18, 22, 44, p.second, 1.8) +
      line(40, 18, 42, 44, p.second, 1.8) +
      line(15, 22, 49, 22, p.second, 2),
  }),

  rug: (p) => ({
    w: 320,
    h: 112,
    body:
      // Woven fringe tassels at left & right edges
      Array.from({ length: 7 }, (_, i) => {
        const y = 38 + i * 6;
        return line(4, y, 16, y, p.paper, 2.5) + line(304, y, 316, y, p.paper, 2.5);
      }).join('') +
      el(160, 56, 148, 46, p.main, INK, 3) +
      el(160, 56, 130, 36, 'none', p.second, 3) +
      el(160, 56, 112, 26, p.paper, INK, 1.8) +
      el(160, 56, 94, 18, p.accent, 'none', 0) +
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return c(160 + Math.cos(a) * 120, 56 + Math.sin(a) * 28, 2.8, p.paper, INK, 1.2);
      }).join(''),
  }),

  plant: (p) => ({
    w: 96,
    h: 132,
    body:
      leafSprig(48, 96, 1.55, p.leaf) +
      leafSprig(29, 96, 1.32, p.second) +
      leafSprig(67, 96, 1.28, p.leaf) +
      shadedPath('M 30 96 L 66 96 L 60 128 L 36 128 Z', p.accent) +
      r(26, 90, 44, 10, p.dark, 3.5) +
      line(34, 110, 62, 110, p.paper, 2).replace('/>', ' opacity="0.45"/>'),
  }),

  vase: (p) => ({
    w: 68,
    h: 112,
    body:
      leafSprig(34, 58, 1.55, p.leaf) +
      leafSprig(34, 60, 1.2, p.second) +
      c(24, 34, 5, p.accent) +
      c(45, 28, 4.5, p.accent) +
      shadedPath('M 24 62 C 11 78 16 106 34 108 C 52 106 57 78 44 62 Z', p.main) +
      r(25, 53, 18, 11, p.main, 3) +
      line(19, 80, 49, 80, p.second, 2.5) +
      sheen(22, 68, 5, 24, '#FFFFFF', 0.35),
  }),

  painting: (p) => ({
    w: 116,
    h: 92,
    body:
      r(6, 6, 104, 80, p.wood, 5) +
      woodGrain(8, 8, 100, 12) +
      r(14, 14, 88, 64, p.paper, 3) +
      `<rect x="18" y="18" width="80" height="56" rx="2" fill="#DCE9EE"/>` +
      c(78, 32, 9, p.accent) +
      shadedPath('M 18 68 L 42 38 L 60 54 L 80 32 L 98 68 Z', p.leaf, INK, 2) +
      r(18, 65, 80, 9, p.second, 1, INK, 1.5),
  }),

  wallClock: (p) => ({
    w: 68,
    h: 68,
    body:
      c(34, 34, 30, p.wood) +
      c(34, 34, 24, p.paper) +
      c(34, 34, 20, p.second, 'none', 0) +
      dots(
        [
          [34, 14],
          [54, 34],
          [34, 54],
          [14, 34],
          [48, 20],
          [48, 48],
          [20, 48],
          [20, 20],
        ],
        INK,
        1.7,
      ) +
      line(34, 34, 34, 18, INK, 3) +
      line(34, 34, 46, 39, INK, 2.6) +
      c(34, 34, 3.2, p.accent) +
      sheen(20, 16, 14, 6, '#FFFFFF', 0.32),
  }),

  shelf: (p) => ({
    w: 150,
    h: 62,
    body:
      r(18, 42, 10, 12, p.dark, 2) +
      r(122, 42, 10, 12, p.dark, 2) +
      r(6, 34, 138, 10, p.wood, 4) +
      woodGrain(10, 34, 130, 10) +
      r(18, 13, 18, 21, p.accent, 2) +
      r(40, 8, 14, 26, p.main, 2) +
      el(84, 24, 11, 10, p.second) +
      leafSprig(84, 22, 0.55, p.leaf) +
      r(110, 15, 22, 19, p.paper, 2) +
      c(121, 23, 4.5, p.accent),
  }),

  mirror: (p) => ({
    w: 92,
    h: 132,
    body:
      r(8, 8, 76, 116, p.wood, 38) +
      woodGrain(12, 12, 68, 22) +
      r(17, 17, 58, 98, p.glass, 29) +
      `<rect x="17" y="17" width="58" height="98" rx="29" fill="url(#oh-glass)" pointer-events="none"/>` +
      path('M 25 90 C 33 64 44 52 63 34', 'none', '#FFFFFF', 5, 'opacity="0.55"') +
      path('M 33 102 C 42 82 52 72 67 58', 'none', '#FFFFFF', 2.4, 'opacity="0.45"'),
  }),

  desk: (p) => ({
    w: 196,
    h: 118,
    body:
      // Cream writing desk with drawer, laptop, books, red mug & tiny plant (IMG_2702)
      r(18, 36, 12, 70, p.paper, 3) +
      r(166, 36, 12, 70, p.paper, 3) +
      r(104, 36, 70, 38, p.paper, 4) +
      r(110, 42, 58, 22, p.second, 3) +
      line(132, 53, 146, 53, INK, 2.4) +
      r(8, 24, 180, 15, p.paper, 4) +
      // Open silver laptop & mug
      path('M 76 24 L 84 4 L 118 4 L 110 24 Z', '#B7BEC4', INK, 2.4) +
      r(70, 20, 44, 5, '#DDE2E6', 2) +
      r(50, 12, 13, 12, '#D65B4A', 3) +
      // Stacked books & little desk plant
      r(22, 16, 22, 8, '#D65B4A', 2) +
      r(24, 9, 18, 7, '#7F9B5C', 2) +
      r(144, 12, 16, 12, p.paper, 3) +
      c(152, 8, 6, p.leaf),
  }),

  easel: (p) => ({
    w: 156,
    h: 200,
    body:
      path('M 78 18 L 28 194 M 78 18 L 128 194 M 78 18 L 78 194', 'none', INK, 10) +
      path('M 78 18 L 28 194 M 78 18 L 128 194 M 78 18 L 78 194', 'none', p.wood, 6) +
      r(28, 50, 100, 78, p.paper, 4) +
      `<rect x="33" y="55" width="90" height="68" rx="2" fill="#DCE9EE"/>` +
      c(102, 72, 7.5, p.accent) +
      shadedPath('M 34 120 L 62 82 L 82 102 L 102 68 L 122 120 Z', p.leaf, INK, 2) +
      r(26, 128, 104, 8, p.wood, 3) +
      r(44, 142, 68, 7, p.wood, 2) +
      c(78, 20, 5.5, p.dark),
  }),

  artTable: (p) => ({
    w: 236,
    h: 118,
    body:
      leg(24, 38, 64, p.dark, 7.5) +
      leg(204, 38, 64, p.dark, 7.5) +
      r(28, 38, 180, 9, p.second, 3) +
      r(8, 22, 220, 17, p.wood, 5) +
      woodGrain(12, 22, 212, 17) +
      // Sketchpad painting & wooden palette
      r(46, 5, 112, 18, p.paper, 3) +
      path('M 56 20 L 76 9 L 94 17 L 116 7 L 146 19 Z', p.leaf, 'none', 0) +
      el(196, 15, 14, 10, p.paper) +
      dots(
        [
          [188, 11],
          [196, 16],
          [204, 10],
          [199, 20],
        ],
        p.accent,
        2.8,
      ) +
      r(176, 25, 26, 8, p.main, 2),
  }),

  chaise: (p) => ({
    w: 260,
    h: 124,
    body:
      shadedPath('M 28 44 C 28 18 96 16 122 28 L 220 28 C 238 28 244 44 238 58 L 54 58 C 36 58 28 54 28 44 Z', p.second) +
      cushion(22, 56, 216, 32, p.main, 16) +
      r(20, 84, 220, 13, p.wood, 6) +
      woodGrain(24, 84, 212, 13) +
      leg(34, 96, 20, p.dark, 6) +
      leg(208, 96, 20, p.dark, 6) +
      cushion(58, 32, 48, 20, p.paper, 9),
  }),

  clothesRack: (p) => ({
    w: 150,
    h: 176,
    body:
      // Wooden A-frame garment rail with 5 colorful hanging shirts (IMG_2702)
      path('M 18 164 L 28 22 M 132 164 L 122 22 M 16 22 L 134 22', 'none', INK, 8) +
      path('M 18 164 L 28 22 M 132 164 L 122 22 M 16 22 L 134 22', 'none', p.wood, 4.5) +
      r(24, 142, 102, 10, p.wood, 3) +
      r(28, 36, 19, 76, '#D65B4A', 4) +
      r(49, 34, 19, 68, '#FFFDF8', 4) +
      r(70, 36, 19, 74, '#B9C0C5', 4) +
      r(91, 34, 17, 70, '#E9C65B', 4) +
      r(108, 36, 18, 78, '#8B7968', 4),
  }),

  laundryBasket: (p) => ({
    w: 96,
    h: 96,
    body:
      // Woven rim & twisted rope handles (IMG_2704)
      path('M 14 28 C 12 14 28 14 26 28 M 70 28 C 68 14 84 14 82 28', 'none', INK, 5) +
      path('M 14 28 C 12 14 28 14 26 28 M 70 28 C 68 14 84 14 82 28', 'none', '#9B754B', 2.4) +
      // Folded warm coral/cream/blue clothes mounded inside
      cushion(28, 12, 34, 22, '#E69F5C', 7) +
      cushion(46, 16, 30, 20, '#96B2CE', 7) +
      // Woven wicker body
      shadedPath('M 10 30 L 86 30 L 76 88 L 20 88 Z', '#A77D52') +
      Array.from({ length: 5 }, (_, i) => line(15, 42 + i * 10, 81, 42 + i * 10, '#6B4E31', 1.8)).join('') +
      Array.from({ length: 6 }, (_, i) => line(22 + i * 10, 32, 24 + i * 9, 86, '#5A4129', 1.8)).join('') +
      // Braided top rim
      r(8, 24, 80, 11, '#8D6740', 5) +
      // Draped white bath towel over front left rim
      shadedPath('M 16 28 C 28 24 38 28 40 42 L 36 74 C 28 76 20 72 18 64 Z', p.paper),
  }),

  shower: (p) => ({
    w: 176,
    h: 232,
    body:
      r(12, 10, 152, 212, '#DCE9EC', 8, INK, 3) +
      `<rect x="16" y="14" width="144" height="204" rx="6" fill="url(#oh-glass)" pointer-events="none"/>` +
      path('M 26 26 L 148 196 M 148 26 L 26 196', 'none', '#FFFFFF', 2, 'opacity="0.4"') +
      r(18, 16, 140, 8, p.metal, 3) +
      line(88, 16, 88, 40, p.metal, 3.5) +
      el(88, 46, 17, 6.5, p.metal) +
      Array.from({ length: 9 }, (_, i) => c(72 + (i % 3) * 16, 62 + Math.floor(i / 3) * 18, 2.2, p.glass, 'none', 0)).join('') +
      r(58, 198, 60, 11, p.second, 4),
  }),

  bathtub: (p) => ({
    w: 290,
    h: 162,
    body:
      // Back ledge faucet & soap bar (IMG_2704 rectangular modern soaking tub)
      r(176, 16, 7, 26, p.metal, 3) +
      path('M 179 16 C 179 6 193 6 193 15', 'none', INK, 6) +
      path('M 179 16 C 179 6 193 6 193 15', 'none', p.metal, 3) +
      r(84, 26, 24, 10, '#E9C65B', 4) +
      r(206, 20, 14, 18, '#8FB2CE', 3) +
      // Crisp white rectangular tub shell
      shadedPath('M 18 36 L 236 36 L 236 128 L 18 128 Z', p.paper) +
      r(28, 44, 198, 48, '#ECE3D3', 4) +
      r(14, 34, 226, 12, '#FFFDF8', 4) +
      // Draped slate-grey towel over front rim
      shadedPath('M 62 46 L 114 46 L 106 116 L 56 114 Z', '#8B8F94') +
      line(64, 108, 104, 110, INK, 1.8) +
      // Tall dark ceramic vase with pink cherry-blossom branches at right
      shadedPath('M 250 94 L 274 94 L 278 144 L 246 144 Z', '#7B746E') +
      path('M 262 94 C 260 66 250 48 236 32 M 262 94 C 268 68 276 52 284 36', 'none', INK, 3.2) +
      c(240, 34, 9, '#F1A7B5') +
      c(254, 48, 8, '#F7C2CC') +
      c(278, 42, 9, '#F1A7B5') +
      c(266, 28, 7, '#F7C2CC') +
      c(244, 62, 7, '#F1A7B5'),
  }),

  sink: (p) => ({
    w: 164,
    h: 148,
    body:
      // Wooden vanity cabinet with drawers & side towel bar (IMG_2704)
      shadedPath('M 18 46 L 146 46 L 146 138 L 18 138 Z', '#C79D66') +
      woodGrain(22, 52, 120, 80) +
      r(26, 56, 54, 72, '#B68A52', 3) +
      r(86, 56, 52, 20, '#B68A52', 3) +
      r(86, 82, 52, 20, '#B68A52', 3) +
      r(86, 108, 52, 20, '#B68A52', 3) +
      line(104, 66, 120, 66, INK, 2.2) +
      line(104, 92, 120, 92, INK, 2.2) +
      line(104, 118, 120, 118, INK, 2.2) +
      // Hanging white hand towel on side bar
      r(14, 70, 8, 6, p.metal, 2) +
      r(8, 74, 18, 36, p.paper, 4) +
      // White quartz top & inset rectangular basin
      r(10, 32, 144, 18, '#FBF9F4', 4) +
      r(28, 36, 92, 10, '#DDE4E6', 3) +
      // Wall-mount chrome faucet & cross handles
      path('M 74 34 L 74 16 C 74 8 86 8 86 16', 'none', INK, 6) +
      path('M 74 34 L 74 16 C 74 8 86 8 86 16', 'none', p.metal, 3) +
      c(58, 28, 4, p.metal) +
      c(90, 28, 4, p.metal) +
      // Tiny succulent & soap dispenser on counter ledge
      r(122, 18, 16, 14, '#A47D52', 3) +
      c(130, 14, 7, p.leaf) +
      r(14, 14, 12, 18, '#E48D6D', 4),
  }),

  kitchenSink: (_p) => ({
    w: 220,
    h: 124,
    body:
      // Blue kitchen lower cabinet under sink (IMG_2706)
      r(12, 42, 196, 72, '#88A7C8', 5) +
      r(22, 52, 84, 52, '#7B9AB9', 3) +
      r(114, 52, 84, 52, '#7B9AB9', 3) +
      line(88, 74, 88, 86, INK, 2.5) +
      line(132, 74, 132, 86, INK, 2.5) +
      // Crisp white countertop
      r(6, 26, 208, 16, '#F4F2EC', 4) +
      // Stainless steel double-bowl sink
      r(28, 22, 134, 14, '#DCE2E4', 4) +
      r(36, 25, 56, 8, '#BAC4C8', 2) +
      r(98, 25, 56, 8, '#BAC4C8', 2) +
      // Curved gooseneck faucet
      path('M 95 26 L 95 10 C 95 2 110 2 110 12', 'none', INK, 6) +
      path('M 95 26 L 95 10 C 95 2 110 2 110 12', 'none', '#EAEFEF', 3) +
      // Green sponge & yellow dish soap bottle
      r(42, 16, 22, 8, '#8EA866', 3) +
      r(172, 6, 20, 22, '#E2B448', 5) +
      r(179, 2, 6, 5, '#D9C9A8', 2),
  }),

  toilet: (p) => ({
    w: 110,
    h: 142,
    body:
      r(40, 6, 30, 42, p.paper, 8) +
      r(38, 4, 34, 7, p.second, 3) +
      c(64, 18, 3, '#E9C65B') +
      r(28, 48, 54, 64, p.paper, 14) +
      el(55, 54, 30, 12, p.paper) +
      r(18, 52, 74, 10, p.paper, 5) +
      r(44, 114, 22, 22, p.paper, 4) +
      el(55, 118, 26, 12, p.paper),
  }),

  counter: (p) => ({
    w: 250,
    h: 120,
    body:
      // Blue cabinets & drawers (IMG_2706)
      r(12, 40, 226, 66, '#88A7C8', 5) +
      r(20, 48, 98, 24, '#7B9AB9', 3) +
      r(20, 76, 98, 24, '#7B9AB9', 3) +
      r(132, 48, 98, 24, '#7B9AB9', 3) +
      r(132, 76, 98, 24, '#7B9AB9', 3) +
      line(58, 56, 80, 56, INK, 2.5) +
      line(58, 84, 80, 84, INK, 2.5) +
      line(170, 56, 192, 56, INK, 2.5) +
      line(170, 84, 192, 84, INK, 2.5) +
      // Crisp white countertop overhang
      r(6, 22, 238, 18, '#F4F2EC', 5) +
      r(6, 106, 238, 8, p.dark, 3),
  }),

  stove: (p) => ({
    w: 250,
    h: 150,
    body:
      r(8, 16, 234, 122, '#88A7C8', 9) +
      r(18, 24, 214, 24, '#3D4043', 5) +
      c(46, 36, 9.5, INK) +
      c(96, 36, 9.5, INK) +
      c(146, 36, 9.5, INK) +
      c(196, 36, 9.5, INK) +
      r(26, 56, 198, 72, '#B6BCC0', 6) +
      r(38, 62, 174, 18, '#D5D9DC', 4) +
      r(44, 84, 162, 36, '#3C4043', 5) +
      `<rect x="44" y="84" width="162" height="36" rx="5" fill="url(#oh-glass)" pointer-events="none"/>` +
      r(48, 78, 154, 5, '#E4E7E9', 2) +
      r(14, 132, 222, 8, p.dark, 3),
  }),

  oven: (p) => ({
    w: 210,
    h: 170,
    body:
      // Blue cabinet surround + stainless built-in oven (IMG_2706)
      r(8, 10, 194, 148, '#88A7C8', 7) +
      r(20, 20, 170, 130, '#B7BDC1', 6) +
      // Control panel with 5 rotary dials
      r(26, 26, 158, 24, '#D5DADF', 4) +
      [44, 68, 105, 142, 166].map((x) => c(x, 38, 7.5, '#9EA6AC')).join('') +
      // Full-width stainless handle & dark glass oven window
      r(32, 56, 146, 74, '#D5DADF', 5) +
      r(38, 66, 134, 54, '#3B3F42', 4) +
      `<rect x="38" y="66" width="134" height="54" rx="4" fill="url(#oh-glass)" pointer-events="none"/>` +
      r(36, 58, 138, 6, '#EEF2F4', 3) +
      r(20, 136, 170, 12, '#8F969B', 3) +
      r(8, 152, 194, 8, p.dark, 3),
  }),

  fridge: (p) => ({
    w: 152,
    h: 236,
    body:
      r(12, 10, 128, 214, p.paper, 14) +
      line(12, 86, 140, 86, INK, 3) +
      r(118, 32, 8, 34, p.metal, 4) +
      r(118, 102, 8, 48, p.metal, 4) +
      // Cute fridge magnets & postcard
      r(26, 24, 26, 20, p.accent, 3) +
      c(39, 33, 4.5, p.main) +
      r(26, 106, 20, 15, p.leaf, 3) +
      r(52, 112, 16, 9, p.second, 2) +
      sheen(20, 18, 10, 62, '#FFFFFF', 0.35),
  }),

  rangeHood: (p) => ({
    w: 190,
    h: 76,
    body:
      shadedPath('M 22 60 L 168 60 L 150 18 L 40 18 Z', '#E6E9EC') +
      r(38, 12, 114, 10, '#C8CFD4', 4) +
      r(28, 56, 134, 10, '#D4DADF', 3) +
      r(132, 59, 10, 4, p.dark, 1) +
      r(146, 59, 10, 4, p.dark, 1),
  }),

  pot: (p) => ({
    w: 92,
    h: 68,
    body:
      el(46, 40, 34, 16, p.accent) +
      r(12, 26, 68, 16, p.accent, 4) +
      el(46, 26, 34, 10, p.dark) +
      el(46, 26, 26, 6, p.second) +
      path('M 12 36 C 4 36 4 48 12 48 M 80 36 C 88 36 88 48 80 48', 'none', INK, 4) +
      el(46, 10, 7, 4, '#FFFFFF') +
      el(58, 4, 6, 3, '#FFFFFF'),
  }),

  pan: (p) => ({
    w: 108,
    h: 54,
    body:
      el(46, 30, 34, 16, p.dark) +
      el(46, 27, 28, 11, p.second) +
      c(38, 24, 6, p.accent) +
      c(52, 27, 5, p.leaf) +
      r(78, 25, 26, 7, p.wood, 3) +
      path('M 46 14 C 52 4 62 2 66 8', 'none', '#FFFFFF', 2.8),
  }),

  mixingBowl: (p) => ({
    w: 82,
    h: 56,
    body:
      el(41, 28, 32, 18, p.main) +
      el(41, 26, 26, 12, p.second) +
      path('M 28 20 C 34 8 44 4 54 10', 'none', p.paper, 4) +
      el(41, 15, 8, 4, p.paper),
  }),

  fruitBowl: (p) => ({
    w: 78,
    h: 46,
    body:
      el(39, 36, 20, 5, p.second) +
      el(39, 26, 30, 13, p.main) +
      c(26, 18, 7, p.accent) +
      c(40, 14, 7, p.leaf) +
      c(54, 19, 6.5, p.second),
  }),

  cabinet: (p) => ({
    w: 156,
    h: 170,
    body:
      r(10, 14, 136, 144, p.wood, 8) +
      woodGrain(14, 16, 128, 14) +
      r(20, 24, 54, 60, p.main, 4) +
      r(82, 24, 54, 60, p.main, 4) +
      r(20, 92, 116, 56, p.second, 4) +
      line(58, 94, 58, 146, INK, 2) +
      line(98, 94, 98, 146, INK, 2) +
      c(46, 54, 3.2, '#E9C65B') +
      c(110, 54, 3.2, '#E9C65B') +
      r(10, 158, 136, 6, p.dark, 3) +
      el(78, 152, 14, 4, p.dark),
  }),

  studioCabinet: (p) => ({
    w: 168,
    h: 214,
    body:
      // Storage tray & brush jars on top (IMG_2705)
      r(24, 6, 54, 18, '#B78C56', 4) +
      r(94, 4, 16, 20, p.leaf, 3) +
      r(116, 8, 18, 16, '#E9C65B', 3) +
      // Tall dark-walnut glass-door artist supply cabinet
      r(12, 20, 144, 12, '#6A4D36', 4) +
      r(16, 30, 136, 166, '#7C5A3F', 6) +
      woodGrain(20, 34, 128, 150) +
      // Interior shelves behind glass doors
      r(24, 40, 56, 142, '#4A3828', 4) +
      r(88, 40, 56, 142, '#4A3828', 4) +
      [76, 112, 148].map((y) => r(24, y, 120, 5, '#7C5A3F', 1)).join('') +
      // Paint jars, sketchbooks, palettes inside
      r(30, 52, 12, 22, '#D8E3E7', 3) +
      r(46, 48, 14, 26, '#E9C65B', 3) +
      r(94, 56, 28, 18, '#FBF7EC', 3) +
      r(30, 88, 36, 20, '#96B2CE', 3) +
      r(94, 84, 18, 26, '#C4483B', 3) +
      r(118, 92, 18, 18, '#7F9B5C', 3) +
      r(30, 124, 34, 22, '#FBF7EC', 3) +
      r(94, 120, 26, 26, '#C79D66', 3) +
      // Glass sheen & brass knobs
      `<rect x="24" y="40" width="56" height="142" rx="4" fill="url(#oh-glass)" pointer-events="none"/>` +
      `<rect x="88" y="40" width="56" height="142" rx="4" fill="url(#oh-glass)" pointer-events="none"/>` +
      c(74, 114, 4, '#E9C65B') +
      c(94, 114, 4, '#E9C65B') +
      leg(26, 196, 14, p.dark, 8) +
      leg(134, 196, 14, p.dark, 8),
  }),

  kitchenRack: (p) => ({
    w: 180,
    h: 110,
    body:
      // Wooden rail with pegs (IMG_2706)
      r(12, 18, 156, 10, p.wood, 3) +
      woodGrain(16, 18, 148, 10) +
      c(20, 23, 4, p.dark) +
      c(160, 23, 4, p.dark) +
      // Hanging striped kitchen towel
      line(38, 28, 38, 40, INK, 2) +
      r(28, 40, 20, 42, '#D77A5C', 3) +
      line(34, 42, 34, 80, '#FBF7EC', 3) +
      line(42, 42, 42, 80, '#FBF7EC', 3) +
      // Wooden cutting board
      line(82, 28, 82, 36, INK, 2) +
      r(72, 36, 22, 40, '#DFC8A2', 4) +
      woodGrain(74, 40, 18, 30) +
      // Hanging cast-iron skillet
      line(128, 28, 128, 48, INK, 4) +
      c(128, 72, 22, '#6A6E72') +
      c(128, 72, 13, '#4E5256') +
      // Dried herb sprig
      leafSprig(156, 72, 0.75, p.leaf),
  }),

  nightstand: (p) => ({
    w: 92,
    h: 92,
    body:
      leg(18, 80, 10, p.dark) +
      leg(68, 80, 10, p.dark) +
      r(10, 20, 72, 60, p.wood, 6) +
      woodGrain(12, 22, 68, 12) +
      r(18, 28, 56, 20, p.main, 3) +
      r(18, 54, 56, 20, p.main, 3) +
      c(46, 38, 3, '#E9C65B') +
      c(46, 64, 3, '#E9C65B'),
  }),

  towelRack: (p) => ({
    w: 96,
    h: 118,
    body:
      line(16, 16, 16, 106, INK, 8) +
      line(80, 16, 80, 106, INK, 8) +
      line(16, 16, 16, 106, p.wood, 5) +
      line(80, 16, 80, 106, p.wood, 5) +
      line(16, 26, 80, 26, p.wood, 5) +
      cushion(26, 30, 20, 58, p.main, 5) +
      cushion(52, 30, 20, 58, p.second, 5) +
      line(16, 106, 80, 106, p.wood, 5),
  }),
};

export const SMALL_SHAPES: Record<string, Shape> = {
  petBowl: (p) => ({
    w: 76,
    h: 44,
    body:
      // Ceramic pet bowl with inner rim & paw-print / dot motif (IMG_2700)
      shadedPath('M 10 18 L 66 18 L 58 38 C 44 41 32 41 18 38 Z', p.main) +
      el(38, 17, 28, 7.5, p.paper) +
      el(38, 18, 22, 5, p.second) +
      // Cute paw print / spots on front face
      c(38, 29, 3, p.paper, 'none', 0) +
      c(34, 25, 1.8, p.paper, 'none', 0) +
      c(38, 23.5, 1.8, p.paper, 'none', 0) +
      c(42, 25, 1.8, p.paper, 'none', 0) +
      c(21, 28, 2.2, p.paper, 'none', 0) +
      c(55, 28, 2.2, p.paper, 'none', 0),
  }),

  ball: (p) => ({
    w: 46,
    h: 46,
    body:
      c(23, 23, 18, p.accent) +
      path('M 8 18 C 20 24 30 24 38 14', 'none', p.second, 4) +
      path('M 10 30 C 22 34 30 32 38 26', 'none', p.second, 4),
  }),

  slippers: (_p) => ({
    w: 88,
    h: 46,
    body:
      // Cozy yellow & grey open-toe porch slippers (IMG_2700)
      `<g transform="rotate(14 26 24)">` +
      el(26, 24, 12, 18, '#D5D8DA') +
      el(26, 24, 9, 14, '#BCC2C6', 'none', 0) +
      r(15, 13, 22, 11, '#E8C04F', 5) +
      line(18, 18, 34, 18, '#B88D2A', 1.8) +
      `</g>` +
      `<g transform="rotate(14 60 24)">` +
      el(60, 24, 12, 18, '#D5D8DA') +
      el(60, 24, 9, 14, '#BCC2C6', 'none', 0) +
      r(49, 13, 22, 11, '#E8C04F', 5) +
      line(52, 18, 68, 18, '#B88D2A', 1.8) +
      `</g>`,
  }),

  steppingStone: (p) => ({
    w: 112,
    h: 50,
    body:
      // Beveled flat garden stepping slab (IMG_2700)
      shadedPath('M 14 20 L 96 14 L 104 38 L 10 42 Z', '#8C9496') +
      shadedPath('M 16 16 L 94 11 L 100 32 L 12 36 Z', '#A7AFB0') +
      line(28, 22, 42, 21, INK, 1.8) +
      line(64, 19, 80, 18, INK, 1.8) +
      c(12, 40, 4, p.second) +
      c(98, 40, 3.5, p.second),
  }),

  doorMat: (p) => ({
    w: 126,
    h: 48,
    body:
      // Fringed grid bath / entry mat (IMG_2704)
      Array.from({ length: 6 }, (_, i) => line(4, 15 + i * 4.5, 16, 15 + i * 4.5, '#FBF9F4', 2.4)).join('') +
      Array.from({ length: 6 }, (_, i) => line(110, 15 + i * 4.5, 122, 15 + i * 4.5, '#FBF9F4', 2.4)).join('') +
      r(14, 10, 98, 30, '#F5F2EC', 3) +
      r(20, 14, 86, 22, p.second, 2, p.main, 1.5) +
      [40, 62, 84].map((x) => line(x, 14, x, 36, '#B8C2C4', 1.8)).join('') +
      [21, 29].map((y) => line(20, y, 106, y, '#B8C2C4', 1.8)).join(''),
  }),

  mushroom: (p) => ({
    w: 54,
    h: 52,
    body:
      r(22, 24, 10, 22, p.paper, 4) +
      shadedPath('M 4 26 C 4 8 50 8 50 26 Z', p.accent) +
      dots(
        [
          [16, 20],
          [28, 15],
          [40, 21],
        ],
        p.paper,
        3.8,
      ),
  }),

  plush: (p) => ({
    w: 64,
    h: 60,
    body:
      c(22, 22, 8, p.main) +
      c(42, 22, 8, p.main) +
      c(32, 38, 18, p.main) +
      c(27, 34, 2.8, INK, 'none', 0) +
      c(37, 34, 2.8, INK, 'none', 0) +
      `<circle cx="27.8" cy="33" r="0.9" fill="#FFFDF8"/><circle cx="37.8" cy="33" r="0.9" fill="#FFFDF8"/>` +
      path('M 28 42 C 31 45 34 45 37 42', 'none', INK, 2) +
      c(20, 44, 7, p.second) +
      c(44, 44, 7, p.second),
  }),

  lantern: (p) => ({
    w: 54,
    h: 84,
    body:
      `<circle cx="27" cy="34" r="24" fill="url(#oh-glow)" pointer-events="none"/>` +
      line(27, 4, 27, 16, INK, 3) +
      shadedPath('M 14 16 L 40 16 L 44 52 L 10 52 Z', p.metal) +
      r(18, 24, 18, 20, '#F7CE70', 4) +
      c(27, 34, 5.5, '#FFF6CC', 'none', 0) +
      r(10, 52, 34, 6, p.metal, 2) +
      r(18, 58, 18, 4, p.metal, 2),
  }),

  birdhouse: (p) => ({
    w: 92,
    h: 120,
    body:
      r(24, 70, 6, 46, p.wood, 2) +
      r(14, 36, 64, 40, p.main, 4) +
      shadedPath('M 8 38 L 46 10 L 84 38 Z', p.accent) +
      c(46, 54, 10, p.dark) +
      r(40, 68, 12, 6, p.wood, 2) +
      dots(
        [
          [34, 46],
          [58, 46],
          [46, 80],
        ],
        p.second,
        2,
      ),
  }),

  windChime: (p) => ({
    w: 58,
    h: 130,
    body:
      line(29, 2, 29, 18, p.wood, 3) +
      el(29, 22, 14, 5, p.wood) +
      line(18, 26, 18, 72, p.metal, 2.5) +
      line(29, 26, 29, 84, p.metal, 2.5) +
      line(40, 26, 40, 64, p.metal, 2.5) +
      el(18, 76, 4, 8, p.metal) +
      el(29, 88, 4, 9, p.metal) +
      el(40, 68, 4, 8, p.metal) +
      path('M 22 106 C 26 96 32 96 36 106', 'none', p.main, 3),
  }),

  wateringCan: (p) => ({
    w: 82,
    h: 74,
    body:
      path('M 22 28 C 22 14 48 14 48 28', 'none', INK, 6) +
      path('M 22 28 C 22 14 48 14 48 28', 'none', p.metal, 3.5) +
      r(14, 28, 42, 34, p.main, 6) +
      path('M 54 26 L 76 10 L 80 18 L 60 34 Z', p.main) +
      el(70, 8, 5.5, 3.5, '#E9C65B') +
      el(35, 30, 12, 4, p.second),
  }),

  catTree: (p) => ({
    w: 156,
    h: 220,
    body:
      el(78, 208, 52, 9, p.second) +
      r(30, 110, 14, 96, p.wood, 3) +
      r(104, 130, 14, 76, p.wood, 3) +
      Array.from({ length: 8 }, (_, i) => line(31, 120 + i * 10, 43, 120 + i * 10, p.second, 2)).join('') +
      Array.from({ length: 6 }, (_, i) => line(105, 140 + i * 10, 117, 140 + i * 10, p.second, 2)).join('') +
      cushion(18, 94, 74, 16, p.main, 6) +
      cushion(92, 62, 54, 14, p.second, 5) +
      r(96, 30, 46, 36, p.accent, 8) +
      c(78, 70, 10, 'none', p.dark, 3) +
      line(38, 110, 38, 126, INK, 1.5) +
      c(38, 129, 5, p.accent) +
      r(42, 72, 10, 22, p.main, 4),
  }),

  swing: (p) => ({
    w: 220,
    h: 200,
    body:
      shadedPath('M 18 192 L 58 26 L 80 26 L 46 192 Z', p.wood) +
      shadedPath('M 202 192 L 162 26 L 140 26 L 174 192 Z', p.wood) +
      line(58, 26, 162, 26, p.wood, 6) +
      line(88, 26, 88, 122, p.metal, 3) +
      line(132, 26, 132, 122, p.metal, 3) +
      r(78, 122, 64, 12, p.main, 4) +
      line(88, 134, 88, 176, p.metal, 3) +
      line(132, 134, 132, 176, p.metal, 3),
  }),

  birdFeeder: (p) => ({
    w: 92,
    h: 150,
    body:
      r(44, 78, 5, 52, p.wood, 2) +
      r(14, 30, 64, 48, p.paper, 5) +
      shadedPath('M 6 30 L 46 4 L 86 30 Z', p.accent) +
      r(22, 40, 48, 6, p.second, 2) +
      c(46, 62, 5, p.dark) +
      r(14, 92, 64, 10, p.main, 4) +
      r(44, 130, 5, 16, p.wood, 2),
  }),

  fountain: (p) => ({
    w: 220,
    h: 230,
    body:
      el(110, 196, 96, 24, p.second) +
      shadedPath('M 26 188 L 58 150 L 162 150 L 194 188 Z', p.second) +
      el(110, 150, 52, 14, p.glass) +
      r(100, 74, 20, 76, p.second, 4) +
      el(110, 70, 34, 10, p.second) +
      shadedPath('M 110 14 C 96 30 96 46 110 58 C 124 46 124 30 110 14 Z', p.glass) +
      path('M 76 62 C 84 74 96 80 110 80 M 144 62 C 136 74 124 80 110 80', 'none', p.glass, 3) +
      dots(
        [
          [88, 56],
          [132, 52],
          [110, 60],
          [72, 100],
          [148, 104],
        ],
        '#FFFFFF',
        2.2,
      ),
  }),

  roseArch: (p) => ({
    w: 200,
    h: 260,
    body:
      path('M 34 252 L 34 84 C 34 34 166 34 166 84 L 166 252', 'none', p.wood, 10) +
      path('M 18 252 L 18 84 C 18 20 182 20 182 84 L 182 252', 'none', p.leaf, 3) +
      [0, 1, 2].map((i) => c(24 + i * 4, 88 + i * 48, 8, p.accent, INK, 2)).join('') +
      [0, 1, 2].map((i) => c(176 - i * 3, 110 + i * 44, 7, p.accent, INK, 2)).join('') +
      c(100, 26, 9, p.accent) +
      c(70, 34, 7, p.second) +
      c(130, 34, 7, p.second) +
      c(44, 66, 8, p.leaf) +
      c(156, 70, 8, p.leaf),
  }),

  stonePath: (p) => ({
    w: 180,
    h: 70,
    body:
      el(34, 44, 26, 16, p.second) +
      el(82, 30, 24, 14, p.main) +
      el(128, 46, 28, 15, p.second) +
      el(160, 26, 16, 10, p.main),
  }),

  butterflyHouse: (p) => ({
    w: 78,
    h: 100,
    body:
      r(12, 20, 54, 66, p.wood, 5) +
      shadedPath('M 6 22 L 39 2 L 72 22 Z', p.accent) +
      r(30, 36, 18, 40, p.dark, 3) +
      Array.from({ length: 4 }, (_, i) => line(24 + i * 10, 40, 24 + i * 10, 72, p.main, 2)).join('') +
      r(34, 86, 6, 10, p.dark, 2),
  }),

  windmill: (p) => ({
    w: 190,
    h: 260,
    body:
      shadedPath('M 62 250 L 76 86 L 114 86 L 128 250 Z', p.main) +
      shadedPath('M 68 86 L 95 40 L 122 86 Z', p.accent) +
      r(88, 54, 14, 18, p.wood, 3) +
      path('M 84 120 L 106 120 L 110 240 L 80 240 Z', p.dark) +
      r(78, 214, 34, 8, p.second, 2) +
      // Timber sails with lattice canvas
      path('M 95 84 L 95 16 M 95 84 L 26 84 M 95 84 L 164 84 M 95 84 L 95 152', 'none', INK, 7) +
      path('M 95 84 L 95 16 M 95 84 L 26 84 M 95 84 L 164 84 M 95 84 L 95 152', 'none', p.wood, 4) +
      r(82, 18, 12, 48, p.paper, 2) +
      r(96, 100, 12, 48, p.paper, 2) +
      r(28, 70, 48, 12, p.paper, 2) +
      r(114, 86, 48, 12, p.paper, 2) +
      c(95, 84, 7.5, p.wood),
  }),

  scarecrow: (p) => ({
    w: 150,
    h: 220,
    body:
      r(72, 60, 8, 146, p.wood, 3) +
      line(34, 96, 118, 96, p.wood, 6) +
      c(76, 44, 18, p.paper) +
      shadedPath('M 58 28 L 94 28 L 88 12 L 64 12 Z', p.accent) +
      c(70, 44, 2.2, INK, 'none', 0) +
      c(82, 44, 2.2, INK, 'none', 0) +
      path('M 70 52 C 74 55 78 55 82 52', 'none', INK, 2) +
      shadedPath('M 46 92 L 58 140 L 94 140 L 106 92 Z', p.main) +
      path('M 58 140 L 56 172 M 94 140 L 96 172', 'none', p.dark, 4) +
      r(44, 62, 16, 8, p.leaf, 2),
  }),

  wheelbarrow: (p) => ({
    w: 170,
    h: 122,
    body:
      c(44, 96, 22, p.dark) +
      c(44, 96, 9, p.metal) +
      shadedPath('M 26 58 L 116 58 L 130 92 L 48 92 Z', p.main) +
      r(24, 52, 94, 10, p.second, 3) +
      line(118, 86, 154, 54, p.wood, 5) +
      r(128, 46, 22, 8, p.wood, 3) +
      r(62, 40, 20, 14, p.leaf, 3) +
      c(84, 36, 10, p.leaf),
  }),

  hayBale: (p) => ({
    w: 130,
    h: 96,
    body:
      // Fluffy golden hay stack with loose wisps (IMG_2707)
      shadedPath('M 14 78 C 8 56 18 32 42 26 C 52 14 82 14 92 28 C 114 34 122 58 114 78 Z', '#E7B955') +
      r(22, 42, 84, 34, p.second, 12, INK, 2) +
      line(30, 54, 98, 54, '#B5842A', 2.4) +
      line(34, 68, 94, 68, '#B5842A', 2.4) +
      path('M 14 70 L 4 64 M 18 76 L 6 82 M 114 68 L 126 62 M 112 76 L 124 82 M 58 20 L 52 8 M 74 20 L 82 10', 'none', '#D6A43C', 2.4),
  }),

  trough: (p) => ({
    w: 170,
    h: 78,
    body:
      leg(24, 68, 6, p.dark) +
      leg(136, 68, 6, p.dark) +
      shadedPath('M 8 18 L 162 18 L 150 68 L 20 68 Z', p.wood) +
      el(85, 18, 75, 9, p.dark) +
      el(85, 18, 64, 6, p.leaf),
  }),

  nest: (_p) => ({
    w: 106,
    h: 68,
    body:
      // Woven straw nest with speckles & tucked eggs (IMG_2707)
      el(53, 42, 42, 18, '#C89B4C') +
      el(53, 33, 33, 12, '#DFB86C') +
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 8) * Math.PI;
        return line(53 - Math.cos(a) * 38, 36 + Math.sin(a) * 12, 53 - Math.cos(a) * 44, 32 + Math.sin(a) * 19, '#9C6D2E', 2.2);
      }).join('') +
      el(41, 29, 9.5, 7.5, '#FFF8EA') +
      el(54, 26, 9, 7, '#E8F0EB') +
      el(65, 30, 8.5, 7, '#FFF4DA'),
  }),

  fence: (p) => ({
    w: 210,
    h: 106,
    body:
      // Crisp white country picket fence (IMG_2707)
      r(8, 36, 194, 10, '#F6F2E8', 3) +
      r(8, 68, 194, 10, '#F6F2E8', 3) +
      [16, 56, 96, 136, 176]
        .map((x) => shadedPath(`M ${x} 98 L ${x} 26 L ${x + 10} 12 L ${x + 20} 26 L ${x + 20} 98 Z`, '#FCF9F2') + c(x + 10, 41, 1.8, p.dark) + c(x + 10, 73, 1.8, p.dark))
        .join(''),
  }),

  doghouse: (p) => ({
    w: 204,
    h: 182,
    body:
      // Cozy painted wood cabin with red pitched roof & porch (IMG_2707)
      r(22, 68, 152, 104, '#E8DCC8', 6) +
      woodGrain(26, 74, 144, 92) +
      shadedPath('M 6 74 L 98 12 L 190 74 L 178 82 L 98 26 L 18 82 Z', '#D65B4A') +
      path('M 60 172 L 60 116 C 60 90 136 90 136 116 L 136 172 Z', '#4B3A30') +
      r(32, 82, 26, 22, '#BFD8E3', 3) +
      line(45, 82, 45, 104, INK, 2) +
      line(32, 93, 58, 93, INK, 2) +
      c(98, 46, 9, '#FFF7EA') +
      line(98, 46, 98, 40, INK, 1.8) +
      line(98, 46, 103, 48, INK, 1.8) +
      r(80, 82, 36, 10, '#E9C65B', 4) +
      r(38, 154, 10, 18, p.dark, 2) +
      r(148, 154, 10, 18, p.dark, 2),
  }),

  coop: (p) => ({
    w: 210,
    h: 180,
    body:
      r(20, 60, 156, 106, '#E8D3B0', 6) +
      woodGrain(26, 66, 144, 90) +
      shadedPath('M 10 64 L 100 8 L 190 64 Z', '#D65B4A') +
      r(52, 96, 36, 70, p.dark, 3) +
      r(116, 88, 42, 30, '#F5E5B8', 3) +
      Array.from({ length: 4 }, (_, i) => line(120 + i * 10, 90, 120 + i * 10, 116, p.wood, 2)).join('') +
      c(100, 44, 7, '#FFF7EA') +
      r(30, 154, 10, 18, p.dark, 2) +
      r(156, 154, 10, 18, p.dark, 2),
  }),

  milkCan: (p) => ({
    w: 68,
    h: 92,
    body:
      r(18, 26, 32, 54, p.metal, 6) +
      r(12, 18, 44, 12, p.metal, 4) +
      r(26, 10, 16, 10, p.metal, 3) +
      path('M 24 20 C 24 12 44 12 44 20', 'none', p.dark, 3) +
      r(22, 48, 24, 12, p.paper, 2),
  }),

  beehive: (p) => ({
    w: 104,
    h: 128,
    body:
      line(52, 98, 52, 122, p.wood, 5) +
      r(20, 52, 64, 46, '#E9C65B', 18) +
      r(24, 30, 56, 30, '#E9C65B', 14) +
      r(32, 60, 40, 8, p.dark, 3) +
      r(32, 82, 40, 8, p.dark, 3) +
      c(52, 46, 7, p.dark) +
      path('M 18 100 C 18 92 86 92 86 100', 'none', p.wood, 5) +
      c(30, 34, 4, p.leaf) +
      c(72, 24, 4, p.leaf) +
      c(84, 40, 3, p.leaf),
  }),

  crate: (p) => ({
    w: 110,
    h: 84,
    body:
      r(10, 20, 90, 54, p.wood, 4) +
      Array.from({ length: 3 }, (_, i) => r(10, 26 + i * 16, 90, 5, p.dark, 2)).join('') +
      c(40, 14, 8, p.accent) +
      c(58, 12, 8, p.leaf) +
      c(76, 15, 7, p.accent),
  }),

  picnicBlanket: (_p) => ({
    w: 270,
    h: 118,
    body:
      // Blue-and-white gingham picnic blanket with woven basket & treats (IMG_2701)
      shadedPath('M 18 44 L 252 44 L 232 108 L 38 108 Z', '#FBF8F0') +
      Array.from({ length: 6 }, (_, i) => line(42 + i * 36, 46, 54 + i * 34, 106, '#8CB1D4', 6)).join('') +
      Array.from({ length: 3 }, (_, i) => line(32, 58 + i * 18, 238, 58 + i * 18, '#8CB1D4', 4.5)).join('') +
      // Woven basket & cake plate
      r(154, 48, 52, 30, '#C79355', 5) +
      path('M 150 48 C 154 22 206 22 210 48', 'none', '#9A6933', 3.5) +
      el(104, 78, 22, 8, '#FFFDF8') +
      r(90, 62, 28, 15, '#F5D67B', 4) +
      c(104, 59, 4, '#D65B4A'),
  }),

  pool: (_p) => ({
    w: 430,
    h: 210,
    body:
      // Perspective rectangular tiled garden pool with stone coping & dual chrome ladders (IMG_2698 / IMG_2701)
      shadedPath('M 64 26 L 412 26 L 348 194 L 16 194 Z', '#ECE7D8') +
      // Blue tiled inner wall & tiled floor water basin
      shadedPath('M 76 38 L 392 38 L 336 178 L 32 178 Z', '#2F94C4') +
      shadedPath('M 76 58 L 384 58 L 336 178 L 32 178 Z', '#3FA6D6') +
      // Tile grid lines across water
      Array.from({ length: 8 }, (_, i) => {
        const xTop = 98 + i * 36;
        const xBot = 56 + i * 36;
        return line(xTop, 38, xBot, 178, '#256F96', 1.6);
      }).join('') +
      [74, 98, 124, 150].map((y) => line(74 - (y - 58) * 0.35, y, 386 - (y - 58) * 0.35, y, '#256F96', 1.6)).join('') +
      // Dual chrome pool ladders on left & right rim
      path('M 74 72 L 74 28 C 74 16 96 16 96 28 L 96 76 M 112 72 L 112 28 C 112 16 134 16 134 28 L 134 76', 'none', INK, 6) +
      path('M 74 72 L 74 28 C 74 16 96 16 96 28 L 96 76 M 112 72 L 112 28 C 112 16 134 16 134 28 L 134 76', 'none', '#D8DFE3', 3) +
      path('M 308 164 L 308 122 C 308 110 330 110 330 122 L 330 166 M 342 164 L 342 122 C 342 110 364 110 364 122 L 364 166', 'none', INK, 6) +
      path('M 308 164 L 308 122 C 308 110 330 110 330 122 L 330 166 M 342 164 L 342 122 C 342 110 364 110 364 122 L 364 166', 'none', '#D8DFE3', 3),
  }),

  flowerBed: (p) => ({
    w: 180,
    h: 112,
    body:
      // Raised timber garden bed with lavender spikes or cheerful daisies (IMG_2701)
      r(8, 52, 164, 52, '#7D5C3E', 4) +
      line(10, 69, 170, 69, INK, 2) +
      line(10, 86, 170, 86, INK, 2) +
      r(16, 46, 148, 14, '#5E4228', 3) +
      [0, 1, 2, 3, 4, 5]
        .map((i) => {
          const x = 30 + i * 24;
          const h = i % 2 === 0 ? 32 : 24;
          return (
            line(x, 52, x, 52 - h, '#58824B', 3) +
            c(x - 6, 48 - h * 0.4, 5, '#6E9A59') +
            c(x + 6, 48 - h * 0.4, 5, '#6E9A59') +
            c(x, 46 - h, 7.5, i % 2 ? p.main : p.accent) +
            c(x, 46 - h, 2.8, '#E9C65B')
          );
        })
        .join('') +
      r(8, 48, 164, 10, '#96714E', 3),
  }),

  hedge: (p) => ({
    w: 210,
    h: 108,
    body:
      shadedPath('M 8 100 C 2 68 20 40 52 46 C 60 22 96 20 108 40 C 124 16 164 20 170 46 C 200 40 214 70 202 100 Z', p.leaf) +
      dots(
        [
          [40, 62],
          [76, 50],
          [112, 60],
          [148, 48],
          [178, 68],
          [60, 82],
          [130, 84],
        ],
        p.second,
        3.5,
      ),
  }),

  tree: (p) => ({
    w: 256,
    h: 304,
    body:
      // Warm autumn canopy tree with red hanging lantern (IMG_2701)
      `<ellipse cx="126" cy="295" rx="88" ry="8" fill="#2B2521" opacity="0.14"/>` +
      r(114, 174, 24, 114, '#7E5A3E', 5) +
      path('M 124 236 L 78 184 M 130 222 L 178 170', 'none', '#7E5A3E', 9) +
      // Hanging red paper lantern on branch
      line(166, 180, 166, 202, INK, 2) +
      el(166, 214, 10, 12, '#DF5F4A') +
      r(161, 201, 10, 4, '#E9C65B', 1) +
      // Layered golden-orange autumn foliage
      c(80, 146, 46, '#E2893B') +
      c(174, 144, 44, '#DF7D36') +
      c(126, 118, 76, '#EA9A45') +
      c(126, 62, 46, '#F4B65B') +
      c(76, 104, 26, '#F4B65B') +
      c(180, 100, 22, '#F4B65B') +
      dots(
        [
          [100, 78],
          [150, 74],
          [72, 138],
          [168, 152],
          [110, 166],
          [140, 122],
        ],
        p.accent,
        4.5,
      ),
  }),

  tent: (_p) => ({
    w: 244,
    h: 178,
    body:
      // Cream string-light canopy teepee tent with soft cushions & plush (IMG_2703)
      shadedPath('M 20 166 L 122 18 L 224 166 Z', '#F7F1E2') +
      shadedPath('M 122 18 L 122 166 L 224 166 Z', '#EAE0CB') +
      path('M 92 166 L 122 78 L 152 166 Z', '#7B6958') +
      // String of warm fairy lights across entrance
      path('M 72 88 C 102 108 142 108 172 88', 'none', INK, 1.8) +
      c(88, 96, 4, '#F9DB78') +
      c(122, 102, 4, '#F9DB78') +
      c(156, 96, 4, '#F9DB78') +
      line(122, 18, 122, 78, INK, 2.5) +
      path('M 122 18 L 104 6 L 122 12 L 140 6 Z', '#9CC2C9') +
      cushion(96, 142, 48, 22, '#B6D3D8', 8) +
      c(120, 142, 10, '#FFFFFF'),
  }),

  rockingChair: (p) => ({
    w: 150,
    h: 150,
    body:
      // Mint polka-dot nursery rocking chair with draped pink throw (IMG_2703)
      r(32, 16, 68, 64, '#5CB09E', 14) +
      dots([[46, 32], [66, 28], [84, 38], [52, 54], [78, 60]], '#DDF5EC', 2.4) +
      // Pink fringed blanket draped over top backrest
      r(44, 10, 42, 46, '#F29FA8', 6) +
      [48, 58, 68, 78].map((x) => line(x, 56, x, 64, '#F29FA8', 2.5)).join('') +
      // Wooden armrests & cushion seat
      cushion(22, 68, 88, 16, '#5CB09E', 6) +
      dots([[40, 76], [62, 74], [88, 77]], '#DDF5EC', 2) +
      r(20, 56, 84, 10, '#C78E54', 4) +
      path('M 30 84 L 22 114 M 102 84 L 110 114', 'none', INK, 7) +
      path('M 30 84 L 22 114 M 102 84 L 110 114', 'none', p.wood, 4) +
      path('M 8 120 C 44 146 108 146 142 116', 'none', INK, 10) +
      path('M 8 120 C 44 146 108 146 142 116', 'none', '#C78E54', 6) +
      line(34, 114, 34, 130, p.dark, 3) +
      line(100, 114, 100, 130, p.dark, 3),
  }),

  toyBasket: (p) => ({
    w: 96,
    h: 82,
    body:
      c(30, 14, 10, p.accent) +
      r(52, 6, 18, 18, p.second, 4) +
      shadedPath('M 12 28 L 84 28 L 74 76 L 22 76 Z', p.main) +
      r(8, 20, 80, 12, p.wood, 5) +
      c(66, 30, 7, p.leaf),
  }),

  walker: (p) => ({
    w: 120,
    h: 120,
    body:
      // Pastel blue circular nursery walker with plush cushion & rolling wheels (IMG_2703)
      el(60, 90, 48, 16, '#B9E2E8') +
      el(60, 86, 36, 10, '#DFF3F6', 'none', 0) +
      line(28, 54, 24, 86, '#7E7A75', 5) +
      line(92, 54, 96, 86, '#7E7A75', 5) +
      line(60, 58, 60, 94, '#7E7A75', 5) +
      el(60, 46, 42, 18, '#B9E2E8') +
      cushion(42, 34, 36, 22, '#9A8CC6', 10) +
      c(24, 94, 6, '#5D5A56') +
      c(96, 94, 6, '#5D5A56') +
      c(60, 102, 6, '#5D5A56') +
      c(42, 46, 2.5, p.paper) +
      c(78, 46, 2.5, p.paper),
  }),

  mobile: (p) => ({
    w: 112,
    h: 132,
    body:
      // Mint constellation nursery mobile with moon, star & clouds (IMG_2703)
      line(56, 4, 56, 26, p.wood, 3) +
      el(56, 30, 38, 8, '#A9D0C8') +
      line(24, 34, 24, 68, p.metal, 1.8) +
      line(56, 38, 56, 82, p.metal, 1.8) +
      line(88, 34, 88, 62, p.metal, 1.8) +
      c(24, 74, 8, '#F7DF84') +
      el(56, 88, 13, 8, '#FFFDF7') +
      c(88, 68, 7, '#B6D3E3') +
      c(56, 14, 5, '#E9C65B'),
  }),

  babyMobileAlt: (p) => ({
    w: 100,
    h: 100,
    body: c(50, 50, 30, p.main) + c(50, 50, 12, p.second),
  }),

  wallArtSmall: (p) => ({
    w: 84,
    h: 74,
    body:
      // Pastel rainbow & cloud nursery print in wood frame (IMG_2703)
      r(6, 6, 72, 62, p.wood, 4) +
      r(12, 12, 60, 50, '#FBF7EC', 2) +
      path('M 22 48 C 22 24 62 24 62 48', 'none', '#E49B8C', 6) +
      path('M 28 48 C 28 30 56 30 56 48', 'none', '#E9C65B', 5) +
      path('M 34 48 C 34 36 50 36 50 48', 'none', '#9CC2C9', 4) +
      el(24, 50, 8, 5, '#FFFFFF') +
      el(60, 50, 8, 5, '#FFFFFF'),
  }),

  curtain: (p) => ({
    w: 120,
    h: 200,
    body:
      r(6, 4, 108, 10, p.wood, 3) +
      shadedPath('M 12 14 C 30 30 28 80 18 190 L 52 190 C 46 120 50 60 58 14 Z', p.main) +
      shadedPath('M 108 14 C 90 30 92 80 102 190 L 68 190 C 74 120 70 60 62 14 Z', p.second),
  }),

  // Fallback SVG shapes for new Asset Pack v1.1 items (matching PNGs in aspect & silhouette)
  noticeBoard: (p) => ({
    w: 130,
    h: 96,
    body:
      r(8, 10, 114, 76, p.wood, 5) +
      r(15, 17, 100, 62, '#D7B587', 3) +
      r(24, 24, 28, 24, '#FFF8E8', 2) +
      r(62, 22, 34, 28, '#DFEFF2', 2) +
      r(38, 50, 32, 22, '#F7DF94', 2) +
      c(38, 26, 2.5, '#D65B4A') +
      c(79, 24, 2.5, '#7F9B5C'),
  }),

  umbrellaStand: (p) => ({
    w: 76,
    h: 124,
    body:
      line(30, 18, 30, 80, INK, 4) +
      path('M 30 18 C 30 10 20 10 20 18', 'none', p.wood, 3.5) +
      line(46, 22, 46, 80, INK, 4) +
      path('M 46 22 C 46 14 56 14 56 22', 'none', p.wood, 3.5) +
      shadedPath('M 18 54 L 58 54 L 54 116 L 22 116 Z', p.main) +
      r(15, 48, 46, 8, p.second, 3),
  }),

  catCarrier: (p) => ({
    w: 112,
    h: 88,
    body:
      path('M 42 18 C 42 10 70 10 70 18', 'none', p.dark, 5) +
      r(12, 20, 88, 60, p.main, 14) +
      r(16, 48, 80, 32, p.second, 10) +
      r(28, 30, 36, 38, '#4A4E52', 6) +
      line(38, 30, 38, 68, '#D5D8DA', 2) +
      line(48, 30, 48, 68, '#D5D8DA', 2) +
      line(56, 30, 56, 68, '#D5D8DA', 2),
  }),

  bookStack: (p) => ({
    w: 84,
    h: 62,
    body:
      r(10, 40, 64, 14, '#C4483B', 3) +
      r(14, 26, 56, 14, '#8EA7C6', 3) +
      r(18, 12, 48, 14, p.second, 3) +
      line(18, 47, 66, 47, p.paper, 2) +
      line(22, 33, 62, 33, p.paper, 2),
  }),

  spiceJars: (p) => ({
    w: 96,
    h: 58,
    body:
      r(8, 44, 80, 8, p.wood, 3) +
      r(16, 18, 16, 26, '#E8EFF1', 4) +
      r(40, 14, 16, 30, '#E8EFF1', 4) +
      r(64, 20, 16, 24, '#E8EFF1', 4) +
      r(18, 14, 12, 5, p.wood, 2) +
      r(42, 10, 12, 5, p.wood, 2) +
      r(66, 16, 12, 5, p.wood, 2) +
      r(19, 26, 10, 14, '#D66A3E', 2) +
      r(43, 24, 10, 16, '#7F9B5C', 2) +
      r(67, 28, 10, 12, '#E9C65B', 2),
  }),

  rockingHorse: (p) => ({
    w: 120,
    h: 108,
    body:
      path('M 14 90 C 42 104 78 104 106 90', 'none', p.wood, 6) +
      line(34, 62, 28, 92, p.wood, 6) +
      line(84, 62, 90, 92, p.wood, 6) +
      r(28, 44, 62, 24, '#C99B6B', 10) +
      shadedPath('M 74 48 L 88 18 L 106 26 L 96 42 L 86 58 Z', '#C99B6B') +
      r(44, 40, 24, 12, '#D65B4A', 4) +
      path('M 28 48 C 16 54 14 72 22 80', 'none', p.dark, 5),
  }),

  lampPost: (_p) => ({
    w: 76,
    h: 224,
    body:
      `<circle cx="38" cy="34" r="28" fill="url(#oh-glow)" pointer-events="none"/>` +
      r(26, 202, 24, 14, '#3A4246', 4) +
      r(34, 54, 8, 150, '#3A4246', 2) +
      shadedPath('M 22 54 L 54 54 L 58 22 L 18 22 Z', '#3A4246') +
      r(24, 26, 28, 24, '#F7CE70', 4) +
      shadedPath('M 14 22 L 38 8 L 62 22 Z', '#3A4246'),
  }),

  tropicalPlants: (_p) => ({
    w: 112,
    h: 136,
    body:
      shadedPath('M 30 88 L 82 88 L 74 128 L 38 128 Z', '#C97B56') +
      r(26, 82, 60, 10, '#DF936C', 4) +
      path('M 56 82 C 36 50 18 46 14 24 C 36 26 48 50 56 82 Z', '#5F8E54') +
      path('M 56 82 C 56 42 46 20 58 8 C 70 24 64 48 56 82 Z', '#78A866') +
      path('M 56 82 C 74 52 92 44 98 22 C 76 28 66 52 56 82 Z', '#639257'),
  }),

  treeStumps: (p) => ({
    w: 120,
    h: 72,
    body:
      r(14, 30, 42, 34, '#8A6442', 6) +
      el(35, 30, 21, 7, '#DFC197') +
      el(35, 30, 13, 4, '#C49A68') +
      r(64, 42, 36, 22, '#7C5839', 5) +
      el(82, 42, 18, 6, '#DFC197') +
      c(20, 62, 5, p.leaf),
  }),

  rockCluster: (p) => ({
    w: 110,
    h: 64,
    body:
      shadedPath('M 14 54 C 12 30 34 18 54 24 C 70 28 74 44 70 54 Z', '#98A2A4') +
      shadedPath('M 52 54 C 54 36 74 28 92 36 C 102 42 100 52 94 54 Z', '#B2BCBE') +
      c(22, 54, 4, p.leaf),
  }),

  cow: (_p) => ({
    w: 150,
    h: 116,
    body:
      // Spotted milk cow (IMG_2707)
      leg(40, 82, 26, '#F6F2EA', 8) +
      leg(104, 82, 26, '#F6F2EA', 8) +
      r(32, 38, 86, 48, '#FCF9F2', 20) +
      c(64, 54, 11, '#3A3531', 'none', 0) +
      c(96, 66, 9, '#3A3531', 'none', 0) +
      r(12, 26, 36, 32, '#FCF9F2', 12) +
      el(24, 52, 14, 9, '#F2B8B8') +
      c(22, 36, 2.5, INK, 'none', 0) +
      c(34, 36, 2.5, INK, 'none', 0) +
      el(14, 24, 6, 4, '#D9C49E') +
      el(44, 24, 6, 4, '#D9C49E'),
  }),

  chicken: (_p) => ({
    w: 72,
    h: 68,
    body:
      // Round farm hen (IMG_2707)
      line(30, 52, 28, 62, '#E29D3B', 3) +
      line(42, 52, 44, 62, '#E29D3B', 3) +
      el(38, 38, 22, 17, '#FFF7EA') +
      c(24, 24, 11, '#FFF7EA') +
      c(24, 11, 4, '#D65B4A') +
      c(29, 12, 3.5, '#D65B4A') +
      path('M 13 24 L 6 27 L 13 30 Z', '#E9A944') +
      c(21, 23, 2, INK, 'none', 0),
  }),
};

export const OUTDOOR_SHAPES = FURNITURE_SHAPES;
