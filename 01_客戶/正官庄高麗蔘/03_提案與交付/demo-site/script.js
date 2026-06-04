const loginView = document.querySelector("#loginView");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const roleSelect = document.querySelector("#roleSelect");
const adminQuickLogin = document.querySelector("#adminQuickLogin");
const logoutButton = document.querySelector("#logoutButton");
const roleBadge = document.querySelector("#roleBadge");
const profileName = document.querySelector("#profileName");
const profileScope = document.querySelector("#profileScope");
const pageTitle = document.querySelector("#pageTitle");
const pageKicker = document.querySelector("#pageKicker");
const toast = document.querySelector("#toast");
const auditForm = document.querySelector("#auditForm");
const copyGeneratorForm = document.querySelector("#copyGeneratorForm");
const imageGeneratorForm = document.querySelector("#imageGeneratorForm");
const reviewPermission = document.querySelector("#reviewPermission");

const roleMap = {
  staff: {
    label: "一般員工",
    name: "Marketing Team",
    scope: "僅可查看自己的送審紀錄",
    admin: false,
  },
  lead: {
    label: "行銷主管",
    name: "Marketing Lead",
    scope: "可查看部門素材與主管審核",
    admin: false,
  },
  legal: {
    label: "法規／法務",
    name: "Legal Review",
    scope: "可覆核紅黃燈素材與規則",
    admin: true,
  },
  admin: {
    label: "管理者",
    name: "System Admin",
    scope: "可查看完整審核紀錄與系統設定",
    admin: true,
  },
};

let currentRole = "staff";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setRole(role) {
  currentRole = role;
  const profile = roleMap[role] || roleMap.staff;
  roleBadge.textContent = profile.label;
  profileName.textContent = profile.name;
  profileScope.textContent = profile.scope;

  document.querySelectorAll("[data-admin-only]").forEach((item) => {
    item.style.display = profile.admin ? "" : "none";
  });

  if (reviewPermission) {
    if (profile.admin) {
      reviewPermission.textContent = "管理者進階登入已啟用。可查看全系統生成、稽核、退件與通過紀錄。";
      reviewPermission.classList.add("admin");
    } else {
      reviewPermission.textContent = "一般員工僅能查看自己的送審紀錄。完整紀錄需管理者進階登入。";
      reviewPermission.classList.remove("admin");
    }
  }
}

function login(role) {
  setRole(role);
  loginView.hidden = true;
  appShell.hidden = false;
  navigateTo("dashboard");
  showToast(`${roleMap[role].label}登入成功`);
}

function logout() {
  appShell.hidden = true;
  loginView.hidden = false;
  showToast("已登出 Demo 系統");
}

function navigateTo(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  if (pageId === "admin-settings" && !roleMap[currentRole].admin) {
    showToast("管理者設定需進階登入");
    return;
  }

  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  target.classList.add("active");

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === pageId);
  });

  pageTitle.textContent = target.dataset.title || "正官庄 AI 行銷稽核系統";
  pageKicker.textContent = target.dataset.kicker || "INTERNAL";
  window.location.hash = pageId;
}

function analyzeCopy(text) {
  const rules = [
    {
      term: "改善疲勞",
      level: "red",
      label: "紅燈",
      reason: "涉及療效暗示",
      suggestion: "改為日常精神補給或生活保養",
    },
    {
      term: "預防感冒",
      level: "red",
      label: "紅燈",
      reason: "涉及疾病預防",
      suggestion: "移除",
    },
    {
      term: "增強免疫力",
      level: "amber",
      label: "黃燈",
      reason: "需確認健康食品核准功效",
      suggestion: "送法規覆核或改寫",
    },
    {
      term: "改善睡眠",
      level: "red",
      label: "紅燈",
      reason: "涉及療效暗示",
      suggestion: "改為睡前日常保養情境",
    },
    {
      term: "醫師推薦",
      level: "red",
      label: "紅燈",
      reason: "涉及醫療背書",
      suggestion: "移除醫療背書",
    },
  ];

  return rules.filter((rule) => text.includes(rule.term));
}

function renderAudit(text) {
  const issues = analyzeCopy(text);
  const banner = document.querySelector("#auditResult .audit-banner");
  const highlightCopy = document.querySelector("#highlightCopy");
  const tbody = document.querySelector("#auditTableBody");
  const safeRewrite = document.querySelector("#safeRewrite");

  let marked = text;
  issues.forEach((issue) => {
    marked = marked.replaceAll(issue.term, `<mark>${issue.term}</mark>`);
  });

  highlightCopy.innerHTML = marked || "尚未輸入文案";

  if (!issues.length) {
    banner.className = "audit-banner green";
    banner.innerHTML = "<strong>綠燈</strong><span>未偵測到主要疾病、療效或醫療暗示。可送審。</span>";
    tbody.innerHTML = `
      <tr>
        <td>無</td>
        <td><span class="pill green">綠燈</span></td>
        <td>未偵測高風險詞</td>
        <td>可進入人工覆核</td>
      </tr>
    `;
    safeRewrite.textContent = "正官庄高麗蔘，讓日常保養多一份穩妥心意。";
    showToast("文案初步通過");
    return;
  }

  const hasRed = issues.some((issue) => issue.level === "red");
  banner.className = hasRed ? "audit-banner red" : "audit-banner green";
  banner.innerHTML = hasRed
    ? "<strong>紅燈</strong><span>文案含疾病預防或療效暗示，禁止送出。</span>"
    : "<strong>黃燈</strong><span>文案需補 SKU 核准功效或送法規覆核。</span>";

  tbody.innerHTML = issues
    .map(
      (issue) => `
        <tr>
          <td>${issue.term}</td>
          <td><span class="pill ${issue.level}">${issue.label}</span></td>
          <td>${issue.reason}</td>
          <td>${issue.suggestion}</td>
        </tr>
      `,
    )
    .join("");

  safeRewrite.textContent =
    "正官庄高麗蔘，給忙碌日常一份溫潤保養。季節轉換時，把照顧自己和家人的心意，變成每天都能做到的小習慣。";
  showToast(hasRed ? "已攔截高風險文案" : "文案需法規覆核");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login(roleSelect.value);
});

adminQuickLogin.addEventListener("click", () => {
  roleSelect.value = "admin";
  login("admin");
});

logoutButton.addEventListener("click", logout);

document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(link.dataset.pageLink);
  });
});

document.querySelectorAll("[data-page-link-button]").forEach((button) => {
  button.addEventListener("click", () => navigateTo(button.dataset.pageLinkButton));
});

auditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(auditForm);
  renderAudit(String(formData.get("auditText") || ""));
});

copyGeneratorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("已完成生成前稽核，模擬 ChatGPT 產出安全版本");
});

imageGeneratorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("已完成 Prompt 稽核，模擬 image2 生成預覽");
});

document.querySelector("#sendCopyReview").addEventListener("click", () => {
  showToast("文案已送主管審核，紀錄寫入審核紀錄");
});

document.querySelector("#runVideoAudit").addEventListener("click", () => {
  showToast("影片稽查完成，已標記 3 個風險時間碼");
});

window.addEventListener("hashchange", () => {
  if (!appShell.hidden) {
    navigateTo(window.location.hash.replace("#", "") || "dashboard");
  }
});

setRole("staff");
