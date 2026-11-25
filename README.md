# Our Home

A cozy home and pet game for the web. This is a ground-up rebuild that starts
small: one living room and the basic interactions.

## Play

```bash
npm install
npm run dev
```

- **Drag** furniture to rearrange it. Floor items stay on the floor, the clock and pinboard stay on the wall, the rug stays underneath, and nearer things draw in front. Your layout is saved in the browser.
- **Tap** furniture: it bounces, the clock and pinboard swing, and the floor lamp turns the room light on and off.
- **Tap the hedgehog** and it hops. Otherwise it wanders around the room.
- **Reset room** puts everything back.

## Art

All art is image files. Nothing is drawn in code.

- Sprites come from the Hearth & Sprout pack (`hearth_and_sprout_2d_asset_pack_v1_0/`).
- `node scripts/import-sprites.mjs` trims the sprites the game uses into `public/sprites/` and records their sizes in `src/game/sprites.json`. To use another sprite, add its id to the list in that script and add an entry to `ITEMS` in `src/game/layout.ts`.
- The room itself is the pack's painted backdrop (`backgrounds/living_room_backdrop.png`), converted to WebP in `public/backgrounds/`.
- Run `npm run sprites` after updating the pack to re-import everything.

## Code

| Path                 | What it is                                                            |
| -------------------- | --------------------------------------------------------------------- |
| `src/game/layout.ts` | Room size, furniture list, default layout, placement rules, save/load |
| `src/game/pet.ts`    | The pet's wander / idle / happy behaviour (pure functions)            |
| `src/ui/`            | Stage scaling, draggable furniture, the pet's animation loop          |

## Tests

```bash
npm test          # unit tests
npm run test:e2e  # browser tests (drag, save, lamp, pet)
```
