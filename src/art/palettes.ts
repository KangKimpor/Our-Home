/** Semantic palettes for the original flat-vector art. */

export interface Palette {
  main: string;
  second: string;
  wood: string;
  dark: string;
  accent: string;
  metal: string;
  leaf: string;
  glass: string;
  paper: string;
}

const base: Palette = {
  main: '#F3EFE0',
  second: '#E4D9C2',
  wood: '#B08A5E',
  dark: '#7A5A3C',
  accent: '#C4483B',
  metal: '#9AA6A8',
  leaf: '#7F9B5C',
  glass: '#BFD8E3',
  paper: '#FBF7EC',
};

export const PALETTES: Record<string, Palette> = {
  cream: base,
  sage: { ...base, main: '#A8BE86', second: '#C9D8AF', wood: '#A98055', accent: '#E9C65B' },
  moss: { ...base, main: '#6E8A55', second: '#8FA96F', wood: '#8C6B4C', accent: '#E8A6B0' },
  butter: { ...base, main: '#E9C65B', second: '#F3D98C', wood: '#A98055', accent: '#C4483B' },
  dusty: { ...base, main: '#8EA7C6', second: '#B4C6DC', wood: '#A98055', accent: '#E9C65B' },
  powder: { ...base, main: '#E8A6B0', second: '#F3C6CC', wood: '#B08A5E', accent: '#7F9B5C' },
  brick: { ...base, main: '#C4483B', second: '#D97A6D', wood: '#8C6B4C', accent: '#E9C65B' },
  teal: { ...base, main: '#4E8C86', second: '#83B4AD', wood: '#A98055', accent: '#E9C65B' },
  navy: { ...base, main: '#3F5578', second: '#6B81A4', wood: '#8C6B4C', accent: '#E9C65B' },
  plum: { ...base, main: '#8A6A8F', second: '#B093B4', wood: '#8C6B4C', accent: '#E9C65B' },
  rust: { ...base, main: '#C97A4A', second: '#E2A377', wood: '#8C6B4C', accent: '#4E6B3E' },
  olive: { ...base, main: '#8B8B4E', second: '#B6B675', wood: '#8C6B4C', accent: '#C4483B' },
  stone: { ...base, main: '#C9C3B4', second: '#E0DBCE', wood: '#9B9285', accent: '#7F9B5C' },
  charcoal: { ...base, main: '#4A4A46', second: '#6E6E68', wood: '#3A332C', accent: '#E9C65B' },
  wood: { ...base, main: '#B08A5E', second: '#C9A97C', wood: '#8C6B4C', accent: '#5B4130' },
  darkwood: { ...base, main: '#8C6B4C', second: '#A8855F', wood: '#5B4130', accent: '#E9C65B' },
  white: { ...base, main: '#FBF7EC', second: '#EDE6D6', wood: '#D8C9AF', accent: '#8EA7C6' },
  red: { ...base, main: '#B84A3C', second: '#D27163', wood: '#8C6B4C', accent: '#E9C65B' },
  pink: { ...base, main: '#D98C9B', second: '#EFBFC8', wood: '#B08A5E', accent: '#7F9B5C' },
  green: { ...base, main: '#5F7D4A', second: '#89A46C', wood: '#8C6B4C', accent: '#E9C65B' },
};

export function palette(name?: string): Palette {
  return PALETTES[name ?? 'cream'] ?? base;
}
