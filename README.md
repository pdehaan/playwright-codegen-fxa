# playwright-codegen-fxa

Testing Playwright codegen functionality on a multi-page login flow like FxA.

## STEPS

```sh
npx playwright codegen accounts.firefox.com
```

This prompted me to install `playwright` in my Terminal (since I don't have it installed globally or locally in this project).

Next it seems to launch some flavor of Chromium, and then opens the specified page (https://accounts.firefox.com), and has a separate "Playwright Inspector" panel that comes up which records the actions and writes the code for me.

Interestingly, in the "Target" dropdown menu, I can choose "Playwright Test" (default), or vanilla JavaScript (or other languages I care less about, like Java, Python, Python Async, or C#).

* Choosing "Target: Playwright Test" writes `test`/`expect` tests in the style of @playwright/test (using `import` statements which would require .mjs or .ts files).
* Choosing "Target: JavaScript" writes vanilla JavaScript-style tests using `require()` and targeting Chromium (which is easy enough to switch to Firefox, presumably).

The actual test steps themselves seem very similar, mostly just the scaffolding and `async`/`await` wrappers for the JavaScript version.

## Running tests

After the test steps were recorded (go to specified URL, enter email, "Continue", enter password, "Sign in", done), I installed "@playwright/test" locally, <kbd>npm i @playwright/test -D</kbd>, since my tests were targing "Playwright Test" style and added this to package.json scripts:

```js
  "scripts": {
    "codegen": "npx playwright codegen accounts.firefox.com",
    "test": "playwright test"
  },
```

Now running <kbd>npm test</kbd> runs my single test (albeit at a relatively slow 10s).

---

### Target: Playwright Test

```mjs
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Go to https://accounts.firefox.com/
  await page.goto('https://accounts.firefox.com/');

  // Click [placeholder="Email"]
  await page.click('[placeholder="Email"]');

  // Fill [placeholder="Email"]
  await page.fill('[placeholder="Email"]', 'xxx@yyy.zzz');

  // Click button:has-text("Continue")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://accounts.firefox.com/signin' }*/),
    page.click('button:has-text("Continue")')
  ]);

  // Fill [placeholder="Password"]
  await page.fill('[placeholder="Password"]', '12345678');
  // Click button:has-text("Sign in")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=123456&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz' }*/),
    page.click('button:has-text("Sign in")')
  ]);
  // Click [data-testid="nav-link-connected-services"]
  await page.click('[data-testid="nav-link-connected-services"]');
  await expect(page).toHaveURL('https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=123456&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz#connected-services');
});
```

### Target: JavaScript

```js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  // Open new page
  const page = await context.newPage();

  // Go to https://accounts.firefox.com/
  await page.goto('https://accounts.firefox.com/');

  // Click [placeholder="Email"]
  await page.click('[placeholder="Email"]');

  // Fill [placeholder="Email"]
  await page.fill('[placeholder="Email"]', 'xxx@yyy.zzz');

  // Click button:has-text("Continue")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://accounts.firefox.com/signin' }*/),
    page.click('button:has-text("Continue")')
  ]);

  // Fill [placeholder="Password"]
  await page.fill('[placeholder="Password"]', '12345678');

  // Click button:has-text("Sign in")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=123456&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz' }*/),
    page.click('button:has-text("Sign in")')
  ]);
  // Click [data-testid="nav-link-connected-services"]
  await page.click('[data-testid="nav-link-connected-services"]');
  // assert.equal(page.url(), 'https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=123456&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz#connected-services');
  // ---------------------
  await context.close();
  await browser.close();
})();
```

Rerunning the tests locally always failed because it appars the query params below change w/ each unique login.

https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=123456&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz#connected-services

It might be trivial enough to parse the URL and verify the protocol, hostname, and path. Ant then have a separate method which verifies the general schema for the `deviceId`, `flowBeginTime`, `flowId`, `broker`, `context`, `isSampleUser`, `service`, and `uniqueUserId` are correct-ish using something like ajv schema validator.
