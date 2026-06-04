const accountKey = "star-color-training-accounts-v2";
const sessionKey = "star-color-training-session-v2";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const prompts = {
  copywriter({ audience, offer, area }) {
    return `請你成為 STAR Color AI 染髮師的社群企劃助理。

我要經營 ${area} 的染髮客源，主要客群是：${audience}。
本週主打服務是：${offer}。

請幫我規劃 7 天 IG/FB 貼文與 Reels 主題，每天都要包含：
1. 主題
2. 1 秒鉤子
3. 文案大綱
4. Reels 畫面建議
5. 社群圖畫面建議
6. CTA
7. LINE 諮詢引導

內容必須符合 STAR Color：AI 智能染髮、底色判斷、價格透明、配方紀錄、專業親切。
不要誇大效果，不要保證染出指定成果，每篇都要能導向私訊、LINE 或預約。`;
  },
  image({ headline, cta, size }) {
    return `請製作一張 STAR Color AI 染髮師社群圖，尺寸 ${size}。

視覺風格：
高級黑、乾淨科技感、專業美業質感、AI 髮色分析介面、色環元素、清楚留白、字體可閱讀。

主標題：
「${headline}」

畫面內容：
一位自然時尚的染髮客人，旁邊有 AI 髮色分析介面與色環。不要廉價促銷感，不要過度科幻，不要文字爆版。

下方 CTA：
「${cta}」`;
  },
  script({ caseType, targetColor }) {
    const map = {
      底色不均: "你的髮根跟髮尾底色差比較明顯，如果直接染成目標色，可能會出現髮根亮、髮尾暗或色帶不均的狀況。",
      髮質偏乾: "你的髮質目前偏乾，這次如果想要呈現有光澤的髮色，需要把染中保養一起考慮進來。",
      退色風險: "這個色系很漂亮，但退色速度會受到髮質、洗髮習慣與居家保養影響。",
      白髮補染: "你的白髮比例需要先看分布位置，這會影響配方遮蓋與整體髮色自然度。",
    };
    const addOn = {
      底色不均: "建議加做染前修護或分段處理，讓顏色更穩。",
      髮質偏乾: "建議搭配染中保養，讓顏色質感和髮絲光澤更好。",
      退色風險: "建議帶居家護理，讓髮色維持時間更漂亮。",
      白髮補染: "建議現場做底色判斷，再決定遮白與目標色的平衡。",
    };
    return `你想做的 ${targetColor} 方向很適合走柔和質感路線，我先幫你看目前髮況。

以目前狀況來看，重點會是「${caseType}」：
${map[caseType]}

所以這次不是只有選顏色，還要先把底色與髮質風險處理好。
${addOn[caseType]}

你可以先傳自然光的正面、側面、髮尾近照給我，我會先幫你做初步髮色分析，再建議適合的染髮方案與預約時間。`;
  },
  upsell({ audience, age, service, tone }) {
    return `請你成為 STAR Color AI 染髮師的現場服務顧問。

客群：${audience}
年齡：${age}
想提升的服務項目：${service}
語氣：${tone}

請幫我設計一段可以在現場或 LINE 使用的客單提升話術。

要求：
1. 先同理客人在意的事，例如怕受損、怕失敗、怕被推銷、怕多花錢。
2. 用「不處理可能造成的風險」來說明服務價值，但不要恐嚇。
3. 讓 ${service} 聽起來是專業安全控管，不是硬推銷。
4. 給客人選擇權，提供基礎方案與推薦方案。
5. 話術要自然、親切、專業，適合美業現場使用。
6. 不要保證效果，不要誇大療效。

請輸出：
- 30 秒現場口語話術
- LINE 文字版話術
- 客人說「我再想想」時的回覆
- 老師提醒學員的使用重點`;
  },
};

function readAccounts() {
  return JSON.parse(localStorage.getItem(accountKey) || "[]");
}

function writeAccounts(accounts) {
  localStorage.setItem(accountKey, JSON.stringify(accounts));
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function normalizeAccount({ branch, name, password }) {
  return {
    id: `${branch.trim()}-${name.trim()}`.toLowerCase(),
    branch: branch.trim(),
    name: name.trim(),
    password,
    disabled: false,
    createdAt: new Date().toISOString(),
  };
}

function showToast(message = "已複製") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1500);
}

function setSession(account) {
  localStorage.setItem(sessionKey, JSON.stringify({ id: account.id }));
  renderApp(account);
}

function getSessionAccount() {
  const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
  if (!session) return null;
  return readAccounts().find((account) => account.id === session.id && !account.disabled) || null;
}

function renderApp(account) {
  $("#authScreen").hidden = true;
  $("#trainingApp").hidden = false;
  $("#userBranch").textContent = account.branch;
  $("#userName").textContent = account.name;
  renderAccounts();
  updatePrompts();
  renderPageFromHash();
}

function renderAuth() {
  $("#authScreen").hidden = false;
  $("#trainingApp").hidden = true;
}

function renderAccounts() {
  const accounts = readAccounts();
  const table = $("#accountTable");
  table.innerHTML = `
    <div class="account-head">
      <span>分店</span><span>英文名</span><span>狀態</span><span>操作</span>
    </div>
    ${accounts
      .map(
        (account) => `
        <div class="account-row">
          <span>${account.branch}</span>
          <strong>${account.name}</strong>
          <span>${account.disabled ? "已停用" : "可登入"}</span>
          <span>
            <button type="button" data-toggle-account="${account.id}">${account.disabled ? "啟用" : "停用"}</button>
            <button type="button" class="danger" data-delete-account="${account.id}">刪除</button>
          </span>
        </div>
      `,
      )
      .join("")}
  `;
}

function updatePrompts() {
  $("#copyPrompt").textContent = prompts.copywriter(formValues($("#copyForm")));
  $("#imagePrompt").textContent = prompts.image(formValues($("#imageForm")));
  $("#scriptOutput").textContent = prompts.script(formValues($("#scriptForm")));
  $("#upsellOutput").textContent = prompts.upsell(formValues($("#upsellForm")));
  $("#upsellToolsOutput").textContent = prompts.upsell(formValues($("#upsellFormTools")));
}

async function copyText(id) {
  const text = document.getElementById(id)?.textContent?.trim();
  if (!text) return;
  await navigator.clipboard.writeText(text);
  showToast("指令已複製");
}

function currentPageId() {
  const id = window.location.hash.replace("#", "") || "overview";
  return document.getElementById(id)?.matches("[data-page]") ? id : "overview";
}

function renderPageFromHash() {
  const id = currentPageId();
  $$("[data-page]").forEach((page) => {
    page.hidden = page.id !== id;
  });
  $$(".nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
  window.scrollTo({ top: 0 });
}

$$("[data-auth-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    $$("[data-auth-tab]").forEach((tab) => tab.classList.toggle("active", tab === button));
    $$(".auth-form").forEach((form) => form.classList.toggle("active", form.id === `${button.dataset.authTab}Form`));
  });
});

$("#registerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const account = normalizeAccount(formValues(event.currentTarget));
  const accounts = readAccounts();
  if (accounts.some((item) => item.id === account.id)) {
    showToast("這個帳號已存在");
    return;
  }
  accounts.push(account);
  writeAccounts(accounts);
  showToast("帳號已建立");
  setSession(account);
});

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const login = normalizeAccount(formValues(event.currentTarget));
  const account = readAccounts().find(
    (item) => item.id === login.id && item.password === login.password && !item.disabled,
  );
  if (!account) {
    showToast("帳號或密碼不正確");
    return;
  }
  setSession(account);
});

$("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(sessionKey);
  renderAuth();
});

$("#copyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updatePrompts();
});

$("#imageForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updatePrompts();
});

$("#scriptForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updatePrompts();
});

$("#upsellForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updatePrompts();
});

$("#upsellFormTools").addEventListener("submit", (event) => {
  event.preventDefault();
  updatePrompts();
});

$$(".copy-btn").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copyTarget));
});

$("#accountTable").addEventListener("click", (event) => {
  const toggleId = event.target.dataset.toggleAccount;
  const deleteId = event.target.dataset.deleteAccount;
  if (!toggleId && !deleteId) return;

  const accounts = readAccounts();
  const nextAccounts = deleteId
    ? accounts.filter((account) => account.id !== deleteId)
    : accounts.map((account) =>
        account.id === toggleId ? { ...account, disabled: !account.disabled } : account,
      );
  writeAccounts(nextAccounts);
  renderAccounts();

  const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
  const removedCurrent = deleteId && session?.id === deleteId;
  const disabledCurrent = toggleId && session?.id === toggleId && nextAccounts.find((item) => item.id === toggleId)?.disabled;
  if (removedCurrent || disabledCurrent) {
    localStorage.removeItem(sessionKey);
    renderAuth();
  }
});

window.addEventListener("hashchange", renderPageFromHash);

const currentAccount = getSessionAccount();
if (currentAccount) {
  renderApp(currentAccount);
} else {
  renderAuth();
}
