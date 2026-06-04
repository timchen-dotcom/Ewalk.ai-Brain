import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4320);

function json(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(text)
  });
  res.end(text);
}

async function serveStatic(res, file, contentType) {
  const fullPath = path.join(__dirname, "public", file);
  const data = await readFile(fullPath);
  const charset = contentType.startsWith("text/") ? "; charset=utf-8" : "";
  res.writeHead(200, { "content-type": `${contentType}${charset}` });
  res.end(data);
}

function staticType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".html") return "text/html";
  if (ext === ".js") return "text/javascript";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/") {
      return serveStatic(res, "index.html", "text/html");
    }
    if ((req.method === "GET" || req.method === "HEAD") && !url.pathname.includes("..")) {
      const file = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      const fullPath = path.join(__dirname, "public", file);
      if (file && existsSync(fullPath)) {
        return serveStatic(res, file, staticType(file));
      }
    }
    if (req.method === "GET" && url.pathname === "/status") {
      return json(res, 200, {
        ok: true,
        disabled: true,
        message: "Ashun live voice site is closed."
      });
    }
    if (req.method === "POST" && ["/session", "/ask", "/tool/searchKnowledge"].includes(url.pathname)) {
      return json(res, 410, {
        error: "Ashun live voice site is closed.",
        disabled: true
      });
    }
    return json(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: String(error?.message || error) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`現場語音阿順已關閉：http://127.0.0.1:${PORT}`);
});
