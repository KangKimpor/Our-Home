import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders the living room sprites and touch-friendly HUD', async ({ page }) => {
  const images = page.locator('.room img');
  await expect(images).toHaveCount(15); // backdrop + 11 furniture + pet + 2 characters
  await expect
    .poll(() => images.evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0)))
    .toBe(true);
  await expect(page.getByTestId('pet')).toBeVisible();
  await expect(page.getByTestId('character-her')).toBeVisible();
  await expect(page.getByTestId('character-him')).toBeVisible();

  // HUD controls stay >= 44px tall and fully inside the viewport on every iPhone/iPad/desktop size.
  const vp = page.viewportSize()!;
  const resetBtn = page.getByRole('button', { name: 'Reset room' });
  const box = await resetBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1);
});

test('portrait phones and iPad default to full-height pan mode with Fit room toggle', async ({ page }) => {
  const vp = page.viewportSize()!;
  const isPortrait = vp.width / vp.height < 1.15;
  const viewportEl = page.locator('.viewport');

  if (!isPortrait) {
    await expect(viewportEl).toHaveAttribute('data-camera-mode', 'fit');
    return;
  }

  await expect(viewportEl).toHaveAttribute('data-camera-mode', 'fill');
  const stageBoxFill = await page.locator('.stage').boundingBox();
  expect(stageBoxFill!.height).toBeGreaterThanOrEqual(vp.height - 2);

  // Swiping empty wall pans the room horizontally.
  const beforeLeft = stageBoxFill!.x;
  await page.mouse.move(vp.width * 0.5, vp.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(vp.width * 0.2, vp.height * 0.25, { steps: 8 });
  await page.mouse.up();
  const afterPan = await page.locator('.stage').boundingBox();
  expect(afterPan!.x).toBeLessThan(beforeLeft - 20);

  // Toggling Fit room shrinks to show the whole width cleanly.
  const toggleBtn = page.getByRole('button', { name: /Fit whole room/i });
  const toggleBox = await toggleBtn.boundingBox();
  expect(toggleBox!.height).toBeGreaterThanOrEqual(44);
  await toggleBtn.click();
  await expect(viewportEl).toHaveAttribute('data-camera-mode', 'fit');
  const stageBoxFit = await page.locator('.stage').boundingBox();
  expect(stageBoxFit!.width).toBeLessThanOrEqual(vp.width + 2);
});

test('dragging furniture moves it and the move survives a reload', async ({ page }) => {
  const table = page.locator('[data-item="coffee-table"]');
  const before = await table.boundingBox();
  const cx = before!.x + before!.width / 2;
  const cy = before!.y + before!.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 80, cy - 20, { steps: 8 });
  await page.mouse.up();

  const after = await table.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 55);

  await page.reload();
  const reloaded = await page.locator('[data-item="coffee-table"]').boundingBox();
  expect(Math.abs(reloaded!.x - after!.x)).toBeLessThan(3);

  await page.getByRole('button', { name: 'Reset room' }).click();
  const reset = await page.locator('[data-item="coffee-table"]').boundingBox();
  expect(Math.abs(reset!.x - before!.x)).toBeLessThan(3);
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
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(400);

    const firstFrame = await anim.getAttribute('data-walk-frame');
    expect(firstFrame).not.toBeNull();
    await expect
      .poll(() => anim.getAttribute('data-walk-frame'), { timeout: 2000 })
      .not.toBe(firstFrame);
  }
});

test('waits for all assets and walk animations to finish loading before revealing the room', async ({ page }) => {
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
    .evaluateAll((imgs) => imgs.every((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0));
  expect(allReady).toBe(true);
});

test('blocks game with retry button if an asset fails to load and recovers cleanly', async ({ page }) => {
  await page.route('**/sprites/resident_him_walk.png*', (route) =>
    route.fulfill({ status: 500, contentType: 'text/plain', body: 'Temporary error' }),
  );

  await page.goto('/');
  await expect(page.getByTestId('asset-preloader')).toHaveAttribute('data-status', 'error');
  await expect(page.locator('.room')).toHaveCount(0);

  await page.unroute('**/sprites/resident_him_walk.png*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.room')).toBeVisible();
});

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
