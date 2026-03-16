const pattern = document.getElementById("pattern");
const isRegex = document.getElementById("is-regex");
const env = document.getElementById("env");
const color = document.getElementById("color");
const colorHex = document.getElementById("color-hex");
const swatch = document.getElementById("swatch");
const borderWidth = document.getElementById("border-width");
const widthVal = document.getElementById("width-val");
const list = document.getElementById("rules-list");
const form = document.getElementById("rule-form");

borderWidth.addEventListener("input", () => {
  widthVal.textContent = `${borderWidth.value}px`;
});

function syncColor(hex) {
  const v = hex.toLowerCase();
  color.value = v;
  colorHex.value = v;
  swatch.style.background = v;
}

color.addEventListener("input", () => syncColor(color.value));
colorHex.addEventListener("input", () => {
  if (/^#([0-9a-f]{6})$/i.test(colorHex.value)) syncColor(colorHex.value);
});

function render(rules) {
  list.innerHTML = "";
  rules.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="rule-meta">
        <span class="rule-dot" style="background:${r.color}"></span>
        <span>${r.pattern}</span>
      </div>
      <div class="rule-actions">
        <button data-i="${i}" data-action="delete">Delete</button>
      </div>`;
    list.appendChild(li);
  });
}

async function loadRules() {
  const { rules = [] } = await chrome.storage.sync.get("rules");
  render(rules);
}

async function notifyActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "EG_APPLY_CUE" });
  } catch {
    // Ignore tabs without content script
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { rules = [] } = await chrome.storage.sync.get("rules");
  rules.push({
    pattern: pattern.value.trim(),
    isRegex: isRegex.checked,
    env: env.value,
    color: colorHex.value,
    width: Number(borderWidth.value)
  });
  await chrome.storage.sync.set({ rules });
  form.reset();
  syncColor("#d92d20");
  isRegex.checked = true;
  borderWidth.value = 4;
  widthVal.textContent = "4px";
  loadRules();
  notifyActiveTab();
});

list.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const idx = Number(btn.dataset.i);
  const { rules = [] } = await chrome.storage.sync.get("rules");
  rules.splice(idx, 1);
  await chrome.storage.sync.set({ rules });
  loadRules();
  notifyActiveTab();
});

syncColor("#d92d20");
loadRules();
