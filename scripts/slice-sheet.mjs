/**
 * Reusable sprite-sheet slicer, white-background alpha extractor, edge
 * decontaminator, and 512x512 pack normalizer for Our Home (Hearth & Sprout).
 *
 * Node/sharp port of scripts/slice-sheet.py.
 *
 * Examples:
 *   node scripts/slice-sheet.mjs --single raw.png living_room/item_a
 *   node scripts/slice-sheet.mjs --grid 2x2 raw.png living_room/a living_room/b living_room/c living_room/d
 *   node scripts/slice-sheet.mjs --backdrop raw_bg.png living_room_backdrop
 */
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK_DIR = path.join(REPO_ROOT, 'hearth_and_sprout_2d_asset_pack_v1_0');

function isBgWhite(r, g, b, lumThresh = 234, satThresh = 20) {
  const mn = Math.min(r, g, b);
  const mx = Math.max(r, g, b);
  return mn >= lumThresh && mx - mn <= satThresh;
}

function isStrictInteriorWhite(r, g, b, soft = false) {
  const mn = Math.min(r, g, b);
  const mx = Math.max(r, g, b);
  if (soft) return mn >= 220 && mx - mn <= 22 && r - b <= 16;
  return mn >= 246 && mx - mn <= 10 && r - b <= 8;
}

function floodFillExterior(mask, w, h) {
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const push = (idx) => {
    if (mask[idx] && !visited[idx]) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + (w - 1));
  }

  while (head < tail) {
    const idx = queue[head++];
    const y = Math.floor(idx / w);
    const x = idx - y * w;
    if (y > 0) push(idx - w);
    if (y + 1 < h) push(idx + w);
    if (x > 0) push(idx - 1);
    if (x + 1 < w) push(idx + 1);
  }

  return visited;
}

function dilateBool(mask, w, h, radius = 1) {
  let out = new Uint8Array(mask);
  for (let step = 0; step < radius; step++) {
    const next = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const y0 = y > 0 ? y - 1 : 0;
      const y1 = y + 1 < h ? y + 1 : h - 1;
      for (let x = 0; x < w; x++) {
        const x0 = x > 0 ? x - 1 : 0;
        const x1 = x + 1 < w ? x + 1 : w - 1;
        let on = 0;
        for (let ny = y0; ny <= y1 && !on; ny++) {
          const row = ny * w;
          for (let nx = x0; nx <= x1; nx++) {
            if (out[row + nx]) {
              on = 1;
              break;
            }
          }
        }
        next[y * w + x] = on;
      }
    }
    out = next;
  }
  return out;
}

function extractRgbaFromCell(rgbBuf, w, h, allowInteriorHoles = true, softHoles = false) {
  const n = w * h;
  const whiteMask = new Uint8Array(n);
  const lum = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = rgbBuf[o];
    const g = rgbBuf[o + 1];
    const b = rgbBuf[o + 2];
    lum[i] = (r + g + b) / 3;
    if (isBgWhite(r, g, b)) whiteMask[i] = 1;
  }

  const bgMask = floodFillExterior(whiteMask, w, h);

  if (allowInteriorHoles) {
    const strictW = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (!bgMask[i]) {
        const o = i * 3;
        if (isStrictInteriorWhite(rgbBuf[o], rgbBuf[o + 1], rgbBuf[o + 2], softHoles)) strictW[i] = 1;
      }
    }

    const visited = new Uint8Array(n);
    const queue = new Int32Array(n);
    const comp = [];

    for (let i = 0; i < n; i++) {
      if (!strictW[i] || visited[i]) continue;
      comp.length = 0;
      let head = 0;
      let tail = 0;
      visited[i] = 1;
      queue[tail++] = i;
      let minX = w;
      let maxX = 0;
      let minY = h;
      let maxY = 0;

      while (head < tail) {
        const idx = queue[head++];
        comp.push(idx);
        const y = Math.floor(idx / w);
        const x = idx - y * w;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (y > 0 && strictW[idx - w] && !visited[idx - w]) {
          visited[idx - w] = 1;
          queue[tail++] = idx - w;
        }
        if (y + 1 < h && strictW[idx + w] && !visited[idx + w]) {
          visited[idx + w] = 1;
          queue[tail++] = idx + w;
        }
        if (x > 0 && strictW[idx - 1] && !visited[idx - 1]) {
          visited[idx - 1] = 1;
          queue[tail++] = idx - 1;
        }
        if (x + 1 < w && strictW[idx + 1] && !visited[idx + 1]) {
          visited[idx + 1] = 1;
          queue[tail++] = idx + 1;
        }
      }

      if (comp.length < (softHoles ? 5 : 18)) continue;

      // Check 2px border around component within its padded bbox.
      const bx0 = Math.max(0, minX - 2);
      const bx1 = Math.min(w - 1, maxX + 2);
      const by0 = Math.max(0, minY - 2);
      const by1 = Math.min(h - 1, maxY + 2);
      const bw = bx1 - bx0 + 1;
      const bh = by1 - by0 + 1;
      const compLocal = new Uint8Array(bw * bh);
      for (const idx of comp) {
        const y = Math.floor(idx / w);
        const x = idx - y * w;
        compLocal[(y - by0) * bw + (x - bx0)] = 1;
      }
      const dilated = dilateBool(compLocal, bw, bh, 2);
      let borderCount = 0;
      let darkCount = 0;
      for (let ly = 0; ly < bh; ly++) {
        for (let lx = 0; lx < bw; lx++) {
          const li = ly * bw + lx;
          if (dilated[li] && !compLocal[li]) {
            borderCount++;
            const gi = (by0 + ly) * w + (bx0 + lx);
            if (lum[gi] < (softHoles ? 165 : 130)) darkCount++;
          }
        }
      }
      if (borderCount > 0 && darkCount / borderCount >= (softHoles ? 0.24 : 0.45)) {
        for (const idx of comp) bgMask[idx] = 1;
      }
    }
  }

  const d1 = dilateBool(bgMask, w, h, 1);
  const d2 = dilateBool(bgMask, w, h, 2);

  const rgba = new Uint8ClampedArray(n * 4);
  const alphaF = new Float32Array(n);
  const inkDist = Math.hypot(255 - 49, 255 - 34, 255 - 16);

  for (let i = 0; i < n; i++) {
    const o3 = i * 3;
    const o4 = i * 4;
    let r = rgbBuf[o3];
    let g = rgbBuf[o3 + 1];
    let b = rgbBuf[o3 + 2];
    let a = bgMask[i] ? 0.0 : 1.0;

    if (!bgMask[i] && (d1[i] || d2[i])) {
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const sat = mx - mn;
      const pxLum = (r + g + b) / 3;
      if (pxLum > 155 && sat < 36) {
        const distW = Math.hypot(255 - r, 255 - g, 255 - b);
        let aNew = Math.min(1, Math.max(0, distW / (inkDist * 0.62)));
        if (aNew < 0.08) aNew = 0;
        a = aNew;
        if (aNew > 0.08) {
          const denom = Math.max(aNew, 0.15);
          r = Math.min(255, Math.max(0, (r - (1 - aNew) * 255) / denom));
          g = Math.min(255, Math.max(0, (g - (1 - aNew) * 255) / denom));
          b = Math.min(255, Math.max(0, (b - (1 - aNew) * 255) / denom));
        }
      }
    }

    alphaF[i] = a;
    rgba[o4] = Math.round(r);
    rgba[o4 + 1] = Math.round(g);
    rgba[o4 + 2] = Math.round(b);
  }

  // Drop stray dust components (< 20 px)
  const visitedDust = new Uint8Array(n);
  const dustQueue = new Int32Array(n);
  const dustComp = [];
  for (let i = 0; i < n; i++) {
    if (alphaF[i] <= 0.15 || visitedDust[i]) continue;
    dustComp.length = 0;
    let head = 0;
    let tail = 0;
    visitedDust[i] = 1;
    dustQueue[tail++] = i;
    while (head < tail) {
      const idx = dustQueue[head++];
      dustComp.push(idx);
      const y = Math.floor(idx / w);
      const x = idx - y * w;
      if (y > 0 && alphaF[idx - w] > 0.15 && !visitedDust[idx - w]) {
        visitedDust[idx - w] = 1;
        dustQueue[tail++] = idx - w;
      }
      if (y + 1 < h && alphaF[idx + w] > 0.15 && !visitedDust[idx + w]) {
        visitedDust[idx + w] = 1;
        dustQueue[tail++] = idx + w;
      }
      if (x > 0 && alphaF[idx - 1] > 0.15 && !visitedDust[idx - 1]) {
        visitedDust[idx - 1] = 1;
        dustQueue[tail++] = idx - 1;
      }
      if (x + 1 < w && alphaF[idx + 1] > 0.15 && !visitedDust[idx + 1]) {
        visitedDust[idx + 1] = 1;
        dustQueue[tail++] = idx + 1;
      }
    }
    if (dustComp.length < 20) {
      for (const idx of dustComp) alphaF[idx] = 0;
    }
  }

  for (let i = 0; i < n; i++) {
    const o4 = i * 4;
    const au8 = Math.min(255, Math.max(0, Math.round(alphaF[i] * 255)));
    rgba[o4 + 3] = au8;
    if (au8 === 0) {
      rgba[o4] = 0;
      rgba[o4 + 1] = 0;
      rgba[o4 + 2] = 0;
    }
  }

  return rgba;
}

async function normalize512(rgba, w, h, minPad = 32) {
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    throw new Error('Empty sprite after alpha extraction');
  }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const maxDim = 512 - 2 * minPad;
  const scale = Math.min(maxDim / cw, maxDim / ch);
  const nw = Math.max(1, Math.round(cw * scale));
  const nh = Math.max(1, Math.round(ch * scale));

  const left = Math.floor((512 - nw) / 2);
  const right = 512 - nw - left;
  const top = Math.floor((512 - nh) / 2);
  const bottom = 512 - nh - top;

  const { data: normData } = await sharp(Buffer.from(rgba.buffer), {
    raw: { width: w, height: h, channels: 4 },
  })
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .resize(nw, nh, { kernel: 'lanczos3' })
    .extend({ top, bottom, left, right, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < 512 * 512; i++) {
    const o = i * 4;
    if (normData[o + 3] === 0) {
      normData[o] = 0;
      normData[o + 1] = 0;
      normData[o + 2] = 0;
    }
  }

  return sharp(normData, { raw: { width: 512, height: 512, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function bestSplit(proj, targetFrac, windowFrac = 0.16) {
  const n = proj.length;
  const lo = Math.max(0, Math.floor(n * (targetFrac - windowFrac)));
  const hi = Math.min(n - 1, Math.floor(n * (targetFrac + windowFrac)));
  let minVal = Infinity;
  for (let i = lo; i <= hi; i++) {
    if (proj[i] < minVal) minVal = proj[i];
  }
  let sum = 0;
  let count = 0;
  for (let i = lo; i <= hi; i++) {
    if (proj[i] === minVal) {
      sum += i;
      count++;
    }
  }
  return Math.round(sum / Math.max(1, count));
}

async function saveSprite(spec, buf) {
  const slash = spec.indexOf('/');
  if (slash === -1) throw new Error(`Invalid target "${spec}": expected <category>/<sprite_id>`);
  const cat = spec.slice(0, slash);
  const sid = spec.slice(slash + 1);
  const out = path.join(PACK_DIR, 'sprites', cat, `${sid}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log(`Saved ${path.relative(REPO_ROOT, out)}`);
  return { id: sid, category: cat, filename: `sprites/${cat}/${sid}.png`, buf };
}

async function updateManifest(savedSprites) {
  const mpath = path.join(PACK_DIR, 'manifest.json');
  if (!fs.existsSync(mpath)) return;
  const data = JSON.parse(fs.readFileSync(mpath, 'utf8'));

  for (const item of savedSprites) {
    let entry = data.assets.find((a) => a.id === item.id);
    if (!entry) {
      entry = {
        id: item.id,
        filename: item.filename,
        category: item.category,
        description: `Hearth & Sprout ${item.id.replace(/_/g, ' ')} living room asset.`,
        dimensions: { width: 512, height: 512 },
        format: 'PNG',
        color_mode: 'RGBA',
        transparency: { has_alpha_channel: true, transparent_pixel_ratio: 0, padding_px: {} },
        scale_tier: 'medium',
        recommended_world_scale: 1.0,
        creator: 'AI-assisted creation (Antigravity living room expansion)',
        tool: 'Antigravity image-generator + scripts/slice-sheet.mjs + scripts/import-sprites.mjs',
        source: 'our_home_art_style_embedded',
        ai_generated: true,
        editable_source_file: null,
        creation_date: new Date().toISOString().slice(0, 10),
        license_status: 'unverified',
        usage_terms_notes:
          'Hearth & Sprout living room asset harmonized to #312210 ink and matte botanical gouache palette.',
      };
      data.assets.push(entry);
    }
  }

  for (const entry of data.assets ?? []) {
    const fp = path.join(PACK_DIR, entry.filename);
    if (!fs.existsSync(fp)) continue;
    const rawFile = fs.readFileSync(fp);
    const { data: px, info } = await sharp(rawFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transCount = 0;
    let minX = info.width;
    let maxX = -1;
    let minY = info.height;
    let maxY = -1;
    const total = info.width * info.height;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const a = px[(y * info.width + x) * 4 + 3];
        if (a === 0) transCount++;
        if (a > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    entry.file_size_bytes = rawFile.length;
    entry.sha256 = crypto.createHash('sha256').update(rawFile).digest('hex');
    entry.transparency = entry.transparency ?? { has_alpha_channel: true };
    entry.transparency.transparent_pixel_ratio = Number((transCount / total).toFixed(4));
    entry.transparency.padding_px =
      maxX >= minX
        ? {
            top: minY,
            right: info.width - 1 - maxX,
            bottom: info.height - 1 - maxY,
            left: minX,
          }
        : { top: 512, right: 512, bottom: 512, left: 512 };
  }

  for (const entry of data.backgrounds ?? []) {
    const fp = path.join(PACK_DIR, entry.filename);
    if (fs.existsSync(fp)) {
      const rawFile = fs.readFileSync(fp);
      entry.file_size_bytes = rawFile.length;
      entry.sha256 = crypto.createHash('sha256').update(rawFile).digest('hex');
    }
  }

  const counts = {};
  for (const entry of data.assets ?? []) {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
  }
  data.total_sprites = (data.assets ?? []).length;
  data.category_counts = counts;

  fs.writeFileSync(mpath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function writeCheckerboard(savedItems, outPath) {
  const cols = Math.min(4, savedItems.length);
  const rows = Math.ceil(savedItems.length / cols);
  const tile = 256;
  const W = cols * tile;
  const H = rows * tile;
  const bg = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const even = (Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0;
      const o = (y * W + x) * 4;
      bg[o] = even ? 70 : 48;
      bg[o + 1] = even ? 70 : 48;
      bg[o + 2] = even ? 76 : 52;
      bg[o + 3] = 255;
    }
  }

  const composites = [];
  for (let i = 0; i < savedItems.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const resized = await sharp(savedItems[i].buf)
      .resize(tile - 16, tile - 16, { kernel: 'lanczos3' })
      .png()
      .toBuffer();
    composites.push({ input: resized, left: c * tile + 8, top: r * tile + 8 });
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(bg, { raw: { width: W, height: H, channels: 4 } })
    .composite(composites)
    .png()
    .toFile(outPath);
  console.log(`Wrote QA checkerboard -> ${outPath}`);
}

function parseArgs(argv) {
  const args = {
    mode: null,
    grid: null,
    only: null,
    noHoles: false,
    softHoles: false,
    flipX: false,
    qa: null,
    positional: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--single') args.mode = 'single';
    else if (a === '--backdrop') args.mode = 'backdrop';
    else if (a === '--grid') {
      args.mode = 'grid';
      args.grid = argv[++i];
    } else if (a === '--only') args.only = argv[++i];
    else if (a === '--no-holes') args.noHoles = true;
    else if (a === '--soft-holes') args.softHoles = true;
    else if (a === '--flip-x') args.flipX = true;
    else if (a === '--qa') args.qa = argv[++i];
    else args.positional.push(a);
  }
  if (!args.mode || args.positional.length < 2) {
    throw new Error(
      'Usage: node scripts/slice-sheet.mjs (--single | --grid CxR | --backdrop) [--no-holes] [--flip-x] [--qa out.png] <image> <target...>',
    );
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [imagePath, ...targets] = args.positional;

  if (args.mode === 'backdrop') {
    const dest = path.join(PACK_DIR, 'backgrounds', `${targets[0]}.png`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await sharp(imagePath)
      .flatten({ background: { r: 247, g: 240, b: 223 } })
      .resize(1950, 900, { kernel: 'lanczos3' })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toFile(dest);
    await updateManifest([]);
    console.log(`Saved 1950x900 backdrop -> ${path.relative(REPO_ROOT, dest)}`);
    return;
  }

  let imgSharp = sharp(imagePath).flatten({ background: { r: 255, g: 255, b: 255 } });
  if (args.flipX) imgSharp = imgSharp.flop();
  const { data: rgbAll, info } = await imgSharp.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const saved = [];

  if (args.mode === 'single') {
    const rgba = extractRgbaFromCell(rgbAll, W, H, !args.noHoles, args.softHoles);
    const buf = await normalize512(rgba, W, H);
    saved.push(await saveSprite(targets[0], buf));
  } else {
    const [colsStr, rowsStr] = String(args.grid).toLowerCase().split('x');
    const cols = Number(colsStr);
    const rows = Number(rowsStr);
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || targets.length !== cols * rows) {
      throw new Error(`--grid ${args.grid} requires ${cols * rows} targets, got ${targets.length}`);
    }

    const nwMask = new Uint8Array(W * H);
    const colProj = new Int32Array(W);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 3;
        if (!isBgWhite(rgbAll[o], rgbAll[o + 1], rgbAll[o + 2])) {
          nwMask[y * W + x] = 1;
          colProj[x]++;
        }
      }
    }

    const xs = [0];
    for (let i = 1; i < cols; i++) xs.push(bestSplit(colProj, i / cols));
    xs.push(W);

    const onlySet = args.only ? new Set(args.only.split(',').map((s) => s.trim())) : null;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const target = targets[r * cols + c];
        if (onlySet && !onlySet.has(target) && !onlySet.has(target.split('/')[1])) continue;
        const xa = xs[c];
        const xb = xs[c + 1];
        const cw = xb - xa;
        const rowProj = new Int32Array(H);
        for (let y = 0; y < H; y++) {
          let cnt = 0;
          for (let x = xa; x < xb; x++) cnt += nwMask[y * W + x];
          rowProj[y] = cnt;
        }
        const ys = [0];
        for (let j = 1; j < rows; j++) ys.push(bestSplit(rowProj, j / rows));
        ys.push(H);

        const ya = ys[r];
        const yb = ys[r + 1];
        const ch = yb - ya;
        const cellRgb = new Uint8Array(cw * ch * 3);
        for (let y = 0; y < ch; y++) {
          const srcStart = ((ya + y) * W + xa) * 3;
          cellRgb.set(rgbAll.subarray(srcStart, srcStart + cw * 3), y * cw * 3);
        }
        const rgba = extractRgbaFromCell(cellRgb, cw, ch, !args.noHoles, args.softHoles);
        const buf = await normalize512(rgba, cw, ch);
        saved.push(await saveSprite(target, buf));
      }
    }
  }

  await updateManifest(saved);
  if (args.qa) await writeCheckerboard(saved, path.resolve(args.qa));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
