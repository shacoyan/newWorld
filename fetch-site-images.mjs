import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const SITE_URL = 'https://shisha-souq.com/';
const OUTPUT_DIR = '/Users/usr0103301/Documents/個人仕事/newWorld/shisha-souq/images';

// ダウンロード関数
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'ja-JP',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // 収集した画像URL
  const imageUrls = new Set();

  // ネットワークインターセプト（画像リクエストをキャッチ）
  page.on('response', async res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (ct.startsWith('image/') && !url.includes('data:') && !url.includes('svg')) {
      imageUrls.add(url);
    }
  });

  const pages = ['', 'about/', 'menu/', 'access/'];

  for (const p of pages) {
    const url = SITE_URL + p;
    console.log(`\nページ取得: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // imgタグのsrcも収集
    const imgs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map(i => i.src).filter(Boolean)
    );
    imgs.forEach(u => { if (!u.startsWith('data:') && !u.includes('.svg')) imageUrls.add(u); });
  }

  console.log(`\n収集した画像URL: ${imageUrls.size}件`);
  imageUrls.forEach(u => console.log(' ', u));

  // ダウンロード
  let count = 0;
  for (const url of imageUrls) {
    try {
      const parsed = new URL(url);
      const ext = path.extname(parsed.pathname) || '.jpg';
      const name = path.basename(parsed.pathname, ext)
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .slice(0, 60);
      const filename = `${name}${ext}`;
      const dest = path.join(OUTPUT_DIR, filename);
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 1000) {
        fs.unlinkSync(dest); // 1KB未満は除外
        console.log(`スキップ（小さすぎ）: ${filename}`);
      } else {
        count++;
        console.log(`ダウンロード完了: ${filename} (${Math.round(size/1024)}KB)`);
      }
    } catch (e) {
      console.log(`エラー: ${url} - ${e.message}`);
    }
  }

  console.log(`\n完了: ${count}件ダウンロード → ${OUTPUT_DIR}`);
  await browser.close();
})();
