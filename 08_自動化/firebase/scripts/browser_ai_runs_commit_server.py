#!/usr/bin/env python3

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import sys
import threading

APP_DIR = Path(__file__).resolve().parents[1] / "command-center-app"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"
PORT = int(sys.argv[1] if len(sys.argv) > 1 else "17636")
RESULT_PATH = OUTPUT_DIR / "ai-runs-browser-write-result.json"
PROJECT_ID = "ewalk-ai-system-prod"

PAGE = """<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ewalk.ai ai_runs Firestore Commit</title>
  <script src="/firebase-config.local.js"></script>
  <script src="/data/ai-runs.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 32px; color: #17212b; }
    .wrap { max-width: 840px; margin: 0 auto; }
    button { background: #0b5f70; border: 0; border-radius: 8px; color: #fff; cursor: pointer; font: inherit; font-weight: 760; min-height: 44px; padding: 0 18px; }
    button:disabled { cursor: wait; opacity: .65; }
    pre { background: #f5f7f8; border: 1px solid #dce3e8; border-radius: 8px; overflow: auto; padding: 16px; white-space: pre-wrap; }
    .warn { background: #fff7e6; border: 1px solid #f1d29b; border-radius: 8px; margin: 16px 0; padding: 14px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Ewalk.ai ai_runs 正式寫入</h1>
    <p>本頁只會寫入 <code>ai_runs</code> 與一筆 <code>audit_logs</code>，不會發文、不會動廣告、不會碰金流。</p>
    <div class="warn">批准人：提姆先生。Project：ewalk-ai-system-prod。請確認使用公司 Google 帳號登入。</div>
    <button id="commitButton" type="button">開始寫入 ai_runs</button>
    <pre id="log">等待開始...</pre>
  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
    import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
    import {
      getFirestore,
      doc,
      getDoc,
      writeBatch,
    } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

    const log = document.getElementById("log");
    const button = document.getElementById("commitButton");

    function writeLog(value) {
      log.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    }

    async function report(payload) {
      try {
        await fetch("/result", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {}
    }

    function assertReady() {
      if (!window.EWALK_FIREBASE_CONFIG) throw new Error("找不到 Firebase config。");
      if (!window.EWALK_AI_RUNS?.ai_runs?.length) throw new Error("找不到 ai_runs dry-run 資料。");
    }

    async function run() {
      button.disabled = true;
      try {
        assertReady();
        writeLog("登入 Firebase...");
        const app = initializeApp(window.EWALK_FIREBASE_CONFIG);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        const user = credential.user;
        const db = getFirestore(app);

        writeLog("檢查使用者權限...");
        const roleDoc = await getDoc(doc(db, "users", user.uid));
        if (!roleDoc.exists()) throw new Error(`尚未建立 users/${user.uid} 權限文件。`);
        const roleData = roleDoc.data();
        const allowedRoles = new Set(["owner", "admin", "manager", "staff"]);
        if (roleData.status !== "active" || !allowedRoles.has(roleData.role)) {
          throw new Error(`目前 role=${roleData.role || "unknown"}，不可寫入內部 ai_runs。`);
        }

        const aiRuns = window.EWALK_AI_RUNS.ai_runs;
        const syncedAt = new Date().toISOString();
        const auditId = "ai-runs-sync-" + syncedAt.replace(/\\D/g, "").slice(0, 14);
        const batch = writeBatch(db);

        for (const item of aiRuns) {
          batch.set(doc(db, "ai_runs", item.run_id), {
            ...item,
            firestore_synced_at: syncedAt,
            firestore_sync_mode: "approved_formal_ai_runs_write",
            approved_by: "提姆先生",
            updated_at: syncedAt,
          }, { merge: true });
        }

        batch.set(doc(db, "audit_logs", auditId), {
          id: auditId,
          action: "firestore_ai_runs_sync",
          approved_by: "提姆先生",
          performed_by: "ashun",
          project_id: "ewalk-ai-system-prod",
          ai_runs_count: aiRuns.length,
          created_at: syncedAt,
        });

        writeLog("送出 Firestore batch...");
        await batch.commit();

        const verify = await getDoc(doc(db, "ai_runs", aiRuns[0].run_id));
        if (!verify.exists()) throw new Error("寫入後回查第一筆 ai_runs 失敗。");

        const payload = {
          ok: true,
          mode: "browser-firestore-write",
          project_id: "ewalk-ai-system-prod",
          user_email: user.email,
          role: roleData.role,
          ai_runs_count: aiRuns.length,
          audit_log: "audit_logs/" + auditId,
          verified_document: "ai_runs/" + aiRuns[0].run_id,
          finished_at: new Date().toISOString(),
        };
        writeLog(payload);
        await report(payload);
      } catch (error) {
        const payload = { ok: false, message: error.message, finished_at: new Date().toISOString() };
        writeLog(payload);
        await report(payload);
      } finally {
        button.disabled = false;
      }
    }

    button.addEventListener("click", run);
  </script>
</body>
</html>
"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def log_message(self, fmt, *args):
        return

    def do_GET(self):
        if self.path in ["/", "/commit-ai-runs"]:
            body = PAGE.encode("utf-8")
            self.send_response(200)
            self.send_header("content-type", "text/html; charset=utf-8")
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/result":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("content-length", "0"))
        body = self.rfile.read(length)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        RESULT_PATH.write_bytes(body)
        self.send_response(204)
        self.end_headers()
        try:
            payload = json.loads(body.decode("utf-8"))
            if payload.get("ok"):
                threading.Thread(target=self.server.shutdown, daemon=True).start()
        except Exception:
            pass


server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
print(f"Browser ai_runs Firestore commit server: http://127.0.0.1:{PORT}/")
server.serve_forever()
