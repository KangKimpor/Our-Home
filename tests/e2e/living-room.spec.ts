import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders the living room sprites', async ({ page }) => {
  const images = page.locator('.room img');
  await expect(images).toHaveCount(13); // backdrop + 11 furniture + pet
  await expect
    .poll(() => images.evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0)))
    .toBe(true);
  await expect(page.getByTestId('pet')).toBeVisible();
});

test('dragging furniture moves it and the move survives a reload', async ({ page }) => {
  const cushion = page.locator('[data-item="cushion"]');
  const before = await cushion.boundingBox();
  const cx = before!.x + before!.width / 2;
  const cy = before!.y + before!.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 120, cy - 20, { steps: 8 });
  await page.mouse.up();

  const after = await cushion.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 100);

  await page.reload();
  const reloaded = await page.locator('[data-item="cushion"]').boundingBox();
  expect(Math.abs(reloaded!.x - after!.x)).toBeLessThan(2);

  await page.getByRole('button', { name: 'Reset room' }).click();
  const reset = await page.locator('[data-item="cushion"]').boundingBox();
  expect(Math.abs(reset!.x - before!.x)).toBeLessThan(2);
});

test('tapping the lamp turns the room light off and on', async ({ page }) => {
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
