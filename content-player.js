"use strict";

function createPlayerButton() {
  const existingButton = document.querySelector(".yal-player-button");
  if (existingButton?.dataset.yalButtonVersion === SCRIPT_VERSION) {
    playerButton = existingButton;
    return;
  }
  existingButton?.remove();
  const controls = document.querySelector(".ytp-right-controls");
  if (!controls) return;

  const button = document.createElement("button");
  button.className = "ytp-button yal-player-button";
  button.type = "button";
  button.setAttribute("aria-label", "Open ambient light settings");
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.dataset.yalButtonVersion = SCRIPT_VERSION;
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0-3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm0 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM2.5 11h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2Zm18 0h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2ZM4.58 3.17a1 1 0 0 1 1.42 0l.7.71A1 1 0 0 1 5.3 5.3l-.72-.71a1 1 0 0 1 0-1.42Zm13.72 13.72a1 1 0 0 1 1.42 0l.7.71A1 1 0 1 1 19 19l-.7-.7a1 1 0 0 1 0-1.42ZM20.42 3.17a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.4l.71-.72a1 1 0 0 1 1.41 0ZM6.7 16.89a1 1 0 0 1 0 1.41l-.7.71a1 1 0 0 1-1.42-1.41l.71-.71a1 1 0 0 1 1.41 0Z"/></svg>`;
  controls.prepend(button);
  playerButton = button;
  applySettings();
}

function findVideo() {
  if (!isWatchPage()) {
    video = null;
    stopRendering();
    root?.classList.remove("yal-frame-ready");
    if (!previewUrl) updateHomePreview();
    return;
  }

  const nextVideo = document.querySelector("video.html5-main-video") || document.querySelector("video");
  if (nextVideo === video) {
    createPlayerButton();
    return;
  }

  video = nextVideo;
  lastFrameLuminance = null;
  darkFrameStreak = 0;
  if (video) {
    video.addEventListener("play", restartRendering);
    video.addEventListener("loadeddata", restartRendering);
    video.addEventListener("pause", drawFrame);
  }
  createPlayerButton();
  applySettings();
}

