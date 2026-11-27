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
  pet: string;
  outfits: { her: string; him: string };
  lampOn: boolean;
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
    await expect(page.locator('.room img')).toHaveCount(15);
    expect(await page.locator('.orientation-shell').evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await expect(page.getByRole('button', { name: 'Reset room' })).toHaveCount(0); // hidden from a11y tree while gated

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

test('renders the living room sprites and touch-friendly HUD', async ({ page }) => {
  const images = page.locator('.room img');
  await expect(images).toHaveCount(15); // backdrop + 11 furniture + pet + 2 characters
  await expect
    .poll(() => images.evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0)))
    .toBe(true);
  await expect(page.getByTestId('pet')).toBeVisible();
  await expect(page.getByTestId('character-her')).toBeVisible();
  await expect(page.getByTestId('character-him')).toBeVisible();
  await expect(page.getByTestId('rotate-gate')).toHaveCount(0);

  // Every HUD control stays >= 44px tall and fully inside the viewport on every iPhone/iPad/desktop size.
  const vp = page.viewportSize()!;
  const buttons = [
    page.getByTestId('decorate-toggle'),
    page.getByTestId('outfit-toggle'),
    page.getByRole('button', { name: 'Reset room' }),
  ];
  if ((await page.getByTestId('frame-toggle').count()) > 0) buttons.push(page.getByTestId('frame-toggle'));
  await expect(page.locator('.hud-button')).toHaveCount(buttons.length);

  let rowTop: number | null = null;
  for (const btn of buttons) {
    await expect(btn).toBeVisible();
    const box = (await btn.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
    // All buttons sit in one tidy row.
    rowTop ??= box.y;
    expect(Math.abs(box.y - rowTop)).toBeLessThan(4);
  }
});

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

test('fixed furniture: slots stay anchored while Decorate swaps art, persists, and resets', async ({
  page,
  request,
}) => {
  // Dragging furniture never moves it.
  const table = page.locator('[data-item="coffee-table"]');
  const tableAnchor = await anchorOf(table);
  expect(tableAnchor).toEqual({ x: 895, y: 830 });
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
  await expect(page.locator('.room img')).toHaveCount(15); // the drawer lives outside the room
  for (const id of [
    'sofa',
    'rug',
    'coffee-table',
    'bookshelf',
    'lamp',
    'cabinet',
    'trolley',
    'tree',
    'cushion',
    'pinboard',
    'clock',
    'pet',
  ]) {
    await expect(page.getByTestId(`slot-tab-${id}`)).toHaveCount(1);
  }
  await expect(page.locator('.item.is-decorating')).toHaveCount(11);

  const sofa = page.locator('[data-item="sofa"]');
  await pick(page, 'sofa', 'sage');
  await expect(sofa).toHaveAttribute('data-option', 'sage');
  await expect(sofa.locator('img')).toHaveAttribute('src', /sage_lounge_sofa/);
  await expect(sofa).toHaveClass(/is-selected-slot/);
  expect(await anchorOf(sofa)).toEqual({ x: 890, y: 722 });

  const rug = page.locator('[data-item="rug"]');
  await pick(page, 'rug', 'tassel');
  await expect(rug.locator('img')).toHaveAttribute('src', /woven_tassel_rug/);
  expect(await anchorOf(rug)).toEqual({ x: 890, y: 852 });

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
  expect(await anchorOf(lamp)).toEqual({ x: 1200, y: 730 });

  // Wall decor.
  await pick(page, 'clock', 'mirror');
  await expect(page.locator('[data-item="clock"] img')).toHaveAttribute('src', /cottage_oval_mirror/);
  await pick(page, 'pinboard', 'painting');
  await expect(page.locator('[data-item="pinboard"] img')).toHaveAttribute('src', /botanical_framed_art/);
  expect(await anchorOf(page.locator('[data-item="pinboard"]'))).toEqual({ x: 480, y: 345 });

  // Pet companion (also selectable by tapping the pet).
  await page.getByTestId('slot-tab-sofa').click();
  await page.getByTestId('pet').dispatchEvent('pointerdown');
  await expect(page.getByTestId('slot-tab-pet')).toHaveAttribute('aria-selected', 'true');
  await page.getByTestId('slot-option-pet-frog').click();
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pet', 'frog');
  await expect(page.getByTestId('pet').locator('img')).toHaveAttribute('src', /sunhat_garden_frog/);
  await expect(page.locator('.room img')).toHaveCount(15);

  // Close the drawer.
  await page.getByTestId('decorate-close').click();
  await expect(page.getByTestId('decorate-panel')).toHaveCount(0);
  await expect(page.locator('.item.is-decorating')).toHaveCount(0);

  // Saved to the one shared save, and survives a reload.
  await expect
    .poll(async () => {
      const s = await serverState(request);
      return [
        s.slots.sofa,
        s.slots.rug,
        s.slots['coffee-table'],
        s.slots.lamp,
        s.slots.clock,
        s.slots.pinboard,
        s.pet,
      ];
    })
    .toEqual(['sage', 'tassel', 'walnut', 'lantern', 'mirror', 'painting', 'frog']);
  await page.reload();
  await expect(page.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'sage');
  await expect(page.locator('[data-item="rug"]')).toHaveAttribute('data-option', 'tassel');
  await expect(page.locator('[data-item="coffee-table"]')).toHaveAttribute('data-option', 'walnut');
  await expect(page.locator('[data-item="lamp"]')).toHaveAttribute('data-option', 'lantern');
  await expect(page.locator('[data-item="clock"]')).toHaveAttribute('data-option', 'mirror');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pet', 'frog');
  expect(await anchorOf(page.locator('[data-item="sofa"]'))).toEqual({ x: 890, y: 722 });

  // Reset room restores every default for everyone.
  await page.getByRole('button', { name: 'Reset room' }).click();
  await expect(page.locator('[data-item="sofa"]')).toHaveAttribute('data-option', 'teal');
  await expect(page.locator('[data-item="rug"]')).toHaveAttribute('data-option', 'terracotta');
  await expect(page.locator('[data-item="coffee-table"]')).toHaveAttribute('data-option', 'oak');
  await expect(page.locator('[data-item="lamp"]')).toHaveAttribute('data-option', 'globe');
  await expect(page.locator('[data-item="clock"]')).toHaveAttribute('data-option', 'clock');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pet', 'hedgehog');
  await expect.poll(async () => (await serverState(request)).slots.sofa).toBe('teal');
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

  // The drawer fits inside the viewport and leaves the room visible above it.
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
