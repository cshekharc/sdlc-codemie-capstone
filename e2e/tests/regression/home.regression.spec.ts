import { test, expect } from '../../fixtures/test';

test.describe('Regression - Home', { tag: ['@regression'] }, () => {
  test('home page has no console errors', async ({ page, homePage }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await homePage.goto();
    await homePage.assertLoaded();

    expect(consoleErrors, `Console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
});
