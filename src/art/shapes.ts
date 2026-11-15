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
        // Curved upholstered backrest
        cushion(20, 20, 220, 62, m, 18) +
        // Left & right plump back cushions
        cushion(34, 32, 92, 42, s, 13) +
        cushion(134, 32, 92, 42, s, 13) +
        // Decorative throw pillows tucked in corners
        `<g transform="rotate(-12 46 56)">${cushion(32, 42, 28, 28, p.accent, 8)}</g>` +
        `<g transform="rotate(11 214 56)">${cushion(200, 42, 28, 28, p.paper, 8)}</g>` +
        // Rolled armrests
        cushion(8, 52, 38, 48, m, 15) +
        cushion(214, 52, 38, 48, m, 15) +
        // Deep seat cushions with seam
        cushion(32, 72, 98, 28, s, 10) +
        cushion(130, 72, 98, 28, s, 10) +
        // Exposed walnut rail with grain & tapered legs
        r(22, 96, 216, 11, p.wood, 5) +
        woodGrain(24, 96, 212, 11) +
        leg(32, 106, 11, p.dark) +
        leg(220, 106, 11, p.dark),
    };
  },

  armchair: (p) => ({
    w: 150,
    h: 132,
    body:
      cushion(26, 16, 98, 76, p.main, 22) +
      cushion(38, 28, 74, 46, p.second, 14) +
      // Tuft button detail
      c(60, 48, 2.5, p.dark, INK, 1.5) +
      c(90, 48, 2.5, p.dark, INK, 1.5) +
      // Small accent throw cushion
      `<g transform="rotate(-10 56 62)">${cushion(42, 48, 28, 24, p.accent, 7)}</g>` +
      // Rolled arms & seat deck
      cushion(12, 58, 32, 46, p.main, 13) +
      cushion(106, 58, 32, 46, p.main, 13) +
      cushion(28, 76, 94, 28, p.second, 11) +
      r(24, 100, 102, 11, p.wood, 5) +
      woodGrain(26, 100, 98, 11) +
      leg(34, 110, 18, p.dark, 6.5) +
      leg(110, 110, 18, p.dark, 6.5),
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
      cushion(18, 13, 144, 15, p.second, 6),
  }),

  bed: (p) => ({
    w: 300,
    h: 176,
    body:
      // Carved timber headboard with inset panels
      r(32, 4, 236, 86, p.wood, 18) +
      woodGrain(38, 10, 224, 24) +
      r(46, 18, 96, 52, p.second, 10) +
      r(158, 18, 96, 52, p.second, 10) +
      // Crisp linen sheet & twin plump pillows
      cushion(18, 62, 264, 34, p.paper, 12) +
      cushion(32, 52, 72, 34, p.main, 14) +
      cushion(110, 52, 72, 34, p.main, 14) +
      // Cozy quilted duvet & folded throw blanket at foot
      cushion(24, 88, 252, 48, p.accent, 14) +
      r(24, 88, 252, 18, p.paper, 8) +
      line(34, 118, 266, 118, p.second, 2.5) +
      dots(
        [
          [60, 112],
          [104, 124],
          [150, 114],
          [198, 124],
          [240, 112],
        ],
        p.second,
        3,
      ) +
      // Timber bed rail & legs
      r(18, 128, 264, 14, p.wood, 6) +
      woodGrain(22, 128, 256, 14) +
      leg(26, 142, 28, p.dark, 8) +
      leg(264, 142, 28, p.dark, 8),
  }),

  crib: (p) => ({
    w: 210,
    h: 152,
    body:
      path('M 20 38 C 20 8 190 8 190 38', 'none', p.wood, 6) +
      el(66, 26, 13, 8, p.paper) +
      el(142, 24, 11, 7, p.paper) +
      c(105, 16, 5, p.accent) +
      r(20, 38, 170, 84, p.second, 10) +
      r(28, 54, 154, 58, p.paper, 6) +
      cushion(34, 84, 142, 26, p.main, 8) +
      Array.from({ length: 7 }, (_, i) => r(36 + i * 22, 50, 5.5, 64, p.wood, 2.5)).join('') +
      r(18, 36, 174, 14, p.wood, 6) +
      woodGrain(22, 36, 166, 14) +
      r(14, 116, 182, 11, p.wood, 5) +
      leg(26, 127, 19, p.dark, 7) +
      leg(176, 127, 19, p.dark, 7),
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
      r(10, 8, 196, 104, p.dark, 12) +
      r(18, 16, 180, 88, '#2C373B', 7) +
      // Warm illustrated mountain & sunset broadcast glow
      `<rect x="24" y="22" width="168" height="76" rx="5" fill="#779BB3"/>` +
      `<rect x="24" y="22" width="168" height="44" rx="5" fill="#F2C88B" opacity="0.45"/>` +
      path('M 28 96 L 74 52 L 106 78 L 144 40 L 188 96 Z', '#557A66', INK, 2) +
      c(156, 39, 9, '#F7DF94', INK, 1.8) +
      // Diagonal glass screen highlight
      `<rect x="24" y="22" width="168" height="76" rx="5" fill="url(#oh-glass)" pointer-events="none"/>` +
      c(192, 94, 3, '#A6D89A', INK, 1.2) +
      r(92, 112, 36, 8, p.dark, 3) +
      r(70, 118, 80, 7, p.dark, 3.5),
  }),

  tvcabinet: (p) => ({
    w: 230,
    h: 78,
    body:
      leg(22, 62, 14, p.dark, 7) +
      leg(198, 62, 14, p.dark, 7) +
      r(10, 18, 210, 46, p.wood, 8) +
      woodGrain(14, 20, 202, 12) +
      r(22, 30, 88, 24, p.main, 4) +
      r(120, 30, 88, 24, p.main, 4) +
      // Slatted panel lines
      line(40, 33, 40, 51, p.second, 2) +
      line(56, 33, 56, 51, p.second, 2) +
      line(156, 33, 156, 51, p.second, 2) +
      line(172, 33, 172, 51, p.second, 2) +
      c(88, 42, 3.2, '#E9C65B') +
      c(142, 42, 3.2, '#E9C65B'),
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
      r(18, 34, 11, 70, p.dark, 3) +
      r(166, 34, 11, 70, p.dark, 3) +
      r(102, 34, 72, 34, p.wood, 4) +
      r(108, 40, 60, 22, p.main, 3) +
      c(138, 51, 3.2, '#E9C65B') +
      r(8, 20, 180, 15, p.wood, 5) +
      woodGrain(12, 20, 172, 15) +
      // Open notebook & pencil cup
      r(28, 10, 50, 10, p.paper, 2) +
      r(32, 3, 42, 8, p.accent, 2) +
      r(148, 6, 13, 14, p.second, 3) +
      line(152, 0, 152, 8, p.accent, 2.5) +
      line(157, 2, 157, 8, p.leaf, 2.5),
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
      path('M 26 26 L 26 164 M 124 26 L 124 164 M 26 26 C 60 6 90 6 124 26', 'none', INK, 9) +
      path('M 26 26 L 26 164 M 124 26 L 124 164 M 26 26 C 60 6 90 6 124 26', 'none', p.wood, 5) +
      r(38, 38, 24, 72, p.main, 4) +
      r(67, 32, 22, 80, p.second, 4) +
      r(95, 42, 21, 68, p.accent, 4) +
      line(40, 108, 40, 150, p.dark, 2) +
      line(70, 110, 70, 150, p.dark, 2) +
      line(98, 108, 98, 150, p.dark, 2) +
      r(18, 154, 14, 9, p.dark, 3) +
      r(118, 154, 14, 9, p.dark, 3),
  }),

  laundryBasket: (p) => ({
    w: 86,
    h: 82,
    body:
      cushion(28, 4, 30, 18, p.paper, 5) +
      cushion(18, 10, 28, 16, p.second, 5) +
      shadedPath('M 12 26 L 74 26 L 66 76 L 20 76 Z', p.main) +
      r(8, 18, 70, 12, p.wood, 5) +
      Array.from({ length: 6 }, (_, i) => line(20 + i * 10, 32, 22 + i * 9, 72, p.second, 2)).join(''),
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
    w: 280,
    h: 136,
    body:
      leg(46, 112, 20, p.metal, 7.5) +
      leg(224, 112, 20, p.metal, 7.5) +
      r(248, 6, 7, 34, p.metal, 3) +
      path('M 252 6 C 252 -6 268 -6 268 4', 'none', INK, 6.5) +
      path('M 252 6 C 252 -6 268 -6 268 4', 'none', p.metal, 3.5) +
      shadedPath('M 22 34 L 258 34 C 258 34 252 104 230 112 L 50 112 C 28 104 22 34 22 34 Z', p.paper) +
      r(16, 24, 248, 16, p.paper, 8) +
      path('M 42 44 C 48 90 64 100 84 100 L 196 100 C 216 100 232 90 238 44 Z', p.glass, 'none', 0).replace(
        '/>',
        ' opacity="0.58"/>',
      ) +
      // Iridescent soap bubbles along rim
      c(84, 24, 11, '#FFFFFF') +
      c(98, 20, 9, '#FFFFFF') +
      c(112, 24, 10, '#FFFFFF') +
      c(162, 25, 8, '#FFFFFF'),
  }),

  sink: (p) => ({
    w: 136,
    h: 132,
    body:
      line(100, 36, 100, 15, INK, 6.5) +
      line(100, 36, 100, 15, p.metal, 3.5) +
      path('M 100 15 C 100 5 88 5 88 13', 'none', INK, 6.5) +
      path('M 100 15 C 100 5 88 5 88 13', 'none', p.metal, 3.5) +
      r(58, 58, 20, 44, p.paper, 6) +
      r(44, 98, 48, 12, p.paper, 5) +
      r(18, 28, 100, 22, p.paper, 10) +
      r(32, 46, 72, 14, p.second, 7) +
      c(66, 36, 3, p.dark),
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
      r(12, 42, 226, 62, p.main, 5) +
      r(22, 52, 62, 42, p.second, 4) +
      r(92, 52, 66, 42, p.second, 4) +
      r(166, 52, 62, 42, p.second, 4) +
      c(53, 73, 3.2, '#E9C65B') +
      c(125, 73, 3.2, '#E9C65B') +
      c(197, 73, 3.2, '#E9C65B') +
      r(6, 22, 238, 20, p.paper, 5) +
      r(6, 104, 238, 9, p.dark, 3),
  }),

  stove: (p) => ({
    w: 250,
    h: 150,
    body:
      r(8, 16, 234, 122, p.main, 9) +
      r(18, 26, 214, 26, p.dark, 5) +
      c(46, 39, 9.5, INK) +
      c(96, 39, 9.5, INK) +
      c(146, 39, 9.5, INK) +
      c(196, 39, 9.5, INK) +
      r(24, 62, 176, 58, p.second, 6) +
      r(36, 72, 152, 36, '#F2C06E', 5) +
      `<rect x="36" y="72" width="152" height="36" rx="5" fill="url(#oh-glass)" pointer-events="none"/>` +
      r(38, 66, 148, 5, p.metal, 2) +
      c(34, 104, 3, p.accent) +
      c(46, 104, 3, p.accent) +
      r(208, 72, 20, 9, p.metal, 3) +
      r(208, 89, 20, 9, p.metal, 3) +
      r(14, 132, 222, 8, p.dark, 3),
  }),

  oven: (p) => ({
    w: 190,
    h: 170,
    body:
      r(10, 12, 170, 144, p.main, 8) +
      r(22, 24, 146, 22, p.dark, 5) +
      c(40, 35, 7, p.metal) +
      c(74, 35, 7, p.metal) +
      c(108, 35, 7, p.metal) +
      r(22, 54, 146, 72, p.second, 5) +
      r(32, 62, 126, 50, '#F2C06E', 4) +
      `<rect x="32" y="62" width="126" height="50" rx="4" fill="url(#oh-glass)" pointer-events="none"/>` +
      r(22, 136, 146, 10, p.metal, 4) +
      r(58, 146, 16, 8, p.dark, 2) +
      r(116, 146, 16, 8, p.dark, 2),
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
      shadedPath('M 22 60 L 168 60 L 150 18 L 40 18 Z', p.metal) +
      r(38, 12, 114, 10, p.metal, 4) +
      r(28, 58, 134, 8, p.dark, 3) +
      r(46, 64, 8, 8, p.metal, 2) +
      r(136, 64, 8, 8, p.metal, 2),
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
    w: 70,
    h: 40,
    body:
      shadedPath('M 8 16 L 62 16 L 54 34 L 16 34 Z', p.main) +
      el(35, 16, 27, 7, p.second) +
      c(28, 13, 4, p.accent) +
      c(39, 12, 3.2, p.leaf) +
      c(46, 14, 3.2, p.accent),
  }),

  ball: (p) => ({
    w: 46,
    h: 46,
    body:
      c(23, 23, 18, p.accent) +
      path('M 8 18 C 20 24 30 24 38 14', 'none', p.second, 4) +
      path('M 10 30 C 22 34 30 32 38 26', 'none', p.second, 4),
  }),

  slippers: (p) => ({
    w: 80,
    h: 40,
    body:
      el(24, 26, 18, 9, p.main) +
      el(56, 26, 18, 9, p.second) +
      path('M 12 22 C 20 12 30 12 36 22', 'none', p.accent, 3) +
      path('M 44 22 C 52 12 62 12 68 22', 'none', p.accent, 3),
  }),

  steppingStone: (p) => ({
    w: 100,
    h: 44,
    body: el(50, 22, 44, 18, p.second) + el(50, 18, 32, 11, p.main, 'none', 0),
  }),

  doorMat: (p) => ({
    w: 110,
    h: 40,
    body:
      r(6, 12, 98, 24, p.main, 4) +
      r(16, 18, 78, 12, 'none', 2, p.second, 2) +
      dots(
        [
          [26, 24],
          [40, 24],
          [54, 24],
          [68, 24],
          [82, 24],
        ],
        p.second,
        2,
      ),
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
      r(10, 20, 110, 62, p.second, 10) +
      Array.from({ length: 5 }, (_, i) => line(22 + i * 22, 24, 22 + i * 22, 78, p.dark, 2)).join('') +
      r(30, 8, 70, 16, p.second, 6) +
      dots(
        [
          [20, 88],
          [110, 88],
        ],
        p.dark,
        2,
      ),
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

  nest: (p) => ({
    w: 100,
    h: 66,
    body:
      el(50, 38, 38, 18, p.wood) +
      el(50, 30, 28, 11, p.second) +
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI;
        return line(50 - Math.cos(a) * 34, 34 + Math.sin(a) * 12, 50 - Math.cos(a) * 40, 30 + Math.sin(a) * 18, p.dark, 2);
      }).join('') +
      el(44, 26, 9, 7, p.paper) +
      el(57, 27, 8, 6, p.glass),
  }),

  fence: (p) => ({
    w: 210,
    h: 106,
    body:
      r(10, 34, 190, 10, p.wood, 3) +
      r(10, 66, 190, 10, p.wood, 3) +
      [18, 68, 118, 168].map((x) => shadedPath(`M ${x} 98 L ${x} 26 L ${x + 8} 14 L ${x + 20} 26 L ${x + 20} 98 Z`, p.main)).join(''),
  }),

  doghouse: (p) => ({
    w: 200,
    h: 178,
    body:
      r(20, 66, 150, 102, p.wood, 6) +
      woodGrain(26, 72, 138, 90) +
      shadedPath('M 8 72 L 96 12 L 184 72 Z', p.accent) +
      path('M 58 168 L 58 116 C 58 92 132 92 132 116 L 132 168 Z', p.dark) +
      r(30, 78, 32, 22, p.paper, 3) +
      c(96, 44, 7, p.second) +
      r(40, 148, 10, 20, p.dark, 2) +
      r(146, 148, 10, 20, p.dark, 2) +
      r(84, 86, 24, 7, p.paper, 3),
  }),

  coop: (p) => ({
    w: 210,
    h: 180,
    body:
      r(20, 60, 156, 106, p.wood, 6) +
      woodGrain(26, 66, 144, 90) +
      shadedPath('M 10 64 L 100 8 L 190 64 Z', p.accent) +
      r(52, 96, 36, 70, p.dark, 3) +
      r(116, 88, 42, 30, p.second, 3) +
      Array.from({ length: 4 }, (_, i) => line(120 + i * 10, 90, 120 + i * 10, 116, p.wood, 2)).join('') +
      c(100, 44, 5, p.second) +
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

  picnicBlanket: (p) => ({
    w: 260,
    h: 110,
    body:
      shadedPath('M 20 40 L 240 40 L 220 100 L 40 100 Z', p.main) +
      Array.from({ length: 5 }, (_, i) => line(40 + i * 42, 44, 54 + i * 40, 96, p.second, 2.2)).join('') +
      Array.from({ length: 2 }, (_, i) => line(30, 58 + i * 26, 230, 58 + i * 26, p.second, 2.2)).join('') +
      r(112, 58, 36, 22, p.wood, 4) +
      path('M 106 58 C 108 34 152 34 154 58', 'none', p.wood, 3),
  }),

  pool: (p) => ({
    w: 430,
    h: 160,
    body:
      el(215, 80, 204, 60, p.paper) +
      el(215, 80, 190, 51, p.glass) +
      `<ellipse cx="215" cy="80" rx="188" ry="49" fill="url(#oh-glass)" pointer-events="none"/>` +
      el(215, 80, 190, 51, 'none', '#8FB9C9', 3) +
      path('M 70 72 C 90 62 110 82 130 72 M 150 92 C 170 82 190 102 210 92 M 220 62 C 240 52 260 72 280 62', 'none', '#FFFFFF', 2.8, 'opacity="0.65"') +
      el(160, 46, 18, 6, p.leaf) +
      c(160, 44, 4.5, p.second) +
      el(280, 66, 14, 5, p.leaf) +
      r(340, 30, 10, 26, p.metal, 2) +
      path('M 345 30 C 345 22 360 22 360 30', 'none', p.metal, 3),
  }),

  flowerBed: (p) => ({
    w: 180,
    h: 112,
    body:
      r(8, 52, 164, 50, p.wood, 5) +
      woodGrain(12, 56, 156, 42) +
      r(18, 60, 144, 34, p.dark, 3) +
      [0, 1, 2, 3, 4]
        .map((i) => {
          const x = 34 + i * 28;
          return line(x, 62, x, 42, p.leaf, 3) + c(x, 36, 8, i % 2 ? p.main : p.accent) + c(x, 36, 3, p.second);
        })
        .join('') +
      r(8, 44, 164, 12, p.second, 4),
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
    w: 250,
    h: 300,
    body:
      `<ellipse cx="126" cy="292" rx="86" ry="8" fill="#2B2521" opacity="0.14"/>` +
      r(116, 178, 20, 106, p.dark, 5) +
      path('M 126 240 L 82 190 M 130 224 L 176 176', 'none', p.dark, 8) +
      c(84, 150, 44, p.leaf) +
      c(172, 146, 42, p.leaf) +
      c(126, 120, 76, p.leaf) +
      c(126, 62, 44, p.second) +
      c(76, 106, 24, p.second) +
      c(180, 100, 20, p.second) +
      dots(
        [
          [100, 80],
          [150, 76],
          [70, 140],
          [170, 160],
          [110, 170],
          [140, 124],
        ],
        p.accent,
        5,
      ),
  }),

  tent: (p) => ({
    w: 240,
    h: 170,
    body:
      shadedPath('M 20 160 L 120 20 L 220 160 Z', p.main) +
      shadedPath('M 120 20 L 120 160 L 220 160 Z', p.second) +
      path('M 96 160 L 120 84 L 144 160 Z', p.dark) +
      line(120, 20, 120, 84, INK, 3) +
      path('M 120 20 L 100 6 L 120 12 L 140 6 Z', p.accent) +
      r(38, 132, 26, 28, p.paper, 3) +
      c(48, 142, 4, p.accent) +
      el(48, 156, 16, 4, p.second),
  }),

  rockingChair: (p) => ({
    w: 150,
    h: 150,
    body:
      r(34, 16, 60, 62, p.wood, 14) +
      cushion(42, 24, 44, 44, p.second, 8) +
      cushion(24, 68, 84, 14, p.wood, 5) +
      path('M 30 82 L 22 108 M 100 82 L 108 108', 'none', p.dark, 6) +
      path('M 8 122 C 44 146 108 146 142 118', 'none', p.wood, 7) +
      line(32, 110, 32, 128, p.dark, 3) +
      line(100, 110, 100, 128, p.dark, 3),
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
      r(18, 30, 84, 50, p.main, 20) +
      r(30, 40, 60, 30, p.second, 15) +
      r(48, 44, 24, 22, p.paper, 8) +
      c(54, 52, 3, INK, 'none', 0) +
      c(66, 52, 3, INK, 'none', 0) +
      c(24, 84, 9, p.dark) +
      c(96, 84, 9, p.dark) +
      c(50, 92, 8, p.dark) +
      c(70, 92, 8, p.dark) +
      r(42, 18, 36, 8, p.metal, 4),
  }),

  mobile: (p) => ({
    w: 110,
    h: 128,
    body:
      line(55, 4, 55, 30, p.wood, 3) +
      path('M 14 40 C 30 26 80 26 96 40', 'none', p.wood, 4) +
      line(22, 40, 22, 64, p.metal, 2) +
      line(55, 34, 55, 74, p.metal, 2) +
      line(88, 40, 88, 58, p.metal, 2) +
      el(22, 72, 10, 6, p.main) +
      el(55, 82, 11, 6, p.accent) +
      el(88, 66, 9, 5, p.leaf) +
      c(55, 12, 5, p.accent),
  }),

  babyMobileAlt: (p) => ({
    w: 100,
    h: 100,
    body: c(50, 50, 30, p.main) + c(50, 50, 12, p.second),
  }),

  wallArtSmall: (p) => ({
    w: 80,
    h: 70,
    body:
      r(6, 6, 68, 58, p.wood, 4) +
      r(12, 12, 56, 46, p.paper, 2) +
      shadedPath('M 16 52 L 32 30 L 44 42 L 56 24 L 66 52 Z', p.leaf) +
      c(54, 22, 5, p.accent),
  }),

  curtain: (p) => ({
    w: 120,
    h: 200,
    body:
      r(6, 4, 108, 10, p.wood, 3) +
      shadedPath('M 12 14 C 30 30 28 80 18 190 L 52 190 C 46 120 50 60 58 14 Z', p.main) +
      shadedPath('M 108 14 C 90 30 92 80 102 190 L 68 190 C 74 120 70 60 62 14 Z', p.second),
  }),
};

export const OUTDOOR_SHAPES = FURNITURE_SHAPES;
