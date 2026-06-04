#!/usr/bin/env node

import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import os from "node:os";
import { resolve } from "node:path";

const plistPath = resolve(os.homedir(), "Library/LaunchAgents/com.ewalk.ashun-host-harness.plist");

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
  const uid = String(process.getuid?.() || "");
  await launchctl(["bootout", `gui/${uid}`, plistPath]);
  await rm(plistPath, { force: true });
  console.log("阿順主機 Harness 常駐已解除。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

