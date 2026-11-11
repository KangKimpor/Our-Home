/** Generates app icons from our original house-and-heart mark. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const mark = (bg, pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${bg === 'transparent' ? 0 : 96}" fill="${bg === 'transparent' ? 'none' : bg}"/>
  <g transform="translate(${pad} ${pad}) scale(${(512 - pad * 2) / 512})">
    <circle cx="256" cy="256" r="220" fill="#F3EFE0"/>
    <path d="M 116 268 L 256 148 L 396 268 L 396 402 L 116 402 Z" fill="#E9C65B" stroke="#2E2A26" stroke-width="12" stroke-linejoin="round"/>
    <path d="M 92 276 L 256 132 L 420 276" fill="none" stroke="#2E2A26" stroke-width="14" stroke-linecap="round"/>
    <rect x="226" y="316" width="60" height="86" rx="10" fill="#8C6B4C" stroke="#2E2A26" stroke-width="10"/>
    <circle cx="270" cy="360" r="5" fill="#E9C65B"/>
    <rect x="142" y="306" width="56" height="52" rx="8" fill="#BFD8E3" stroke="#2E2A26" stroke-width="10"/>
    <line x1="170" y1="306" x2="170" y2="358" stroke="#2E2A26" stroke-width="7"/>
    <line x1="142" y1="332" x2="198" y2="332" stroke="#2E2A26" stroke-width="7"/>
    <rect x="314" y="306" width="56" height="52" rx="8" fill="#BFD8E3" stroke="#2E2A26" stroke-width="10"/>
    <line x1="342" y1="306" x2="342" y2="358" stroke="#2E2A26" stroke-width="7"/>
    <line x1="314" y1="332" x2="370" y2="332" stroke="#2E2A26" stroke-width="7"/>
    <path d="M 256 236 C 236 208 196 220 196 252 C 196 284 256 314 256 314 C 256 314 316 284 316 252 C 316 220 276 208 256 236 Z" fill="#E8A6B0" stroke="#2E2A26" stroke-width="9" stroke-linejoin="round"/>
    <circle cx="118" cy="196" r="16" fill="#A8BE86" stroke="#2E2A26" stroke-width="7"/>
    <circle cx="394" cy="200" r="13" fill="#A8BE86" stroke="#2E2A26" stroke-width="7"/>
  </g>
</svg>`;

const full = mark('#F3EFE0');
const maskable = mark('#E9C65B', 92);
const transparent = mark('transparent');

writeFileSync(join(outDir, 'favicon.svg'), full);
writeFileSync(join(outDir, 'icon.svg'), full);

await sharp(Buffer.from(full)).resize(192, 192).png().toFile(join(outDir, 'icon-192.png'));
await sharp(Buffer.from(full)).resize(512, 512).png().toFile(join(outDir, 'icon-512.png'));
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile(join(outDir, 'maskable-512.png'));
await sharp(Buffer.from(transparent)).resize(180, 180).png().toFile(join(outDir, 'apple-touch-icon.png'));
await sharp(Buffer.from(transparent)).resize(32, 32).png().toFile(join(outDir, 'favicon-32.png'));
console.log('icons generated');
