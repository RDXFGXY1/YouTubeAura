"use strict";

function isWatchPage() {
  return location.pathname === "/watch" || location.pathname.startsWith("/shorts/");
}

function createAmbientLayer() {
  if (root) return;
  root = document.createElement("div");
  root.id = "yal-ambient-root";
  root.setAttribute("aria-hidden", "true");

  preview = document.createElement("div");
  preview.id = "yal-ambient-preview";
  preview.className = "yal-preview-layer";

  previewAlt = document.createElement("div");
  previewAlt.id = "yal-ambient-preview-alt";
  previewAlt.className = "yal-preview-layer";

  baseCanvas = document.createElement("canvas");
  baseCanvas.id = "yal-ambient-base-canvas";
  baseCanvas.width = 96;
  baseCanvas.height = 54;
  baseContext = baseCanvas.getContext("2d", { alpha: false, desynchronized: true });

  canvas = document.createElement("canvas");
  canvas.id = "yal-ambient-canvas";
  canvas.width = 96;
  canvas.height = 54;
  context = canvas.getContext("2d", { alpha: false, desynchronized: true });

  analysisCanvas = document.createElement("canvas");
  analysisCanvas.width = 64;
  analysisCanvas.height = 36;
  analysisContext = analysisCanvas.getContext("2d", { willReadFrequently: true });

  flashProbeCanvas = document.createElement("canvas");
  flashProbeCanvas.width = 12;
  flashProbeCanvas.height = 7;
  flashProbeContext = flashProbeCanvas.getContext("2d", { willReadFrequently: true });

  const shade = document.createElement("div");
  shade.id = "yal-ambient-shade";
  noise = document.createElement("div");
  noise.id = "yal-ambient-noise";
  root.append(preview, previewAlt, baseCanvas, canvas, shade, noise);
  document.body.prepend(root);

  stats = document.createElement("div");
  stats.id = "yal-performance-stats";
  stats.setAttribute("aria-live", "off");
  document.body.append(stats);

  settingsPanel = document.createElement("aside");
  settingsPanel.id = "yal-settings-panel";
  settingsPanel.setAttribute("role", "dialog");
  settingsPanel.setAttribute("aria-label", "Ambient light settings");
  settingsPanel.setAttribute("aria-hidden", "true");

  const closeButton = document.createElement("button");
  closeButton.id = "yal-settings-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close ambient light settings");
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", () => toggleSettingsPanel(false));

  const settingsFrame = document.createElement("iframe");
  settingsFrame.id = "yal-settings-frame";
  settingsFrame.title = "Ambient light settings";
  settingsFrame.src = chrome.runtime.getURL("popup.html?embedded=1");
  settingsPanel.append(closeButton, settingsFrame);
  document.body.append(settingsPanel);
}

function setAmbientPreview(url) {
  if (!url || !/^https?:\/\//i.test(url) || url === previewUrl || !preview || !previewAlt) return;
  previewUrl = url;
  const current = activePreview === 0 ? preview : previewAlt;
  const next = activePreview === 0 ? previewAlt : preview;
  next.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
  next.classList.add("yal-visible");
  current.classList.remove("yal-visible");
  activePreview = activePreview === 0 ? 1 : 0;
  root.classList.remove("yal-frame-ready");
  if (!document.documentElement.classList.contains("yal-active")) applySettings();
}

