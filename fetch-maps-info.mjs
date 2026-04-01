import { chromium } from 'playwright';

const PLACE_URL = 'https://www.google.com/maps/place/%E3%82%B7%E3%83%BC%E3%82%B7%E3%83%A3%E3%82%AB%E3%83%95%E3%82%A7%E5%90%B8%E6%9A%AE(%E3%82%B9%E3%83%BC%E3%82%AF)/@34.6877967,135.5146708,17z/data=!3m1!4b1!4m6!3m5!1s0x6000e73224f2a567:0xe76bcfad99c19d66!8m2!3d34.6877967!4d135.5146708!16s%2Fg%2F11fj5kn2jz';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(PLACE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  // HTMLソース全体から曜日データを探す
  const html = await page.content();

  // 13:00や営業時間パターンで検索
  const matches = [];
  const patterns = [
    /月曜.{0,50}/g,
    /火曜.{0,50}/g,
    /水曜.{0,50}/g,
    /木曜.{0,50}/g,
    /土曜.{0,50}/g,
    /日曜.{0,50}/g,
    /"13:00".{0,100}/g,
    /13\\u6642.{0,100}/g,
    /\[1,13,0,5,0\].{0,200}/g,
  ];

  for (const pat of patterns) {
    const found = html.match(pat);
    if (found) matches.push(...found);
  }

  console.log('パターンマッチ:');
  matches.slice(0, 20).forEach(m => console.log(m));

  // 数字13（開店時間）と5（閉店時間）のパターン
  // Google MapsのHTML内のJSONデータ形式で時間が埋め込まれているか確認
  const timePattern = html.match(/\[\[\d+,\d+,\d+\],\[\d+,\d+,\d+\]\]/g);
  console.log('\n時間パターン:', timePattern?.slice(0, 10));

  await browser.close();
})();
