#!/usr/bin/env node
/**
 * GLM Engineer - Z.AI API wrapper (Anthropic-compatible)
 * Engineer 2, 3, 4, 5 用の GLM-5.1 呼び出しスクリプト
 *
 * Usage:
 *   echo "タスク内容" | node tools/glm_engineer.js --role "Engineer 2" --system "システムプロンプト"
 *   echo "タスク内容" | GLM_API_KEY=xxx node tools/glm_engineer.js --role "Engineer 3"
 */

const https = require('https');

const API_KEY = process.env.GLM_API_KEY;
const BASE_URL = 'api.z.ai';
const API_PATH = '/api/anthropic/v1/messages';
const MODEL = 'glm-5.1';

if (!API_KEY) {
  console.error('Error: GLM_API_KEY が設定されていません。.env を確認してください。');
  process.exit(1);
}

// コマンドライン引数をパース
const args = process.argv.slice(2);
let role = 'Engineer';
let systemPrompt = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--role' && args[i + 1]) role = args[++i];
  if (args[i] === '--system' && args[i + 1]) systemPrompt = args[++i];
}

const defaultSystem = `あなたは${role}です。ソフトウェアエンジニアとして、与えられたタスクを日本語で実行してください。`;

// stdin からタスクを読み込む
function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

// Z.AI API を呼び出す（Anthropic Messages API 互換）
function callGLM(system, userMessage) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 8192,
    system: system,
    messages: [{ role: 'user', content: userMessage }],
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content && parsed.content[0] && parsed.content[0].text) {
            resolve(parsed.content[0].text);
          } else if (parsed.error) {
            reject(new Error(`API Error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
          } else {
            reject(new Error(`予期しないレスポンス: ${data}`));
          }
        } catch (e) {
          reject(new Error(`レスポンスのパースに失敗: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const task = await readStdin();

  if (!task) {
    console.error('Error: タスクが stdin から渡されていません。');
    console.error('例: echo "レビュー対象のコード..." | node tools/glm_engineer.js --role "Engineer 3"');
    process.exit(1);
  }

  try {
    const response = await callGLM(systemPrompt || defaultSystem, task);
    console.log(response);
  } catch (err) {
    console.error(`GLM呼び出しエラー: ${err.message}`);
    process.exit(1);
  }
})();
