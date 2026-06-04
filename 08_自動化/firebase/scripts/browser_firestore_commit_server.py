#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import html
import json
import sys
import threading

BATCH_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "/private/tmp/ewalk-firestore-command-center")
PORT = int(sys.argv[2] if len(sys.argv) > 2 else "17632")
PROJECT_ID = "ewalk-ai-system-prod"
VERIFY_DOCUMENT = sys.argv[3] if len(sys.argv) > 3 else "clients/hansik-daily-hotpot"

token = (BATCH_DIR / "access-token.txt").read_text(encoding="utf-8").strip()
commit_json = (BATCH_DIR / "firestore-commit.json").read_text(encoding="utf-8")
result_path = BATCH_DIR / "browser-firestore-result.json"

PAGE = f"""<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <title>Ewalk.ai Firestore Commit</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 32px; }}
    pre {{ white-space: pre-wrap; background: #f5f7f8; padding: 16px; border: 1px solid #dce3e8; }}
  </style>
</head>
<body>
  <h1>Ewalk.ai Firestore 寫入中</h1>
  <pre id="log">準備送出...</pre>
  <script>
    const token = {json.dumps(token)};
    const commit = {commit_json};
    const projectId = {json.dumps(PROJECT_ID)};
    const log = document.getElementById("log");
    async function report(payload) {{
      try {{
        await fetch("/result", {{
          method: "POST",
          headers: {{ "content-type": "application/json" }},
          body: JSON.stringify(payload),
        }});
      }} catch (error) {{}}
    }}
    async function run() {{
      try {{
        log.textContent = "送出 Firestore commit...";
        const commitResponse = await fetch("https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents:commit", {{
          method: "POST",
          headers: {{
            "authorization": "Bearer " + token,
            "content-type": "application/json",
          }},
          body: JSON.stringify(commit),
        }});
        const commitBody = await commitResponse.json().catch(() => ({{}}));
        if (!commitResponse.ok) {{
          throw new Error("Firestore commit failed: " + commitResponse.status + " " + JSON.stringify(commitBody));
        }}

        log.textContent = "回查 {html.escape(VERIFY_DOCUMENT)}...";
        const verifyResponse = await fetch("https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents/{html.escape(VERIFY_DOCUMENT)}", {{
          headers: {{ "authorization": "Bearer " + token }},
        }});
        const verifyBody = await verifyResponse.json().catch(() => ({{}}));
        if (!verifyResponse.ok || !verifyBody.name) {{
          throw new Error("Firestore verify failed: " + verifyResponse.status + " " + JSON.stringify(verifyBody));
        }}

        const payload = {{
          ok: true,
          project_id: projectId,
          verified_document: verifyBody.name,
          write_count: commit.writes.length,
          finished_at: new Date().toISOString(),
        }};
        log.textContent = JSON.stringify(payload, null, 2);
        await report(payload);
      }} catch (error) {{
        const payload = {{ ok: false, message: error.message, finished_at: new Date().toISOString() }};
        log.textContent = JSON.stringify(payload, null, 2);
        await report(payload);
      }}
    }}
    run();
  </script>
</body>
</html>"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def do_GET(self):
        body = PAGE.encode("utf-8")
        self.send_response(200)
        self.send_header("content-type", "text/html; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/result":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("content-length", "0"))
        body = self.rfile.read(length)
        result_path.write_bytes(body)
        self.send_response(204)
        self.end_headers()
        threading.Thread(target=self.server.shutdown, daemon=True).start()


server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
print(f"Browser Firestore commit server: http://127.0.0.1:{PORT}/")
server.serve_forever()
