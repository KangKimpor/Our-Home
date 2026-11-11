export interface PetSpeciesDef {
  id: string;
  name: string;
  nameKey: string;
  coats: { id: string; name: string; nameKey: string }[];
  price: number;
}

export const PET_SPECIES: PetSpeciesDef[] = [
  {
    id: 'cat',
    name: 'Cat',
    nameKey: 'species.cat',
    coats: [
      { id: 'ginger', name: 'Ginger', nameKey: 'coat.ginger' },
      { id: 'charcoal', name: 'Charcoal', nameKey: 'coat.charcoal' },
      { id: 'calico', name: 'Calico', nameKey: 'coat.calico' },
    ],
    price: 500,
  },
  {
    id: 'dog',
    name: 'Dog',
    nameKey: 'species.dog',
    coats: [
      { id: 'golden', name: 'Golden', nameKey: 'coat.golden' },
      { id: 'brown', name: 'Cocoa', nameKey: 'coat.brown' },
      { id: 'grey', name: 'Pebble', nameKey: 'coat.grey' },
    ],
    price: 900,
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    nameKey: 'species.rabbit',
    coats: [
      { id: 'white', name: 'Snow', nameKey: 'coat.white' },
      { id: 'rose', name: 'Rose', nameKey: 'coat.rose' },
      { id: 'grey', name: 'Ash', nameKey: 'coat.grey' },
    ],
    price: 700,
  },
  {
    id: 'bird',
    name: 'Bird',
    nameKey: 'species.bird',
    coats: [
      { id: 'sky', name: 'Sky', nameKey: 'coat.sky' },
      { id: 'butter', name: 'Butter', nameKey: 'coat.golden' },
      { id: 'mint', name: 'Mint', nameKey: 'coat.mint' },
    ],
    price: 600,
  },
];

export const PET_SPECIES_BY_ID = Object.fromEntries(PET_SPECIES.map((s) => [s.id, s]));

export const PET_TRAITS = [
  { id: 'sleepy', name: 'Sleepy', nameKey: 'trait.sleepy' },
  { id: 'curious', name: 'Curious', nameKey: 'trait.curious' },
  { id: 'foodie', name: 'Foodie', nameKey: 'trait.foodie' },
  { id: 'playful', name: 'Playful', nameKey: 'trait.playful' },
] as const;
