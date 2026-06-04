#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const harnessRoot = resolve(scriptDir, "..");
const workspaceRoot = resolve(harnessRoot, "../../../..");
const logsDir = resolve(harnessRoot, "logs");
const plistPath = resolve(os.homedir(), "Library/LaunchAgents/com.ewalk.ashun-host-harness.plist");
const nodePath = process.execPath;
const runnerPath = resolve(scriptDir, "harness-runner.mjs");

function launchctl(args) {
  return new Promise((resolveRun) => {
    execFile("launchctl", args, { timeout: 30000 }, (error, stdout, stderr) => {
      resolveRun({
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: error ? error.message : null,
      });
    });
  });
}

async function main() {
  await mkdir(dirname(plistPath), { recursive: true });
  await mkdir(logsDir, { recursive: true });

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
"http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ewalk.ashun-host-harness</string>
  <key>ProgramArguments</key>
  <array>
    <string>${nodePath}</string>
    <string>${runnerPath}</string>
    <string>--scheduled</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${workspaceRoot}</string>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>900</integer>
  <key>StandardOutPath</key>
  <string>${resolve(logsDir, "launchd.out.log")}</string>
  <key>StandardErrorPath</key>
  <string>${resolve(logsDir, "launchd.err.log")}</string>
</dict>
</plist>
`;

  await writeFile(plistPath, plist, "utf8");
  const uid = String(process.getuid?.() || "");
  await launchctl(["bootout", `gui/${uid}`, plistPath]);
  const result = await launchctl(["bootstrap", `gui/${uid}`, plistPath]);
  if (!result.ok) {
    console.error(result.stderr || result.error);
    process.exit(1);
  }
  console.log(`阿順主機 Harness 常駐已安裝：${plistPath}`);
  console.log("頻率：每 15 分鐘；模式：低風險本機任務，不做對外副作用。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

