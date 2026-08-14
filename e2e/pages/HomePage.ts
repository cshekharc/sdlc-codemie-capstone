import { expect, type Page } from '@playwright/test';
import { baseURL } from '../fixtures/test';

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\\\\\\\]/g, '\\\$&');
}

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(
      new RegExp('^' + escapeRegExp(baseURL))
    );
    await expect(this.page).toHaveTitle(/.+/);
  }
}
