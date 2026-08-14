# Playwright E2E Tests

This folder contains end-to-end tests using [Playwright](https://playwright.dev/).

## Prequisites

- Node.js installed
- A local endpoint to test against (default: `http://localhost:3000`)

## Setup

```bash
npm ci
npm run playwright:install
```

## Run tests

- Run all E2E tests:

```bash
npm run test:e2e
```

- Run smoke:

```bash
npm run test:smoke
```

- Run regression:

```bash
npm run test:regression
```

## Configure the base URL

Override the base URL with an env var:

```bash
BASE_URL=http://localhost:3000 npm run test:smoke
```
