import {
  expect,
  test,
  type APIRequestContext,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';

/**
 * Every test gets its own in-memory shared room on the dev/preview server (addressed by a
 * cookie/header that only the local middleware understands), so parallel tests never trample
 * each other. Production has exactly one shared save and ignores the namespace entirely.
 */
const NS_COOKIE = 'our-home-save-ns';
const NS_HEADER = 'x-our-home-save-ns';
let ns = 'default';

interface ApiState {
  slots: Record<string, string>;
  placements: Record<string, string>;
  pet: string;
  outfits: { her: string; him: string };
  lampOn: boolean;
  tvOn: boolean;
  revision: number;
}

async function serverState(request: APIRequestContext): Promise<ApiState> {
  const res = await request.get('/api/home-state', { headers: { [NS_HEADER]: ns } });
  expect(res.ok()).toBe(true);
  expect(res.headers()['cache-control']).toContain('no-store');
  return ((await res.json()) as { state: ApiState }).state;
}

/** A clean tap (pointerdown + pointerup at the same spot) that ignores anything drawn on top. */
async function tap(target: Locator) {
  await target.dispatchEvent('pointerdown', {
    button: 0,
    pointerId: 7,
    pointerType: 'mouse',
    isPrimary: true,
  });
  await target.dispatchEvent('pointerup', { button: 0, pointerId: 7, pointerType: 'mouse', isPrimary: true });
}

/** Furniture is anchored by inline style in room coordinates; returns its base-centre anchor. */
async function anchorOf(item: Locator) {
  return item.evaluate((el) => {
    const s = (el as HTMLElement).style;
    const left = parseFloat(s.left);
    const top = parseFloat(s.top);
    const width = parseFloat(s.width);
    const height = parseFloat(s.height);
    return { x: Math.round(left + width / 2), y: Math.round(top + height) };
  });
}

async function openDecorate(page: Page) {
  const toggle = page.getByTestId('decorate-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('decorate-panel')).toBeVisible();
}

async function pick(page: Page, slotId: string, optionId: string) {
  await page.getByTestId(`slot-tab-${slotId}`).click();
  await expect(page.getByTestId(`slot-tab-${slotId}`)).toHaveAttribute('aria-selected', 'true');
  const option = page.getByTestId(`slot-option-${slotId}-${optionId}`);
  await option.click();
  await expect(option).toHaveAttribute('aria-pressed', 'true');
}

/** Phones and tablets held upright: the game is landscape-only there and shows a rotate prompt. */
function isPortraitTouch(testInfo: TestInfo): boolean {
  const vp = testInfo.project.use.viewport;
  return Boolean(testInfo.project.use.hasTouch && vp && vp.height > vp.width);
}

/** Tests tagged with this run in every orientation; the rest need a playable (landscape) room. */
const ANY_ORIENTATION = { tag: '@any-orientation' };

test.beforeEach(async ({ page, context, request }, testInfo) => {
  test.skip(
    isPortraitTouch(testInfo) && !testInfo.tags.includes(ANY_ORIENTATION.tag),
    'Phones and tablets play in landscape only; portrait shows the rotate prompt (covered separately).',
  );

  ns = `e2e-${testInfo.project.name}-${testInfo.testId}-${testInfo.retry}`;
  await context.addCookies([{ name: NS_COOKIE, value: ns, url: testInfo.project.use.baseURL! }]);
  const res = await request.delete('/api/home-state', { headers: { [NS_HEADER]: ns } });
  expect(res.ok()).toBe(true);

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('.room')).toBeVisible();
});

test(
  'phones and tablets are landscape-only: portrait asks to rotate, landscape plays',
  ANY_ORIENTATION,
  async ({ page }, testInfo) => {
    const gate = page.getByTestId('rotate-gate');
    const vp = page.viewportSize()!;

    if (!isPortraitTouch(testInfo)) {
      await expect(gate).toHaveCount(0);
      await expect(page.getByTestId('decorate-toggle')).toBeVisible();
      if (!testInfo.project.use.hasTouch) {
        // Desktops are never gated, even in a tall window.
        await page.setViewportSize({ width: 600, height: 900 });
        await expect(gate).toHaveCount(0);
      }
      return;
    }

    // Portrait phone/tablet: a hand-painted card covers the room, which stays mounted but inert.
    await expect(gate).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Turn sideways to come in' })).toBeVisible();
    await expect(page.locator('.room img')).toHaveCount(22);
    expect(await page.locator('.orientation-shell').evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await expect(page.getByRole('button', { name: 'Decorate' })).toHaveCount(0); // hidden from a11y tree while gated
    await expect(page.getByTestId('reset-room')).toHaveCount(0);

    // Rotating to landscape reveals the playable room instantly, with nothing reloaded.
    await page.setViewportSize({ width: vp.height, height: vp.width });
    await expect(gate).toHaveCount(0);
    expect(await page.locator('.orientation-shell').evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await expect(page.locator('.viewport')).toHaveAttribute('data-camera-mode', 'fit');
    await page.getByTestId('decorate-toggle').click();
    await expect(page.getByTestId('decorate-panel')).toBeVisible();

    // Turning back upright brings the prompt back.
    await page.setViewportSize(vp);
    await expect(gate).toBeVisible();
  },
);

test('renders the living room sprites and touch-friendly HUD without Reset room', async ({ page }) => {
  const images = page.locator('.room img');
  await expect(images).toHaveCount(22); // backdrop + 18 slots + pet + 2 characters
  await expect
    .poll(() => images.evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0)))
    .toBe(true);
  await expect(page.getByTestId('pet')).toBeVisible();
  await expect(page.getByTestId('character-her')).toBeVisible();
  await expect(page.getByTestId('character-him')).toBeVisible();
  await expect(page.getByTestId('rotate-gate')).toHaveCount(0);
  await expect(page.getByTestId('reset-room')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reset room' })).toHaveCount(0);

  // Every HUD control stays >= 44px tall and fully inside the viewport on every iPhone/iPad/desktop size.
  const buttons = [
    page.getByTestId('player-toggle'),
    page.getByTestId('decorate-toggle'),
    page.getByTestId('outfit-toggle'),
  ];
  if ((await page.getByTestId('frame-toggle').count()) > 0) buttons.push(page.getByTestId('frame-toggle'));
  await expect(page.locator('.hud-button')).toHaveCount(buttons.length);
  await expect(page.getByTestId('player-toggle')).toHaveAttribute('data-role', 'none');
  await expect(page.getByTestId('player-toggle')).toContainText('Play as');
  await expect(page.getByTestId('emote-toggle')).toHaveCount(0);
  await expectHudFitsOneRow(page);

  // Choosing who you play adds the Emotes button, and the row still fits (never blocks the room).
  await page.getByTestId('player-toggle').click();
  await expect(page.getByTestId('player-picker')).toBeVisible();
  await page.getByTestId('player-option-her').click();
  await expect(page.getByTestId('player-picker')).toHaveCount(0);
  await expect(page.getByTestId('player-toggle')).toHaveAttribute('data-role', 'her');
  await expect(page.getByTestId('emote-toggle')).toBeVisible();
  await expect(page.locator('.hud-button')).toHaveCount(buttons.length + 1);
  await expectHudFitsOneRow(page);
  await expect(page.locator('.room img')).toHaveCount(22);
});

/** Every `.hud-button` is >= 44px tall, inside the viewport, in one tidy row, and never overlapping. */
async function expectHudFitsOneRow(page: Page) {
  const vp = page.viewportSize()!;
  const boxes = await page.locator('.hud-button').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }),
  );
  expect(boxes.length).toBeGreaterThan(0);
  const rowTop = boxes[0].y;
  boxes.sort((a, b) => a.x - b.x);
  for (const [i, box] of boxes.entries()) {
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
    expect(Math.abs(box.y - rowTop)).toBeLessThan(4);
    if (i > 0) expect(box.x).toBeGreaterThanOrEqual(boxes[i - 1].x + boxes[i - 1].width - 1);
  }
}

test('Fill view pans the room, even when the swipe starts on fixed furniture', async ({ page }) => {
  const viewportEl = page.locator('.viewport');
  await expect(viewportEl).toHaveAttribute('data-camera-mode', 'fit');
  const frameToggle = page.getByTestId('frame-toggle');
  if ((await frameToggle.count()) === 0) return; // the whole room already fills this screen

  await page.getByRole('button', { name: 'Fill screen' }).click();
  await expect(viewportEl).toHaveAttribute('data-camera-mode', 'fill');
  await expect(viewportEl).toHaveClass(/can-pan/);
  const vp = page.viewportSize()!;

  // Swiping empty wall pans the room horizontally.
  const stageBefore = (await page.locator('.stage').boundingBox())!;
  await page.mouse.move(vp.width * 0.5, vp.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(vp.width * 0.5 - 100, vp.height * 0.2, { steps: 8 });
  await page.mouse.up();
  const stageAfterWall = (await page.locator('.stage').boundingBox())!;
  expect(stageAfterWall.x).toBeLessThan(stageBefore.x - 20);

  // A swipe that starts on the sofa pans too, without moving or tapping it.
  const sofa = page.locator('[data-item="sofa"]');
  const anchor = await anchorOf(sofa);
  const sofaBox = (await sofa.boundingBox())!;
  const sx = sofaBox.x + sofaBox.width * 0.5;
  const sy = sofaBox.y + sofaBox.height * 0.45;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 110, sy, { steps: 10 });
  await page.mouse.up();
  const stageAfterSofa = (await page.locator('.stage').boundingBox())!;
  expect(stageAfterSofa.x).toBeGreaterThan(stageAfterWall.x + 20);
  expect(await anchorOf(sofa)).toEqual(anchor);
  await expect(page.locator('.room')).not.toHaveClass(/is-dim/);

  // Fit room shows the whole room again.
  await page.getByRole('button', { name: /Fit whole room/i }).click();
  await expect(viewportEl).toHaveAttribute('data-camera-mode', 'fit');
  const stageFit = (await page.locator('.stage').boundingBox())!;
  expect(stageFit.width).toBeLessThanOrEqual(vp.width + 2);
});

test('furniture: Decorate swaps art, moves placements across spots, toggles TV, and persists', async ({
  page,
  request,
}) => {
  // Dragging furniture never moves it.
  const table = page.locator('[data-item="coffee-table"]');
  const tableAnchor = await anchorOf(table);
  expect(tableAnchor).toEqual({ x: 895, y: 836 });
  const box = (await table.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height * 0.6;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 80, cy - 20, { steps: 8 });
  await page.mouse.up();
  expect(await anchorOf(table)).toEqual(tableAnchor);

  await openDecorate(page);
  await expect(page.locator('.hint')).toHaveClass(/is-hidden/);
  await expect(page.locator('.room img')).toHaveCount(22); // the drawer lives outside the room
  for (const id of [
    'sofa',
    'rug',
    'coffee-table',
    'reading-nook',
    'tv',
    'bookshelf',
    'cabinet',
    'armchair',
    'side-table',
    'lamp',
    'trolley',
    'tree',
    'cushion',
    'accent-rug',
    'hanging-decor',
    'garland',
    'pinboard',
    'clock',
    'pet',
  ]) {
    await expect(page.getByTestId(`slot-tab-${id}`)).toHaveCount(1);
  }
  await expect(page.locator('.item.is-decorating')).toHaveCount(18);

  const sofa = page.locator('[data-item="sofa"]');
  await pick(page, 'sofa', 'sage');
  await expect(sofa).toHaveAttribute('data-option', 'sage');
  await expect(sofa.locator('img')).toHaveAttribute('src', /sage_lounge_sofa/);
  await expect(sofa).toHaveClass(/is-selected-slot/);
  expect(await anchorOf(sofa)).toEqual({ x: 895, y: 735 });

  const rug = page.locator('[data-item="rug"]');
  await pick(page, 'rug', 'tassel');
  await expect(rug.locator('img')).toHaveAttribute('src', /woven_tassel_rug/);
  expect(await anchorOf(rug)).toEqual({ x: 895, y: 858 });

  // Reading nook under the new window.
  await pick(page, 'reading-nook', 'reading-chair');
  const nook = page.locator('[data-item="reading-nook"]');
  await expect(nook).toHaveAttribute('data-option', 'reading-chair');
  await expect(nook.locator('img')).toHaveAttribute('src', /reading_nook_armchair/);
  expect(await anchorOf(nook)).toEqual({ x: 1435, y: 588 });

  // Backdrop decorations: hanging plant defaults to terracotta-plant, swap to ivy-basket, plus garland.
  const hanging = page.locator('[data-item="hanging-decor"]');
  await expect(hanging).toHaveAttribute('data-option', 'terracotta-plant');
  await pick(page, 'hanging-decor', 'ivy-basket');
  await expect(hanging.locator('img')).toHaveAttribute('src', /hanging_ivy_basket/);
  await pick(page, 'garland', 'lights');
  await expect(page.locator('[data-item="garland"] img')).toHaveAttribute('src', /ceiling_fairy_lights/);

  // TV swapping + multi-spot placement via Decorate drawer (swapping cleanly with cabinet).
  await pick(page, 'tv', 'retro-tv');
  const tv = page.locator('[data-item="tv"]');
  const cabinet = page.locator('[data-item="cabinet"]');
  await expect(tv).toHaveAttribute('data-spot', 'mid-left');
  await expect(cabinet).toHaveAttribute('data-spot', 'left-wall');
  await page.getByTestId('slot-place-tv-left-wall').click();
  await expect(tv).toHaveAttribute('data-spot', 'left-wall');
  await expect(cabinet).toHaveAttribute('data-spot', 'mid-left');
  expect(await anchorOf(tv)).toEqual({ x: 365, y: 582 });
  expect(await anchorOf(cabinet)).toEqual({ x: 615, y: 582 });

  // Multi-spot placement via in-room marker.
  await page.getByTestId('slot-tab-armchair').click();
  await page.getByTestId('room-spot-armchair-fireside-front').click();
  const armchair = page.locator('[data-item="armchair"]');
  await expect(armchair).toHaveAttribute('data-spot', 'fireside-front');
  expect(await anchorOf(armchair)).toEqual({ x: 1790, y: 836 });

  // Tapping a piece in the room selects its slot in the drawer.
  await tap(table);
  await expect(page.getByTestId('slot-tab-coffee-table')).toHaveAttribute('aria-selected', 'true');
  await expect(table).toHaveClass(/is-selected-slot/);
  await expect(page.getByTestId('decorate-title')).toContainText('Table');
  await page.getByTestId('slot-option-coffee-table-walnut').click();
  await expect(table.locator('img')).toHaveAttribute('src', /walnut_coffee_table/);
  expect(await anchorOf(table)).toEqual(tableAnchor);

  // Tapping the lamp while decorating selects it instead of switching it off.
  const lamp = page.locator('[data-item="lamp"]');
  await tap(lamp);
  await expect(page.getByTestId('slot-tab-lamp')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.room')).not.toHaveClass(/is-dim/);
  await page.getByTestId('slot-option-lamp-lantern').click();
  await expect(lamp).toHaveAttribute('data-option', 'lantern');
  await expect(lamp.locator('img')).toHaveAttribute('src', /greenhouse_lantern/);
  await expect(lamp.locator('.lamp-glow')).toHaveCount(1);
  expect(await anchorOf(lamp)).toEqual({ x: 1150, y: 738 });

  // Wall decor.
  await pick(page, 'clock', 'gallery');
  await expect(page.locator('[data-item="clock"] img')).toHaveAttribute('src', /cottage_gallery_frames/);
  await pick(page, 'pinboard', 'tapestry');
  await expect(page.locator('[data-item="pinboard"] img')).toHaveAttribute('src', /botanical_wall_tapestry/);
  expect(await anchorOf(page.locator('[data-item="pinboard"]'))).toEqual({ x: 455, y: 335 });

  // Pet companion (also selectable by tapping the pet).
  await page.getByTestId('slot-tab-sofa').click();
  await page.getByTestId('pet').dispatchEvent('pointerdown');
  await expect(page.getByTestId('slot-tab-pet')).toHaveAttribute('aria-selected', 'true');
  await page.getByTestId('slot-option-pet-frog').click();
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pet', 'frog');
  await expect(page.getByTestId('pet').locator('img')).toHaveAttribute('src', /sunhat_garden_frog/);
  await expect(page.locator('.room img')).toHaveCount(22);

  // Close the drawer and tap the TV to toggle it off.
  await page.getByTestId('decorate-close').click();
  await expect(page.getByTestId('decorate-panel')).toHaveCount(0);
  await expect(page.locator('.item.is-decorating')).toHaveCount(0);
  await expect(tv).toHaveAttribute('data-tv-on', 'true');
  await tap(tv);
  await expect(tv).toHaveAttribute('data-tv-on', 'false');

  // Saved to the one shared save, and survives a reload.
  await expect
    .poll(async () => {
      const s = await serverState(request);
      return [
        s.slots.sofa,
        s.slots.rug,
        s.slots['coffee-table'],
        s.slots['reading-nook'],
        s.slots.tv,
        s.slots['hanging-decor'],
        s.slots.garland,
        s.slots.lamp,
        s.slots.clock,
        s.slots.pinboard,
        s.placements.tv,
        s.placements.cabinet,
        s.placements.armchair,
        s.tvOn,
        s.pet,
      ];
    })
    .toEqual([
      'sage',
      'tassel',
      'walnut',
      'reading-chair',
      'retro-tv',
      'ivy-basket',
      'lights',
      'lantern',
      'gallery',
      'tapestry',
      'left-wall',
      'mid-left',
      'fireside-front',
      false,
      'frog',
    ]);
  await page.reload();
  await expect(page.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'sage');
  await expect(page.locator('[data-item="reading-nook"]')).toHaveAttribute('data-option', 'reading-chair');
  await expect(page.locator('[data-item="tv"]')).toHaveAttribute('data-option', 'retro-tv');
  await expect(page.locator('[data-item="tv"]')).toHaveAttribute('data-spot', 'left-wall');
  await expect(page.locator('[data-item="tv"]')).toHaveAttribute('data-tv-on', 'false');
  await expect(page.locator('[data-item="cabinet"]')).toHaveAttribute('data-spot', 'mid-left');
  await expect(page.locator('[data-item="armchair"]')).toHaveAttribute('data-spot', 'fireside-front');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pet', 'frog');
  expect(await anchorOf(page.locator('[data-item="sofa"]'))).toEqual({ x: 895, y: 735 });
  expect(await anchorOf(page.locator('[data-item="tv"]'))).toEqual({ x: 365, y: 582 });
});

test('one shared save across two independent players', async ({ page, browser, request }, testInfo) => {
  // Player 1 customizes the room.
  await openDecorate(page);
  await pick(page, 'sofa', 'terracotta');
  await pick(page, 'rug', 'sage');
  await pick(page, 'pet', 'tortoise');
  await page.getByTestId('decorate-close').click();
  await tap(page.locator('[data-item="lamp"]'));
  await expect(page.locator('.room')).toHaveClass(/is-dim/);
  await page.getByTestId('outfit-toggle').click();
  await page.getByTestId('outfit-option-badminton').click();
  await expect(page.getByTestId('character-her')).toHaveAttribute('data-outfit', 'badminton');

  await expect
    .poll(async () => {
      const s = await serverState(request);
      return [s.slots.sofa, s.slots.rug, s.pet, s.lampOn, s.outfits.her];
    })
    .toEqual(['terracotta', 'sage', 'tortoise', false, 'badminton']);

  // Player 2: a completely fresh browser profile (no shared localStorage or cookies).
  const baseURL = testInfo.project.use.baseURL!;
  const { hasTouch, isMobile, deviceScaleFactor } = testInfo.project.use;
  const ctx2 = await browser.newContext({
    baseURL,
    viewport: page.viewportSize(),
    hasTouch,
    isMobile,
    deviceScaleFactor,
  });
  try {
    expect((await ctx2.storageState()).origins).toHaveLength(0);
    await ctx2.addCookies([{ name: NS_COOKIE, value: ns, url: baseURL }]);
    const page2 = await ctx2.newPage();
    await page2.goto('/');
    await expect(page2.locator('.room')).toBeVisible();

    await expect(page2.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'terracotta');
    await expect(page2.locator('[data-item="sofa"] img')).toHaveAttribute('src', /terracotta_lounge_sofa/);
    await expect(page2.locator('[data-item="rug"]')).toHaveAttribute('data-option', 'sage');
    await expect(page2.getByTestId('pet')).toHaveAttribute('data-pet', 'tortoise');
    await expect(page2.locator('.room')).toHaveClass(/is-dim/);
    await expect(page2.getByTestId('character-her')).toHaveAttribute('data-outfit', 'badminton');

    // Player 2 swaps the sofa.
    await openDecorate(page2);
    await pick(page2, 'sofa', 'sage');
    await expect(page2.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'sage');
    await expect.poll(async () => (await serverState(request)).slots.sofa).toBe('sage');
  } finally {
    await ctx2.close();
  }

  // Player 1 sees Player 2's change, while keeping everything else.
  await page.reload();
  await expect(page.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'sage');
  await expect(page.locator('[data-item="rug"]')).toHaveAttribute('data-option', 'sage');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pet', 'tortoise');
  await expect(page.getByTestId('character-her')).toHaveAttribute('data-outfit', 'badminton');
});

test('Decorate and Outfits panels never overlap', async ({ page }) => {
  await openDecorate(page);
  await page.getByTestId('outfit-toggle').click();
  await expect(page.getByTestId('outfit-picker')).toBeVisible();
  await expect(page.getByTestId('decorate-panel')).toHaveCount(0);
  await expect(page.getByTestId('decorate-toggle')).toHaveAttribute('aria-expanded', 'false');

  await page.getByTestId('decorate-toggle').click();
  await expect(page.getByTestId('decorate-panel')).toBeVisible();
  await expect(page.getByTestId('outfit-picker')).toHaveCount(0);

  // Switch to a movable slot (shows placement bar) and ensure the drawer fits inside the viewport.
  await page.getByTestId('slot-tab-tv').click();
  await expect(page.getByTestId('decorate-placements')).toBeVisible();
  const vp = page.viewportSize()!;
  const panel = (await page.getByTestId('decorate-panel').boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(vp.width + 1);
  expect(panel.y + panel.height).toBeLessThanOrEqual(vp.height + 1);
  expect(panel.height).toBeLessThan(vp.height * 0.55);
  for (const id of ['decorate-close']) {
    const b = (await page.getByTestId(id).boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(36);
  }
});

test('Player and Emote pickers are hand-drawn popovers that never overlap the others', async ({ page }) => {
  const vp = page.viewportSize()!;
  const popovers = ['player-picker', 'emote-picker', 'outfit-picker', 'decorate-panel'];
  const expectOnlyOpen = async (open: string) => {
    for (const id of popovers) await expect(page.getByTestId(id)).toHaveCount(id === open ? 1 : 0);
  };

  await openDecorate(page);
  await page.getByTestId('player-toggle').click();
  await expectOnlyOpen('player-picker');
  await expect(page.getByTestId('player-toggle')).toHaveClass(/is-open/);
  await expect(page.getByTestId('player-status')).toContainText('Share this link with your partner');
  await expect(page.getByTestId('player-option-her').locator('.partner-tag')).toHaveCount(0);
  const picker = (await page.getByTestId('player-picker').boundingBox())!;
  expect(picker.x).toBeGreaterThanOrEqual(0);
  expect(picker.x + picker.width).toBeLessThanOrEqual(vp.width + 1);
  expect(picker.y + picker.height).toBeLessThanOrEqual(vp.height + 1);
  expect((await page.getByTestId('player-close').boundingBox())!.height).toBeGreaterThanOrEqual(36);
  await page.getByTestId('player-close').click();
  await expectOnlyOpen('');

  await page.getByTestId('player-toggle').click();
  await page.getByTestId('player-option-him').click();
  await expect(page.getByTestId('player-toggle')).toHaveAttribute('data-role', 'him');
  await expect(page.getByTestId('character-him')).toHaveAttribute('data-controlled', 'local');
  await expect(page.getByTestId('character-her')).toHaveAttribute('data-control', 'auto');

  await page.getByTestId('emote-toggle').click();
  await expectOnlyOpen('emote-picker');
  for (const id of ['love', 'wave', 'tea', 'music', 'sleepy', 'shuttle']) {
    const option = page.getByTestId(`emote-option-${id}`);
    await expect(option).toBeVisible();
    expect(await option.locator('.emote-option-icon').evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
      `emote_${id}`,
    );
  }
  await expect(page.getByTestId('emote-picker').locator('img')).toHaveCount(0);
  const emotes = (await page.getByTestId('emote-picker').boundingBox())!;
  expect(emotes.x + emotes.width).toBeLessThanOrEqual(vp.width + 1);
  expect(emotes.y + emotes.height).toBeLessThanOrEqual(vp.height + 1);

  await page.getByTestId('outfit-toggle').click();
  await expectOnlyOpen('outfit-picker');
  await page.getByTestId('emote-toggle').click();
  await expectOnlyOpen('emote-picker');

  // Sending an emote closes the picker and floats a hand-drawn bubble (CSS art, no <img>) over him.
  await page.getByTestId('emote-option-love').click();
  await expectOnlyOpen('');
  const bubble = page.getByTestId('emote-bubble-him');
  await expect(bubble).toHaveAttribute('data-emote', 'love');
  expect(await bubble.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain('bubble_emote');
  await expect(page.locator('.room img')).toHaveCount(22);
  await expect(bubble).toHaveCount(0, { timeout: 6000 });

  // The role survives a reload.
  await page.reload();
  await expect(page.getByTestId('player-toggle')).toHaveAttribute('data-role', 'him');
});

/** Room coordinates -> viewport coordinates for the current camera. */
async function roomToClient(page: Page, x: number, y: number) {
  const box = (await page.locator('.stage').boundingBox())!;
  const scale = box.width / 1950;
  return { x: box.x + x * scale, y: box.y + y * scale };
}

/** Picks an open floor spot near the right side (not covered by the pet, a person, or furniture). */
async function openFloorSpot(page: Page) {
  for (const [x, y] of [
    [1660, 820],
    [1700, 860],
    [1620, 870],
    [1740, 780],
    [1580, 860],
    [1260, 860],
    [1450, 865],
  ]) {
    const pt = await roomToClient(page, x, y);
    const blocked = await page.evaluate(
      ({ cx, cy }) => {
        const el = document.elementFromPoint(cx, cy);
        return !el || Boolean(el.closest('.pet, .character, .hud-overlay, .item:not(.item--rug)'));
      },
      { cx: pt.x, cy: pt.y },
    );
    if (!blocked) return { room: { x, y }, client: pt };
  }
  throw new Error('No open floor spot found');
}

async function roomPos(page: Page, id: 'her' | 'him') {
  const el = page.getByTestId(`character-${id}`);
  return { x: Number(await el.getAttribute('data-x')), y: Number(await el.getAttribute('data-y')) };
}

test('live 2-player: presence, walking, emotes, pokes, and decorating sync instantly', async ({
  page,
  browser,
}, testInfo) => {
  const A = page;

  // 1. Player A plays Him.
  await A.getByTestId('player-toggle').click();
  await A.getByTestId('player-option-him').click();
  await expect(A.getByTestId('player-toggle')).toHaveAttribute('data-role', 'him');
  await expect(A.getByTestId('player-toggle')).toHaveAttribute('data-partner-online', 'false');

  const baseURL = testInfo.project.use.baseURL!;
  const { hasTouch, isMobile, deviceScaleFactor } = testInfo.project.use;
  const ctxB = await browser.newContext({ baseURL, viewport: A.viewportSize(), hasTouch, isMobile, deviceScaleFactor });
  let ctxBOpen = true;
  try {
    await ctxB.addCookies([{ name: NS_COOKIE, value: ns, url: baseURL }]);
    const B = await ctxB.newPage();
    await B.goto('/');
    await expect(B.locator('.room')).toBeVisible();

    // A gets a cozy "came home" note when B arrives.
    await expect(A.getByTestId('presence-toast')).toContainText('came home');

    // 2. B sees Him is taken by the partner and picks Her.
    await B.getByTestId('player-toggle').click();
    await expect(B.getByTestId('player-option-him')).toHaveAttribute('data-partner', 'true');
    await expect(B.getByTestId('player-option-him')).toContainText('Partner here');
    await expect(B.getByTestId('player-status')).toContainText('Both of you are home');
    await B.getByTestId('player-option-her').click();
    await expect(B.getByTestId('player-toggle')).toHaveAttribute('data-role', 'her');

    // 3. Both screens show live presence.
    for (const p of [A, B]) {
      await expect(p.getByTestId('player-toggle')).toHaveAttribute('data-partner-online', 'true');
      await expect(p.getByTestId('player-toggle')).toContainText('Together');
      await expectHudFitsOneRow(p);
    }
    await expect(A.getByTestId('character-her')).toHaveAttribute('data-control', 'remote');
    await expect(B.getByTestId('character-him')).toHaveAttribute('data-control', 'remote');
    await expect(B.getByTestId('character-her')).toHaveAttribute('data-controlled', 'local');

    // 4. A taps an open floor spot on the right: Him walks there on both screens.
    const spot = await openFloorSpot(A);
    await A.mouse.click(spot.client.x, spot.client.y);
    await expect(A.locator('.walk-target')).toHaveCount(1);
    await expect(A.getByTestId('character-him')).toHaveAttribute('data-mode', 'walk');
    await expect(B.getByTestId('character-him')).toHaveAttribute('data-mode', 'walk');
    for (const p of [A, B]) {
      await expect
        .poll(
          async () => {
            const pos = await roomPos(p, 'him');
            return Math.hypot(pos.x - spot.room.x, pos.y - spot.room.y);
          },
          { timeout: 12_000 },
        )
        .toBeLessThan(4);
      await expect(p.getByTestId('character-him')).toHaveAttribute('data-mode', 'idle');
    }

    // 5. A sends the shuttlecock emote: the bubble floats over Him on both screens.
    await A.getByTestId('emote-toggle').click();
    await A.getByTestId('emote-option-shuttle').click();
    for (const p of [A, B]) {
      await expect(p.getByTestId('emote-bubble-him')).toHaveAttribute('data-emote', 'shuttle');
      await expect(p.locator('.room img')).toHaveCount(22);
    }

    // 6. B taps Him: he hops happily on A's screen too.
    await B.getByTestId('character-him').click();
    await expect(A.getByTestId('character-him')).toHaveAttribute('data-mode', 'happy');
    await expect(A.getByTestId('character-him').locator('.character-heart')).toHaveCount(1);

    // 7. B decorates & moves furniture: A's room updates live (no reload, no 15s poll).
    await openDecorate(B);
    await pick(B, 'sofa', 'sage');
    await expect(A.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'sage', { timeout: 3000 });
    await expect(A.locator('[data-item="sofa"] img')).toHaveAttribute('src', /sage_lounge_sofa/);

    await B.getByTestId('slot-tab-tv').click();
    await B.getByTestId('slot-place-tv-left-wall').click();
    await expect(A.locator('[data-item="tv"]')).toHaveAttribute('data-spot', 'left-wall', { timeout: 3000 });
    await expect(A.locator('[data-item="cabinet"]')).toHaveAttribute('data-spot', 'mid-left', {
      timeout: 3000,
    });

    // 8. B leaves: A is home alone again and Her resumes strolling on her own.
    await ctxB.close();
    ctxBOpen = false;
    await expect(A.getByTestId('player-toggle')).toHaveAttribute('data-partner-online', 'false');
    await expect(A.getByTestId('character-her')).toHaveAttribute('data-control', 'auto');
  } finally {
    if (ctxBOpen) await ctxB.close();
  }
});

test('tapping the lamp turns the room light off and on', async ({ page }) => {
  const fitBtn = page.getByRole('button', { name: /Fit whole room/i });
  if (await fitBtn.isVisible()) await fitBtn.click();

  const room = page.locator('.room');
  await page.locator('[data-item="lamp"]').click();
  await expect(room).toHaveClass(/is-dim/);
  await page.locator('[data-item="lamp"]').click();
  await expect(room).not.toHaveClass(/is-dim/);
});

test('tapping the pet makes it hop', async ({ page }) => {
  const pet = page.getByTestId('pet');
  await pet.dispatchEvent('pointerdown');
  await expect(pet.locator('.pet-anim')).toHaveAttribute('data-mode', 'happy');
});

test('both human characters play their 4-frame walking animations when strolling', async ({ page }) => {
  for (const id of ['her', 'him'] as const) {
    const char = page.getByTestId(`character-${id}`);
    const anim = char.locator('.character-anim');
    await expect(anim).toHaveAttribute('data-mode', 'walk', { timeout: 8000 });
    await expect(anim).toHaveAttribute('data-walk-strip', '1', { timeout: 4000 });

    const img = char.locator('img');
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(400);

    const firstFrame = await anim.getAttribute('data-walk-frame');
    expect(firstFrame).not.toBeNull();
    await expect.poll(() => anim.getAttribute('data-walk-frame'), { timeout: 2000 }).not.toBe(firstFrame);
  }
});

test(
  'waits for all assets and walk animations to finish loading before revealing the room',
  ANY_ORIENTATION,
  async ({ page }) => {
    let releaseWalkStrip!: () => void;
    const walkBlocked = new Promise<void>((resolve) => {
      releaseWalkStrip = resolve;
    });
    let sawWalkRequest = false;

    await page.route('**/sprites/resident_her_walk.png*', async (route) => {
      sawWalkRequest = true;
      await walkBlocked;
      await route.continue();
    });

    await page.goto('/');
    await expect.poll(() => sawWalkRequest).toBe(true);
    await expect(page.getByTestId('asset-preloader')).toHaveAttribute('data-status', 'loading');
    await expect(page.locator('.room')).toHaveCount(0);

    releaseWalkStrip();
    await expect(page.locator('.room')).toBeVisible();
    await expect(page.getByTestId('asset-preloader')).toHaveCount(0);

    // Every visible image in the room is already completely decoded on first paint.
    const allReady = await page
      .locator('.room img')
      .evaluateAll((imgs) =>
        imgs.every((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0),
      );
    expect(allReady).toBe(true);
  },
);

test(
  'blocks game with retry button if an asset fails to load and recovers cleanly',
  ANY_ORIENTATION,
  async ({ page }) => {
    await page.route('**/sprites/resident_him_walk.png*', (route) =>
      route.fulfill({ status: 500, contentType: 'text/plain', body: 'Temporary error' }),
    );

    await page.goto('/');
    await expect(page.getByTestId('asset-preloader')).toHaveAttribute('data-status', 'error');
    await expect(page.locator('.room')).toHaveCount(0);

    await page.unroute('**/sprites/resident_him_walk.png*');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('.room')).toBeVisible();
  },
);

test('switches her outfit back and forth between Cozy dress and Badminton and persists across reload', async ({
  page,
}) => {
  const her = page.getByTestId('character-her');
  await expect(her).toHaveAttribute('data-outfit', 'dress');

  await page.getByTestId('outfit-toggle').click();
  await expect(page.getByTestId('outfit-picker')).toBeVisible();

  await page.getByTestId('outfit-option-badminton').click();
  await expect(her).toHaveAttribute('data-outfit', 'badminton');
  await expect(her.locator('img')).toHaveAttribute('src', /resident_her_badminton/);

  // Survives a full page reload.
  await page.reload();
  await expect(page.getByTestId('character-her')).toHaveAttribute('data-outfit', 'badminton');

  // Switch cleanly back to Cozy dress.
  await page.getByTestId('outfit-toggle').click();
  await page.getByTestId('outfit-option-dress').click();
  await expect(page.getByTestId('character-her')).toHaveAttribute('data-outfit', 'dress');
});

/** Returns the selected card's ::after badge box and whether it fits inside its scroller. */
async function badgeFitsInScroller(page: Page, cardTestId: string) {
  return page.getByTestId(cardTestId).evaluate((el) => {
    const after = getComputedStyle(el, '::after');
    const card = el.getBoundingClientRect();
    const scroller = el.parentElement!.getBoundingClientRect();
    const size = parseFloat(after.width);
    const top = card.top + parseFloat(after.top);
    const right = card.right - parseFloat(after.right);
    return {
      image: after.backgroundImage,
      size,
      fits: top >= scroller.top - 0.5 && right <= scroller.right + 0.5,
    };
  });
}

test('Outfits popover uses hand-drawn cards, check badge, and a working close button', async ({ page }) => {
  const toggle = page.getByTestId('outfit-toggle');
  await toggle.click();
  const picker = page.getByTestId('outfit-picker');
  await expect(picker).toBeVisible();
  await expect(toggle).toHaveClass(/is-open/);

  const selected = page.getByTestId('outfit-option-dress');
  await expect(selected).toHaveAttribute('aria-pressed', 'true');
  const badge = await badgeFitsInScroller(page, 'outfit-option-dress');
  expect(badge.image).toContain('badge_check');
  expect(badge.size).toBeGreaterThan(16);
  expect(badge.fits).toBe(true);
  // No extra <img> tags for the badge: only the outfit thumbnails.
  await expect(picker.locator('img')).toHaveCount(2);

  const close = page.getByTestId('outfit-close');
  await expect(close).toHaveAttribute('aria-label', 'Close outfits');
  const closeBox = (await close.boundingBox())!;
  expect(closeBox.height).toBeGreaterThanOrEqual(36);
  await close.click();
  await expect(picker).toHaveCount(0);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('Decorate drawer selected card shows an unclipped hand-drawn check badge', async ({ page }) => {
  await openDecorate(page);
  const selected = page.locator('.decorate-option.is-selected');
  await expect(selected).toHaveCount(1);
  const testId = (await selected.getAttribute('data-testid'))!;
  const badge = await badgeFitsInScroller(page, testId);
  expect(badge.image).toContain('badge_check');
  expect(badge.fits).toBe(true);
  await expect(page.locator('.decorate-tab.is-selected')).toHaveCount(1);
});
