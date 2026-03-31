const fs = require('fs');
const path = require('path');
const https = require('https');

const SYSTEM_PROMPT_BASE = `あなたはソフトウェアエンジニアです。
複数のファイルを以下の形式で出力してください。
各ファイルは必ず区切り記号「<<FILE:パス>>」で始め、コードのみ出力してください。
コードブロック使用禁止。説明文禁止。

形式例:
<<FILE:src/foo.jsx>>
export function Foo() { return <div/>; }
<<FILE:src/bar.js>>
export const bar = 42;`;

function parseArgs() {
  const args = process.argv.slice(2);
  let role = null;
  let system = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--role' && i + 1 < args.length) {
      role = args[i + 1];
      i++;
    } else if (args[i] === '--system' && i + 1 < args.length) {
      system = args[i + 1];
      i++;
    }
  }
  
  return { role, system };
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', reject);
  });
}

function callGLM(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'glm-5.1',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const options = {
      hostname: 'api.z.ai',
      path: '/api/anthropic/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.GLM_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content && parsed.content[0] && parsed.content[0].text) {
            resolve(parsed.content[0].text);
          } else {
            reject(new Error('Invalid response structure'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseFiles(response) {
  const files = [];
  const regex = /<<FILE:(.+?)>>\n([\s\S]*?)(?=<<FILE:|$)/g;
  let match;
  
  while ((match = regex.exec(response)) !== null) {
    const filePath = match[1];
    const lines = match[2].trim().split('\n');
    
    if (lines.length > 0 && lines[0].startsWith('```')) {
      lines.shift();
    }
    
    if (lines.length > 0 && lines[lines.length - 1].trim() === '```') {
      lines.pop();
    }
    
    files.push({
      path: filePath,
      content: lines.join('\n')
    });
  }
  
  return files;
}

async function main() {
  if (!process.env.GLM_API_KEY) {
    process.stderr.write('Error: GLM_API_KEY environment variable is not set\n');
    process.exit(1);
  }

  const args = parseArgs();
  const userInput = await readStdin();
  
  let systemPrompt = SYSTEM_PROMPT_BASE;
  if (args.role) {
    systemPrompt = args.role + '\n' + systemPrompt;
  }
  if (args.system) {
    systemPrompt = systemPrompt + '\n' + args.system;
  }
  
  const response = await callGLM(systemPrompt, userInput);
  const files = parseFiles(response);
  
  if (files.length === 0) {
    process.stderr.write('Error: No files parsed from response\n');
    process.stderr.write('Raw response:\n' + response + '\n');
    process.exit(1);
  }
  
  for (const file of files) {
    const dir = path.dirname(file.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file.path, file.content + '\n');
    const lines = file.content.split('\n').length;
    process.stderr.write(`✓ ${file.path} (${lines} lines)\n`);
  }
}

main().catch(err => {
  process.stderr.write('Error: ' + err.message + '\n');
  process.exit(1);
});
