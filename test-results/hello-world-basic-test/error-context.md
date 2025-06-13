# Test info

- Name: basic test
- Location: C:\Users\TRIPLE D.TECH\Downloads\Project Work\Project App\blockchain-attendance-system-ME\tests\hello-world.spec.ts:3:5

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\TRIPLE D.TECH\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
> 3 | test('basic test', async ({ page }: { page: import('@playwright/test').Page }) => {
    |     ^ Error: browserType.launch: Executable doesn't exist at C:\Users\TRIPLE D.TECH\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  4 |   await page.goto('https://example.com');
  5 |   const title = await page.title();
  6 |   expect(title).toBe('Example Domain');
  7 | });
```