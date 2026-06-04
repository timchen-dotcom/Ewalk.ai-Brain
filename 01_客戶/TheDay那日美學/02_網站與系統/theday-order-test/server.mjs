import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(root, "data");
const statePath = join(dataDir, "state.json");
const port = Number(process.env.PORT || 4188);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function safeStaticPath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, "http://localhost").pathname);
  const target = resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
  if (!target.startsWith(resolve(root))) return null;
  return target;
}

const server = createServer(async (req, res) => {
  try {
    if (req.url === "/api/state" && req.method === "GET") {
      if (!existsSync(statePath)) return sendJson(res, 200, null);
      const raw = await readFile(statePath, "utf8");
      return sendJson(res, 200, JSON.parse(raw));
    }

    if (req.url === "/api/state" && req.method === "PUT") {
      const body = await readBody(req);
      const data = JSON.parse(body);
      await mkdir(dataDir, { recursive: true });
      await writeFile(statePath, JSON.stringify(data, null, 2));
      return sendJson(res, 200, { ok: true });
    }

    const filePath = safeStaticPath(req.url || "/");
    if (!filePath || !existsSync(filePath)) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }

    res.writeHead(200, {
      "content-type": mime[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    return createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { ok: false, error: "server_error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`TheDay order test server is running on http://0.0.0.0:${port}`);
});
