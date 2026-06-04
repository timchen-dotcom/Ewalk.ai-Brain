const STORAGE_KEY = "theday-order-test-v2";
let serverMode = false;
let saveTimer = null;
const importedSeed = window.TheDaySeedData || {};
const DATA_VERSION = importedSeed.importedAt || "demo";

const seedStores = importedSeed.stores || [
  { id: "store-taiyi", name: "太一", manager: "公司", phone: "", address: "", status: "啟用", staff: ["公司"] },
];

const seedProducts = importedSeed.products || [
  { id: "product-demo", brand: "待補", category: "一般品項", name: "範例品項", spec: "", unit: "個", price: 0, active: true, note: "價格待補" },
];

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

const defaultState = () => ({
  dataVersion: DATA_VERSION,
  view: "dashboard",
  user: null,
  stores: cloneData(seedStores),
  products: cloneData(seedProducts),
  batches: [{ id: "batch-2026-06-test", title: "2026-06 試用批次", status: "開放下單" }],
  orders: [],
});

let state = defaultState();

const els = {
  content: document.querySelector("#content"),
  loginPanel: document.querySelector("#loginPanel"),
  pageTitle: document.querySelector("#pageTitle"),
  userBox: document.querySelector("#userBox"),
  storeLoginSelect: document.querySelector("#storeLoginSelect"),
  staffLoginSelect: document.querySelector("#staffLoginSelect"),
};

async function loadState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (response.ok) {
      serverMode = true;
      const serverState = await response.json();
      if (serverState?.stores?.length && serverState.dataVersion === DATA_VERSION) return serverState;
      return defaultState();
    }
  } catch {
    serverMode = false;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return parsed?.dataVersion === DATA_VERSION ? parsed : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!serverMode) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fetch("/api/state", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => {
      serverMode = false;
      renderMode();
    });
  }, 160);
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function money(value) {
  return Number(value || 0).toLocaleString("zh-Hant-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  });
}

function todayTime() {
  return new Date().toLocaleString("zh-Hant-TW", { hour12: false });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function activeProducts() {
  return state.products.filter((product) => product.active);
}

function currentStore() {
  if (!state.user?.storeId) return null;
  return state.stores.find((store) => store.id === state.user.storeId);
}

function getStoreStaff(storeId) {
  const store = state.stores.find((item) => item.id === storeId);
  return store?.staff?.length ? store.staff : ["公司"];
}

function currentBatch() {
  return state.batches[0];
}

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function downloadCSV(filename, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function render() {
  renderLoginOptions();
  renderUser();
  renderNav();
  renderMode();
  if (!state.user) {
    els.loginPanel.hidden = false;
    els.content.hidden = true;
    els.pageTitle.textContent = "TheDay 內部訂購測試版";
    return;
  }
  els.loginPanel.hidden = true;
  els.content.hidden = false;
  const titles = {
    dashboard: "總覽",
    order: "分店下單",
    history: "我的訂單",
    adminOrders: "管理彙總",
    products: "商品管理",
    stores: "分店管理",
  };
  els.pageTitle.textContent = titles[state.view] || "總覽";
  if (state.view === "dashboard") renderDashboard();
  if (state.view === "order") renderOrder();
  if (state.view === "history") renderHistory();
  if (state.view === "adminOrders") renderAdminOrders();
  if (state.view === "products") renderProducts();
  if (state.view === "stores") renderStores();
}

function renderMode() {
  const mode = document.querySelector("#storageMode");
  if (!mode) return;
  mode.textContent = serverMode
    ? "平板共用資料模式：同 Wi‑Fi 裝置開同一網址，分店下單會進同一份測試資料。"
    : "單機測試模式：資料存在這台瀏覽器，適合單機看流程；平板共用需用啟動平板預覽。";
}

function renderLoginOptions() {
  els.storeLoginSelect.innerHTML = state.stores
    .filter((store) => store.status === "啟用")
    .map((store) => `<option value="${store.id}">${escapeHTML(store.name)}</option>`)
    .join("");
  renderStaffOptions();
}

function renderStaffOptions() {
  const storeId = els.storeLoginSelect.value || state.stores[0]?.id;
  els.staffLoginSelect.innerHTML = getStoreStaff(storeId)
    .map((staff) => `<option value="${escapeHTML(staff)}">${escapeHTML(staff)}</option>`)
    .join("");
}

function renderUser() {
  if (!state.user) {
    els.userBox.innerHTML = "<span>尚未進入</span><strong>請選擇角色</strong>";
    return;
  }
  const label = state.user.role === "admin" ? "管理者" : "分店帳號";
  const name = state.user.role === "admin" ? "TheDay 總部管理者" : currentStore()?.name;
  const staff = state.user.role === "store" ? `<small>${escapeHTML(state.user.staffName || "公司")}</small>` : "";
  els.userBox.innerHTML = `<span>${label}</span><strong>${escapeHTML(name)}</strong>${staff}`;
}

function renderNav() {
  document.querySelectorAll("[data-admin-only]").forEach((button) => {
    button.hidden = state.user?.role !== "admin";
  });
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === state.view);
  });
}

function adminOnlyGuard() {
  if (state.user?.role === "admin") return false;
  state.view = "dashboard";
  saveState();
  return true;
}

function renderDashboard() {
  const batch = currentBatch();
  const submittedStores = new Set(state.orders.map((order) => order.storeId));
  const totalAmount = state.orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const ownOrders =
    state.user.role === "admin"
      ? state.orders
      : state.orders.filter((order) => order.storeId === state.user.storeId && order.staffName === state.user.staffName);
  const missingStores = state.stores.filter((store) => !submittedStores.has(store.id));
  els.content.innerHTML = `
    <div class="grid stats">
      <article class="card stat"><small>目前批次</small><strong>${escapeHTML(batch.title)}</strong><span class="muted">${escapeHTML(batch.status)}</span></article>
      <article class="card stat"><small>已下單分店</small><strong>${submittedStores.size}/${state.stores.length}</strong><span class="muted">已匯入 TheDay 分店</span></article>
      <article class="card stat"><small>商品數</small><strong>${state.products.length}</strong><span class="muted">${activeProducts().length} 個上架</span></article>
      <article class="card stat"><small>${state.user.role === "admin" ? "本期總金額" : "我的訂單數"}</small><strong>${state.user.role === "admin" ? money(totalAmount) : ownOrders.length}</strong><span class="muted">測試資料</span></article>
    </div>

    <div class="grid two">
      <section class="card pad">
        <div class="section-title">
          <div>
            <h2>${state.user.role === "admin" ? "管理者下一步" : "分店下單入口"}</h2>
            <p>${state.user.role === "admin" ? "已匯入 Excel 品項與分店人員，接著補價格或讓店內人員測下單。" : "選品、輸入數量、送出後可在我的訂單查看。"}</p>
          </div>
        </div>
        ${state.user.role === "admin" ? adminChecklist(missingStores) : storeChecklist()}
      </section>
      <section class="card pad">
        <div class="section-title">
          <div>
            <h2>最近訂單</h2>
            <p>最新送出的分店訂單會出現在這裡。</p>
          </div>
        </div>
        ${recentOrdersHTML(ownOrders)}
      </section>
    </div>
  `;
}

function adminChecklist(missingStores) {
  return `
    <div class="notice">商品很多時，請直接用商品 CSV 匯入。欄位順序：品牌、分類、品項名稱、規格、單位、價格、是否上架、備註。</div>
    <div class="toolbar" style="margin-top:14px">
      <button class="button primary" type="button" data-nav="products">整理商品</button>
      <button class="button secondary" type="button" data-nav="adminOrders">看彙總</button>
      <button class="button" type="button" data-export="product-template">下載商品模板</button>
    </div>
    <p class="muted">尚未下單分店：${missingStores.length ? missingStores.map((store) => escapeHTML(store.name)).join("、") : "全部分店都已送出"}</p>
  `;
}

function storeChecklist() {
  return `
    <div class="notice">這是測試版。請先用真實品項與大概數量試下單，確認畫面是否夠快、分類是否好找、送出後紀錄是否清楚。</div>
    <div class="toolbar" style="margin-top:14px">
      <button class="button primary" type="button" data-nav="order">開始下單</button>
      <button class="button" type="button" data-nav="history">查看我的訂單</button>
    </div>
  `;
}

function recentOrdersHTML(orders) {
  if (!orders.length) return `<div class="empty">目前還沒有訂單。</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>時間</th><th>分店</th><th>人員</th><th>品項數</th><th class="numeric">金額</th><th>狀態</th></tr></thead>
        <tbody>
          ${orders
            .slice()
            .reverse()
            .slice(0, 6)
            .map((order) => orderRowHTML(order))
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function orderRowHTML(order) {
  const store = state.stores.find((item) => item.id === order.storeId);
  return `<tr>
    <td>${escapeHTML(order.createdAt)}</td>
    <td>${escapeHTML(store?.name || "未知分店")}</td>
    <td>${escapeHTML(order.staffName || "公司")}</td>
    <td>${order.items.length}</td>
    <td class="numeric">${money(orderTotal(order))}</td>
    <td><span class="pill">${escapeHTML(order.status)}</span></td>
  </tr>`;
}

function renderOrder() {
  if (state.user.role === "admin") {
    els.content.innerHTML = `<div class="empty">管理者不用從分店端下單。請切換分店帳號測試下單流程，或到「管理彙總」查看訂單。</div>`;
    return;
  }
  const products = activeProducts();
  const brands = [...new Set(products.map((product) => product.brand))];
  const categories = [...new Set(products.map((product) => product.category))];
  els.content.innerHTML = `
    <section class="card pad">
      <div class="section-title">
        <div>
          <h2>${escapeHTML(currentStore()?.name)}｜${escapeHTML(currentBatch().title)}</h2>
          <p>${escapeHTML(state.user.staffName || "公司")} 叫貨中。輸入需要訂購的數量，空白或 0 會自動略過。</p>
        </div>
      </div>
      <div class="filters">
        <label>搜尋<input id="productSearch" type="search" placeholder="品牌、品項、規格"></label>
        <label>品牌<select id="brandFilter"><option value="">全部品牌</option>${brands.map((brand) => `<option>${escapeHTML(brand)}</option>`).join("")}</select></label>
        <label>分類<select id="categoryFilter"><option value="">全部分類</option>${categories.map((category) => `<option>${escapeHTML(category)}</option>`).join("")}</select></label>
      </div>
    </section>
    <section class="card">
      <div class="table-wrap">
        <table id="orderTable">
          <thead><tr><th>品牌</th><th>分類</th><th>品項</th><th>規格</th><th>單位</th><th class="numeric">單價</th><th class="numeric">數量</th><th class="numeric">小計</th></tr></thead>
          <tbody>${products.map(orderProductRow).join("")}</tbody>
        </table>
      </div>
    </section>
    <div class="total-bar">
      <span>目前訂單合計：<strong id="orderTotal">${money(0)}</strong></span>
      <button class="button primary" type="button" id="submitOrderBtn">送出訂單</button>
    </div>
  `;
  updateOrderTotal();
}

function orderProductRow(product) {
  return `<tr data-product-row data-product-id="${product.id}" data-brand="${escapeHTML(product.brand)}" data-category="${escapeHTML(product.category)}" data-text="${escapeHTML(`${product.brand} ${product.category} ${product.name} ${product.spec}`.toLowerCase())}">
    <td>${escapeHTML(product.brand)}</td>
    <td>${escapeHTML(product.category)}</td>
    <td><strong>${escapeHTML(product.name)}</strong>${product.note ? `<br><small class="muted">${escapeHTML(product.note)}</small>` : ""}</td>
    <td>${escapeHTML(product.spec)}</td>
    <td>${escapeHTML(product.unit)}</td>
    <td class="numeric">${money(product.price)}</td>
    <td class="numeric"><input class="qty-input" data-qty="${product.id}" type="number" min="0" step="1" inputmode="numeric" aria-label="${escapeHTML(product.name)} 數量"></td>
    <td class="numeric" data-subtotal="${product.id}">${money(0)}</td>
  </tr>`;
}

function updateOrderFilter() {
  const query = document.querySelector("#productSearch")?.value.trim().toLowerCase() || "";
  const brand = document.querySelector("#brandFilter")?.value || "";
  const category = document.querySelector("#categoryFilter")?.value || "";
  document.querySelectorAll("[data-product-row]").forEach((row) => {
    const matchQuery = !query || row.dataset.text.includes(query);
    const matchBrand = !brand || row.dataset.brand === brand;
    const matchCategory = !category || row.dataset.category === category;
    row.hidden = !(matchQuery && matchBrand && matchCategory);
  });
}

function updateOrderTotal() {
  let total = 0;
  document.querySelectorAll("[data-qty]").forEach((input) => {
    const product = state.products.find((item) => item.id === input.dataset.qty);
    const qty = Number(input.value || 0);
    const subtotal = product ? qty * Number(product.price || 0) : 0;
    const target = document.querySelector(`[data-subtotal="${input.dataset.qty}"]`);
    if (target) target.textContent = money(subtotal);
    total += subtotal;
  });
  const totalEl = document.querySelector("#orderTotal");
  if (totalEl) totalEl.textContent = money(total);
}

function submitOrder() {
  const items = [];
  document.querySelectorAll("[data-qty]").forEach((input) => {
    const quantity = Number(input.value || 0);
    if (quantity <= 0) return;
    const product = state.products.find((item) => item.id === input.dataset.qty);
    if (!product) return;
    items.push({
      productId: product.id,
      brand: product.brand,
      category: product.category,
      name: product.name,
      spec: product.spec,
      unit: product.unit,
      price: Number(product.price),
      quantity,
      subtotal: quantity * Number(product.price),
    });
  });
  if (!items.length) {
    alert("請至少輸入一個品項數量。");
    return;
  }
  state.orders.push({
    id: id("order"),
    batchId: currentBatch().id,
    storeId: state.user.storeId,
    staffName: state.user.staffName || "公司",
    status: "已送出",
    createdAt: todayTime(),
    items,
  });
  state.view = "history";
  saveState();
  render();
}

function renderHistory() {
  const orders =
    state.user.role === "admin"
      ? state.orders
      : state.orders.filter((order) => order.storeId === state.user.storeId && order.staffName === state.user.staffName);
  els.content.innerHTML = `
    <section class="card pad">
      <div class="section-title">
        <div>
          <h2>${state.user.role === "admin" ? "全部訂單紀錄" : "我的訂單紀錄"}</h2>
          <p>分店送出後會在這裡留存，正式版會加上退回修改與鎖定流程。</p>
        </div>
        <button class="button" type="button" data-export="detail">匯出明細</button>
      </div>
      ${orders.length ? orders.map(orderDetailHTML).join("") : `<div class="empty">目前還沒有訂單。</div>`}
    </section>
  `;
}

function orderDetailHTML(order) {
  const store = state.stores.find((item) => item.id === order.storeId);
  return `
    <article class="card pad" style="margin-bottom:14px">
      <div class="section-title">
        <div>
          <h2>${escapeHTML(store?.name || "未知分店")}</h2>
          <p>${escapeHTML(order.createdAt)}｜${escapeHTML(order.staffName || "公司")}｜${order.items.length} 個品項｜${money(orderTotal(order))}</p>
        </div>
        <span class="pill">${escapeHTML(order.status)}</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>品牌</th><th>分類</th><th>品項</th><th>規格</th><th class="numeric">單價</th><th class="numeric">數量</th><th class="numeric">小計</th></tr></thead>
          <tbody>
            ${order.items
              .map(
                (item) => `<tr><td>${escapeHTML(item.brand)}</td><td>${escapeHTML(item.category)}</td><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.spec)}</td><td class="numeric">${money(item.price)}</td><td class="numeric">${item.quantity}</td><td class="numeric">${money(item.subtotal)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderAdminOrders() {
  if (adminOnlyGuard()) return render();
  const summary = aggregateOrders();
  const submittedStores = new Set(state.orders.map((order) => order.storeId));
  els.content.innerHTML = `
    <section class="card pad">
      <div class="section-title">
        <div>
          <h2>本期管理彙總</h2>
          <p>依商品彙整各分店數量，可匯出給總部採購；分店明細會保留叫貨人員。</p>
        </div>
        <div class="row-actions">
          <button class="button" type="button" data-export="summary">匯出商品彙總</button>
          <button class="button" type="button" data-export="detail">匯出分店明細</button>
        </div>
      </div>
      <div class="notice">已送出：${submittedStores.size}/${state.stores.length}。尚未送出：${state.stores.filter((store) => !submittedStores.has(store.id)).map((store) => escapeHTML(store.name)).join("、") || "無"}</div>
    </section>
    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>品牌</th><th>分類</th><th>品項</th><th>規格</th><th>單位</th>${state.stores.map((store) => `<th class="numeric">${escapeHTML(store.name)}</th>`).join("")}<th class="numeric">總數量</th><th class="numeric">總金額</th></tr>
          </thead>
          <tbody>
            ${summary.length ? summary.map(summaryRowHTML).join("") : `<tr><td colspan="${8 + state.stores.length}">目前還沒有訂單。</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function aggregateOrders() {
  const map = new Map();
  state.orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = [item.productId, item.brand, item.category, item.name, item.spec, item.unit, item.price].join("|");
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          stores: Object.fromEntries(state.stores.map((store) => [store.id, 0])),
          totalQuantity: 0,
          totalAmount: 0,
        });
      }
      const row = map.get(key);
      row.stores[order.storeId] += Number(item.quantity);
      row.totalQuantity += Number(item.quantity);
      row.totalAmount += Number(item.subtotal);
    });
  });
  return [...map.values()].sort((a, b) => `${a.brand}${a.category}${a.name}`.localeCompare(`${b.brand}${b.category}${b.name}`, "zh-Hant"));
}

function summaryRowHTML(row) {
  return `<tr>
    <td>${escapeHTML(row.brand)}</td>
    <td>${escapeHTML(row.category)}</td>
    <td><strong>${escapeHTML(row.name)}</strong></td>
    <td>${escapeHTML(row.spec)}</td>
    <td>${escapeHTML(row.unit)}</td>
    ${state.stores.map((store) => `<td class="numeric">${row.stores[store.id] || 0}</td>`).join("")}
    <td class="numeric"><strong>${row.totalQuantity}</strong></td>
    <td class="numeric">${money(row.totalAmount)}</td>
  </tr>`;
}

function renderProducts() {
  if (adminOnlyGuard()) return render();
  els.content.innerHTML = `
    <section class="card pad">
      <div class="section-title">
        <div>
          <h2>商品管理</h2>
          <p>商品多的時候請匯入 CSV。手動新增適合臨時補品項。</p>
        </div>
        <div class="row-actions">
          <button class="button" type="button" data-export="product-template">下載商品模板</button>
          <label class="button">
            匯入商品 CSV
            <input class="sr-only" id="productImport" type="file" accept=".csv,text/csv">
          </label>
        </div>
      </div>
      <form id="productForm" class="form-grid">
        <label>品牌<input name="brand" required placeholder="例：Milbon"></label>
        <label>分類<input name="category" required placeholder="例：染膏"></label>
        <label class="wide">品項名稱<input name="name" required placeholder="例：N. 染膏 8N"></label>
        <label>規格<input name="spec" required placeholder="例：80g"></label>
        <label>單位<input name="unit" required placeholder="例：條"></label>
        <label>價格<input name="price" type="number" min="0" step="1" required placeholder="0"></label>
        <label class="wide">備註<input name="note" placeholder="特殊限制可填這裡"></label>
        <button class="button primary" type="submit">新增商品</button>
      </form>
    </section>
    <section class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>狀態</th><th>品牌</th><th>分類</th><th>品項</th><th>規格</th><th>單位</th><th class="numeric">價格</th><th>操作</th></tr></thead>
          <tbody>${state.products.map(productRowHTML).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function productRowHTML(product) {
  return `<tr>
    <td><span class="pill ${product.active ? "" : "warn"}">${product.active ? "上架" : "停用"}</span></td>
    <td>${escapeHTML(product.brand)}</td>
    <td>${escapeHTML(product.category)}</td>
    <td><strong>${escapeHTML(product.name)}</strong>${product.note ? `<br><small class="muted">${escapeHTML(product.note)}</small>` : ""}</td>
    <td>${escapeHTML(product.spec)}</td>
    <td>${escapeHTML(product.unit)}</td>
    <td class="numeric">${money(product.price)}</td>
    <td class="row-actions">
      <button class="button" type="button" data-toggle-product="${product.id}">${product.active ? "停用" : "上架"}</button>
      <button class="button danger" type="button" data-delete-product="${product.id}">刪除</button>
    </td>
  </tr>`;
}

function renderStores() {
  if (adminOnlyGuard()) return render();
  els.content.innerHTML = `
    <section class="card pad">
      <div class="section-title">
        <div>
          <h2>分店管理</h2>
          <p>已匯入 Excel 分店與人員名單；人員用逗號分隔可直接調整。</p>
        </div>
      </div>
      <form id="storeForm" class="form-grid">
        <label class="wide">分店名稱<input name="name" required placeholder="例：TheDay 台北店"></label>
        <label>負責人<input name="manager" placeholder="店長姓名"></label>
        <label>電話<input name="phone" placeholder="聯絡電話"></label>
        <label class="wide">地址<input name="address" placeholder="分店地址"></label>
        <label class="wide">人員<input name="staff" placeholder="公司, 小美, 小明"></label>
        <button class="button primary" type="submit">新增分店</button>
      </form>
    </section>
    <section class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>狀態</th><th>分店</th><th>負責人</th><th>電話</th><th>地址</th><th>人員</th><th>操作</th></tr></thead>
          <tbody>${state.stores.map(storeRowHTML).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function storeRowHTML(store) {
  return `<tr>
    <td><span class="pill ${store.status === "啟用" ? "" : "warn"}">${escapeHTML(store.status)}</span></td>
    <td><input data-store-field="${store.id}:name" value="${escapeHTML(store.name)}"></td>
    <td><input data-store-field="${store.id}:manager" value="${escapeHTML(store.manager)}"></td>
    <td><input data-store-field="${store.id}:phone" value="${escapeHTML(store.phone)}"></td>
    <td><input data-store-field="${store.id}:address" value="${escapeHTML(store.address)}"></td>
    <td><input data-store-field="${store.id}:staff" value="${escapeHTML((store.staff || []).join(", "))}"></td>
    <td><button class="button" type="button" data-toggle-store="${store.id}">${store.status === "啟用" ? "停用" : "啟用"}</button></td>
  </tr>`;
}

function addProduct(form) {
  const data = Object.fromEntries(new FormData(form));
  state.products.push({
    id: id("product"),
    brand: data.brand.trim(),
    category: data.category.trim(),
    name: data.name.trim(),
    spec: data.spec.trim(),
    unit: data.unit.trim(),
    price: Number(data.price || 0),
    active: true,
    note: data.note.trim(),
  });
  saveState();
  renderProducts();
}

function addStore(form) {
  const data = Object.fromEntries(new FormData(form));
  state.stores.push({
    id: id("store"),
    name: data.name.trim(),
    manager: data.manager.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    staff: data.staff
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: "啟用",
  });
  saveState();
  renderStores();
}

async function importProducts(file) {
  const text = await file.text();
  const rows = parseCSV(text);
  const [, ...dataRows] = rows;
  const imported = dataRows
    .map((row) => ({
      id: id("product"),
      brand: row[0] || "",
      category: row[1] || "",
      name: row[2] || "",
      spec: row[3] || "",
      unit: row[4] || "",
      price: Number(String(row[5] || "0").replaceAll(",", "")),
      active: (row[6] || "是") !== "否",
      note: row[7] || "",
    }))
    .filter((product) => product.brand && product.category && product.name);
  if (!imported.length) {
    alert("沒有找到可匯入的商品，請確認 CSV 欄位。");
    return;
  }
  state.products = imported;
  saveState();
  alert(`已匯入 ${imported.length} 個商品。`);
  renderProducts();
}

function exportProductTemplate() {
  downloadCSV("TheDay商品匯入模板.csv", [
    ["品牌", "分類", "品項名稱", "規格", "單位", "價格", "是否上架", "備註"],
    ["Milbon", "洗髮", "保濕洗髮精", "500ml", "瓶", "680", "是", ""],
    ["Wella", "染膏", "Koleston 7/0", "60g", "條", "230", "是", "範例，請替換"],
  ]);
}

function exportSummary() {
  const rows = [
    ["品牌", "分類", "品項名稱", "規格", "單位", "單價", ...state.stores.map((store) => store.name), "總數量", "總金額"],
    ...aggregateOrders().map((row) => [
      row.brand,
      row.category,
      row.name,
      row.spec,
      row.unit,
      row.price,
      ...state.stores.map((store) => row.stores[store.id] || 0),
      row.totalQuantity,
      row.totalAmount,
    ]),
  ];
  downloadCSV("TheDay本期商品彙總.csv", rows);
}

function exportDetail() {
  const rows = [["分店", "人員", "批次", "送出時間", "狀態", "品牌", "分類", "品項名稱", "規格", "單位", "單價", "數量", "小計"]];
  state.orders.forEach((order) => {
    const store = state.stores.find((item) => item.id === order.storeId);
    order.items.forEach((item) => {
      rows.push([store?.name || "", order.staffName || "公司", currentBatch().title, order.createdAt, order.status, item.brand, item.category, item.name, item.spec, item.unit, item.price, item.quantity, item.subtotal]);
    });
  });
  downloadCSV("TheDay分店訂單明細.csv", rows);
}

document.addEventListener("click", (event) => {
  const login = event.target.closest("[data-login]");
  if (login) {
    if (login.dataset.login === "admin") state.user = { role: "admin" };
    if (login.dataset.login === "store") {
      state.user = {
        role: "store",
        storeId: els.storeLoginSelect.value,
        staffName: els.staffLoginSelect.value || "公司",
      };
    }
    state.view = "dashboard";
    saveState();
    render();
    return;
  }

  const nav = event.target.closest("[data-nav]");
  if (nav && state.user) {
    state.view = nav.dataset.nav;
    saveState();
    render();
    return;
  }

  if (event.target.closest("#logoutBtn")) {
    state.user = null;
    state.view = "dashboard";
    saveState();
    render();
    return;
  }

  if (event.target.closest("#resetDemoBtn")) {
    if (confirm("確定要重置測試資料？目前瀏覽器裡的訂單會被清掉。")) {
      state = defaultState();
      saveState();
      render();
    }
    return;
  }

  if (event.target.closest("#submitOrderBtn")) {
    submitOrder();
    return;
  }

  const toggleProduct = event.target.closest("[data-toggle-product]");
  if (toggleProduct) {
    const product = state.products.find((item) => item.id === toggleProduct.dataset.toggleProduct);
    if (product) product.active = !product.active;
    saveState();
    renderProducts();
    return;
  }

  const deleteProduct = event.target.closest("[data-delete-product]");
  if (deleteProduct) {
    if (confirm("確定刪除此商品？測試版會直接移除。")) {
      state.products = state.products.filter((item) => item.id !== deleteProduct.dataset.deleteProduct);
      saveState();
      renderProducts();
    }
    return;
  }

  const toggleStore = event.target.closest("[data-toggle-store]");
  if (toggleStore) {
    const store = state.stores.find((item) => item.id === toggleStore.dataset.toggleStore);
    if (store) store.status = store.status === "啟用" ? "停用" : "啟用";
    saveState();
    renderStores();
    return;
  }

  const exportButton = event.target.closest("[data-export]");
  if (exportButton) {
    if (exportButton.dataset.export === "product-template") exportProductTemplate();
    if (exportButton.dataset.export === "summary") exportSummary();
    if (exportButton.dataset.export === "detail") exportDetail();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-qty]")) updateOrderTotal();
  if (event.target.matches("#productSearch, #brandFilter, #categoryFilter")) updateOrderFilter();
  const storeField = event.target.closest("[data-store-field]");
  if (storeField) {
    const [storeId, field] = storeField.dataset.storeField.split(":");
    const store = state.stores.find((item) => item.id === storeId);
    if (store) {
      store[field] =
        field === "staff"
          ? storeField.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : storeField.value;
      saveState();
      renderLoginOptions();
    }
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("#brandFilter, #categoryFilter")) updateOrderFilter();
  if (event.target.matches("#storeLoginSelect")) renderStaffOptions();
  if (event.target.matches("#productImport") && event.target.files[0]) {
    importProducts(event.target.files[0]);
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.matches("#productForm")) {
    event.preventDefault();
    addProduct(event.target);
  }
  if (event.target.matches("#storeForm")) {
    event.preventDefault();
    addStore(event.target);
  }
});

async function init() {
  state = await loadState();
  if (serverMode) saveState();
  render();
}

init();
