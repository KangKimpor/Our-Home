/** Original furniture and indoor item shapes. All drawn on a bottom baseline. */

import type { Palette } from './palettes';
import {
  c,
  dots,
  el,
  INK,
  leafSprig,
  leg,
  line,
  p as path,  r,
  sheen,
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
        r(22, 24, 216, 60, m, 16) +
        r(34, 36, 92, 38, s, 12) +
        r(134, 36, 92, 38, s, 12) +
        line(130, 38, 130, 76, INK, 2) +
        r(10, 56, 38, 44, m, 14) +
        r(212, 56, 38, 44, m, 14) +
        r(30, 74, 200, 26, s, 10) +
        dots(
          [
            [52, 70],
            [70, 70],
            [88, 70],
            [106, 70],
            [124, 70],
            [142, 70],
            [160, 70],
            [178, 70],
            [196, 70],
          ],
          p.dark,
          1.8,
        ) +
        r(22, 96, 216, 10, p.wood, 5) +
        leg(30, 104, 10, p.dark) +
        leg(222, 104, 10, p.dark) +
        sheen(40, 30, 60, 8, '#FFFFFF', 0.22),
    };
  },

  armchair: (p) => ({
    w: 150,
    h: 132,
    body:
      r(28, 18, 94, 74, p.main, 22) +
      r(40, 30, 70, 44, p.second, 14) +
      r(14, 60, 30, 44, p.main, 12) +
      r(106, 60, 30, 44, p.main, 12) +
      r(28, 78, 94, 26, p.second, 10) +
      r(26, 100, 98, 10, p.wood, 5) +
      leg(34, 108, 16, p.dark, 6) +
      leg(112, 108, 16, p.dark, 6) +
      sheen(46, 34, 30, 7, '#FFFFFF', 0.2),
  }),

  coffeeTable: (p) => ({
    w: 190,
    h: 78,
    body:
      r(10, 18, 170, 18, p.wood, 7) +
      r(22, 27, 146, 5, p.second, 3) +
      r(26, 56, 138, 9, p.second, 4) +
      leg(28, 60, 16, p.dark, 6) +
      leg(156, 60, 16, p.dark, 6) +
      r(84, 6, 22, 10, p.accent, 3) +
      c(95, 2, 5, p.leaf) +
      sheen(18, 20, 78, 4, '#FFFFFF', 0.28),
  }),

  sideTable: (p) => ({
    w: 96,
    h: 82,
    body:
      el(48, 20, 38, 11, p.wood) +
      r(43, 28, 10, 40, p.dark, 3) +
      el(48, 70, 24, 7, p.dark) +
      r(30, 6, 28, 9, p.accent, 4) +
      c(44, 2, 4, p.leaf),
  }),

  diningTable: (p) => ({
    w: 250,
    h: 104,
    body:
      r(8, 20, 214, 16, p.wood, 6) +
      r(20, 31, 190, 4, p.second, 2) +
      leg(26, 36, 56, p.dark, 8) +
      leg(178, 36, 56, p.dark, 8) +
      leg(26, 36, 40, p.wood, 4) +
      leg(180, 36, 40, p.wood, 4) +
      r(104, 4, 42, 14, p.paper, 4) +
      c(114, 10, 4, p.accent) +
      c(126, 13, 4, p.leaf) +
      c(138, 8, 3, p.main) +
      sheen(16, 22, 90, 4, '#FFFFFF', 0.25),
  }),

  chair: (p) => ({
    w: 86,
    h: 124,
    body:
      r(14, 12, 58, 62, p.wood, 12) +
      r(24, 22, 38, 40, p.second, 7) +
      r(10, 66, 66, 14, p.wood, 6) +
      leg(16, 78, 36, p.dark, 6) +
      leg(64, 78, 36, p.dark, 6) +
      r(20, 44, 4, 12, p.wood, 2),
  }),

  stool: (p) => ({
    w: 64,
    h: 64,
    body:
      el(32, 18, 24, 9, p.main) +
      r(29, 22, 6, 30, p.dark, 2) +
      path('M 32 46 L 12 60 M 32 46 L 52 60 M 32 46 L 32 60', 'none', INK, 4) +
      r(10, 12, 44, 7, p.second, 3),
  }),

  bench: (p) => ({
    w: 180,
    h: 82,
    body:
      r(8, 26, 164, 14, p.wood, 6) +
      r(20, 14, 140, 14, p.second, 5) +
      leg(22, 40, 34, p.dark, 7) +
      leg(150, 40, 34, p.dark, 7) +
      line(20, 50, 160, 50, p.wood, 5),
  }),

  bed: (p) => ({
    w: 300,
    h: 176,
    body:
      r(34, 4, 232, 82, p.wood, 18) +
      r(48, 16, 204, 54, p.second, 12) +
      r(18, 62, 264, 30, p.paper, 12) +
      r(30, 54, 70, 34, p.main, 14) +
      r(108, 54, 70, 34, p.main, 14) +
      r(30, 92, 240, 44, p.accent, 14) +
      line(34, 112, 266, 112, p.second, 3) +
      r(18, 128, 264, 12, p.wood, 6) +
      leg(28, 140, 26, p.dark) +
      leg(260, 140, 26, p.dark) +
      dots(
        [
          [60, 104],
          [92, 120],
          [150, 108],
          [200, 116],
          [236, 104],
        ],
        p.second,
        3,
      ) +
      r(46, 22, 76, 22, p.paper, 11) +
      r(166, 22, 76, 22, p.paper, 11),
  }),

  crib: (p) => ({
    w: 210,
    h: 152,
    body:
      r(20, 38, 170, 84, p.second, 10) +
      r(20, 38, 170, 14, p.wood, 6) +
      r(30, 54, 150, 58, p.paper, 6) +
      Array.from({ length: 7 }, (_, i) => r(36 + i * 22, 52, 5, 62, p.wood, 2)).join('') +
      r(14, 116, 182, 10, p.wood, 5) +
      leg(26, 126, 16, p.dark) +
      leg(166, 126, 16, p.dark) +
      path('M 20 38 C 20 10 190 10 190 38', 'none', p.wood, 6) +
      el(64, 28, 12, 8, p.paper) +
      el(140, 24, 10, 7, p.paper),
  }),

  wardrobe: (p) => ({
    w: 164,
    h: 224,
    body:
      r(12, 18, 140, 186, p.wood, 10) +
      r(22, 30, 58, 160, p.main, 6) +
      r(84, 30, 58, 160, p.main, 6) +
      line(82, 22, 82, 202, INK, 2) +
      c(74, 112, 4, p.dark) +
      c(92, 112, 4, p.dark) +
      r(10, 202, 144, 10, p.wood, 4) +
      leg(22, 212, 10, p.dark) +
      leg(132, 212, 10, p.dark) +
      c(48, 20, 8, p.accent) +
      c(116, 12, 5, p.accent),
  }),

  dresser: (p) => ({
    w: 176,
    h: 122,
    body:
      r(12, 22, 152, 84, p.wood, 9) +
      r(24, 32, 128, 20, p.main, 5) +
      r(24, 58, 128, 20, p.main, 5) +
      r(24, 84, 128, 20, p.main, 5) +
      c(88, 42, 3, p.dark) +
      c(88, 68, 3, p.dark) +
      c(88, 94, 3, p.dark) +
      r(10, 106, 156, 8, p.wood, 4) +
      leg(22, 114, 8, p.dark) +
      leg(146, 114, 8, p.dark) +
      el(88, 22, 26, 5, p.second),
  }),

  bookshelf: (p) => ({
    w: 132,
    h: 206,
    body:
      r(12, 10, 108, 188, p.wood, 6) +
      r(20, 20, 92, 168, p.second, 3) +
      [20, 62, 104, 146].map((y) => r(20, y, 92, 6, p.wood, 2)).join('') +
      r(28, 30, 10, 28, p.accent, 2) +
      r(41, 34, 8, 24, p.main, 2) +
      r(52, 28, 9, 30, p.leaf, 2) +
      r(28, 72, 9, 28, p.leaf, 2) +
      r(40, 76, 11, 24, p.accent, 2) +
      r(56, 70, 8, 30, p.main, 2) +
      r(70, 76, 9, 24, p.dark, 2) +
      r(28, 114, 12, 28, p.main, 2) +
      r(46, 118, 8, 24, p.accent, 2) +
      r(60, 112, 10, 30, p.leaf, 2) +
      el(66, 176, 16, 10, p.accent) +
      c(66, 168, 5, p.leaf),
  }),

  tv: (p) => ({
    w: 220,
    h: 132,
    body:
      r(10, 8, 196, 104, p.dark, 12) +
      r(20, 18, 176, 84, '#3D4A4E', 7) +
      r(30, 28, 156, 64, p.glass, 4) +
      path('M 40 80 L 74 50 L 100 72 L 132 36 L 170 74', 'none', p.main, 4) +
      c(154, 40, 8, p.accent) +
      r(92, 112, 36, 8, p.dark, 3) +
      r(74, 118, 72, 6, p.dark, 3),
  }),

  tvcabinet: (p) => ({
    w: 230,
    h: 78,
    body:
      r(10, 20, 210, 44, p.wood, 8) +
      r(22, 30, 90, 24, p.main, 4) +
      r(118, 30, 90, 24, p.main, 4) +
      c(58, 42, 3, p.dark) +
      c(172, 42, 3, p.dark) +
      line(115, 24, 115, 60, INK, 2) +
      leg(24, 64, 12, p.dark) +
      leg(196, 64, 12, p.dark),
  }),

  piano: (p) => ({
    w: 270,
    h: 210,
    body:
      r(20, 16, 210, 96, p.wood, 8) +
      r(32, 26, 186, 72, p.dark, 4) +
      r(46, 40, 158, 20, p.main, 3) +
      r(20, 108, 210, 22, p.paper, 4) +
      Array.from({ length: 14 }, (_, i) => line(30 + i * 14, 108, 30 + i * 14, 130, INK, 2)).join('') +
      Array.from({ length: 7 }, (_, i) => r(34 + i * 28, 108, 8, 13, INK, 0, INK, 0)).join('') +
      r(20, 130, 210, 42, p.wood, 6) +
      r(32, 142, 186, 12, p.second, 3) +
      leg(40, 172, 30, p.dark, 8) +
      leg(204, 172, 30, p.dark, 8) +
      r(118, 78, 24, 28, p.dark, 3) +
      r(20, 8, 210, 10, p.second, 4),
  }),

  pianoBench: (p) => ({
    w: 110,
    h: 62,
    body:
      r(8, 18, 94, 14, p.wood, 6) +
      r(14, 12, 82, 8, p.second, 3) +
      leg(18, 32, 22, p.dark, 6) +
      leg(86, 32, 22, p.dark, 6) +
      line(18, 46, 86, 46, p.wood, 4),
  }),

  floorLamp: (p) => ({
    w: 78,
    h: 220,
    body:
      el(39, 206, 28, 8, p.dark) +
      r(35, 96, 7, 106, p.wood, 3) +
      path('M 26 96 L 52 96 L 64 46 L 14 46 Z', p.main) +
      path('M 14 46 L 64 46 L 60 40 L 18 40 Z', p.second) +
      line(20, 52, 58, 52, p.second, 2) +
      r(33, 94, 11, 8, p.wood, 2),
  }),

  tableLamp: (p) => ({
    w: 64,
    h: 96,
    body:
      el(32, 88, 18, 6, p.dark) +
      r(29, 46, 6, 38, p.wood, 2) +
      path('M 22 46 L 42 46 L 50 16 L 14 16 Z', p.main) +
      line(18, 22, 46, 22, p.second, 2) +
      el(32, 10, 6, 4, p.second),
  }),

  rug: (p) => ({
    w: 320,
    h: 112,
    body:
      el(160, 56, 150, 46, p.main, INK, 3) +
      el(160, 56, 132, 36, 'none', p.second, 3) +
      el(160, 56, 116, 26, 'none', p.second, 2) +
      el(160, 56, 96, 18, 'none', p.second, 2) +
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return c(160 + Math.cos(a) * 118, 56 + Math.sin(a) * 24, 2.6, p.second);
      }).join(''),
  }),

  plant: (p) => ({
    w: 96,
    h: 132,
    body:
      path('M 30 96 L 66 96 L 60 128 L 36 128 Z', p.accent) +
      r(28, 92, 40, 8, p.dark, 3) +
      leafSprig(48, 96, 1.5, p.leaf) +
      leafSprig(30, 96, 1.3, p.second) +
      leafSprig(66, 96, 1.25, p.leaf),
  }),

  vase: (p) => ({
    w: 68,
    h: 112,
    body:
      path('M 26 62 C 12 78 16 106 34 108 C 52 106 56 78 42 62 Z', p.main) +
      r(26, 54, 16, 12, p.main, 3) +
      leafSprig(34, 56, 1.6, p.leaf) +
      leafSprig(34, 58, 1.2, p.second) +
      line(20, 78, 48, 86, p.second, 2),
  }),

  painting: (p) => ({
    w: 116,
    h: 92,
    body:
      r(6, 6, 104, 80, p.wood, 4) +
      r(14, 14, 88, 64, p.paper, 2) +
      path('M 14 66 L 40 38 L 58 54 L 78 30 L 102 66 Z', p.leaf) +
      c(76, 30, 8, p.accent) +
      line(14, 70, 102, 70, p.second, 2),
  }),

  wallClock: (p) => ({
    w: 68,
    h: 68,
    body:
      c(34, 34, 29, p.paper) +
      c(34, 34, 24, p.second) +
      line(34, 34, 34, 18, INK, 3) +
      line(34, 34, 46, 40, INK, 3) +
      c(34, 34, 3, p.accent) +
      dots(
        [
          [34, 14],
          [54, 34],
          [34, 54],
          [14, 34],
        ],
        INK,
        2,
      ),
  }),

  shelf: (p) => ({
    w: 150,
    h: 62,
    body:
      r(6, 34, 138, 10, p.wood, 3) +
      r(20, 14, 18, 20, p.accent, 2) +
      r(44, 8, 14, 26, p.main, 2) +
      el(84, 24, 12, 10, p.leaf) +
      r(110, 16, 22, 18, p.paper, 2) +
      line(120, 20, 120, 30, p.second, 2),
  }),

  mirror: (p) => ({
    w: 92,
    h: 132,
    body:
      r(8, 8, 76, 116, p.wood, 40) +
      r(18, 18, 56, 96, p.glass, 28) +
      path('M 26 92 C 34 66 44 54 62 36', 'none', p.paper, 5) +
      path('M 32 104 C 42 82 52 72 68 58', 'none', p.paper, 2),
  }),

  desk: (p) => ({
    w: 196,
    h: 118,
    body:
      r(8, 20, 180, 14, p.wood, 4) +
      r(20, 34, 10, 66, p.dark, 3) +
      r(166, 34, 10, 66, p.dark, 3) +
      r(100, 34, 76, 30, p.wood, 4) +
      c(138, 49, 3, p.dark) +
      r(28, 10, 50, 10, p.paper, 2) +
      r(30, 2, 44, 10, p.main, 2),
  }),

  easel: (p) => ({
    w: 156,
    h: 200,
    body:
      path('M 78 18 L 30 192 M 78 18 L 126 192 M 78 18 L 78 192', 'none', p.wood, 7) +
      r(30, 52, 96, 76, p.paper, 3) +
      path('M 38 116 L 64 82 L 82 100 L 102 68 L 122 116 Z', p.leaf) +
      c(102, 74, 7, p.accent) +
      r(62, 128, 34, 7, p.wood, 2) +
      r(40, 140, 70, 6, p.wood, 2) +
      c(78, 20, 5, p.dark),
  }),

  artTable: (p) => ({
    w: 236,
    h: 118,
    body:
      r(8, 22, 220, 16, p.wood, 5) +
      leg(24, 38, 62, p.dark, 7) +
      leg(204, 38, 62, p.dark, 7) +
      r(28, 38, 176, 8, p.second, 3) +
      r(48, 6, 110, 17, p.paper, 3) +
      path('M 58 20 L 78 9 L 96 17 L 116 7 L 148 19 Z', p.leaf, 'none', 0) +
      el(198, 16, 12, 9, p.paper) +
      dots(
        [
          [188, 12],
          [196, 17],
          [204, 11],
          [200, 21],
        ],
        p.accent,
        3,
      ) +
      r(178, 24, 24, 8, p.main, 2),
  }),

  chaise: (p) => ({
    w: 260,
    h: 124,
    body:
      path('M 30 44 C 30 20 96 18 120 30 L 218 30 C 236 30 242 44 238 58 L 56 58 C 38 58 30 54 30 44 Z', p.second) +
      r(24, 58, 212, 30, p.main, 16) +
      r(20, 84, 220, 12, p.wood, 6) +
      leg(34, 96, 18, p.dark, 5) +
      leg(206, 96, 18, p.dark, 5) +
      path('M 52 58 L 226 58', 'none', p.dark, 2) +
      r(64, 34, 44, 18, p.paper, 9),
  }),

  clothesRack: (p) => ({
    w: 150,
    h: 176,
    body:
      path('M 26 26 L 26 164 M 124 26 L 124 164 M 26 26 C 60 6 90 6 124 26', 'none', p.wood, 6) +
      r(38, 40, 24, 70, p.main, 3) +
      r(68, 34, 22, 78, p.second, 3) +
      r(96, 44, 20, 66, p.accent, 3) +
      line(40, 108, 40, 150, p.dark, 2) +
      line(70, 110, 70, 150, p.dark, 2) +
      line(98, 108, 98, 150, p.dark, 2) +
      r(20, 154, 12, 8, p.dark, 2) +
      r(118, 154, 12, 8, p.dark, 2),
  }),

  laundryBasket: (p) => ({
    w: 86,
    h: 82,
    body:
      path('M 12 26 L 74 26 L 66 76 L 20 76 Z', p.main) +
      r(8, 18, 70, 12, p.wood, 5) +
      Array.from({ length: 6 }, (_, i) => line(20 + i * 10, 32, 22 + i * 9, 72, p.second, 2)).join('') +
      r(30, 4, 26, 16, p.paper, 4),
  }),

  shower: (p) => ({
    w: 176,
    h: 232,
    body:
      r(12, 10, 152, 212, '#DCE9EC', 8, INK, 3) +
      path('M 24 22 L 152 210 M 152 22 L 24 210', 'none', '#FFFFFF', 2) +
      r(18, 16, 140, 8, p.metal, 3) +
      el(88, 16, 8, 5, p.metal) +
      line(88, 16, 88, 40, p.metal, 3) +
      el(88, 46, 16, 6, p.metal) +
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return c(88 + Math.cos(a) * 24, 62 + Math.sin(a) * 10, 2, p.glass, 'none', 0);
      }).join('') +
      r(60, 196, 56, 10, p.second, 3),
  }),

  bathtub: (p) => ({
    w: 280,
    h: 136,
    body:
      path('M 22 34 L 258 34 C 258 34 252 104 230 112 L 50 112 C 28 104 22 34 22 34 Z', p.paper) +
      r(18, 24, 244, 16, p.paper, 8) +
      path('M 34 44 L 246 44', 'none', p.second, 2) +
      path('M 42 44 C 48 90 64 100 84 100 L 196 100 C 216 100 232 90 238 44 Z', p.glass, 'none', 0).replace(
        '/>',
        ' opacity="0.55"/>',
      ) +
      el(86, 56, 10, 6, p.paper, 'none', 0) +
      el(120, 50, 12, 6, p.paper, 'none', 0) +
      el(160, 60, 9, 5, p.paper, 'none', 0) +
      leg(48, 112, 18, p.metal, 7) +
      leg(222, 112, 18, p.metal, 7) +
      r(248, 6, 6, 34, p.metal, 3) +
      path('M 252 6 C 252 -6 268 -6 268 4', 'none', p.metal, 4),
  }),

  sink: (p) => ({
    w: 136,
    h: 132,
    body:
      r(20, 30, 96, 22, p.paper, 10) +
      r(34, 46, 68, 14, p.second, 7) +
      r(58, 60, 20, 40, p.paper, 6) +
      r(44, 98, 48, 10, p.paper, 4) +
      line(100, 40, 100, 16, p.metal, 4) +
      path('M 100 16 C 100 6 88 6 88 14', 'none', p.metal, 4) +
      c(66, 38, 3, p.dark),
  }),

  toilet: (p) => ({
    w: 110,
    h: 142,
    body:
      r(28, 48, 54, 62, p.paper, 14) +
      el(55, 54, 30, 12, p.paper) +
      r(18, 52, 74, 10, p.paper, 5) +
      el(55, 116, 26, 12, p.paper) +
      r(40, 6, 30, 40, p.paper, 8) +
      c(55, 26, 4, p.second) +
      r(46, 124, 18, 14, p.paper, 4),
  }),

  counter: (p) => ({
    w: 250,
    h: 120,
    body:
      r(6, 22, 238, 20, p.second, 5) +
      r(14, 42, 222, 62, p.main, 5) +
      r(24, 52, 60, 42, p.second, 3) +
      r(92, 52, 60, 42, p.second, 3) +
      r(160, 52, 66, 42, p.second, 3) +
      c(54, 73, 3, p.dark) +
      c(122, 73, 3, p.dark) +
      c(193, 73, 3, p.dark) +
      r(6, 104, 238, 8, p.dark, 3),
  }),

  stove: (p) => ({
    w: 250,
    h: 150,
    body:
      r(8, 16, 234, 122, p.main, 8) +
      r(18, 26, 214, 26, p.dark, 5) +
      c(46, 39, 9, INK) +
      c(96, 39, 9, INK) +
      c(146, 39, 9, INK) +
      c(196, 39, 9, INK) +
      r(24, 62, 176, 58, p.second, 6) +
      r(36, 72, 152, 36, p.glass, 4) +
      c(34, 102, 3, p.accent) +
      c(46, 102, 3, p.accent) +
      r(208, 74, 20, 8, p.metal, 3) +
      r(208, 90, 20, 8, p.metal, 3) +
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
      r(32, 62, 126, 50, p.glass, 4) +
      r(22, 136, 146, 10, p.metal, 4) +
      r(58, 146, 16, 8, p.dark, 2) +
      r(116, 146, 16, 8, p.dark, 2),
  }),

  fridge: (p) => ({
    w: 152,
    h: 236,
    body:
      r(12, 10, 128, 214, p.paper, 10) +
      line(12, 86, 140, 86, INK, 3) +
      r(118, 34, 8, 32, p.metal, 4) +
      r(118, 104, 8, 46, p.metal, 4) +
      r(28, 24, 24, 18, p.accent, 3) +
      c(40, 33, 4, p.main) +
      r(28, 108, 18, 14, p.leaf, 3) +
      r(52, 114, 14, 8, p.paper, 2),
  }),

  rangeHood: (p) => ({
    w: 190,
    h: 76,
    body:
      path('M 22 60 L 168 60 L 150 18 L 40 18 Z', p.metal) +
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
      el(46, 10, 7, 4, p.paper) +
      el(58, 4, 6, 3, p.paper),
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
      path('M 46 14 C 52 4 62 2 66 8', 'none', p.paper, 3),
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
      el(39, 26, 30, 13, p.main) +
      c(26, 18, 7, p.accent) +
      c(40, 14, 7, p.leaf) +
      c(54, 19, 6, p.second) +
      el(39, 36, 20, 5, p.second),
  }),

  cabinet: (p) => ({
    w: 156,
    h: 170,
    body:
      r(10, 14, 136, 144, p.wood, 8) +
      r(20, 24, 54, 60, p.main, 4) +
      r(82, 24, 54, 60, p.main, 4) +
      r(20, 92, 116, 56, p.second, 4) +
      line(58, 94, 58, 146, INK, 2) +
      line(98, 94, 98, 146, INK, 2) +
      c(46, 54, 3, p.dark) +
      c(110, 54, 3, p.dark) +
      r(10, 158, 136, 6, p.dark, 3) +
      el(78, 152, 14, 4, p.dark),
  }),

  nightstand: (p) => ({
    w: 92,
    h: 92,
    body:
      r(10, 20, 72, 60, p.wood, 6) +
      r(18, 28, 56, 20, p.main, 3) +
      r(18, 54, 56, 20, p.main, 3) +
      c(46, 38, 3, p.dark) +
      c(46, 64, 3, p.dark) +
      leg(18, 80, 10, p.dark) +
      leg(68, 80, 10, p.dark),
  }),

  towelRack: (p) => ({
    w: 96,
    h: 118,
    body:
      line(16, 16, 16, 106, p.wood, 6) +
      line(80, 16, 80, 106, p.wood, 6) +
      line(16, 26, 80, 26, p.wood, 5) +
      r(26, 30, 20, 58, p.main, 4) +
      r(52, 30, 20, 58, p.second, 4) +
      line(16, 106, 80, 106, p.wood, 5),
  }),
};

export const SMALL_SHAPES: Record<string, Shape> = {
  petBowl: (p) => ({
    w: 70,
    h: 40,
    body:
      path('M 8 16 L 62 16 L 54 34 L 16 34 Z', p.main) +
      el(35, 16, 27, 7, p.second) +
      c(28, 13, 4, p.accent) +
      c(39, 12, 3, p.leaf) +
      c(46, 14, 3, p.accent),
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
      r(23, 24, 8, 22, p.paper, 3) +
      path('M 4 26 C 4 8 50 8 50 26 Z', p.accent) +
      dots(
        [
          [16, 20],
          [28, 15],
          [40, 21],
        ],
        p.paper,
        4,
      ),
  }),

  plush: (p) => ({
    w: 64,
    h: 60,
    body:
      c(32, 38, 18, p.main) +
      c(22, 22, 8, p.main) +
      c(42, 22, 8, p.main) +
      c(27, 34, 3, INK, 'none', 0) +
      c(37, 34, 3, INK, 'none', 0) +
      path('M 28 42 C 31 45 34 45 37 42', 'none', INK, 2) +
      c(20, 44, 7, p.second) +
      c(44, 44, 7, p.second),
  }),

  lantern: (p) => ({
    w: 54,
    h: 84,
    body:
      line(27, 4, 27, 16, INK, 3) +
      path('M 14 16 L 40 16 L 44 52 L 10 52 Z', p.metal) +
      r(18, 24, 18, 20, p.accent, 4) +
      c(27, 34, 5, p.second) +
      r(10, 52, 34, 6, p.metal, 2) +
      r(18, 58, 18, 4, p.metal, 2),
  }),

  birdhouse: (p) => ({
    w: 92,
    h: 120,
    body:
      r(24, 70, 6, 46, p.wood, 2) +
      r(14, 36, 64, 40, p.main, 4) +
      path('M 8 38 L 46 10 L 84 38 Z', p.accent) +
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
      line(18, 26, 18, 72, p.metal, 2) +
      line(29, 26, 29, 84, p.metal, 2) +
      line(40, 26, 40, 64, p.metal, 2) +
      el(18, 76, 4, 8, p.metal) +
      el(29, 88, 4, 9, p.metal) +
      el(40, 68, 4, 8, p.metal) +
      path('M 22 106 C 26 96 32 96 36 106', 'none', p.main, 3),
  }),

  wateringCan: (p) => ({
    w: 82,
    h: 74,
    body:
      r(14, 28, 42, 34, p.main, 6) +
      path('M 54 34 C 68 28 74 20 76 12', 'none', p.main, 5) +
      path('M 54 26 L 76 10 L 80 18 L 60 34 Z', p.main) +
      path('M 22 28 C 22 14 48 14 48 28', 'none', p.metal, 4) +
      el(70, 8, 5, 3, p.metal) +
      el(35, 30, 12, 4, p.second),
  }),

  catTree: (p) => ({
    w: 156,
    h: 220,
    body:
      el(78, 208, 52, 9, p.second) +
      r(30, 110, 14, 96, p.wood, 3) +
      r(104, 130, 14, 76, p.wood, 3) +
      r(18, 94, 74, 16, p.main, 6) +
      r(92, 62, 54, 14, p.second, 5) +
      r(96, 30, 46, 36, p.accent, 8) +
      c(78, 70, 10, 'none', p.dark, 3) +
      path('M 60 108 C 60 92 96 92 96 108', 'none', p.main, 4) +
      r(42, 72, 10, 22, p.main, 4),
  }),

  swing: (p) => ({
    w: 220,
    h: 200,
    body:
      path('M 18 192 L 58 26 L 80 26 L 46 192 Z', p.wood) +
      path('M 202 192 L 162 26 L 140 26 L 174 192 Z', p.wood) +
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
      r(14, 30, 64, 48, p.paper, 5) +
      path('M 6 30 L 46 4 L 86 30 Z', p.accent) +
      r(22, 40, 48, 6, p.second, 2) +
      c(46, 62, 5, p.dark) +
      r(44, 78, 5, 52, p.wood, 2) +
      r(14, 92, 64, 10, p.main, 4) +
      r(44, 130, 5, 16, p.wood, 2),
  }),

  fountain: (p) => ({
    w: 220,
    h: 230,
    body:
      el(110, 196, 96, 24, p.second) +
      path('M 26 188 L 58 150 L 162 150 L 194 188 Z', p.second) +
      el(110, 150, 52, 14, p.glass) +
      r(100, 74, 20, 76, p.second, 4) +
      el(110, 70, 34, 10, p.second) +
      path('M 110 14 C 96 30 96 46 110 58 C 124 46 124 30 110 14 Z', p.glass) +
      path('M 76 62 C 84 74 96 80 110 80 M 144 62 C 136 74 124 80 110 80', 'none', p.glass, 3) +
      dots(
        [
          [88, 56],
          [132, 52],
          [110, 60],
          [72, 100],
          [148, 104],
        ],
        p.paper,
        2,
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
      path('M 6 22 L 39 2 L 72 22 Z', p.accent) +
      r(30, 36, 18, 40, p.dark, 3) +
      Array.from({ length: 4 }, (_, i) => line(24 + i * 10, 40, 24 + i * 10, 72, p.main, 2)).join('') +
      r(34, 86, 6, 10, p.dark, 2),
  }),

  windmill: (p) => ({
    w: 190,
    h: 260,
    body:
      path('M 62 250 L 76 86 L 114 86 L 128 250 Z', p.main) +
      path('M 68 86 L 95 40 L 122 86 Z', p.accent) +
      r(88, 54, 14, 18, p.wood, 3) +
      c(95, 84, 7, p.wood) +
      path('M 95 84 L 95 20 M 95 84 L 30 84 M 95 84 L 160 84 M 95 84 L 48 36 M 95 84 L 142 132 M 95 84 L 48 132 M 95 84 L 142 36', 'none', p.wood, 5) +
      path('M 84 120 L 106 120 L 110 240 L 80 240 Z', p.dark) +
      r(78, 214, 34, 8, p.second, 2),
  }),

  scarecrow: (p) => ({
    w: 150,
    h: 220,
    body:
      r(72, 60, 8, 146, p.wood, 3) +
      line(34, 96, 118, 96, p.wood, 6) +
      c(76, 44, 18, p.paper) +
      path('M 58 28 L 94 28 L 88 12 L 64 12 Z', p.accent) +
      c(70, 44, 2, INK, 'none', 0) +
      c(82, 44, 2, INK, 'none', 0) +
      path('M 70 52 C 74 55 78 55 82 52', 'none', INK, 2) +
      path('M 46 92 L 58 140 L 94 140 L 106 92 Z', p.main) +
      path('M 58 140 L 56 172 M 94 140 L 96 172', 'none', p.dark, 4) +
      r(44, 62, 16, 8, p.leaf, 2),
  }),

  wheelbarrow: (p) => ({
    w: 170,
    h: 122,
    body:
      c(44, 96, 22, p.dark) +
      c(44, 96, 9, p.metal) +
      path('M 26 58 L 116 58 L 130 92 L 48 92 Z', p.main) +
      r(24, 52, 94, 10, p.second, 3) +
      line(118, 86, 154, 54, p.wood, 5) +
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
      path('M 8 18 L 162 18 L 150 68 L 20 68 Z', p.wood) +
      el(85, 18, 75, 9, p.dark) +
      el(85, 18, 64, 6, p.leaf) +
      leg(24, 68, 6, p.dark) +
      leg(136, 68, 6, p.dark),
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
      el(50, 26, 12, 8, p.paper),
  }),

  fence: (p) => ({
    w: 210,
    h: 106,
    body:
      r(10, 34, 190, 10, p.wood, 3) +
      r(10, 66, 190, 10, p.wood, 3) +
      [18, 68, 118, 168].map((x) => path(`M ${x} 98 L ${x} 26 L ${x + 8} 14 L ${x + 20} 26 L ${x + 20} 98 Z`, p.main)).join(''),
  }),

  doghouse: (p) => ({
    w: 200,
    h: 178,
    body:
      r(20, 66, 150, 102, p.wood, 6) +
      path('M 8 72 L 96 12 L 184 72 Z', p.accent) +
      path('M 58 168 L 58 116 C 58 92 132 92 132 116 L 132 168 Z', p.dark) +
      r(30, 78, 32, 22, p.paper, 3) +
      c(96, 44, 7, p.second) +
      r(40, 148, 10, 20, p.dark, 2) +
      r(146, 148, 10, 20, p.dark, 2) +
      r(88, 88, 16, 6, p.paper, 3),
  }),

  coop: (p) => ({
    w: 210,
    h: 180,
    body:
      r(20, 60, 156, 106, p.wood, 6) +
      path('M 10 64 L 100 8 L 190 64 Z', p.accent) +
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
      r(20, 52, 64, 46, '#E9C65B', 18) +
      r(24, 30, 56, 30, '#E9C65B', 14) +
      r(32, 60, 40, 8, p.dark, 3) +
      r(32, 82, 40, 8, p.dark, 3) +
      c(52, 46, 7, p.dark) +
      path('M 18 100 C 18 92 86 92 86 100', 'none', p.wood, 5) +
      line(52, 98, 52, 122, p.wood, 5) +
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
      path('M 20 40 L 240 40 L 220 100 L 40 100 Z', p.main) +
      Array.from({ length: 5 }, (_, i) => line(40 + i * 42, 44, 54 + i * 40, 96, p.second, 2)).join('') +
      Array.from({ length: 2 }, (_, i) => line(30, 58 + i * 26, 230, 58 + i * 26, p.second, 2)).join('') +
      r(112, 58, 36, 22, p.wood, 4) +
      path('M 106 58 C 108 34 152 34 154 58', 'none', p.wood, 3),
  }),

  pool: (p) => ({
    w: 430,
    h: 160,
    body:
      el(215, 80, 204, 60, p.paper) +
      el(215, 80, 190, 51, p.glass) +
      el(215, 80, 190, 51, 'none', '#8FB9C9', 3) +
      path('M 70 72 C 90 62 110 82 130 72 M 150 92 C 170 82 190 102 210 92 M 220 62 C 240 52 260 72 280 62', 'none', p.paper, 3) +
      el(160, 46, 18, 6, p.leaf) +
      c(160, 44, 4, p.second) +
      el(280, 66, 14, 5, p.leaf) +
      r(340, 30, 10, 26, p.metal, 2) +
      path('M 345 30 C 345 22 360 22 360 30', 'none', p.metal, 3),
  }),

  flowerBed: (p) => ({
    w: 180,
    h: 112,
    body:
      r(8, 52, 164, 50, p.wood, 5) +
      r(18, 60, 144, 34, p.dark, 3) +
      [0, 1, 2, 3, 4].map((i) => {
        const x = 34 + i * 28;
        return line(x, 62, x, 42, p.leaf, 3) + c(x, 36, 8, i % 2 ? p.main : p.accent) + c(x, 36, 3, p.second);
      }).join('') +
      r(8, 44, 164, 12, p.second, 4),
  }),

  hedge: (p) => ({
    w: 210,
    h: 108,
    body:
      path('M 8 100 C 2 68 20 40 52 46 C 60 22 96 20 108 40 C 124 16 164 20 170 46 C 200 40 214 70 202 100 Z', p.leaf) +
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
        3,
      ),
  }),

  tree: (p) => ({
    w: 250,
    h: 300,
    body:
      r(118, 180, 18, 100, p.dark, 4) +
      path('M 126 240 L 82 190 M 130 224 L 176 176', 'none', p.dark, 8) +
      c(126, 120, 76, p.leaf) +
      c(84, 150, 44, p.leaf) +
      c(172, 146, 42, p.leaf) +
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
      ) +
      el(126, 292, 86, 8, p.dark).replace('/>', ' opacity="0.15"/>'),
  }),

  tent: (p) => ({
    w: 240,
    h: 170,
    body:
      path('M 20 160 L 120 20 L 220 160 Z', p.main) +
      path('M 120 20 L 120 160 L 220 160 Z', p.second) +
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
      r(44, 26, 40, 42, p.second, 8) +
      r(24, 70, 84, 12, p.wood, 5) +
      path('M 30 82 L 22 108 M 100 82 L 108 108', 'none', p.dark, 6) +
      path('M 8 122 C 44 146 108 146 142 118', 'none', p.wood, 7) +
      line(32, 110, 32, 128, p.dark, 3) +
      line(100, 110, 100, 128, p.dark, 3),
  }),

  toyBasket: (p) => ({
    w: 96,
    h: 82,
    body:
      path('M 12 28 L 84 28 L 74 76 L 22 76 Z', p.main) +
      r(8, 20, 80, 12, p.wood, 5) +
      c(30, 14, 10, p.accent) +
      r(52, 6, 18, 18, p.second, 4) +
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
      path('M 16 52 L 32 30 L 44 42 L 56 24 L 66 52 Z', p.leaf) +
      c(54, 22, 5, p.accent),
  }),

  curtain: (p) => ({
    w: 120,
    h: 200,
    body:
      r(6, 4, 108, 10, p.wood, 3) +
      path('M 12 14 C 30 30 28 80 18 190 L 52 190 C 46 120 50 60 58 14 Z', p.main) +
      path('M 108 14 C 90 30 92 80 102 190 L 68 190 C 74 120 70 60 62 14 Z', p.second),
  }),
};

export const OUTDOOR_SHAPES = FURNITURE_SHAPES;
