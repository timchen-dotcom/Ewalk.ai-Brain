#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { printCliError } from './lib/env.mjs';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const SCRIPT_ROOT = path.dirname(CURRENT_FILE);
const WORKSPACE_ROOT = path.resolve(SCRIPT_ROOT, '../../..');
const DEFAULT_GENERATED_DIR = path.join(
  WORKSPACE_ROOT,
  'Ewalk.ai Brain/01_客戶/韓食日常鍋物/04_素材/Generated',
);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceDir = path.resolve(args.sourceDir || DEFAULT_GENERATED_DIR);
  const outputDir = path.resolve(args.outputDir || path.join(sourceDir, 'IGReady'));

  assertSipsAvailable();
  assertDirectory(sourceDir, '來源圖片資料夾');
  fs.mkdirSync(outputDir, { recursive: true });

  const files = fs
    .readdirSync(sourceDir)
    .filter((fileName) => /_GPTImage2\.png$/i.test(fileName))
    .map((fileName) => path.join(sourceDir, fileName))
    .sort();

  if (!files.length) {
    console.log(`沒有找到 GPT Image 2 PNG：${sourceDir}`);
    return;
  }

  const rows = [];

  for (const filePath of files) {
    const dimensions = readDimensions(filePath);
    const crop = calculateCrop(dimensions);
    const baseName = path.basename(filePath, path.extname(filePath));
    const outputPath = path.join(outputDir, `${baseName}_1080x1350.jpg`);
    const tempPath = path.join(os.tmpdir(), `${baseName}_${Date.now()}_crop.png`);

    execFileSync('sips', ['-c', String(crop.height), String(crop.width), filePath, '--out', tempPath], {
      stdio: 'ignore',
    });
    execFileSync(
      'sips',
      ['-z', '1350', '1080', '-s', 'format', 'jpeg', '-s', 'formatOptions', '90', tempPath, '--out', outputPath],
      { stdio: 'ignore' },
    );
    fs.rmSync(tempPath, { force: true });

    const outputDimensions = readDimensions(outputPath);
    rows.push({
      source: path.basename(filePath),
      output: path.basename(outputPath),
      width: outputDimensions.width,
      height: outputDimensions.height,
      size: fs.statSync(outputPath).size,
    });
  }

  writeManifest(outputDir, rows);

  console.log('Instagram 圖片素材準備完成');
  console.log(`來源：${sourceDir}`);
  console.log(`輸出：${outputDir}`);
  console.log(`數量：${rows.length}`);
  for (const row of rows) {
    console.log(`${row.output} ${row.width}x${row.height}`);
  }
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current.startsWith('--')) {
      const key = current.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[index + 1];

      if (!value || value.startsWith('--')) {
        throw new Error(`缺少參數值：${current}`);
      }

      args[key] = value;
      index += 1;
    }
  }

  return args;
}

function assertSipsAvailable() {
  try {
    execFileSync('sips', ['--version'], { stdio: 'ignore' });
  } catch {
    throw new Error('找不到 macOS sips 工具，無法準備 IG 圖片。');
  }
}

function assertDirectory(dirPath, label) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`${label}不存在：${dirPath}`);
  }
}

function readDimensions(filePath) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], {
    encoding: 'utf8',
  });
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);

  if (!width || !height) {
    throw new Error(`無法讀取圖片尺寸：${filePath}`);
  }

  return { width, height };
}

function calculateCrop({ width, height }) {
  const targetRatio = 1080 / 1350;
  const sourceRatio = width / height;

  if (sourceRatio > targetRatio) {
    return {
      width: Math.floor(height * targetRatio),
      height,
    };
  }

  return {
    width,
    height: Math.floor(width / targetRatio),
  };
}

function writeManifest(outputDir, rows) {
  const lines = [
    '# IGReady 1080x1350 圖片 Manifest',
    '',
    `建立時間：${formatTaipeiTimestamp(new Date())}`,
    '',
    '| 檔案 | 尺寸 | 大小 |',
    '| --- | --- | --- |',
    ...rows.map((row) => `| \`${row.output}\` | ${row.width}x${row.height} | ${formatBytes(row.size)} |`),
    '',
  ];

  fs.writeFileSync(path.join(outputDir, 'manifest.md'), lines.join('\n'), 'utf8');
}

function formatTaipeiTimestamp(date) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(date).replace(' ', ' ');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

main().catch(printCliError);
