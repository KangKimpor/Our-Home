"""
Reusable sprite-sheet slicer, white-background alpha extractor, edge
decontaminator, and 512x512 pack normalizer for Our Home (Hearth & Sprout).

Examples:
  # Single 1:1 sprite (e.g. a refined pet or prop):
  python scripts/slice-sheet.py --single path/to/raw.jpg characters/mossback_hedgehog

  # 2x2 sprite sheet (row-major: top-left, top-right, bottom-left, bottom-right):
  python scripts/slice-sheet.py --grid 2x2 path/to/sheet.jpg \\
    home/tea_trolley living_room/low_oak_coffee_table \\
    home/patchwork_floor_cushion characters/mossback_hedgehog

  # 3x2 sprite sheet (row-major):
  python scripts/slice-sheet.py --grid 3x2 path/to/sheet.jpg \\
    living_room/cottage_lounge_sofa living_room/arched_display_bookshelf \\
    living_room/standing_globe_floor_lamp living_room/braided_oval_rug \\
    living_room/low_oak_coffee_table garden/potted_calamondin_tree

  # Backdrop (16:9 -> exact 1600x900 PNG):
  python scripts/slice-sheet.py --backdrop path/to/backdrop_raw.jpg living_room_backdrop

After running this script, run `npm run sprites` (`node scripts/import-sprites.mjs`)
to apply uneven hand-ink harmonization, backdrop optical-resolution parity, and
sync into `public/sprites/` and `src/game/sprites.json`.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

REPO_ROOT = Path(__file__).resolve().parent.parent
PACK_DIR = REPO_ROOT / "hearth_and_sprout_2d_asset_pack_v1_0"


def is_bg_white(rgb: np.ndarray, lum_thresh: int = 236, sat_thresh: int = 18) -> np.ndarray:
    """True for near-pure neutral white pixels (distinct from warm Oat Cream #F3E7CE)."""
    r = rgb[..., 0].astype(np.int16)
    g = rgb[..., 1].astype(np.int16)
    b = rgb[..., 2].astype(np.int16)
    mn = np.minimum(np.minimum(r, g), b)
    mx = np.maximum(np.maximum(r, g), b)
    return (mn >= lum_thresh) & ((mx - mn) <= sat_thresh)


def is_strict_interior_white(rgb: np.ndarray) -> np.ndarray:
    """Stricter check for interior holes so warm oat-cream fills stay 100% opaque."""
    r = rgb[..., 0].astype(np.int16)
    g = rgb[..., 1].astype(np.int16)
    b = rgb[..., 2].astype(np.int16)
    mn = np.minimum(np.minimum(r, g), b)
    mx = np.maximum(np.maximum(r, g), b)
    return (mn >= 242) & ((mx - mn) <= 12) & ((r - b) <= 10)


def flood_fill_exterior(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        if mask[0, x] and not visited[0, x]:
            visited[0, x] = True
            q.append((0, x))
        if mask[h - 1, x] and not visited[h - 1, x]:
            visited[h - 1, x] = True
            q.append((h - 1, x))
    for y in range(h):
        if mask[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if mask[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            q.append((y, w - 1))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
    return visited


def dilate_bool(mask: np.ndarray, radius: int = 1) -> np.ndarray:
    out = mask.copy()
    for _ in range(radius):
        p = np.pad(out, 1, mode="constant", constant_values=False)
        out = (
            p[1:-1, 1:-1]
            | p[:-2, 1:-1]
            | p[2:, 1:-1]
            | p[1:-1, :-2]
            | p[1:-1, 2:]
            | p[:-2, :-2]
            | p[:-2, 2:]
            | p[2:, :-2]
            | p[2:, 2:]
        )
    return out


def extract_rgba_from_cell(cell_rgb: np.ndarray, allow_interior_holes: bool = True) -> np.ndarray:
    """Removes white background + enclosed pure-white holes and decontaminates edges."""
    h, w, _ = cell_rgb.shape
    bg_mask = flood_fill_exterior(is_bg_white(cell_rgb))

    if allow_interior_holes:
        strict_w = is_strict_interior_white(cell_rgb) & (~bg_mask)
        visited = np.zeros((h, w), dtype=bool)
        lum = cell_rgb.mean(axis=2)
        ys, xs = np.where(strict_w)
        for sy, sx in zip(ys.tolist(), xs.tolist()):
            if visited[sy, sx]:
                continue
            comp = []
            q = deque([(sy, sx)])
            visited[sy, sx] = True
            while q:
                cy, cx = q.popleft()
                comp.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and strict_w[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))
            if len(comp) < 18:
                continue
            comp_mask = np.zeros((h, w), dtype=bool)
            comp_mask[[p[0] for p in comp], [p[1] for p in comp]] = True
            border = dilate_bool(comp_mask, 2) & (~comp_mask)
            border_lums = lum[border]
            if len(border_lums) > 0 and float(np.mean(border_lums < 130)) >= 0.45:
                bg_mask |= comp_mask

    near_bg_1 = dilate_bool(bg_mask, 1) & (~bg_mask)
    near_bg_2 = dilate_bool(bg_mask, 2) & (~bg_mask) & (~near_bg_1)

    rgb_f = cell_rgb.astype(np.float32)
    alpha = np.where(bg_mask, 0.0, 1.0).astype(np.float32)
    ink = np.array([49.0, 34.0, 16.0], dtype=np.float32)
    white = np.array([255.0, 255.0, 255.0], dtype=np.float32)
    ink_dist = np.linalg.norm(white - ink)

    for ring in (near_bg_1, near_bg_2):
        ry, rx = np.where(ring)
        if len(ry) == 0:
            continue
        px = rgb_f[ry, rx]
        sat = px.max(axis=1) - px.min(axis=1)
        lum = px.mean(axis=1)
        dist_w = np.linalg.norm(white - px, axis=1)
        is_fringe = (lum > 155.0) & (sat < 36.0)
        if np.any(is_fringe):
            fy, fx = ry[is_fringe], rx[is_fringe]
            a_new = np.clip(dist_w[is_fringe] / (ink_dist * 0.62), 0.0, 1.0)
            a_new = np.where(a_new < 0.08, 0.0, a_new)
            alpha[fy, fx] = a_new
            nz = a_new > 0.08
            if np.any(nz):
                ny_idx, nx_idx = fy[nz], fx[nz]
                a_nz = a_new[nz][:, None]
                decontam = (rgb_f[ny_idx, nx_idx] - (1.0 - a_nz) * 255.0) / np.maximum(a_nz, 0.15)
                rgb_f[ny_idx, nx_idx] = np.clip(decontam, 0.0, 255.0)

    # Drop stray dust specs (< 20 px)
    fg = alpha > 0.15
    visited = np.zeros((h, w), dtype=bool)
    ys, xs = np.where(fg)
    for sy, sx in zip(ys.tolist(), xs.tolist()):
        if visited[sy, sx]:
            continue
        comp = []
        q = deque([(sy, sx)])
        visited[sy, sx] = True
        while q:
            cy, cx = q.popleft()
            comp.append((cy, cx))
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w and fg[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
        if len(comp) < 20:
            for cy, cx in comp:
                alpha[cy, cx] = 0.0

    alpha_u8 = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
    rgb_u8 = np.clip(np.round(rgb_f), 0, 255).astype(np.uint8)
    rgb_u8[alpha_u8 == 0] = 0
    return np.dstack([rgb_u8, alpha_u8])


def normalize_512(rgba: np.ndarray, min_pad: int = 32) -> Image.Image:
    ys, xs = np.where(rgba[..., 3] > 8)
    if len(ys) == 0:
        raise ValueError("Empty sprite after alpha extraction")
    cropped = Image.fromarray(rgba[int(ys.min()):int(ys.max()) + 1, int(xs.min()):int(xs.max()) + 1], "RGBA")
    max_dim = 512 - 2 * min_pad
    scale = min(max_dim / cropped.width, max_dim / cropped.height)
    nw, nh = max(1, int(round(cropped.width * scale))), max(1, int(round(cropped.height * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    canvas.paste(resized, ((512 - nw) // 2, (512 - nh) // 2))
    arr = np.array(canvas)
    arr[arr[..., 3] == 0] = 0
    return Image.fromarray(arr, "RGBA")


def best_split(proj: np.ndarray, target: float, window_frac: float = 0.16) -> int:
    n = len(proj)
    lo = max(0, int(n * (target - window_frac)))
    hi = min(n - 1, int(n * (target + window_frac)))
    seg = proj[lo:hi + 1]
    mins = np.where(seg == seg.min())[0]
    return lo + int(round(float(mins.mean())))


def update_manifest() -> None:
    mpath = PACK_DIR / "manifest.json"
    if not mpath.exists():
        return
    data = json.loads(mpath.read_text(encoding="utf-8"))
    for entry in data.get("assets", []):
        fp = PACK_DIR / entry["filename"]
        if not fp.exists():
            continue
        arr = np.array(Image.open(fp).convert("RGBA"))
        alpha = arr[..., 3]
        ys, xs = np.where(alpha > 0)
        raw = fp.read_bytes()
        entry["file_size_bytes"] = len(raw)
        entry["sha256"] = hashlib.sha256(raw).hexdigest()
        entry["transparency"]["transparent_pixel_ratio"] = round(float(np.mean(alpha == 0)), 4)
        entry["transparency"]["padding_px"] = {
            "top": int(ys.min()) if len(ys) else 512,
            "right": int(511 - xs.max()) if len(xs) else 512,
            "bottom": int(511 - ys.max()) if len(ys) else 512,
            "left": int(xs.min()) if len(xs) else 512,
        }
    for entry in data.get("backgrounds", []):
        fp = PACK_DIR / entry["filename"]
        if fp.exists():
            raw = fp.read_bytes()
            entry["file_size_bytes"] = len(raw)
            entry["sha256"] = hashlib.sha256(raw).hexdigest()
    mpath.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def save_sprite(spec: str, rgba: np.ndarray) -> Image.Image:
    cat, sid = spec.split("/", 1)
    norm = normalize_512(rgba)
    out = PACK_DIR / "sprites" / cat / f"{sid}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    norm.save(out, optimize=True)
    print(f"Saved {out.relative_to(REPO_ROOT)}")
    return norm


def write_checkerboard(sprites: dict[str, Image.Image], out_path: Path) -> None:
    cols = min(4, len(sprites))
    rows = (len(sprites) + cols - 1) // cols
    tile = 256
    bg = Image.new("RGBA", (cols * tile, rows * tile), (48, 48, 52, 255))
    draw = ImageDraw.Draw(bg)
    for y in range(0, bg.height, 16):
        for x in range(0, bg.width, 16):
            if ((x // 16) + (y // 16)) % 2 == 0:
                draw.rectangle([x, y, x + 15, y + 15], fill=(70, 70, 76, 255))
    for i, (sid, im) in enumerate(sprites.items()):
        r, c = divmod(i, cols)
        bg.alpha_composite(im.resize((tile - 16, tile - 16), Image.Resampling.LANCZOS), (c * tile + 8, r * tile + 8))
        draw.text((c * tile + 8, r * tile + 6), sid, fill=(255, 255, 255, 255))
    bg.convert("RGB").save(out_path)
    print(f"Wrote QA checkerboard -> {out_path}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Slice and normalize Our Home sprites.")
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--single", action="store_true", help="Single sprite image")
    mode.add_argument("--grid", metavar="CxR", help="Grid layout like 2x2 or 3x2")
    mode.add_argument("--backdrop", action="store_true", help="16:9 room backdrop -> 1600x900")
    ap.add_argument("--no-holes", action="store_true", help="Skip interior pure-white hole removal")
    ap.add_argument("--qa", type=Path, help="Optional output path for dark checkerboard QA sheet")
    ap.add_argument("image", type=Path, help="Raw input image")
    ap.add_argument("targets", nargs="+", help="Target(s): <category>/<sprite_id> or <backdrop_id>")
    args = ap.parse_args()

    if args.backdrop:
        im = Image.open(args.image).convert("RGB").resize((1600, 900), Image.Resampling.LANCZOS)
        dest = PACK_DIR / "backgrounds" / f"{args.targets[0]}.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, optimize=True)
        update_manifest()
        print(f"Saved 1600x900 backdrop -> {dest.relative_to(REPO_ROOT)}")
        return

    arr = np.array(Image.open(args.image).convert("RGB"))
    h, w, _ = arr.shape
    saved: dict[str, Image.Image] = {}

    if args.single:
        rgba = extract_rgba_from_cell(arr, allow_interior_holes=not args.no_holes)
        saved[args.targets[0]] = save_sprite(args.targets[0], rgba)
    else:
        cols, rows = (int(v) for v in args.grid.lower().split("x"))
        if len(args.targets) != cols * rows:
            ap.error(f"--grid {cols}x{rows} requires {cols * rows} targets, got {len(args.targets)}")
        nw = ~is_bg_white(arr)
        col_proj = nw.sum(axis=0)
        xs = [0] + [best_split(col_proj, i / cols) for i in range(1, cols)] + [w]
        for c_i in range(cols):
            xa, xb = xs[c_i], xs[c_i + 1]
            row_proj = nw[:, xa:xb].sum(axis=1)
            ys = [0] + [best_split(row_proj, j / rows) for j in range(1, rows)] + [h]
            for r_i in range(rows):
                target = args.targets[r_i * cols + c_i]
                rgba = extract_rgba_from_cell(arr[ys[r_i]:ys[r_i + 1], xa:xb], allow_interior_holes=not args.no_holes)
                saved[target] = save_sprite(target, rgba)

    update_manifest()
    if args.qa:
        write_checkerboard(saved, args.qa)


if __name__ == "__main__":
    main()
