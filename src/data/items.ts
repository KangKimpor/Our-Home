import type { ItemDef, RoomId } from '../game/types';

type Extra = Partial<
  Pick<ItemDef, 'anchor' | 'palette' | 'width' | 'variantGroup' | 'tags' | 'starter' | 'babyOnly' | 'surface'>
>;

function it(id: string, name: string, room: RoomId, art: string, price: number, width: number, extra: Extra = {}): ItemDef {
  return { id, name, room, art, price, width, anchor: 'floor', palette: 'cream', ...extra };
}

const living: ItemDef[] = [
  it('living.sofa.sage', 'Sage sofa', 'living', 'sofa', 420, 340, { palette: 'sage', variantGroup: 'sofa', starter: true }),
  it('living.sofa.dusk', 'Dusk-blue sofa', 'living', 'sofa', 420, 340, { palette: 'dusty', variantGroup: 'sofa' }),
  it('living.sofa.butter', 'Butter sofa', 'living', 'sofa', 420, 340, { palette: 'butter', variantGroup: 'sofa' }),
  it('living.sofa.plum', 'Plum sofa', 'living', 'sofa', 420, 340, { palette: 'plum', variantGroup: 'sofa' }),
  it('living.coffeeTable', 'Oak coffee table', 'living', 'coffeeTable', 120, 220, { palette: 'wood', starter: true, surface: true }),
  it('living.rug.oval', 'Meadow oval rug', 'living', 'rug', 120, 440, { palette: 'sage', starter: true }),
  it('living.rug.sunset', 'Sunset oval rug', 'living', 'rug', 120, 440, { palette: 'rust', variantGroup: 'livingRug' }),
  it('living.tvCabinet', 'Little TV cabinet', 'living', 'tvcabinet', 180, 260, { palette: 'darkwood', tags: ['window'], surface: true }),
  it('living.tv', 'Box television', 'living', 'tv', 240, 260, { palette: 'charcoal', anchor: 'surface' }),
  it('living.piano', 'Upright piano', 'living', 'piano', 950, 330, { palette: 'darkwood', tags: ['music'] }),
  it('living.pianoBench', 'Piano bench', 'living', 'pianoBench', 70, 120, { palette: 'darkwood' }),
  it('living.bookshelf', 'Tall bookshelf', 'living', 'bookshelf', 260, 150, { palette: 'wood', tags: ['cosy'] }),
  it('living.floorLamp', 'Paper floor lamp', 'living', 'floorLamp', 140, 105, { palette: 'cream', starter: true }),
  it('living.fern', 'Potted fern', 'living', 'plant', 60, 105, { palette: 'teal', starter: true, tags: ['plant'] }),
  it('living.vase', 'Ceramic vase', 'living', 'vase', 45, 65, { palette: 'dusty', anchor: 'surface' }),
  it('living.painting', 'Meadow painting', 'living', 'painting', 170, 130, { palette: 'wood', anchor: 'wall', variantGroup: 'livingPainting' }),
  it('living.paintingBlue', 'Blue-hill painting', 'living', 'painting', 170, 130, { palette: 'dusty', anchor: 'wall', variantGroup: 'livingPainting' }),
  it('living.clock', 'Round wall clock', 'living', 'wallClock', 90, 75, { palette: 'cream', anchor: 'wall' }),
  it('living.diningTable', 'Family dining table', 'living', 'diningTable', 380, 300, { palette: 'wood', surface: true }),
  it('living.diningChair', 'Rush dining chair', 'living', 'chair', 90, 95, { palette: 'wood' }),
  it('living.sideTable', 'Round side table', 'living', 'sideTable', 110, 100, { palette: 'darkwood', surface: true }),
  it('living.shelf', 'Open wall shelf', 'living', 'shelf', 110, 170, { palette: 'wood', anchor: 'wall' }),
];

const bedroom: ItemDef[] = [
  it('bedroom.bed.rose', 'Rose linen bed', 'bedroom', 'bed', 700, 400, { palette: 'powder', variantGroup: 'bed', starter: true }),
  it('bedroom.bed.blue', 'Blue linen bed', 'bedroom', 'bed', 700, 400, { palette: 'dusty', variantGroup: 'bed' }),
  it('bedroom.wardrobe', 'Panel wardrobe', 'bedroom', 'wardrobe', 480, 200, { palette: 'wood', starter: true }),
  it('bedroom.dresser', 'Drawer dresser', 'bedroom', 'dresser', 320, 200, { palette: 'darkwood', surface: true }),
  it('bedroom.desk', 'Writing desk', 'bedroom', 'desk', 280, 230, { palette: 'wood', tags: ['window'], surface: true }),
  it('bedroom.chair', 'Sage desk chair', 'bedroom', 'chair', 110, 95, { palette: 'sage' }),
  it('bedroom.armchair', 'Reading armchair', 'bedroom', 'armchair', 280, 190, { palette: 'sage', tags: ['cosy'] }),
  it('bedroom.clothesRack', 'Clothes rack', 'bedroom', 'clothesRack', 170, 170, { palette: 'cream' }),
  it('bedroom.nightstand', 'Little nightstand', 'bedroom', 'nightstand', 90, 100, { palette: 'wood', starter: true, surface: true }),
  it('bedroom.lamp', 'Butter table lamp', 'bedroom', 'tableLamp', 80, 70, { palette: 'butter', anchor: 'surface' }),
  it('bedroom.rug', 'Wool bedside rug', 'bedroom', 'rug', 140, 380, { palette: 'dusty' }),
  it('bedroom.plant', 'Quiet potted plant', 'bedroom', 'plant', 70, 95, { palette: 'moss', tags: ['plant'] }),
  it('bedroom.mirror', 'Round mirror', 'bedroom', 'mirror', 150, 110, { palette: 'cream', anchor: 'wall' }),
  it('bedroom.art', 'Teal wall print', 'bedroom', 'painting', 140, 110, { palette: 'teal', anchor: 'wall' }),
  it('bedroom.shelf', 'Bedside shelf', 'bedroom', 'shelf', 130, 160, { palette: 'wood', anchor: 'wall' }),
  it('bedroom.bench', 'End-of-bed bench', 'bedroom', 'bench', 150, 190, { palette: 'powder' }),
];

const kitchen: ItemDef[] = [
  it('kitchen.counter', 'Sage kitchen counter', 'kitchen', 'counter', 320, 300, { palette: 'sage', starter: true, surface: true }),
  it('kitchen.stove', 'Farmhouse stove', 'kitchen', 'stove', 440, 280, { palette: 'cream', starter: true, surface: true }),
  it('kitchen.oven', 'Built-in oven', 'kitchen', 'oven', 380, 210, { palette: 'cream' }),
  it('kitchen.fridge', 'Cream larder fridge', 'kitchen', 'fridge', 520, 180, { palette: 'white', starter: true }),
  it('kitchen.sink', 'Apron sink', 'kitchen', 'sink', 260, 160, { palette: 'cream' }),
  it('kitchen.hood', 'Range hood', 'kitchen', 'rangeHood', 220, 210, { palette: 'stone', anchor: 'wall' }),
  it('kitchen.pot', 'Red stock pot', 'kitchen', 'pot', 60, 100, { palette: 'brick', anchor: 'surface' }),
  it('kitchen.pan', 'Black frying pan', 'kitchen', 'pan', 60, 110, { palette: 'charcoal', anchor: 'surface' }),
  it('kitchen.bowl', 'Mixing bowl', 'kitchen', 'mixingBowl', 45, 90, { palette: 'dusty', anchor: 'surface' }),
  it('kitchen.fruit', 'Fruit bowl', 'kitchen', 'fruitBowl', 70, 90, { palette: 'butter', anchor: 'surface' }),
  it('kitchen.shelf', 'Spice shelf', 'kitchen', 'shelf', 120, 170, { palette: 'wood', anchor: 'wall' }),
  it('kitchen.clock', 'Kitchen clock', 'kitchen', 'wallClock', 80, 70, { palette: 'cream', anchor: 'wall' }),
  it('kitchen.herb', 'Herb pot', 'kitchen', 'plant', 50, 80, { palette: 'sage', anchor: 'surface', tags: ['plant'] }),
  it('kitchen.table', 'Scrubbed kitchen table', 'kitchen', 'diningTable', 330, 280, { palette: 'darkwood', surface: true }),
  it('kitchen.chair', 'Cream kitchen chair', 'kitchen', 'chair', 90, 90, { palette: 'cream' }),
  it('kitchen.cabinet', 'Pantry cabinet', 'kitchen', 'cabinet', 360, 180, { palette: 'wood', surface: true }),
];

const bathroom: ItemDef[] = [
  it('bathroom.tub', 'Clawfoot bathtub', 'bathroom', 'bathtub', 600, 320, { palette: 'cream', starter: true }),
  it('bathroom.shower', 'Glass shower', 'bathroom', 'shower', 520, 200, { palette: 'dusty' }),
  it('bathroom.toilet', 'Little toilet', 'bathroom', 'toilet', 300, 125, { palette: 'cream', starter: true }),
  it('bathroom.sink', 'Pedestal sink', 'bathroom', 'sink', 260, 150, { palette: 'cream' }),
  it('bathroom.basket', 'Laundry basket', 'bathroom', 'laundryBasket', 80, 95, { palette: 'dusty' }),
  it('bathroom.mat', 'Soft bath mat', 'bathroom', 'doorMat', 60, 130, { palette: 'teal' }),
  it('bathroom.mirror', 'Bathroom mirror', 'bathroom', 'mirror', 140, 100, { palette: 'cream', anchor: 'wall' }),
  it('bathroom.towels', 'Towel rack', 'bathroom', 'towelRack', 90, 100, { palette: 'cream', anchor: 'wall' }),
  it('bathroom.plant', 'Steamy plant', 'bathroom', 'plant', 60, 90, { palette: 'moss', tags: ['plant'] }),
  it('bathroom.shelf', 'Bath shelf', 'bathroom', 'shelf', 100, 140, { palette: 'white', anchor: 'wall' }),
  it('bathroom.art', 'Bath wall print', 'bathroom', 'wallArtSmall', 100, 90, { palette: 'dusty', anchor: 'wall' }),
  it('bathroom.stool', 'Wooden bath stool', 'bathroom', 'stool', 60, 70, { palette: 'wood' }),
  it('bathroom.lantern', 'Bath lantern', 'bathroom', 'lantern', 70, 60, { palette: 'cream', anchor: 'surface' }),
];

const studio: ItemDef[] = [
  it('studio.easel', 'Painter easel', 'studio', 'easel', 400, 190, { palette: 'wood', starter: true }),
  it('studio.table', 'Paint-splattered table', 'studio', 'artTable', 480, 280, { palette: 'darkwood', starter: true, surface: true }),
  it('studio.chair', 'Studio chair', 'studio', 'chair', 100, 95, { palette: 'sage' }),
  it('studio.chaise', 'Cream chaise', 'studio', 'chaise', 700, 320, { palette: 'cream', tags: ['cosy'] }),
  it('studio.shelf', 'Sketchbook shelf', 'studio', 'bookshelf', 280, 150, { palette: 'wood' }),
  it('studio.cabinet', 'Paint cabinet', 'studio', 'cabinet', 360, 180, { palette: 'darkwood', surface: true }),
  it('studio.lamp', 'Studio floor lamp', 'studio', 'floorLamp', 150, 110, { palette: 'cream' }),
  it('studio.plant', 'Big studio plant', 'studio', 'plant', 70, 110, { palette: 'moss', tags: ['plant'] }),
  it('studio.paintingA', 'Golden field painting', 'studio', 'painting', 180, 140, { palette: 'butter', anchor: 'wall', variantGroup: 'studioPainting' }),
  it('studio.paintingB', 'Sea painting', 'studio', 'painting', 180, 140, { palette: 'dusty', anchor: 'wall', variantGroup: 'studioPainting' }),
  it('studio.paintingC', 'Red abstract painting', 'studio', 'painting', 180, 140, { palette: 'brick', anchor: 'wall', variantGroup: 'studioPainting' }),
  it('studio.rug', 'Olive studio rug', 'studio', 'rug', 150, 360, { palette: 'olive' }),
  it('studio.stool', 'Paint stool', 'studio', 'stool', 65, 70, { palette: 'wood' }),
  it('studio.vase', 'Brush jar', 'studio', 'vase', 50, 60, { palette: 'teal', anchor: 'surface' }),
  it('studio.frame', 'Empty frame', 'studio', 'wallArtSmall', 80, 90, { palette: 'cream', anchor: 'wall' }),
];

const nursery: ItemDef[] = [
  it('nursery.crib', 'Cloud crib', 'nursery', 'crib', 600, 250, { palette: 'powder', starter: true }),
  it('nursery.rockingChair', 'Rocking chair', 'nursery', 'rockingChair', 300, 180, { palette: 'sage' }),
  it('nursery.tent', 'Play tent', 'nursery', 'tent', 500, 280, { palette: 'dusty' }),
  it('nursery.toyBasket', 'Toy basket', 'nursery', 'toyBasket', 120, 100, { palette: 'butter' }),
  it('nursery.walker', 'Baby walker', 'nursery', 'walker', 240, 140, { palette: 'cream', babyOnly: true }),
  it('nursery.shelf', 'Little wall shelf', 'nursery', 'shelf', 120, 150, { palette: 'cream', anchor: 'wall' }),
  it('nursery.art', 'Cloud wall print', 'nursery', 'wallArtSmall', 90, 90, { palette: 'powder', anchor: 'wall' }),
  it('nursery.rug', 'Round nursery rug', 'nursery', 'rug', 130, 300, { palette: 'powder' }),
  it('nursery.plant', 'Tiny nursery plant', 'nursery', 'plant', 55, 85, { palette: 'sage', tags: ['plant'] }),
  it('nursery.lamp', 'Pink table lamp', 'nursery', 'tableLamp', 80, 70, { palette: 'powder', anchor: 'surface' }),
  it('nursery.dresser', 'Changing dresser', 'nursery', 'dresser', 300, 190, { palette: 'white', surface: true }),
  it('nursery.bookshelf', 'Picture-book shelf', 'nursery', 'bookshelf', 200, 125, { palette: 'powder' }),
  it('nursery.mobile', 'Star mobile', 'nursery', 'mobile', 140, 110, { palette: 'butter', anchor: 'wall' }),
  it('nursery.plush', 'Bunny plush', 'nursery', 'plush', 70, 65, { palette: 'cream', anchor: 'surface' }),
  it('nursery.nightstand', 'White nightstand', 'nursery', 'nightstand', 100, 95, { palette: 'white', surface: true }),
];

const porch: ItemDef[] = [
  it('porch.bowl.sun', 'Sunny pet bowl', 'porch', 'petBowl', 40, 75, { palette: 'butter', starter: true }),
  it('porch.bowl.sky', 'Sky pet bowl', 'porch', 'petBowl', 40, 75, { palette: 'dusty', variantGroup: 'petbowl' }),
  it('porch.bowl.leaf', 'Leafy pet bowl', 'porch', 'petBowl', 40, 75, { palette: 'sage', variantGroup: 'petbowl' }),
  it('porch.ball', 'Tennis ball', 'porch', 'ball', 25, 45, { palette: 'butter' }),
  it('porch.slippers', 'Porch slippers', 'porch', 'slippers', 35, 80, { palette: 'cream' }),
  it('porch.stone', 'Stepping stone', 'porch', 'steppingStone', 45, 100, { palette: 'stone' }),
  it('porch.bench', 'Porch bench', 'porch', 'bench', 260, 200, { palette: 'wood', tags: ['cosy'] }),
  it('porch.lantern', 'Porch lantern', 'porch', 'lantern', 80, 60, { palette: 'cream' }),
  it('porch.planter', 'Porch planter', 'porch', 'flowerBed', 150, 180, { palette: 'sage' }),
  it('porch.wateringCan', 'Watering can', 'porch', 'wateringCan', 50, 90, { palette: 'teal' }),
  it('porch.mat', 'Welcome mat', 'porch', 'doorMat', 55, 120, { palette: 'brick' }),
  it('porch.windChime', 'Shell wind chime', 'porch', 'windChime', 95, 65, { palette: 'cream', anchor: 'wall' }),
  it('porch.birdhouse', 'Porch birdhouse', 'porch', 'birdhouse', 180, 100, { palette: 'sage', tags: ['bird'] }),
  it('porch.catTree', 'Sunny cat tree', 'porch', 'catTree', 300, 160, { palette: 'wood', tags: ['cat'] }),
];

const garden: ItemDef[] = [
  it('garden.pool', 'Stone garden pool', 'garden', 'pool', 900, 450, { palette: 'dusty', tags: ['water'] }),
  it('garden.flowerRed', 'Brick flower bed', 'garden', 'flowerBed', 180, 190, { palette: 'brick', tags: ['flower'] }),
  it('garden.flowerBlue', 'Blue flower bed', 'garden', 'flowerBed', 180, 190, { palette: 'dusty', variantGroup: 'flowerbed', tags: ['flower'] }),
  it('garden.picnic', 'Picnic blanket', 'garden', 'picnicBlanket', 220, 280, { palette: 'sage', starter: true, tags: ['visitor'] }),
  it('garden.tree', 'Autumn tree', 'garden', 'tree', 650, 280, { palette: 'rust' }),
  it('garden.hedge', 'Clipped hedge', 'garden', 'hedge', 180, 240, { palette: 'green' }),
  it('garden.mushrooms', 'Mushroom cluster', 'garden', 'mushroom', 40, 65, { palette: 'brick' }),
  it('garden.lantern', 'Path lantern', 'garden', 'lantern', 90, 65, { palette: 'cream' }),
  it('garden.swing', 'Garden swing', 'garden', 'swing', 500, 230, { palette: 'wood' }),
  it('garden.feeder', 'Seed feeder', 'garden', 'birdFeeder', 150, 100, { palette: 'cream', tags: ['bird'] }),
  it('garden.fountain', 'Birdbath fountain', 'garden', 'fountain', 800, 250, { palette: 'stone', tags: ['water', 'bird'] }),
  it('garden.arch', 'Rose arch', 'garden', 'roseArch', 450, 210, { palette: 'sage', tags: ['flower'] }),
  it('garden.path', 'Stone path', 'garden', 'stonePath', 90, 190, { palette: 'stone' }),
  it('garden.butterflyHouse', 'Butterfly house', 'garden', 'butterflyHouse', 160, 80, { palette: 'dusty', tags: ['critter'] }),
  it('garden.bench', 'Garden bench', 'garden', 'bench', 240, 200, { palette: 'sage', tags: ['cosy'] }),
  it('garden.chime', 'Glass wind chime', 'garden', 'windChime', 100, 65, { palette: 'teal', anchor: 'wall' }),
];

const farm: ItemDef[] = [
  it('farm.doghouse', 'Moss doghouse', 'farm', 'doghouse', 500, 230, { palette: 'sage', tags: ['dog'] }),
  it('farm.hay', 'Hay bale', 'farm', 'hayBale', 120, 150, { palette: 'butter' }),
  it('farm.trough', 'Feeding trough', 'farm', 'trough', 170, 190, { palette: 'wood' }),
  it('farm.nest', 'Hen nest', 'farm', 'nest', 130, 110, { palette: 'wood', tags: ['bird'] }),
  it('farm.pond', 'Duck pond', 'farm', 'pool', 600, 370, { palette: 'teal', tags: ['water', 'bird'], variantGroup: 'pond' }),
  it('farm.fence', 'Field fence', 'farm', 'fence', 200, 230, { palette: 'wood' }),
  it('farm.windmill', 'Little windmill', 'farm', 'windmill', 850, 210, { palette: 'cream' }),
  it('farm.scarecrow', 'Friendly scarecrow', 'farm', 'scarecrow', 320, 160, { palette: 'rust' }),
  it('farm.wheelbarrow', 'Wheelbarrow', 'farm', 'wheelbarrow', 220, 190, { palette: 'wood' }),
  it('farm.beehive', 'Busy beehive', 'farm', 'beehive', 300, 110, { palette: 'butter', tags: ['critter'] }),
  it('farm.coop', 'Chicken coop', 'farm', 'coop', 480, 230, { palette: 'sage', tags: ['bird'] }),
  it('farm.milkCan', 'Milk can', 'farm', 'milkCan', 60, 70, { palette: 'cream' }),
  it('farm.crate', 'Apple crate', 'farm', 'crate', 90, 110, { palette: 'wood' }),
  it('farm.sign', 'Farm sign', 'farm', 'wallArtSmall', 80, 90, { palette: 'wood', anchor: 'wall' }),
  it('farm.lamp', 'Brick barn lamp', 'farm', 'lantern', 70, 60, { palette: 'brick', anchor: 'wall' }),
];

export const ITEMS: ItemDef[] = [...living, ...bedroom, ...kitchen, ...bathroom, ...studio, ...nursery, ...porch, ...garden, ...farm];

export const ITEMS_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((item) => [item.id, item]));

export function itemsForRoom(room: RoomId): ItemDef[] {
  return ITEMS.filter((item) => item.room === room);
}

export function itemName(item: ItemDef): string {
  return item.name;
}

export const VARIANT_GROUPS: Record<string, ItemDef[]> = ITEMS.reduce<Record<string, ItemDef[]>>((acc, item) => {
  if (!item.variantGroup) return acc;
  (acc[item.variantGroup] ??= []).push(item);
  return acc;
}, {});
