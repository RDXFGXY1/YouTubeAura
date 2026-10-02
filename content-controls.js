"use strict";

function toggleSettingsPanel(force) {
  if (!settingsPanel?.isConnected) settingsPanel = document.querySelector("#yal-settings-panel");
  if (!settingsPanel) return;
  const open = typeof force === "boolean" ? force : !settingsPanel.classList.contains("yal-open");
  settingsPanel.classList.toggle("yal-open", open);
  settingsPanel.setAttribute("aria-hidden", String(!open));
  playerButton?.setAttribute("aria-expanded", String(open));
}

function matchesViewMode() {
  const fullscreen = Boolean(document.fullscreenElement);
  const theater = Boolean(document.querySelector("ytd-watch-flexy[theater]"));
  if (settings.viewMode === "fullscreen") return fullscreen;
  if (settings.viewMode === "theater") return theater && !fullscreen;
  if (settings.viewMode === "small") return !theater && !fullscreen;
  return true;
}

function updateDirectionMask() {
  const edge = Math.max(5, settings.edgeSize);
  const start = Math.min(edge - 1, edge * settings.fadeStart / 100);
  const middle = start + (edge - start) * 0.55;
  const alpha = Math.max(0.05, Math.min(0.95, settings.fadeCurve / 100));
  const gradients = [];
  const gradient = (direction) => `linear-gradient(${direction}, black 0%, black ${start.toFixed(1)}%, rgba(0,0,0,${alpha}) ${middle.toFixed(1)}%, transparent ${edge}%)`;
  if (settings.directionTop) gradients.push(gradient("to bottom"));
  if (settings.directionRight) gradients.push(gradient("to left"));
  if (settings.directionBottom) gradients.push(gradient("to top"));
  if (settings.directionLeft) gradients.push(gradient("to right"));
  const mask = gradients.length ? gradients.join(", ") : "linear-gradient(transparent, transparent)";
  canvas.style.maskImage = mask;
  canvas.style.webkitMaskImage = mask;
  noise.style.maskImage = mask;
  noise.style.webkitMaskImage = mask;
}

