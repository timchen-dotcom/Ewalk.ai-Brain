const garageData = window.GARAGE_DATA || { brand: {}, vehicles: [] };
const brand = garageData.brand || {};
const vehicles = Array.isArray(garageData.vehicles) ? garageData.vehicles : [];

const $ = (selector) => document.querySelector(selector);

const statusLabels = {
  available: "嚴選在庫",
  reserved: "洽談中",
  sold: "已售出",
  draft: "草稿",
};

const fields = {
  brandLogo: $("#brandLogo"),
  brandTitle: $("#brandTitle"),
  brandSubtitle: $("#brandSubtitle"),
  heroTitle: $("#heroTitle"),
  brandTagline: $("#brandTagline"),
  inventoryCount: $("#inventoryCount"),
  lastUpdated: $("#lastUpdated"),
  inventorySummary: $("#inventorySummary"),
  vehicleGrid: $("#vehicleGrid"),
  emptyState: $("#emptyState"),
  keywordInput: $("#keywordInput"),
  budgetSelect: $("#budgetSelect"),
  sortSelect: $("#sortSelect"),
  dialog: $("#vehicleDialog"),
  closeDialog: $("#closeDialog"),
  detailMainPhoto: $("#detailMainPhoto"),
  thumbnailRow: $("#thumbnailRow"),
  dialogStatus: $("#dialogStatus"),
  dialogTitle: $("#dialogTitle"),
  dialogPrice: $("#dialogPrice"),
  dialogSpecs: $("#dialogSpecs"),
  dialogHighlights: $("#dialogHighlights"),
  dialogDescription: $("#dialogDescription"),
  dialogLine: $("#dialogLine"),
  dialogPhone: $("#dialogPhone"),
};

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function phoneHref(phone) {
  return `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;
}

function normalizeStatus(status) {
  return status || "available";
}

function publishedVehicles() {
  return vehicles.filter((vehicle) => normalizeStatus(vehicle.status) !== "draft");
}

function availableVehicles() {
  return publishedVehicles().filter((vehicle) => normalizeStatus(vehicle.status) !== "sold");
}

function priceNumber(price) {
  if (!price) return Number.POSITIVE_INFINITY;
  const raw = String(price).replace(/,/g, "");
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  if (!match) return Number.POSITIVE_INFINITY;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return Number.POSITIVE_INFINITY;
  return raw.includes("萬") ? amount : amount / 10000;
}

function imageList(vehicle) {
  return Array.isArray(vehicle.images) ? vehicle.images.filter(Boolean).slice(0, 5) : [];
}

function fallbackPhoto(label = "車輛照片整理中") {
  const logo = escapeHtml(brand.logo || "assets/brand/lin-teacher-logo.png");
  return `
    <div class="photo-placeholder">
      <span>
        <img src="./${logo}" alt="" />
        <strong>${escapeHtml(label)}</strong>
      </span>
    </div>
  `;
}

function photoMarkup(src, alt) {
  if (!src) return fallbackPhoto();
  return `<img data-photo src="./${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
}

function bindPhotoFallbacks(root = document) {
  root.querySelectorAll("[data-photo]").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        const holder = image.parentElement;
        if (holder) holder.innerHTML = fallbackPhoto("照片載入中");
      },
      { once: true },
    );
  });
}

function setLink(selector, href, label) {
  const element = $(selector);
  if (!element) return;
  element.href = href;
  if (label) element.textContent = label;
}

function renderBrand() {
  const title = text(brand.siteTitle, "霖老師的模範生車庫");
  const subtitle = text(brand.subtitle, "中古車補教名師嚴選在庫車");
  const tagline = text(brand.tagline, "專業嚴選、透明資訊、安心詢問");
  const logo = text(brand.logo, "assets/brand/lin-teacher-logo.png");
  const phone = text(brand.phone, "0916-056-554");
  const lineUrl = text(brand.lineUrl, "https://lin.ee/ZvB7HAX");

  document.title = `${title}｜${subtitle}`;
  fields.brandLogo.src = `./${logo}`;
  fields.brandTitle.textContent = title;
  fields.brandSubtitle.textContent = subtitle;
  fields.heroTitle.textContent = title;
  fields.brandTagline.textContent = tagline;
  fields.lastUpdated.textContent = text(brand.updatedAt, "待更新");

  setLink("#headerPhone", phoneHref(phone), "電話詢問");
  setLink("#heroPhone", phoneHref(phone), "電話聯繫");
  setLink("#dialogPhone", phoneHref(phone), "電話聯繫");
  setLink("#headerLine", lineUrl, "LINE 詢問");
  setLink("#heroLine", lineUrl, "詢問在庫車");
  setLink("#emptyLine", lineUrl, "先用 LINE 詢問");
  setLink("#dialogLine", lineUrl, "LINE 詢問這台車");
}

function passesBudget(vehicle, budget) {
  const price = priceNumber(vehicle.price);
  if (budget === "under50") return price < 50;
  if (budget === "50to80") return price >= 50 && price <= 80;
  if (budget === "80to120") return price > 80 && price <= 120;
  if (budget === "over120") return price > 120;
  return true;
}

function vehicleSearchText(vehicle) {
  return [
    vehicle.title,
    vehicle.brand,
    vehicle.model,
    vehicle.year,
    vehicle.grade,
    vehicle.color,
    vehicle.mileage,
    vehicle.price,
    ...(Array.isArray(vehicle.highlights) ? vehicle.highlights : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filteredVehicles() {
  const keyword = fields.keywordInput.value.trim().toLowerCase();
  const budget = fields.budgetSelect.value;
  const sort = fields.sortSelect.value;
  const list = availableVehicles().filter((vehicle) => {
    const matchesKeyword = !keyword || vehicleSearchText(vehicle).includes(keyword);
    return matchesKeyword && passesBudget(vehicle, budget);
  });

  return list.sort((a, b) => {
    if (sort === "priceAsc") return priceNumber(a.price) - priceNumber(b.price);
    if (sort === "priceDesc") return priceNumber(b.price) - priceNumber(a.price);
    if (sort === "yearDesc") return Number(b.year || 0) - Number(a.year || 0);
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}

function vehicleCard(vehicle) {
  const images = imageList(vehicle);
  const highlights = Array.isArray(vehicle.highlights) ? vehicle.highlights.slice(0, 3) : [];
  const status = normalizeStatus(vehicle.status);
  return `
    <article class="vehicle-card">
      <button type="button" data-open-vehicle="${escapeHtml(vehicle.id)}" aria-label="查看 ${escapeHtml(vehicle.title)} 詳情">
        <div class="card-photo">
          <span class="status-badge">${escapeHtml(statusLabels[status] || "在庫")}</span>
          ${photoMarkup(images[0], vehicle.title || "車輛照片")}
        </div>
        <div class="card-body">
          <h3>${escapeHtml(vehicle.title || "未命名車輛")}</h3>
          <p class="price">${escapeHtml(vehicle.price || "售價洽詢")}</p>
          <div class="spec-row">
            <span>${escapeHtml(vehicle.year || "年份待補")}</span>
            <span>${escapeHtml(vehicle.mileage || "里程待補")}</span>
            <span>${escapeHtml(vehicle.color || "車色待補")}</span>
            ${vehicle.grade ? `<span>${escapeHtml(vehicle.grade)}</span>` : ""}
          </div>
          ${
            highlights.length
              ? `<div class="highlight-row">${highlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
              : ""
          }
        </div>
      </button>
    </article>
  `;
}

function renderInventory() {
  const allCount = availableVehicles().length;
  const list = filteredVehicles();

  fields.inventoryCount.textContent = allCount;
  fields.inventorySummary.textContent = `目前在庫 ${allCount} 台`;
  fields.vehicleGrid.innerHTML = list.map(vehicleCard).join("");
  fields.emptyState.hidden = list.length > 0;

  fields.vehicleGrid.querySelectorAll("[data-open-vehicle]").forEach((button) => {
    button.addEventListener("click", () => openVehicle(button.dataset.openVehicle));
  });
  bindPhotoFallbacks(fields.vehicleGrid);
}

function specItems(vehicle) {
  return [
    ["年份", vehicle.year],
    ["里程數", vehicle.mileage],
    ["車色", vehicle.color],
    ["等級", vehicle.grade],
    ["地點", vehicle.location],
    ["排檔", vehicle.transmission],
    ["燃料", vehicle.fuel],
    ["更新", vehicle.updatedAt],
  ].filter(([, value]) => value);
}

function renderDetailPhoto(vehicle, selectedIndex = 0) {
  const images = imageList(vehicle);
  const activeImage = images[selectedIndex] || "";
  fields.detailMainPhoto.innerHTML = photoMarkup(activeImage, `${vehicle.title || "車輛"}照片`);
  fields.thumbnailRow.innerHTML = images
    .map(
      (image, index) => `
        <button type="button" class="${index === selectedIndex ? "active" : ""}" data-photo-index="${index}" aria-label="查看第 ${index + 1} 張照片">
          ${photoMarkup(image, `${vehicle.title || "車輛"}縮圖 ${index + 1}`)}
        </button>
      `,
    )
    .join("");

  if (!images.length) {
    fields.thumbnailRow.innerHTML = "";
  }

  fields.thumbnailRow.querySelectorAll("[data-photo-index]").forEach((button) => {
    button.addEventListener("click", () => renderDetailPhoto(vehicle, Number(button.dataset.photoIndex)));
  });
  bindPhotoFallbacks(fields.detailMainPhoto);
  bindPhotoFallbacks(fields.thumbnailRow);
}

function openVehicle(id) {
  const vehicle = publishedVehicles().find((item) => item.id === id);
  if (!vehicle) return;

  const status = normalizeStatus(vehicle.status);
  fields.dialogStatus.textContent = statusLabels[status] || "嚴選在庫";
  fields.dialogTitle.textContent = vehicle.title || "未命名車輛";
  fields.dialogPrice.textContent = vehicle.price || "售價洽詢";
  fields.dialogSpecs.innerHTML = specItems(vehicle)
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  fields.dialogHighlights.innerHTML = (Array.isArray(vehicle.highlights) && vehicle.highlights.length
    ? vehicle.highlights
    : ["車況資料整理中"]
  )
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  fields.dialogDescription.textContent = text(vehicle.description, "詳細車況請先透過 LINE 與霖老師團隊確認。");

  renderDetailPhoto(vehicle);

  if (typeof fields.dialog.showModal === "function") {
    fields.dialog.showModal();
  } else {
    fields.dialog.setAttribute("open", "");
  }
}

function closeDialog() {
  fields.dialog.close();
}

function bindEvents() {
  [fields.keywordInput, fields.budgetSelect, fields.sortSelect].forEach((field) => {
    field.addEventListener("input", renderInventory);
  });
  fields.closeDialog.addEventListener("click", closeDialog);
  fields.dialog.addEventListener("click", (event) => {
    if (event.target === fields.dialog) closeDialog();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && fields.dialog.open) closeDialog();
  });
}

renderBrand();
bindEvents();
renderInventory();
