import { test } from '../../fixtures/test';

test.describe('Smoke - Home', { tag: ['@smoke'] }, () => {
  test('home page loads', async ({ homePage }) => {
    await homePage.goto();
    await homePage.assertLoaded();
  });
});
