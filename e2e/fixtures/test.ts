import { test as base, expect, type Page } from '@playwright/test';
import env from '../test-data/env.json';
import { HomePage } from '../pages/HomePage';

type Fixtures = {
  homePage: HomePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  }
});

export { expect };
export const baseURL = process.env.BASE_URL|| env.baseURL;
