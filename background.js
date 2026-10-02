async function refreshOpenYouTubeTabs() {
  const contentFiles = [
    "content-state.js",
    "content-layer.js",
    "content-home.js",
    "content-controls.js",
    "content-crop.js",
    "content-renderer.js",
    "content-player.js",
    "content-main.js"
  ];
  const tabs = await chrome.tabs.query({ url: ["https://www.youtube.com/*"] });
  await Promise.allSettled(tabs.map(async (tab) => {
    if (!tab.id) return;
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["ambient.css"] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: contentFiles });
  }));
}

chrome.runtime.onInstalled.addListener(() => {
  refreshOpenYouTubeTabs().catch(() => {});
});
