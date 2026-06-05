let commandCenterData = window.EWALK_COMMAND_CENTER_SNAPSHOT;
let clientRegistryData = window.EWALK_CLIENT_REGISTRY;
let aiRunsData = window.EWALK_AI_RUNS || { mode: "missing", summary: { total: 0 }, ai_runs: [] };
let approvalQueueData = window.EWALK_APPROVAL_QUEUE || {
  mode: "missing",
  summary: { total: 0, pending: 0 },
  approvals: [],
};
let activeDataMode = "snapshot";
let hostStatusData = window.EWALK_HOST_STATUS || {
  mode: "missing",
  generated_at_taipei: null,
  hostname: "Mac Studio",
  health: {},
  disks: {},
  hardware: {},
  guardrails: {},
};

const statusLabel = {
  draft: "草稿",
  pending: "待批准",
  pending_review: "待阿順檢查",
  pending_approval: "待提姆先生批准",
  approved: "已批准",
  published: "已發布",
  failed: "失敗",
  success: "成功",
  blocked: "阻塞",
  rejected: "不批准",
  changes_requested: "需修改",
  expired: "已過期",
};

const categoryLabel = {
  publish: "對外發布",
  scheduled_research: "排程研究",
  billing: "金流 / 付費",
  ad_budget: "廣告預算",
  core_rule: "核心規則",
  client_commitment: "客戶承諾",
};

function formatDate(value) {
  if (!value) return "未排程";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ").replace("+08:00", "");
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function nextAction(item) {
  if (item.status === "published") return item.meta?.post_url ? "回收成效" : "補貼文連結";
  if (item.status === "approved") return "等待發布流程";
  if (item.status === "pending_approval") return "送提姆先生批准";
  if (item.status === "pending_review") return "阿順檢查";
  if (item.status === "failed") return "人工排查";
  return "補齊內容";
}

function statusClass(status) {
  if (status === "published") return "published";
  if (status === "approved") return "approved";
  if (status === "success") return "success";
  if (status === "failed" || status === "blocked" || status === "rejected" || status === "expired") return "danger";
  if (status === "draft") return "draft";
  return "pending";
}

function readinessLabel(value) {
  const labels = {
    ready_content_queue: "可進內容佇列",
    ready_profile_and_content: "可建客戶與內容",
    ready_profile: "可建客戶名冊",
    live_readonly: "正式只讀",
    needs整理: "需先整理",
    empty_folder: "待補資料",
  };
  return labels[value] || value || "待確認";
}

function readinessClass(value) {
  if (value === "ready_content_queue") return "published";
  if (value === "ready_profile_and_content") return "approved";
  if (value === "live_readonly") return "approved";
  if (value === "ready_profile") return "draft";
  return "pending";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function metricFrom(items, status) {
  return items.filter((item) => item.status === status).length;
}

function isLiveMode() {
  return activeDataMode === "live";
}

function appendEmptyRow(body, colSpan, message) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.className = "empty-row";
  td.colSpan = colSpan;
  td.textContent = message;
  tr.appendChild(td);
  body.appendChild(tr);
}

function getClientItems() {
  if (isLiveMode()) return commandCenterData.clients || [];
  return clientRegistryData?.clients || commandCenterData.clients || [];
}

function getApprovalItems() {
  if (isLiveMode()) return commandCenterData.approvals || [];
  if (approvalQueueData.approvals?.length) return approvalQueueData.approvals;
  return commandCenterData.approvals || [];
}

function getAiRunItems() {
  if (isLiveMode()) return commandCenterData.ai_runs || [];
  if (aiRunsData.ai_runs?.length) return aiRunsData.ai_runs;
  return commandCenterData.ai_runs || [];
}

function deriveSnapshot(payload) {
  const client = payload.client || payload.clients?.[0] || {};
  const contentQueue = payload.content_queue || [];
  const campaignReports = payload.campaign_reports || [];
  const clients = payload.clients || [];
  return {
    project_id: payload.project_id || "ewalk-ai-system-prod",
    firestore_verified_at: payload.firestore_verified_at || payload.loaded_at || new Date().toISOString(),
    client: {
      id: client.id || "hansik-daily-hotpot",
      name: client.name || "未命名客戶",
      industry: client.industry || "未分類",
      status: client.status || "unknown",
      logo_src: client.logo_src || client.logo_url || "",
    },
    clients,
    metrics: {
      content_total: contentQueue.length,
      published: metricFrom(contentQueue, "published"),
      approved: metricFrom(contentQueue, "approved"),
      followups_due: campaignReports.filter((item) => item.status === "due" || !item.status).length,
      pending_approvals: (payload.approvals || []).filter((item) => item.status === "pending").length,
    },
    content_queue: contentQueue,
    campaign_reports: campaignReports,
    ai_runs: payload.ai_runs || [],
    approvals: payload.approvals || [],
    live_user: payload.user || null,
    live_role: payload.role || null,
  };
}

function showDataSource(title, message, mode = "snapshot") {
  setText("dataSourceTitle", title);
  setText("dataSourceMessage", message);
  document.querySelector(".live-read")?.setAttribute("data-mode", mode);
}

function setLiveReadBusy(isBusy) {
  const button = document.getElementById("liveReadButton");
  button.disabled = isBusy;
  button.textContent = isBusy ? "讀取中..." : "讀取正式雲端資料";
}

function renderMetrics() {
  const approvals = getApprovalItems();
  setText("projectId", commandCenterData.project_id);
  setText("clientName", commandCenterData.client.name);
  setText("clientMeta", `${commandCenterData.client.industry} · ${commandCenterData.client.status}`);
  setText("metricClients", getClientItems().length);
  setText("metricTotal", commandCenterData.metrics.content_total);
  setText("metricPublished", commandCenterData.metrics.published);
  setText("metricApproved", commandCenterData.metrics.approved);
  setText("metricFollowups", commandCenterData.metrics.followups_due);
  setText("metricAiRuns", getAiRunItems().length);
  const pendingApprovalCount = approvals.filter((item) => item.status === "pending").length;
  setText("metricApprovals", pendingApprovalCount);
  setText("reviewFocusValue", `${pendingApprovalCount} 筆待批准`);
  setText(
    "reviewFocusNote",
    pendingApprovalCount > 0 ? "先看批准佇列，不會自動執行" : "目前沒有需要你決定的事項"
  );
  document.getElementById("clientLogo").src = commandCenterData.client.logo_src || commandCenterData.client.logo_data_url || "";
}

function renderHostStatus() {
  const isReady = Boolean(hostStatusData.generated_at_taipei);
  const sleepOk = hostStatusData.health?.sleep_disabled;
  const diskOk = hostStatusData.health?.disk_sleep_disabled;
  const workDiskOk = hostStatusData.health?.work_disk_mounted;
  const dataDisk = hostStatusData.disks?.data;
  const workDisk = hostStatusData.disks?.work_disk;
  setText("hostLastCheck", isReady ? hostStatusData.generated_at_taipei : "尚未產生");
  setText("hostName", hostStatusData.hostname || "Mac Studio");
  setText("hostHealth", sleepOk && diskOk ? "可長時間運作" : "需再檢查");
  setText("hostPower", `主機睡眠 ${sleepOk ? "已關閉" : "待確認"} · 磁碟睡眠 ${diskOk ? "已關閉" : "待確認"}`);
  setText("hostDisk", dataDisk ? `${dataDisk.available} 可用` : "待檢查");
  setText("hostWorkDisk", workDiskOk && workDisk ? `${workDisk.available} 可用` : "未偵測");
  setText(
    "hostGuardrails",
    "低風險任務可自動執行；發文、金流、廣告預算、正式部署仍需提姆先生批准。OpenClaw 第一階段只接測試 workspace。"
  );
  setText("hostStatusMode", isReady ? "本機狀態已更新" : "尚未產生本機狀態");
}

function queueRow(item) {
  const tr = document.createElement("tr");
  tr.dataset.status = item.status;
  tr.innerHTML = `
    <td>
      <div class="row-title">${item.title || item.source_task_id}</div>
      <div class="row-sub">${item.source_task_id}</div>
    </td>
    <td>${(item.platforms || []).join(", ")}</td>
    <td>${formatDate(item.scheduled_at)}</td>
    <td><span class="status ${statusClass(item.status)}">${statusLabel[item.status] || item.status}</span></td>
    <td>${nextAction(item)}</td>
  `;
  return tr;
}

function clientRow(item) {
  const tr = document.createElement("tr");
  const clientName = item.client_name || item.name || item.display_name || item.id || "未命名客戶";
  const sourcePath = item.source_path || item.path || item.id || "Firestore clients";
  const readiness = item.import_readiness || (isLiveMode() ? "live_readonly" : "empty_folder");
  const nextActionText = item.next_action || (isLiveMode() ? "正式資料只讀檢視，不自動執行" : "待補下一步");
  tr.innerHTML = `
    <td>
      <div class="row-title">${clientName}</div>
      <div class="row-sub">${sourcePath}</div>
    </td>
    <td>${item.industry || "未分類"}</td>
    <td>${item.status || "unknown"}</td>
    <td><span class="status ${readinessClass(readiness)}">${readinessLabel(readiness)}</span></td>
    <td>${nextActionText}</td>
  `;
  return tr;
}

function renderClientRegistry() {
  const body = document.getElementById("clientRows");
  if (!body) return;
  body.replaceChildren();
  const clients = getClientItems();
  for (const item of clients) body.appendChild(clientRow(item));
  if (!clients.length) {
    appendEmptyRow(body, 5, isLiveMode() ? "正式雲端 clients 目前沒有資料。" : "尚未產生客戶名冊。");
  }
  const mode = document.getElementById("clientRegistryMode");
  if (mode && isLiveMode()) {
    mode.textContent = `${clients.length} 位客戶；正式雲端只讀`;
  } else if (mode && clientRegistryData) {
    mode.textContent = `${clientRegistryData.count} 位客戶；正式狀態以登入讀取結果為準`;
  }
}

function renderQueue(filter = "all") {
  const body = document.getElementById("queueRows");
  body.replaceChildren();
  const rows = commandCenterData.content_queue
    .slice()
    .sort((a, b) => (b.scheduled_at || "").localeCompare(a.scheduled_at || ""))
    .filter((item) => filter === "all" || item.status === filter);
  for (const item of rows) body.appendChild(queueRow(item));
}

function renderFollowups() {
  const container = document.getElementById("followupCards");
  container.replaceChildren();
  const items = commandCenterData.campaign_reports
    .slice()
    .sort((a, b) => (a.due_at || "").localeCompare(b.due_at || ""));
  for (const item of items) {
    const card = document.createElement("article");
    card.className = "followup-card";
    card.innerHTML = `
      <strong>${item.source_task_id}</strong>
      <p>${item.checkpoint} · ${formatDate(item.due_at)}</p>
      <p>${item.assigned_to} · ${item.status === "due" ? "待回收" : "已排程"}</p>
    `;
    container.appendChild(card);
  }
}

function approvalRow(item) {
  const tr = document.createElement("tr");
  tr.dataset.status = item.status;
  const category = categoryLabel[item.category] || item.category || item.target_type || "待分類";
  const dueText = item.expires_at ? `期限 ${formatDate(item.expires_at)}` : "無期限";
  tr.innerHTML = `
    <td>
      <div class="row-title">${item.title || item.approval_id}</div>
      <div class="row-sub">${item.approval_id || item.id || item.target_id}</div>
    </td>
    <td>${item.client_name || item.client_id || "Ewalk.ai 系統"}</td>
    <td>
      <div>${category}</div>
      <div class="row-sub">${item.permission_level || "未分級"}</div>
    </td>
    <td>${item.business_value || item.request_summary || "待補說明"}</td>
    <td>${item.risk_summary || "待補風險"}</td>
    <td>
      <span class="status ${statusClass(item.status)}">${statusLabel[item.status] || item.status || "待確認"}</span>
      <div class="row-sub">${dueText}</div>
    </td>
    <td>${item.ashun_recommendation || "待阿順補建議"}</td>
  `;
  return tr;
}

function renderApprovalQueue() {
  const body = document.getElementById("approvalRows");
  if (!body) return;
  body.replaceChildren();
  const items = getApprovalItems()
    .slice()
    .sort((a, b) => {
      const statusRank = { pending: 0, changes_requested: 1, approved: 2, rejected: 3, expired: 4 };
      const aRank = statusRank[a.status] ?? 9;
      const bRank = statusRank[b.status] ?? 9;
      if (aRank !== bRank) return aRank - bRank;
      return String(b.requested_at || "").localeCompare(String(a.requested_at || ""));
    });
  for (const item of items) body.appendChild(approvalRow(item));
  if (!items.length) {
    appendEmptyRow(body, 7, isLiveMode() ? "正式雲端目前沒有批准紀錄。" : "目前沒有本機批准佇列。");
  }
  const mode = document.getElementById("approvalQueueMode");
  if (mode) {
    const pending = items.filter((item) => item.status === "pending").length;
    const sourceText = isLiveMode()
      ? "正式雲端只讀"
      : approvalQueueData.mode === "dry-run"
        ? "本機 dry-run"
        : "本機預覽或未載入";
    mode.textContent = `${pending} 筆待批准；${sourceText}`;
  }
}

function approvalLabel(item) {
  if (item.approval_required && item.approval_status === "pending") return "待批准";
  if (item.approval_status === "approved") return "已批准";
  if (item.approval_status === "rejected") return "未批准";
  return "免批准";
}

function aiRunRow(item) {
  const tr = document.createElement("tr");
  const tools = item.tool_ids?.length ? item.tool_ids.join(", ") : "未記錄工具";
  const agents = item.agent_ids?.length ? item.agent_ids.join(", ") : item.lead_agent_id || "ashun";
  tr.innerHTML = `
    <td>
      <div class="row-title">${item.title || item.run_id}</div>
      <div class="row-sub">${item.run_id}</div>
    </td>
    <td>
      <div>${agents}</div>
      <div class="row-sub">${tools}</div>
    </td>
    <td>${item.permission_level || "未分級"}</td>
    <td>${approvalLabel(item)}</td>
    <td><span class="status ${statusClass(item.status)}">${statusLabel[item.status] || item.status || "未確認"}</span></td>
    <td>${formatDate(item.created_at)}</td>
  `;
  return tr;
}

function renderAiRuns() {
  const body = document.getElementById("aiRunRows");
  if (!body) return;
  body.replaceChildren();
  const items = getAiRunItems()
    .slice()
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  for (const item of items) body.appendChild(aiRunRow(item));
  if (!items.length) {
    appendEmptyRow(body, 6, isLiveMode() ? "正式雲端目前沒有 AI 執行紀錄。" : "目前沒有本機 AI 執行紀錄。");
  }
  const mode = document.getElementById("aiRunsMode");
  if (mode) {
    const sourceText = isLiveMode()
      ? "正式雲端只讀"
      : aiRunsData.mode === "dry-run"
        ? "本機 dry-run"
        : "本機預覽或未載入";
    mode.textContent = `${items.length} 筆；${sourceText}`;
  }
}

function reloadView() {
  renderMetrics();
  renderApprovalQueue();
  renderClientRegistry();
  renderQueue(document.querySelector("[data-filter].active")?.dataset.filter || "all");
  renderFollowups();
  renderHostStatus();
  renderAiRuns();
}

function loadLocalFirebaseConfig() {
  if (window.EWALK_FIREBASE_CONFIG) return Promise.resolve(window.EWALK_FIREBASE_CONFIG);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./firebase-config.local.js";
    script.onload = () => {
      if (window.EWALK_FIREBASE_CONFIG) resolve(window.EWALK_FIREBASE_CONFIG);
      else reject(new Error("firebase-config.local.js 沒有設定 EWALK_FIREBASE_CONFIG。"));
    };
    script.onerror = () => reject(new Error("找不到 firebase-config.local.js，請先建立 Firebase Web App config。"));
    document.head.appendChild(script);
  });
}

async function loadLiveFirestore() {
  setLiveReadBusy(true);
  showDataSource("正在讀取正式雲端資料", "正在登入 Google 並讀取 Firestore，只讀不寫入。", "loading");
  try {
    const firebaseConfig = await loadLocalFirebaseConfig();
    const adapter = await import("./firestore-live-adapter.js");
    const livePayload = await adapter.loadFirebaseCommandCenter({ firebaseConfig });
    activeDataMode = "live";
    clientRegistryData = { mode: "live", count: livePayload.clients?.length || 0, clients: livePayload.clients || [] };
    aiRunsData = { mode: "live", ai_runs: livePayload.ai_runs || [] };
    approvalQueueData = { mode: "live", approvals: livePayload.approvals || [] };
    commandCenterData = deriveSnapshot(livePayload);
    reloadView();
    const email = commandCenterData.live_user?.email || "已登入使用者";
    const role = commandCenterData.live_role || "unknown";
    const formalClientCount = livePayload.clients?.length || 0;
    const formalApprovalCount = livePayload.approvals?.length || 0;
    showDataSource(
      "正式雲端資料",
      `${email} 已通過內部權限檢查；目前讀到 ${formalClientCount} 位客戶、${formalApprovalCount} 筆批准紀錄。`,
      "live"
    );
  } catch (error) {
    console.error(error);
    if (error.code === "EWALK_MISSING_ROLE" && error.user?.uid) {
      showDataSource(
        "已登入，但還沒開通內部權限",
        `${error.user.email || "這個 Google 帳號"} 還沒有 Command Center 內部權限；請阿順先完成權限設定後再讀取正式雲端資料。`,
        "error"
      );
    } else {
      showDataSource("仍維持本機預覽資料", error.message || "正式雲端資料讀取失敗。", "error");
    }
  } finally {
    setLiveReadBusy(false);
  }
}

function bindFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      for (const item of buttons) item.classList.remove("active");
      button.classList.add("active");
      renderQueue(button.dataset.filter);
    });
  }
}

function bindLiveRead() {
  document.getElementById("liveReadButton")?.addEventListener("click", loadLiveFirestore);
}

reloadView();
bindFilters();
bindLiveRead();
