// Copies the sprites the game uses from the Hearth & Sprout pack into
// public/sprites/, trimming the transparent padding so each image's bottom
// edge is the object's base. Writes src/game/sprites.json with the trimmed
// sizes so layout code knows each sprite's aspect ratio.
//
//   node scripts/import-sprites.mjs [packDir]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const packDir = path.resolve(process.argv[2] ?? path.join(root, 'hearth_and_sprout_2d_asset_pack_v1_0'));
const outDir = path.join(root, 'public', 'sprites');
const manifestOut = path.join(root, 'src', 'game', 'sprites.json');

// Sprite ids used by the living room. Add an id here to import it.
const USED = [
  'cottage_lounge_sofa',
  'low_oak_coffee_table',
  'braided_oval_rug',
  'arched_display_bookshelf',
  'standing_globe_floor_lamp',
  'wall_pinboard_trio',
  'seed_drawer_cabinet',
  'tea_trolley',
  'wall_clock',
  'patchwork_floor_cushion',
  'potted_calamondin_tree',
  'mossback_hedgehog',
];
// Room backdrops, copied as-is (they are full 1600x900 scenes).
const BACKGROUNDS = ['living_room_backdrop'];

const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const sizes = {};
for (const id of USED) {
  const entry = manifest.assets.find((a) => a.id === id);
  if (!entry) throw new Error(`Sprite "${id}" is not in the pack manifest`);
  const src = path.join(packDir, entry.filename);
  const dest = path.join(outDir, `${id}.png`);
  const info = await sharp(src).trim({ threshold: 1 }).png().toFile(dest);
  sizes[id] = { w: info.width, h: info.height };
  console.log(`${id}: ${info.width}x${info.height}`);
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
