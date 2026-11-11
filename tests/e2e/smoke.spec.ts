import { expect, test, type Page } from '@playwright/test';

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openGame(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Our Home' })).toBeVisible();
  await page.getByRole('button', { name: /^(Play|Continue)$/ }).click();
  await expect(page.locator('.stage-frame canvas')).toBeVisible();
}

test('title screen opens the house', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await expect(page.locator('.room-plaque')).toContainText(/Living Room/i);
  await expect(page.locator('.heart-plaque strong')).not.toHaveText('');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('every panel opens and closes without errors', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);

  const panels: { menu: string; heading: RegExp }[] = [
    { menu: 'Rooms', heading: /Our rooms/i },
    { menu: 'Things', heading: /Everything we own/i },
    { menu: 'Visitors', heading: /Visitors/i },
    { menu: 'Our moments', heading: /Our moments/i },
    { menu: 'Our recipe book', heading: /Our recipe book/i },
    { menu: 'Our pets', heading: /Our pets/i },
    { menu: 'The people of the house', heading: /The people of the house/i },
    { menu: 'Settings', heading: /Settings/i },
    { menu: 'About', heading: /Our Home/i },
  ];

  for (const panel of panels) {
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('menuitem', { name: panel.menu }).click();
    await expect(page.locator('.modal-head h2')).toContainText(panel.heading);
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
  await page.waitForTimeout(2500);
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

test('navigates across rooms and captures review shots', async ({ page }, testInfo) => {
  const errors = watchConsole(page);
  await openGame(page);
  await page.waitForTimeout(250);

  await page.screenshot({ path: `tests/__shots__/living-${testInfo.project.name}.png` });

  await page.getByRole('button', { name: 'Next room' }).click();
  await expect(page.locator('.room-plaque')).toContainText(/Bedroom/i);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tests/__shots__/bedroom-${testInfo.project.name}.png` });

  await page.getByRole('button', { name: 'Next room' }).click();
  await expect(page.locator('.room-plaque')).toContainText(/Kitchen/i);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tests/__shots__/kitchen-${testInfo.project.name}.png` });

  expect(errors, errors.join('\n')).toEqual([]);
});
