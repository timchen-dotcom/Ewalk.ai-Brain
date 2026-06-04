import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const srcDir = path.join(projectRoot, "src");
const dataPath = path.join(projectRoot, "data", "garage-data.json");
const assetsDir = path.join(projectRoot, "assets");
const distDir = path.join(projectRoot, "dist");
const srcPreviewAssetsDir = path.join(srcDir, "assets");
const garageDataFile = "garage-data.js";

const requiredVehicleFields = [
  "id",
  "title",
  "brand",
  "model",
  "year",
  "grade",
  "price",
  "mileage",
  "color",
  "description",
  "updatedAt",
];
const optionalVehicleFields = ["location", "transmission", "fuel"];
const pendingPattern = /待確認|待補|未提供|資料整理中/;
const defaultSiteUrl = "https://lin-teacher-garage.vercel.app";

function fail(message) {
  throw new Error(`線上車庫資料檢查失敗：${message}`);
}

function assertText(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} 不可空白`);
  }
}

function hasPendingMarker(value) {
  if (typeof value === "string") return pendingPattern.test(value);
  if (Array.isArray(value)) return value.some((item) => hasPendingMarker(item));
  return false;
}

function assertPublicText(value, label) {
  assertText(value, label);
  if (hasPendingMarker(value)) {
    fail(`${label} 仍含待確認資訊；請先補完整，或將 status 改成 draft`);
  }
}

function normalizeStatus(status) {
  return status || "available";
}

function publicVehicles(data) {
  return data.vehicles.filter((vehicle) => normalizeStatus(vehicle.status) !== "draft");
}

function publicGarageData(data) {
  return {
    ...data,
    vehicles: publicVehicles(data),
  };
}

function normalizeSiteUrl(data) {
  const siteUrl = process.env.SITE_URL || data.brand?.siteUrl || defaultSiteUrl;
  return String(siteUrl).replace(/\/+$/, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cleanDescription(value, fallback) {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function vehiclePageHtml(data, vehicle, baseUrl) {
  const brand = data.brand || {};
  const title = `${vehicle.title}｜${brand.siteTitle || "霖老師的模範生車庫"}`;
  const description = cleanDescription(
    vehicle.description,
    `${vehicle.year || ""} ${vehicle.brand || ""} ${vehicle.model || ""}，售價 ${vehicle.price || "洽詢"}，里程 ${vehicle.mileage || "洽詢"}。`,
  );
  const canonical = `${baseUrl}/cars/${vehicle.id}/`;
  const image = vehicle.images?.[0] ? `${baseUrl}/${vehicle.images[0]}` : `${baseUrl}/${brand.logo || "assets/brand/lin-teacher-logo.png"}`;
  const highlights = Array.isArray(vehicle.highlights) ? vehicle.highlights : [];
  const specs = [
    ["年份", vehicle.year],
    ["品牌", vehicle.brand],
    ["車型", vehicle.model],
    ["等級", vehicle.grade],
    ["售價", vehicle.price],
    ["里程", vehicle.mileage],
    ["車色", vehicle.color],
    ["地點", vehicle.location],
    ["排檔", vehicle.transmission],
    ["燃料", vehicle.fuel],
  ].filter(([, value]) => value);
  const carJsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.title,
    brand: vehicle.brand,
    model: vehicle.model,
    vehicleModelDate: vehicle.year,
    color: vehicle.color,
    mileageFromOdometer: vehicle.mileage,
    image,
    description,
    offers: {
      "@type": "Offer",
      priceCurrency: "TWD",
      price: vehicle.price,
      availability: "https://schema.org/InStock",
      url: canonical,
    },
    seller: {
      "@type": "Organization",
      name: brand.lineName || brand.siteTitle || "中古車補教名師-霖老師",
      telephone: brand.phone,
      url: baseUrl,
    },
  };

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="zh_TW" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="../../styles.css" />
    <script type="application/ld+json">${JSON.stringify(carJsonLd)}</script>
  </head>
  <body>
    <main class="static-vehicle-page">
      <article class="detail-content">
        <p class="eyebrow">MODEL STUDENT GARAGE</p>
        <h1>${escapeHtml(vehicle.title)}</h1>
        <p class="detail-price">${escapeHtml(vehicle.price)}</p>
        <img src="../../${escapeHtml(vehicle.images?.[0] || brand.logo || "assets/brand/lin-teacher-logo.png")}" alt="${escapeHtml(vehicle.title)}" />
        <dl class="detail-specs">
          ${specs.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
        <div class="detail-block">
          <h2>車況重點</h2>
          <ul>${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div class="detail-block">
          <h2>霖老師說明</h2>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="dialog-actions">
          <a class="button primary" href="${escapeHtml(brand.lineUrl || "https://lin.ee/ZvB7HAX")}" target="_blank" rel="noopener">LINE 詢問這台車</a>
          <a class="button secondary" href="../../">回到在庫車列表</a>
        </div>
      </article>
    </main>
  </body>
</html>
`;
}

async function writeSeoFiles(data) {
  const baseUrl = normalizeSiteUrl(data);
  const published = publicVehicles(data);
  const urls = [
    { loc: `${baseUrl}/`, lastmod: data.brand?.updatedAt },
    ...published.map((vehicle) => ({
      loc: `${baseUrl}/cars/${vehicle.id}/`,
      lastmod: vehicle.updatedAt || data.brand?.updatedAt,
    })),
  ];

  await writeFile(
    path.join(distDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`,
    "utf8",
  );

  await writeFile(
    path.join(distDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (url) =>
          `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <lastmod>${escapeXml(url.lastmod || new Date().toISOString().slice(0, 10))}</lastmod>\n  </url>`,
      )
      .join("\n")}\n</urlset>\n`,
    "utf8",
  );

  for (const vehicle of published) {
    const vehicleDir = path.join(distDir, "cars", vehicle.id);
    await mkdir(vehicleDir, { recursive: true });
    await writeFile(path.join(vehicleDir, "index.html"), vehiclePageHtml(data, vehicle, baseUrl), "utf8");
  }
}

async function assertAssetExists(relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    fail(`${label} 圖片路徑不可空白`);
  }
  if (!relativePath.startsWith("assets/")) {
    fail(`${label} 必須放在 assets/ 開頭的資料夾，例如 assets/cars/車輛代號/01.jpg`);
  }
  await access(path.join(projectRoot, relativePath)).catch(() => {
    fail(`${label} 找不到圖片：${relativePath}`);
  });
}

async function validateData(data) {
  const warnings = [];

  if (!data || typeof data !== "object") {
    fail("garage-data.json 必須是 JSON 物件");
  }

  const brand = data.brand || {};
  ["siteTitle", "subtitle", "tagline", "phone", "lineName", "lineUrl", "logo", "updatedAt"].forEach((field) => {
    assertText(brand[field], `brand.${field}`);
  });
  await assertAssetExists(brand.logo, "brand.logo");

  if (!Array.isArray(data.vehicles)) {
    fail("vehicles 必須是陣列");
  }

  const ids = new Set();
  for (const [index, vehicle] of data.vehicles.entries()) {
    const number = index + 1;
    if (!vehicle || typeof vehicle !== "object") {
      fail(`第 ${number} 台車資料格式不正確`);
    }

    assertText(vehicle.id, `第 ${number} 台車 id`);
    if (ids.has(vehicle.id)) {
      fail(`車輛 id 重複：${vehicle.id}`);
    }
    ids.add(vehicle.id);

    const status = normalizeStatus(vehicle.status);
    if (!["available", "reserved", "sold", "draft"].includes(status)) {
      fail(`第 ${number} 台車 status 只能是 available、reserved、sold、draft`);
    }
    if (status === "draft") {
      continue;
    }

    requiredVehicleFields.forEach((field) => assertPublicText(vehicle[field], `第 ${number} 台車 ${field}`));

    if (!Array.isArray(vehicle.highlights) || vehicle.highlights.length < 3 || vehicle.highlights.length > 6) {
      fail(`第 ${number} 台車 highlights 需要 3 至 6 點`);
    }
    if (hasPendingMarker(vehicle.highlights)) {
      fail(`第 ${number} 台車 highlights 仍含待確認資訊；請先補完整，或將 status 改成 draft`);
    }

    const missingOptionalFields = optionalVehicleFields.filter((field) => !vehicle[field]);
    if (missingOptionalFields.length) {
      warnings.push(`第 ${number} 台車 ${vehicle.id} 缺少 ${missingOptionalFields.join("、")}，公開頁會略過這些欄位`);
    }

    if (!Array.isArray(vehicle.images) || vehicle.images.length === 0) {
      fail(`第 ${number} 台車至少需要 1 張照片，最多 5 張`);
    }
    if (vehicle.images.length > 5) {
      fail(`第 ${number} 台車照片最多 5 張`);
    }
    for (const [imageIndex, image] of vehicle.images.entries()) {
      await assertAssetExists(image, `第 ${number} 台車第 ${imageIndex + 1} 張`);
    }
  }

  return warnings;
}

async function copySourceFiles(data) {
  await cp(path.join(srcDir, "index.html"), path.join(distDir, "index.html"));
  await cp(path.join(srcDir, "styles.css"), path.join(distDir, "styles.css"));
  await cp(path.join(srcDir, "app.js"), path.join(distDir, "app.js"));
  await cp(assetsDir, path.join(distDir, "assets"), { recursive: true });

  const draftVehicles = data.vehicles.filter((vehicle) => normalizeStatus(vehicle.status) === "draft");
  for (const vehicle of draftVehicles) {
    await rm(path.join(distDir, "assets", "cars", vehicle.id), { recursive: true, force: true });
  }
}

function garageDataScript(data) {
  return `window.GARAGE_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

async function syncSourcePreview(data) {
  await writeFile(path.join(srcDir, garageDataFile), garageDataScript(data), "utf8");
  await rm(srcPreviewAssetsDir, { recursive: true, force: true });
  await cp(assetsDir, srcPreviewAssetsDir, { recursive: true });
}

async function main() {
  const raw = await readFile(dataPath, "utf8");
  const data = JSON.parse(raw);
  const warnings = await validateData(data);
  await syncSourcePreview(data);

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await copySourceFiles(data);

  await writeFile(path.join(distDir, garageDataFile), garageDataScript(publicGarageData(data)), "utf8");
  await writeSeoFiles(data);

  await writeFile(
    path.join(distDir, "build-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        vehicleCount: publicVehicles(data).length,
        source: "data/garage-data.json",
        warningCount: warnings.length,
        warnings,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  if (warnings.length) {
    console.warn(`資料提醒：${warnings.length} 項非阻擋欄位缺漏，已寫入 dist/build-report.json`);
  }
  console.log(`已產生線上車庫：${path.relative(projectRoot, path.join(distDir, "index.html"))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
