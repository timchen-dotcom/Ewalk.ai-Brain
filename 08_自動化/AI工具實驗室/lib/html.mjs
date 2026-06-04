import { spawn } from "node:child_process";

function normalizeSpace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function decodeHtml(text) {
  return String(text || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

export function assertHttpUrl(url) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("只支援 http / https 網址。");
  }
  return parsed;
}

export async function fetchPage(url, timeoutMs = 12000) {
  assertHttpUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "EwalkAI-ToolLab/0.1 (+https://ewalk.ai)"
      }
    });
    const html = await response.text();
    return {
      url: response.url || url,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type") || "",
      html
    };
  } catch (error) {
    return fetchPageWithCurl(url, timeoutMs, error);
  } finally {
    clearTimeout(timeout);
  }
}

function fetchPageWithCurl(url, timeoutMs, originalError) {
  return new Promise((resolve, reject) => {
    const marker = "\n__EWALK_CURL_STATUS__";
    const urlMarker = "__EWALK_CURL_URL__";
    const args = [
      "-L",
      "-sS",
      "--max-time",
      String(Math.max(3, Math.ceil(timeoutMs / 1000))),
      "-A",
      "EwalkAI-ToolLab/0.1 (+https://ewalk.ai)",
      "-w",
      `${marker}%{http_code}${urlMarker}%{url_effective}`,
      url
    ];
    const child = spawn("curl", args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", () => reject(originalError));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`fetch 失敗：${originalError.message}；curl 也失敗：${stderr.trim()}`));
        return;
      }
      const index = stdout.lastIndexOf(marker);
      if (index < 0) {
        resolve({ url, status: 200, ok: true, contentType: "text/html", html: stdout });
        return;
      }
      const html = stdout.slice(0, index);
      const meta = stdout.slice(index + marker.length);
      const [statusText, effectiveUrl] = meta.split(urlMarker);
      const status = Number(statusText) || 0;
      resolve({
        url: effectiveUrl || url,
        status,
        ok: status >= 200 && status < 400,
        contentType: "text/html",
        html
      });
    });
  });
}

export function extractPageData(url, html) {
  const title = decodeHtml((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const description =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) || [])[1] ||
    (html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i) || [])[1] ||
    "";

  const headings = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((match) => ({
      level: Number(match[1]),
      text: normalizeSpace(decodeHtml(match[2].replace(/<[^>]+>/g, " ")))
    }))
    .filter((item) => item.text)
    .slice(0, 30);

  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      let href = match[1];
      try {
        href = new URL(href, url).toString();
      } catch {
        return null;
      }
      return {
        href,
        text: normalizeSpace(decodeHtml(match[2].replace(/<[^>]+>/g, " ")))
      };
    })
    .filter(Boolean)
    .filter((link) => /^https?:/.test(link.href));

  const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)]
    .map((match) => normalizeSpace(decodeHtml(match[1].replace(/<[^>]+>/g, " "))))
    .filter(Boolean)
    .slice(0, 20);

  const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)].map((match) => {
    const form = match[0];
    const labels = [...form.matchAll(/<(?:label|button)[^>]*>([\s\S]*?)<\/(?:label|button)>/gi)]
      .map((label) => normalizeSpace(decodeHtml(label[1].replace(/<[^>]+>/g, " "))))
      .filter(Boolean);
    const inputs = [...form.matchAll(/<(?:input|textarea|select)[^>]*(?:>|<\/(?:textarea|select)>)/gi)].length;
    return { inputs, labels: labels.slice(0, 12) };
  });

  const images = [...html.matchAll(/<img[^>]+(?:alt=["']([^"']*)["'])?[^>]*>/gi)]
    .map((match) => normalizeSpace(decodeHtml(match[1] || "")))
    .filter(Boolean)
    .slice(0, 30);

  const text = decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

  return {
    url,
    title: normalizeSpace(title),
    description: normalizeSpace(description),
    headings,
    links,
    buttons,
    forms,
    images,
    text: normalizeSpace(text).slice(0, 9000)
  };
}

export function pickInternalLinks(pageData, max = 5) {
  const origin = new URL(pageData.url).origin;
  const keywords = /服務|項目|價|預約|聯絡|關於|案例|作品|文章|blog|service|price|booking|reserve|contact|about|case|work|portfolio|product|shop/i;
  const seen = new Set([pageData.url.replace(/#.*$/, "")]);
  const picked = [];
  for (const link of pageData.links) {
    const parsed = new URL(link.href);
    const clean = link.href.replace(/#.*$/, "");
    if (parsed.origin !== origin || seen.has(clean)) continue;
    const scoreText = `${parsed.pathname} ${link.text}`;
    if (!keywords.test(scoreText)) continue;
    seen.add(clean);
    picked.push(clean);
    if (picked.length >= max) break;
  }
  return picked;
}

export function summarizePages(pages) {
  return pages.map((page, index) => ({
    index: index + 1,
    url: page.url,
    title: page.title,
    description: page.description,
    headings: page.headings.slice(0, 12),
    buttons: page.buttons,
    forms: page.forms,
    images: page.images.slice(0, 12),
    links: page.links.slice(0, 30),
    textSample: page.text.slice(0, 3500)
  }));
}
