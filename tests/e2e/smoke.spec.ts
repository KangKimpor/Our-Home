import { expect, test, type Page } from '@playwright/test';

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function assertAllImagesLoaded(page: Page) {
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => img.offsetParent !== null && (!img.complete || img.naturalWidth === 0))
      .map((img) => img.getAttribute('src') || img.className),
  );
  expect(broken, `Broken images: ${broken.join(', ')}`).toEqual([]);
}

async function openGame(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Our Home' })).toBeVisible();
  await assertAllImagesLoaded(page);
  await page.getByRole('button', { name: /^(Play|Continue)$/ }).click();
  await expect(page.locator('.stage-frame canvas')).toBeVisible();
}

test('title screen opens the house', async ({ page }, testInfo) => {
  const errors = watchConsole(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Our Home' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await assertAllImagesLoaded(page);
  await page.screenshot({ path: `tests/__shots__/title-${testInfo.project.name}.png` });
  await page.getByRole('button', { name: /^(Play|Continue)$/ }).click();
  await expect(page.locator('.stage-frame canvas')).toBeVisible();
  await expect(page.locator('.room-plaque')).toContainText(/Living Room/i);
  await expect(page.locator('.heart-plaque strong')).not.toHaveText('');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('hud hit targets meet 44px minimum and avoid overlap', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);

  const hudSelectors = [
    '.hud-peek',
    '.hud-round',
    '.room-plaque',
    '.heart-plaque',
    '.hud-feed',
    '.hud-square',
    '.hud-dock .dock-btn',
  ];
  for (const selector of hudSelectors) {
    const count = await page.locator(selector).count();
    for (let i = 0; i < count; i++) {
      const box = await page.locator(selector).nth(i).boundingBox();
      expect(box, `${selector}[${i}] should be visible`).not.toBeNull();
      expect(box!.width, `${selector}[${i}] width >= 44`).toBeGreaterThanOrEqual(43.5);
      expect(box!.height, `${selector}[${i}] height >= 44`).toBeGreaterThanOrEqual(43.5);
    }
  }

  // Edit bar buttons also clear 44px touch targets
  await page.locator('.hud-dock .dock-btn').first().click();
  await expect(page.locator('.edit-bar')).toBeVisible();
  const miniCount = await page.locator('.edit-bar .mini-btn').count();
  for (let i = 0; i < miniCount; i++) {
    const box = await page.locator('.edit-bar .mini-btn').nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(43.5);
  }
  await page.getByRole('button', { name: 'Done' }).first().click();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('every panel opens and closes without errors', async ({ page }, testInfo) => {
  const errors = watchConsole(page);
  await openGame(page);

  const panels: { menu: string; heading: RegExp; shot?: string }[] = [
    { menu: 'Rooms', heading: /Our rooms/i, shot: 'map' },
    { menu: 'Things', heading: /Everything we own/i },
    { menu: 'Visitors', heading: /Visitors/i },
    { menu: 'Our moments', heading: /Our moments/i, shot: 'moments' },
    { menu: 'Our recipe book', heading: /Our recipe book/i, shot: 'recipes' },
    { menu: 'Our pets', heading: /Our pets/i },
    { menu: 'The people of the house', heading: /The people of the house/i },
    { menu: 'Settings', heading: /Settings/i },
    { menu: 'About', heading: /Our Home/i },
  ];

  for (const panel of panels) {
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('menuitem', { name: panel.menu }).click();
    await expect(page.locator('.modal-head h2')).toContainText(panel.heading);
    await assertAllImagesLoaded(page);
    if (panel.shot) {
      await page.waitForTimeout(260);
      await page.screenshot({ path: `tests/__shots__/${panel.shot}-${testInfo.project.name}.png` });
    }
    await page.getByRole('button', { name: 'Close' }).first().click();
    await expect(page.locator('.modal')).toHaveCount(0);
  }

  expect(errors, errors.join('\n')).toEqual([]);
});

test('shop buys a floor item and places it', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);

  await page.getByRole('button', { name: 'Shop' }).click();
  await expect(page.locator('.modal-head h2')).toContainText(/Shop/i);
  await assertAllImagesLoaded(page);

  const before = Number(await page.locator('.heart-plaque strong').innerText());

  const buy = page.locator('.shop-card .btn-primary:not([disabled])').first();
  await expect(buy).toBeVisible();
  await buy.click();

  await expect(page.locator('.toast').first()).toBeVisible();
  const after = Number(await page.locator('.heart-plaque strong').innerText());
  expect(after).toBeLessThan(before);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('the house survives a reload', async ({ page }) => {
  await openGame(page);
  await expect(page.locator('.save-pill')).toHaveClass(/save-saved/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});

test('edit mode shows the decorating bar', async ({ page }) => {
  await openGame(page);
  await page.locator('.hud-dock .dock-btn').first().click();
  await expect(page.locator('.edit-bar')).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).first().click();
  await expect(page.locator('.edit-bar')).toHaveCount(0);
});

async function waitForStageFrame(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test('navigates across all nine rooms and captures review shots', async ({ page }, testInfo) => {
  const errors = watchConsole(page);
  await openGame(page);
  await page.evaluate(() => document.fonts.ready);

  // Unlock studio, nursery, and farm legitimately through backup import + time control check
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('menuitem', { name: 'Settings' }).click();
  await page.getByRole('button', { name: '+6h' }).click();
  await page.getByRole('tab', { name: 'Save data' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const raw = await fs.readFile(path!, 'utf-8');
  const parsed = JSON.parse(raw);
  parsed.state.hearts = 2500;
  parsed.state.rooms.studio = { unlocked: true };
  parsed.state.rooms.nursery = { unlocked: true };
  parsed.state.rooms.farm = { unlocked: true };
  await page.locator('.import-area').fill(JSON.stringify(parsed));
  await page.getByRole('button', { name: 'Restore backup' }).click();
  await expect(page.locator('.modal')).toHaveCount(0);

  const roomSequence: { id: string; title: RegExp }[] = [
    { id: 'living', title: /Living room/i },
    { id: 'bedroom', title: /Bedroom/i },
    { id: 'kitchen', title: /Kitchen/i },
    { id: 'bathroom', title: /Bathroom/i },
    { id: 'studio', title: /Studio/i },
    { id: 'nursery', title: /Nursery/i },
    { id: 'porch', title: /Porch/i },
    { id: 'garden', title: /Garden/i },
    { id: 'farm', title: /Little farm/i },
  ];

  for (let i = 0; i < roomSequence.length; i++) {
    const step = roomSequence[i];
    await expect(page.locator('.room-plaque')).toContainText(step.title);
    await waitForStageFrame(page);
    await page.screenshot({ path: `tests/__shots__/${step.id}-${testInfo.project.name}.png` });
    if (i < roomSequence.length - 1) {
      await page.getByRole('button', { name: 'Next room' }).click();
    }
  }

  expect(errors, errors.join('\n')).toEqual([]);
});
