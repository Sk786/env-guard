async function sendCueUpdate(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "EG_APPLY_CUE" });
  } catch {
    // Ignore tabs without the content script
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    sendCueUpdate(tabId);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  sendCueUpdate(activeInfo.tabId);
});

chrome.storage.onChanged.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    for (const t of tabs) sendCueUpdate(t.id);
  });
});
