const FRAME_ID = "env-guard-frame";

function ensureFrame() {
  let frame = document.getElementById(FRAME_ID);
  if (!frame) {
    frame = document.createElement("div");
    frame.id = FRAME_ID;
    (document.documentElement || document.body).appendChild(frame);
  }
  return frame;
}

function matchRule(url, rule) {
  if (rule.isRegex) {
    try {
      const re = new RegExp(rule.pattern);
      return re.test(url);
    } catch {
      return false;
    }
  }
  const escaped = rule.pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("^" + escaped.replace(/\*/g, ".*") + "$");
  return re.test(url);
}

function pickRule(url, rules) {
  return rules.find(r => matchRule(url, r)) || null;
}

async function applyCue() {
  const frame = ensureFrame();
  const [{ rules = [] }, { settings = {} }] = await Promise.all([
    chrome.storage.sync.get("rules"),
    chrome.storage.sync.get("settings")
  ]);

  const enabled = settings.enabled ?? true;
  if (!enabled) {
    frame.classList.add("eg-hidden");
    return;
  }

  const rule = pickRule(location.href, rules);
  if (!rule) {
    frame.classList.add("eg-hidden");
    return;
  }

  const thickness = rule.width ?? settings.thickness ?? 8;
  frame.style.setProperty("--eg-color", rule.color || "#d92d20");
  frame.style.setProperty("--eg-thickness", `${thickness}px`);
  frame.classList.remove("eg-hidden");

  if (settings.pulse) frame.classList.add("eg-pulse");
  else frame.classList.remove("eg-pulse");
}

chrome.storage.onChanged.addListener(() => applyCue());

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "EG_APPLY_CUE") applyCue();
});

applyCue();
