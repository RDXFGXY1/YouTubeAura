"use strict";

function handleNavigation() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    video = null;
    playerButton = null;
    document.documentElement.classList.remove("yal-active");
    root?.classList.remove("yal-frame-ready");
    if (settings.resetBarsNextVideo) {
      detectedHorizontalCrop = 0;
      detectedVerticalCrop = 0;
    }
    detectionAvailable = true;
    lastDetectionAt = 0;
    horizontalCandidate = 0;
    verticalCandidate = 0;
    horizontalCandidateFrames = 0;
    verticalCandidateFrames = 0;
    lastFrameLuminance = null;
    darkFrameStreak = 0;
  }
  if (isWatchPage()) setWatchPreviewFromUrl();
  else updateHomePreview();
  for (const delay of [150, 500, 1200]) window.setTimeout(findVideo, delay);
}

chrome.storage.sync.get(DEFAULTS, (stored) => {
  settings = { ...DEFAULTS, ...stored };
  createAmbientLayer();
  if (isWatchPage()) setWatchPreviewFromUrl();
  else updateHomePreview();
  findVideo();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  for (const [key, change] of Object.entries(changes)) {
    if (key in DEFAULTS) settings[key] = change.newValue;
  }
  applySettings();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "YAL_SETTINGS_PATCH" || !message.patch) return;
  for (const [key, value] of Object.entries(message.patch)) {
    if (key in DEFAULTS) settings[key] = value;
  }
  applySettings();
});

document.addEventListener("yt-navigate-finish", handleNavigation);
document.addEventListener("visibilitychange", restartRendering);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settingsPanel?.classList.contains("yal-open")) {
    event.preventDefault();
    toggleSettingsPanel(false);
    return;
  }
  const isTyping = event.target instanceof Element
    && event.target.closest("input, textarea, [contenteditable='true']");
  if (event.ctrlKey || event.altKey || event.metaKey || isTyping) return;
  const shortcuts = {
    a: "enabled",
    b: "removeBlackBars",
    v: "removeBlackSidebars",
    s: "fillVideo"
  };
  const key = shortcuts[event.key.toLowerCase()];
  if (!key) return;
  event.preventDefault();
  settings[key] = !settings[key];
  chrome.storage.sync.set({ [key]: settings[key] });
  applySettings();
});
document.addEventListener("fullscreenchange", applySettings);
var originUpdateFrame = 0;
var scheduleOriginUpdate = () => {
  if (originUpdateFrame) return;
  originUpdateFrame = requestAnimationFrame(() => {
    originUpdateFrame = 0;
    updateAmbientOrigin();
  });
};
window.addEventListener("resize", scheduleOriginUpdate, { passive: true });
window.addEventListener("scroll", scheduleOriginUpdate, { passive: true });
document.addEventListener("pointerover", (event) => {
  if (location.pathname !== "/" || !(event.target instanceof Element)) return;
  const now = performance.now();
  if (now - lastHomeHoverAt < 220) return;
  lastHomeHoverAt = now;
  updateHomePreview(event.target);
}, { passive: true });
document.addEventListener("click", (event) => {
  const ambientButton = event.target instanceof Element
    ? event.target.closest(".yal-player-button")
    : null;
  if (ambientButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    playerButton = ambientButton;
    toggleSettingsPanel();
    return;
  }
  if (event.target instanceof Element) {
    const thumbnailUrl = thumbnailFromElement(event.target);
    if (thumbnailUrl) setAmbientPreview(thumbnailUrl);
  }
  if (event.target instanceof Element && event.target.closest(".ytp-size-button")) {
    window.setTimeout(applySettings, 120);
  }
}, true);
mutationObserver = new MutationObserver(() => {
  if (mutationScheduled) return;
  mutationScheduled = true;
  const run = () => {
    mutationScheduled = false;
    findVideo();
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 350 });
  else window.setTimeout(run, 180);
});
mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
globalThis.__YAL_CLEANUP__ = () => {
  mutationObserver?.disconnect();
  window.removeEventListener("resize", scheduleOriginUpdate);
  window.removeEventListener("scroll", scheduleOriginUpdate);
  if (originUpdateFrame) cancelAnimationFrame(originUpdateFrame);
  stopRendering();
};

