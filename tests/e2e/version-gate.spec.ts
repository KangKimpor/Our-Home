import { expect, test } from '@playwright/test';

test('serves version.json with no-store and cache-busts static art assets', async ({ page, request }) => {
  const res = await request.get('/version.json');
  expect(res.ok()).toBe(true);
  expect(res.headers()['cache-control']).toContain('no-store');
  const manifest = (await res.json()) as { version: string; builtAt: string };
  expect(manifest.version.length).toBeGreaterThan(0);

  await page.goto('/');
  await expect(page.locator('.room')).toBeVisible();

  const metaVersion = await page.locator('meta[name="app-version"]').getAttribute('content');
  expect(metaVersion).toBe(manifest.version);

  const srcs = await page
    .locator('.room img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''));
  expect(srcs.length).toBe(15);
  for (const src of srcs) {
    expect(src).toContain(`?v=${encodeURIComponent(manifest.version)}`);
  }
});

test('blocks game from loading when client is outdated and reloads into latest version', async ({ page }) => {
  const forcedLatest = '9.9.9-forced-latest';

  await page.route('**/version.json*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify({ version: forcedLatest }),
    }),
  );

  await page.goto('/');

  // First mismatch triggers one cache-busting reload; second mismatch stops on blocking screen.
  await expect(page.getByTestId('version-gate')).toHaveAttribute('data-status', 'outdated');
  await expect(page.getByRole('heading', { name: 'Update required' })).toBeVisible();
  await expect(page.locator('.room')).toHaveCount(0);
  expect(page.url()).toContain(`_v=${encodeURIComponent(forcedLatest)}`);

  // Once the latest version is reachable, clicking Reload loads the game and cleans the URL.
  await page.unroute('**/version.json*');
  await page.getByRole('button', { name: 'Reload latest version' }).click();

  await expect(page.locator('.room')).toBeVisible();
  await expect(page.getByTestId('version-gate')).toHaveCount(0);
  expect(page.url()).not.toContain('_v=');
  expect(page.url()).not.toContain('_t=');
});

test('blocks game from loading when version check fails and recovers on retry', async ({ page }) => {
  await page.route('**/version.json*', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'text/plain',
      body: 'Service unavailable',
    }),
  );

  await page.goto('/');

  await expect(page.getByTestId('version-gate')).toHaveAttribute('data-status', 'error');
  await expect(page.getByRole('heading', { name: "Couldn't verify version" })).toBeVisible();
  await expect(page.locator('.room')).toHaveCount(0);

  await page.unroute('**/version.json*');
  await page.getByRole('button', { name: 'Try again' }).click();

  await expect(page.locator('.room')).toBeVisible();
  await expect(page.getByTestId('version-gate')).toHaveCount(0);
});

test('blocks an open session when a newer version is published and tab becomes visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.room')).toBeVisible();

  await page.route('**/version.json*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify({ version: '9.9.9-mid-session' }),
    }),
  );

  await page.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await expect(page.getByTestId('version-gate')).toHaveAttribute('data-status', 'outdated');
  await expect(page.locator('.room')).toHaveCount(0);
});
