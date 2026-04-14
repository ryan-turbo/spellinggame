const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:5173');
  await p.waitForTimeout(2000);
  await p.getByText('PU2').first().click();
  await p.waitForTimeout(1000);
  await p.getByText('Learn').first().click();
  await p.waitForTimeout(2000);
  const src = await p.locator('img').first().getAttribute('src');
  console.log('Image src:', src);
  await b.close();
})();
