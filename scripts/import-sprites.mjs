// Copies the sprites the game uses from the Hearth & Sprout pack into
// public/sprites/, trimming transparent padding and harmonizing each sprite's
// room-space resolution, visibly uneven hand-drawn ink outlines (bidirectional
// pen swelling/tapering + organic contour wobble + nib tooth), and warm sepia
// ink tone to match living_room_backdrop.webp (1376x768 -> 1600x900).
// Writes src/game/sprites.json with the output sizes.
//
//   node scripts/import-sprites.mjs [packDir]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packDir = path.resolve(process.argv[2] ?? path.join(root, 'hearth_and_sprout_2d_asset_pack_v1_0'));
const outDir = path.join(root, 'public', 'sprites');
const manifestOut = path.join(root, 'src', 'game', 'sprites.json');

// Backdrop native-to-stage optical scale (1376x768 -> 1600x900) and ink RGB.
const BACKDROP_NATIVE_RATIO = 1376 / 1600;
const TARGET_INK = [49, 34, 16];

// Active living-room sprites:
// - height: display height in 1600x900 room px
// - inkBlend: base dark-ink thickening to match backdrop's ~3.5px weight
// - wobble: organic hand-drawn contour irregularity (px at 2x room scale)
// - uneven: bidirectional pen swelling/tapering + nib-tooth roughness (0..1)
const SPRITE_SPECS = {
  // Sofas (center sofa slot)
  cottage_lounge_sofa: { height: 240, inkBlend: 0.12, wobble: 0.5, uneven: 0.25 },
  terracotta_lounge_sofa: { height: 240, inkBlend: 0.12, wobble: 0.5, uneven: 0.25 },
  sage_lounge_sofa: { height: 240, inkBlend: 0.12, wobble: 0.5, uneven: 0.25 },
  oat_cream_lounge_sofa: { height: 240, inkBlend: 0.12, wobble: 0.5, uneven: 0.25 },

  // Coffee tables (center table slot)
  low_oak_coffee_table: { height: 160, inkBlend: 0.65, wobble: 2.1, uneven: 0.9 },
  teal_coffee_table: { height: 160, inkBlend: 0.65, wobble: 2.1, uneven: 0.9 },
  walnut_coffee_table: { height: 160, inkBlend: 0.65, wobble: 2.1, uneven: 0.9 },

  // Rugs (center rug slot)
  braided_oval_rug: { height: 250, inkBlend: 0.12, wobble: 0.7, uneven: 0.3 },
  sage_braided_rug: { height: 250, inkBlend: 0.12, wobble: 0.7, uneven: 0.3 },
  plum_braided_rug: { height: 250, inkBlend: 0.12, wobble: 0.7, uneven: 0.3 },
  woven_tassel_rug: { height: 245, inkBlend: 0.38, wobble: 1.5, uneven: 0.75 },

  // Back-right alcove (bookshelf slot)
  arched_display_bookshelf: { height: 340, inkBlend: 0.0, wobble: 0.4, uneven: 0.2 },
  sage_display_bookshelf: { height: 340, inkBlend: 0.0, wobble: 0.4, uneven: 0.2 },
  walnut_display_bookshelf: { height: 340, inkBlend: 0.0, wobble: 0.4, uneven: 0.2 },
  arched_window_seat: { height: 335, inkBlend: 0.12, wobble: 0.55, uneven: 0.3 },

  // Under-window reading nooks (reading-nook slot)
  window_bench_nook: { height: 198, inkBlend: 0.45, wobble: 1.3, uneven: 0.65 },
  reading_nook_armchair: { height: 205, inkBlend: 0.45, wobble: 1.3, uneven: 0.65 },
  daybed_reading_nook: { height: 150, inkBlend: 0.45, wobble: 1.3, uneven: 0.65 },
  rattan_reading_chair: { height: 210, inkBlend: 0.48, wobble: 1.35, uneven: 0.68 },

  // Cottage TVs (tv slot)
  cottage_tv_console: { height: 220, inkBlend: 0.48, wobble: 1.35, uneven: 0.68 },
  retro_wood_tv: { height: 215, inkBlend: 0.48, wobble: 1.35, uneven: 0.68 },
  teal_media_tv: { height: 220, inkBlend: 0.48, wobble: 1.35, uneven: 0.68 },

  // Cozy armchairs (armchair slot)
  sage_wingback_chair: { height: 205, inkBlend: 0.45, wobble: 1.35, uneven: 0.65 },
  cottage_rocking_chair: { height: 208, inkBlend: 0.5, wobble: 1.4, uneven: 0.7 },
  plum_tub_armchair: { height: 195, inkBlend: 0.45, wobble: 1.35, uneven: 0.65 },

  // Side & record tables (side-table slot)
  oak_end_table: { height: 155, inkBlend: 0.62, wobble: 1.85, uneven: 0.85 },
  vinyl_record_stand: { height: 162, inkBlend: 0.6, wobble: 1.8, uneven: 0.82 },
  candle_side_table: { height: 158, inkBlend: 0.62, wobble: 1.85, uneven: 0.85 },

  // Floor lighting (lamp slot)
  standing_globe_floor_lamp: { height: 280, inkBlend: 0.85, wobble: 1.8, uneven: 0.85 },
  pedestal_reading_lamp: { height: 248, inkBlend: 0.58, wobble: 1.7, uneven: 0.8 },
  greenhouse_lantern: { height: 175, inkBlend: 0.65, wobble: 1.8, uneven: 0.85 },

  // Accent rugs (accent-rug slot)
  hearth_braided_mat: { height: 136, inkBlend: 0.35, wobble: 1.2, uneven: 0.55 },
  oat_fleece_rug: { height: 140, inkBlend: 0.35, wobble: 1.2, uneven: 0.55 },
  botanical_runner_rug: { height: 145, inkBlend: 0.38, wobble: 1.25, uneven: 0.58 },

  // Hanging ceiling-beam decor (hanging-decor slot)
  hanging_terracotta_plant: { height: 185, inkBlend: 0.52, wobble: 1.4, uneven: 0.7 },
  hanging_ivy_basket: { height: 190, inkBlend: 0.52, wobble: 1.45, uneven: 0.7 },
  hanging_cottage_lantern: { height: 185, inkBlend: 0.55, wobble: 1.45, uneven: 0.72 },
  hanging_dried_herbs: { height: 185, inkBlend: 0.52, wobble: 1.45, uneven: 0.7 },

  // Ceiling-beam garlands (garland slot)
  ceiling_vine_garland: { height: 115, inkBlend: 0.58, wobble: 1.35, uneven: 0.68 },
  ceiling_fairy_lights: { height: 118, inkBlend: 0.58, wobble: 1.35, uneven: 0.68 },
  ceiling_fabric_bunting: { height: 115, inkBlend: 0.58, wobble: 1.35, uneven: 0.68 },
  ceiling_flower_swag: { height: 118, inkBlend: 0.58, wobble: 1.35, uneven: 0.68 },

  // Left wall decor (pinboard slot)
  wall_pinboard_trio: { height: 175, inkBlend: 0.9, wobble: 1.7, uneven: 0.8 },
  botanical_framed_art: { height: 165, inkBlend: 0.55, wobble: 1.45, uneven: 0.7 },
  wall_floating_shelf: { height: 170, inkBlend: 0.55, wobble: 1.45, uneven: 0.7 },
  botanical_wall_tapestry: { height: 175, inkBlend: 0.52, wobble: 1.4, uneven: 0.68 },

  // Center wall decor (clock slot)
  wall_clock: { height: 145, inkBlend: 0.82, wobble: 1.7, uneven: 0.8 },
  cottage_oval_mirror: { height: 165, inkBlend: 0.55, wobble: 1.45, uneven: 0.7 },
  macrame_wall_hanging: { height: 175, inkBlend: 0.45, wobble: 1.35, uneven: 0.65 },
  cottage_gallery_frames: { height: 165, inkBlend: 0.55, wobble: 1.45, uneven: 0.7 },

  // Back-left cabinet (cabinet slot)
  seed_drawer_cabinet: { height: 210, inkBlend: 0.8, wobble: 1.6, uneven: 0.75 },
  cottage_sideboard: { height: 215, inkBlend: 0.52, wobble: 1.4, uneven: 0.68 },
  flowering_trellis: { height: 255, inkBlend: 0.45, wobble: 1.4, uneven: 0.65 },

  // Right corner accent (trolley slot)
  tea_trolley: { height: 210, inkBlend: 0.65, wobble: 2.1, uneven: 0.9 },
  two_wheeled_herb_cart: { height: 215, inkBlend: 0.55, wobble: 1.8, uneven: 0.8 },
  fireplace_basket_set: { height: 192, inkBlend: 0.5, wobble: 1.6, uneven: 0.75 },

  // Front-left floor accent (cushion slot)
  patchwork_floor_cushion: { height: 105, inkBlend: 0.68, wobble: 2.35, uneven: 1.0 },
  woven_pet_basket: { height: 118, inkBlend: 0.52, wobble: 1.8, uneven: 0.82 },
  curved_orchard_stool: { height: 128, inkBlend: 0.62, wobble: 2.0, uneven: 0.85 },
  knit_ottoman: { height: 112, inkBlend: 0.62, wobble: 2.0, uneven: 0.85 },

  // Left corner plant (tree slot)
  potted_calamondin_tree: { height: 240, inkBlend: 0.62, wobble: 1.5, uneven: 0.7 },
  monstera_ceramic_pot: { height: 225, inkBlend: 0.5, wobble: 1.5, uneven: 0.7 },
  raised_herb_bed: { height: 180, inkBlend: 0.55, wobble: 1.8, uneven: 0.8 },

  // Wandering pets (pet slot)
  mossback_hedgehog: { height: 120, inkBlend: 0.58, wobble: 2.35, uneven: 1.0 },
  terracotta_tortoise: { height: 112, inkBlend: 0.55, wobble: 2.2, uneven: 0.95 },
  sunhat_garden_frog: { height: 115, inkBlend: 0.55, wobble: 2.2, uneven: 0.95 },

  // Residents
  resident_her: { height: 275, inkBlend: 0.45, wobble: 2.35, uneven: 1.0 },
  resident_her_badminton: { height: 275, inkBlend: 0.45, wobble: 2.35, uneven: 1.0 },
  resident_him: { height: 295, inkBlend: 0.45, wobble: 2.35, uneven: 1.0 },
};

// Multi-frame horizontal animation strips built from aligned 512x512 pack frames.
// Each strip keeps a shared union frame box so foot baselines and head centers
// stay rock-steady across frames without per-frame trim jitter.
const SPRITE_STRIPS = {
  resident_her_walk: {
    frames: ['resident_her_walk_1', 'resident_her_walk_2', 'resident_her_walk_3', 'resident_her_walk_4'],
    height: 275,
    inkBlend: 0.45,
    wobble: 2.35,
    uneven: 1.0,
  },
  resident_her_badminton_walk: {
    frames: [
      'resident_her_badminton_walk_1',
      'resident_her_badminton_walk_2',
      'resident_her_badminton_walk_3',
      'resident_her_badminton_walk_4',
    ],
    height: 275,
    inkBlend: 0.45,
    wobble: 2.35,
    uneven: 1.0,
  },
  resident_him_walk: {
    frames: ['resident_him_walk_1', 'resident_him_walk_2', 'resident_him_walk_3', 'resident_him_walk_4'],
    height: 295,
    inkBlend: 0.45,
    wobble: 2.35,
    uneven: 1.0,
  },
};

// Room backdrops, copied as-is (they are full 1600x900 scenes).
const BACKGROUNDS = ['living_room_backdrop'];

const clampByte = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

// Deterministic smooth 2D value noise in [0, 1] seeded per sprite id.
function hash2(ix, iy, seed) {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function seedFromId(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Bilinear RGBA sample with transparent out-of-bounds clamp.
function sampleRGBA(buf, w, h, fx, fy, dst, dstOffset) {
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const get = (cx, cy, c) => {
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) return 0;
    return buf[(cy * w + cx) * 4 + c];
  };

  const w00 = (1 - tx) * (1 - ty);
  const w10 = tx * (1 - ty);
  const w01 = (1 - tx) * ty;
  const w11 = tx * ty;

  const a =
    get(x0, y0, 3) * w00 + get(x1, y0, 3) * w10 + get(x0, y1, 3) * w01 + get(x1, y1, 3) * w11;
  if (a < 6) {
    dst[dstOffset] = dst[dstOffset + 1] = dst[dstOffset + 2] = dst[dstOffset + 3] = 0;
    return;
  }
  for (let c = 0; c < 3; c++) {
    const num =
      get(x0, y0, c) * get(x0, y0, 3) * w00 +
      get(x1, y0, c) * get(x1, y0, 3) * w10 +
      get(x0, y1, c) * get(x0, y1, 3) * w01 +
      get(x1, y1, c) * get(x1, y1, 3) * w11;
    dst[dstOffset + c] = clampByte(num / a);
  }
  dst[dstOffset + 3] = clampByte(a);
}

function applyHandInkedStyle(data, workW, workH, { seed, inkBlend, wobble, uneven }) {
  // 1. Multi-octave hand-drawn contour wobble (bowed curves + tactile pen jitter)
  //    applied identically to fills & outlines so registration stays locked.
  const warped = new Uint8ClampedArray(workW * workH * 4);
  if (wobble > 0) {
    for (let y = 0; y < workH; y++) {
      for (let x = 0; x < workW; x++) {
        // Organic hand-drawn line bow (period ~20px) + subtle pen tremor (period ~7px).
        const nx1 = smoothNoise(x / 20, y / 20, seed + 11) - 0.5;
        const ny1 = smoothNoise(x / 20, y / 20, seed + 29) - 0.5;
        const nx2 = smoothNoise(x / 7, y / 7, seed + 53) - 0.5;
        const ny2 = smoothNoise(x / 7, y / 7, seed + 71) - 0.5;
        const dx = (nx1 * 1.35 + nx2 * 0.75) * wobble;
        const dy = (ny1 * 1.35 + ny2 * 0.75) * wobble;
        sampleRGBA(data, workW, workH, x + dx, y + dy, warped, (y * workW + x) * 4);
      }
    }
  } else {
    warped.set(data);
  }

  // 2. Bidirectional uneven hand-inked pressure modulation:
  //    - High-pressure zones SWELL dark outlines (up to 5x5 radius)
  //    - Low-pressure zones TAPER/THIN outer ink edge pixels back toward adjacent fill/alpha
  //    - High-frequency nib tooth adds real hand-inked paper texture on outlines.
  const out = new Uint8ClampedArray(warped);
  const isInk = new Uint8Array(workW * workH);
  for (let i = 0; i < workW * workH; i++) {
    const o = i * 4;
    const lum = (warped[o] + warped[o + 1] + warped[o + 2]) / 3;
    if (lum < 86 && warped[o + 3] > 125) isInk[i] = 1;
  }

  for (let y = 0; y < workH; y++) {
    const y0 = y > 0 ? y - 1 : 0;
    const y1 = y + 1 < workH ? y + 1 : workH - 1;
    const y0b = y > 1 ? y - 2 : 0;
    const y1b = y + 2 < workH ? y + 2 : workH - 1;
    for (let x = 0; x < workW; x++) {
      const idx = y * workW + x;
      const o = idx * 4;
      const x0 = x > 0 ? x - 1 : 0;
      const x1 = x + 1 < workW ? x + 1 : workW - 1;
      const x0b = x > 1 ? x - 2 : 0;
      const x1b = x + 2 < workW ? x + 2 : workW - 1;

      // Tighter spatial pen-pressure field so unevenness is genuinely visible on
      // small 105-160px sprites as well as large furniture.
      const pMed = smoothNoise(x / 14, y / 14, seed + 101);
      const pTooth = smoothNoise(x / 4.5, y / 4.5, seed + 137);
      const pressure = pMed * 0.65 + pTooth * 0.35; // [0..1]

      // 2a. Taper/thin outer edge of ink where pen pressure is light.
      if (isInk[idx] && uneven > 0.25 && pressure < 0.36) {
        let nonInkCount = 0;
        let fillR = 0;
        let fillG = 0;
        let fillB = 0;
        let fillN = 0;
        let transCount = 0;
        for (let ny = y0; ny <= y1; ny++) {
          const row = ny * workW;
          for (let nx = x0; nx <= x1; nx++) {
            const ni = row + nx;
            if (!isInk[ni]) {
              nonInkCount++;
              const no = ni * 4;
              if (warped[no + 3] > 180) {
                fillR += warped[no];
                fillG += warped[no + 1];
                fillB += warped[no + 2];
                fillN++;
              } else if (warped[no + 3] < 40) {
                transCount++;
              }
            }
          }
        }
        // Only erode edge-of-stroke pixels (never punch holes through the core of a thin line).
        if (nonInkCount >= 2 && nonInkCount <= 5) {
          const taper = Math.min(0.88, ((0.36 - pressure) / 0.36) * uneven * 0.95);
          if (transCount > fillN) {
            out[o + 3] = clampByte(warped[o + 3] * (1 - taper * 0.85));
          } else if (fillN > 0) {
            const fr = fillR / fillN;
            const fg = fillG / fillN;
            const fb = fillB / fillN;
            out[o] = clampByte(warped[o] * (1 - taper) + fr * taper);
            out[o + 1] = clampByte(warped[o + 1] * (1 - taper) + fg * taper);
            out[o + 2] = clampByte(warped[o + 2] * (1 - taper) + fb * taper);
          }
        }
        continue;
      }

      // 2b. Swell/thicken dark outlines unevenly where pen pressure is medium-to-heavy.
      const swellDrive = Math.max(0, (pressure - 0.28) / 0.72); // 0..1
      const localBlend = Math.min(1.0, inkBlend * (0.15 + 1.55 * swellDrive) + uneven * 0.22 * Math.max(0, pressure - 0.6));
      const useWide = (inkBlend >= 0.5 || uneven >= 0.8) && pressure > 0.66;

      if (localBlend > 0.05) {
        const ya = useWide ? y0b : y0;
        const yb = useWide ? y1b : y1;
        const xa = useWide ? x0b : x0;
        const xb = useWide ? x1b : x1;
        let hasInk = 0;
        let minR = 255;
        let minG = 255;
        let minB = 255;
        let maxA = 0;
        for (let ny = ya; ny <= yb; ny++) {
          const row = ny * workW;
          for (let nx = xa; nx <= xb; nx++) {
            if (useWide && Math.abs(nx - x) === 2 && Math.abs(ny - y) === 2) continue;
            const ni = row + nx;
            if (isInk[ni]) hasInk = 1;
            const no = ni * 4;
            if (warped[no] < minR) minR = warped[no];
            if (warped[no + 1] < minG) minG = warped[no + 1];
            if (warped[no + 2] < minB) minB = warped[no + 2];
            if (warped[no + 3] > maxA) maxA = warped[no + 3];
          }
        }
        if (hasInk && maxA > 90) {
          const b = useWide ? Math.min(1.0, localBlend * 0.82) : localBlend;
          const inv = 1 - b;
          out[o] = clampByte(warped[o] * inv + minR * b);
          out[o + 1] = clampByte(warped[o + 1] * inv + minG * b);
          out[o + 2] = clampByte(warped[o + 2] * inv + minB * b);
          out[o + 3] = clampByte(Math.max(warped[o + 3], maxA * b));
        }
      }
    }
  }

  // 3. Harmonize ink hue toward exact backdrop warm dark-brown RGB(49, 34, 16)
  //    with subtle felt-tip ink grain, plus warm sunlit lift on fills.
  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      const i = y * workW + x;
      const o = i * 4;
      const a = out[o + 3];
      if (a < 8) {
        out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
        continue;
      }
      const r = out[o];
      const g = out[o + 1];
      const b = out[o + 2];
      const af = a / 255;
      const lum = (r + g + b) / 3;
      const inkW = Math.min(1, Math.max(0, (92 - lum) / 52)) * af;
      const fillW = (1 - inkW) * af;

      // Subtle paper-tooth variation on ink density so lines feel inked on paper.
      const tooth = (smoothNoise(x / 3.5, y / 3.5, seed + 211) - 0.5) * 18 * uneven * inkW;
      const inkScale = Math.min(1.32, Math.max(0.78, lum / 36));
      const ir = Math.min(255, Math.max(0, TARGET_INK[0] * inkScale + tooth));
      const ig = Math.min(255, Math.max(0, TARGET_INK[1] * inkScale + tooth * 0.85));
      const ib = Math.min(255, Math.max(0, TARGET_INK[2] * inkScale + tooth * 0.65));

      const iw = 0.58 * inkW;
      const nr = r * (1 - iw) + ir * iw;
      const ng = g * (1 - iw) + ig * iw;
      const nb = b * (1 - iw) + ib * iw;

      const lr = Math.min(255, nr * 1.045 + 4);
      const lg = Math.min(255, ng * 1.045 + 2);
      const lb = Math.max(0, Math.min(255, nb * 1.045 - 2));

      out[o] = clampByte(nr * (1 - fillW) + lr * fillW);
      out[o + 1] = clampByte(ng * (1 - fillW) + lg * fillW);
      out[o + 2] = clampByte(nb * (1 - fillW) + lb * fillW);
    }
  }

  return out;
}

async function harmonizeSprite(id, srcPath, destPath, { height: roomH, inkBlend, wobble, uneven }) {
  const seed = seedFromId(id);
  const trimmedBuf = await sharp(srcPath).trim({ threshold: 1 }).ensureAlpha().png().toBuffer();
  const meta = await sharp(trimmedBuf).metadata();
  const roomW = Math.max(1, Math.round((meta.width / meta.height) * roomH));

  // Add a 6px transparent margin at 2x scale so hand-wobble never clips edges.
  const pad = 6;
  const innerW = roomW * 2;
  const innerH = roomH * 2;
  const workW = innerW + pad * 2;
  const workH = innerH + pad * 2;
  const { data } = await sharp(trimmedBuf)
    .resize(innerW, innerH, { kernel: 'lanczos3' })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = applyHandInkedStyle(data, workW, workH, { seed, inkBlend, wobble, uneven });

  // 4. Trim margin cleanly and match backdrop's exact optical resolution (1376/1600 -> 1600x900).
  const trimmed2x = await sharp(Buffer.from(out.buffer), {
    raw: { width: workW, height: workH, channels: 4 },
  })
    .trim({ threshold: 4 })
    .png()
    .toBuffer();
  const tMeta = await sharp(trimmed2x).metadata();
  const finalW = Math.max(1, Math.round((tMeta.width / tMeta.height) * roomH));
  const natW = Math.max(1, Math.round(finalW * BACKDROP_NATIVE_RATIO));
  const natH = Math.max(1, Math.round(roomH * BACKDROP_NATIVE_RATIO));

  const natBuf = await sharp(trimmed2x).resize(natW, natH, { kernel: 'lanczos3' }).raw().toBuffer();
  const info = await sharp(natBuf, { raw: { width: natW, height: natH, channels: 4 } })
    .resize(finalW, roomH, { kernel: 'cubic' })
    .png()
    .toFile(destPath);

  return { w: info.width, h: info.height };
}

async function harmonizeStrip(id, frameEntries, destPath, { height: roomH, inkBlend, wobble, uneven }) {
  // Inspect all aligned 512x512 frames to compute a single symmetric union box
  // centered on the canvas midline so every frame shares exact scale & foot baseline.
  const rawFrames = [];
  let minY = Infinity;
  let maxY = -1;
  let maxHalfW = 0;
  let canvasW = 0;
  let canvasH = 0;

  for (const frame of frameEntries) {
    const { data, info } = await sharp(frame.src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    canvasW = info.width;
    canvasH = info.height;
    const cx = canvasW / 2;
    for (let y = 0; y < info.height; y++) {
      const row = y * info.width;
      for (let x = 0; x < info.width; x++) {
        if (data[(row + x) * 4 + 3] > 4) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          const dist = Math.abs(x + 0.5 - cx);
          if (dist > maxHalfW) maxHalfW = dist;
        }
      }
    }
    rawFrames.push(frame);
  }

  // Small safety margin inside the 512x512 canvas so wobble never clips frame edges.
  const margin = 4;
  const cropTop = Math.max(0, minY - margin);
  const cropBot = Math.min(canvasH - 1, maxY + margin);
  const cropHalfW = Math.min(Math.floor(canvasW / 2), Math.ceil(maxHalfW) + margin);
  const cropLeft = Math.floor(canvasW / 2) - cropHalfW;
  const cropW = cropHalfW * 2;
  const cropH = cropBot - cropTop + 1;

  const frameW = Math.max(1, Math.round((cropW / cropH) * roomH));
  const pad = 6;
  const innerW = frameW * 2;
  const innerH = roomH * 2;
  const workW = innerW + pad * 2;
  const workH = innerH + pad * 2;
  const natW = Math.max(1, Math.round(frameW * BACKDROP_NATIVE_RATIO));
  const natH = Math.max(1, Math.round(roomH * BACKDROP_NATIVE_RATIO));

  const composites = [];
  for (let i = 0; i < rawFrames.length; i++) {
    const { id: frameId, src } = rawFrames[i];
    const { data } = await sharp(src)
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .resize(innerW, innerH, { kernel: 'lanczos3' })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const out = applyHandInkedStyle(data, workW, workH, {
      seed: seedFromId(frameId),
      inkBlend,
      wobble,
      uneven,
    });

    const inner2x = await sharp(Buffer.from(out.buffer), {
      raw: { width: workW, height: workH, channels: 4 },
    })
      .extract({ left: pad, top: pad, width: innerW, height: innerH })
      .resize(natW, natH, { kernel: 'lanczos3' })
      .raw()
      .toBuffer();

    const framePng = await sharp(inner2x, { raw: { width: natW, height: natH, channels: 4 } })
      .resize(frameW, roomH, { kernel: 'cubic' })
      .png()
      .toBuffer();

    composites.push({ input: framePng, left: i * frameW, top: 0 });
  }

  await sharp({
    create: {
      width: frameW * rawFrames.length,
      height: roomH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(destPath);

  return { w: frameW, h: roomH, frames: rawFrames.length };
}

const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const sizes = {};
for (const [id, spec] of Object.entries(SPRITE_SPECS)) {
  const entry = manifest.assets.find((a) => a.id === id);
  if (!entry) throw new Error(`Sprite "${id}" is not in the pack manifest`);
  const src = path.join(packDir, entry.filename);
  const dest = path.join(outDir, `${id}.png`);
  sizes[id] = await harmonizeSprite(id, src, dest, spec);
  console.log(`${id}: ${sizes[id].w}x${sizes[id].h}`);
}

for (const [id, spec] of Object.entries(SPRITE_STRIPS)) {
  const frameEntries = spec.frames.map((frameId) => {
    const entry = manifest.assets.find((a) => a.id === frameId);
    if (!entry) throw new Error(`Strip frame "${frameId}" is not in the pack manifest`);
    return { id: frameId, src: path.join(packDir, entry.filename) };
  });
  const dest = path.join(outDir, `${id}.png`);
  sizes[id] = await harmonizeStrip(id, frameEntries, dest, spec);
  console.log(`${id}: ${sizes[id].w}x${sizes[id].h} (${sizes[id].frames} frames)`);
}

const bgOut = path.join(root, 'public', 'backgrounds');
fs.mkdirSync(bgOut, { recursive: true });
for (const id of BACKGROUNDS) {
  const entry = manifest.backgrounds.find((b) => b.id === id);
  if (!entry) throw new Error(`Background "${id}" is not in the pack manifest`);
  const info = await sharp(path.join(packDir, entry.filename))
    .webp({ quality: 92 })
    .toFile(path.join(bgOut, `${id}.webp`));
  console.log(`${id}: ${info.width}x${info.height} (${Math.round(info.size / 1024)} KB)`);
}

fs.writeFileSync(manifestOut, JSON.stringify(sizes, null, 2) + '\n');
console.log(`Wrote ${Object.keys(sizes).length} sprites to ${path.relative(root, outDir)}`);
