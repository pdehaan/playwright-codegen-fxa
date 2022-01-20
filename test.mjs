import { test, expect } from '@playwright/test';

// PDEHAAN: Loading the EMAIL/PASSWORD from a .env file so I don't leak my credentials/credibility.
// I'm using my personal FxA login info since my LDAP is 2FA protected, which doesn't typically play nice w/ automation.
import dotenv from 'dotenv';
dotenv.config();

test('test', async ({ page }) => {

  // Go to https://accounts.firefox.com/
  await page.goto('https://accounts.firefox.com/');

  // Click [placeholder="Email"]
  await page.click('[placeholder="Email"]');

  // Fill [placeholder="Email"]
  await page.fill('[placeholder="Email"]', process.env.EMAIL);

  // Click button:has-text("Continue")
  await Promise.all([
    page.waitForNavigation(
      /*{ url: 'https://accounts.firefox.com/signin' }*/
    ),
    page.click('button:has-text("Continue")')
  ]);

  // Click [placeholder="Password"]
  await page.click('[placeholder="Password"]');

  // Fill [placeholder="Password"]
  await page.fill('[placeholder="Password"]', process.env.PASSWORD);

  // Click button:has-text("Sign in")
  await Promise.all([
    page.waitForNavigation(
      /*{ url: 'https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=12345678&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz' }*/
    ),
    page.click('button:has-text("Sign in")')
  ]);

  // Click [data-testid="nav-link-connected-services"]
  await page.click('[data-testid="nav-link-connected-services"]');

  // PDEHAAN: Commenting this bit out, since the query params seem to change on each test run. We could parse the URL and validate the query params against a schema separately.
  // await expect(page).toHaveURL('https://accounts.firefox.com/settings?deviceId=xxx&flowBeginTime=12345678&flowId=yyy&broker=web&context=web&isSampledUser=false&service=none&uniqueUserId=zzz#connected-services');
});
