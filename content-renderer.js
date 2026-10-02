"use strict";

function resizeCanvas() {
  const scale = settings.resolution / 100;
  const width = Math.max(24, Math.round(96 * scale));
  const height = Math.max(14, Math.round(54 * scale));
  if (canvas.width === width && canvas.height === height) return;
  baseCanvas.width = width;
  baseCanvas.height = height;
  baseContext = baseCanvas.getContext("2d", { alpha: false, desynchronized: true });
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext("2d", { alpha: false, desynchronized: true });
}

function updateAmbientOrigin() {
  if (!root) return;
  const player = document.querySelector("#movie_player") || video?.closest(".html5-video-player");
  const usePlayer = isWatchPage() && settings.ambientOrigin === "player" && player;
  root.classList.toggle("yal-player-origin", Boolean(usePlayer));
  if (!usePlayer) return;

  const rect = player.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  root.style.setProperty("--yal-player-left", `${rect.left}px`);
  root.style.setProperty("--yal-player-top", `${rect.top}px`);
  root.style.setProperty("--yal-player-width", `${rect.width}px`);
  root.style.setProperty("--yal-player-height", `${rect.height}px`);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const horizontalCoverage = (2 * Math.max(centerX + 100, innerWidth + 100 - centerX)) / rect.width;
  const verticalCoverage = (2 * Math.max(centerY + 100, innerHeight + 100 - centerY)) / rect.height;
  const spreadBoost = 1 + settings.spread / 200;
  const coverScale = Math.max(1, horizontalCoverage, verticalCoverage) * spreadBoost * 1.04;
  root.style.setProperty("--yal-player-cover-scale", coverScale.toFixed(3));
}

function updateStats(now) {
  if (!stats) return;
  framesSinceReport += 1;
  if (lastFrameAt) measuredFrametime = now - lastFrameAt;
  lastFrameAt = now;

  const elapsed = now - lastReportAt;
  if (elapsed >= 500) {
    measuredFps = (framesSinceReport * 1000) / elapsed;
    framesSinceReport = 0;
    lastReportAt = now;
  }

  const rows = [];
  if (settings.showFps) rows.push(`FPS <span>${measuredFps.toFixed(1)}</span>`);
  if (settings.showFrametime) rows.push(`Frame <span>${measuredFrametime.toFixed(1)} ms</span>`);
  stats.innerHTML = rows.join("<br>");
  stats.classList.toggle("yal-visible", Boolean(settings.enabled && rows.length && isWatchPage()));
}

function applySettings() {
  const style = document.documentElement.style;
  style.setProperty("--yal-opacity", String(settings.intensity / 100));
  style.setProperty("--yal-home-opacity", String(Math.min(0.82, settings.intensity / 112)));
  style.setProperty("--yal-blur", `${settings.blur}px`);
  style.setProperty("--yal-base-blur", `${Math.round(settings.blur * 1.25)}px`);
  style.setProperty("--yal-saturation", String(settings.saturation / 100));
  style.setProperty("--yal-dim", String(settings.dimming / 100));
  style.setProperty("--yal-page-shadow-size", `${settings.pageShadowSize}px`);
  style.setProperty("--yal-page-shadow-opacity", String(settings.pageShadowOpacity / 100));
  style.setProperty("--yal-box-opacity", String(settings.boxOpacity / 100));
  style.setProperty("--yal-image-opacity", String(settings.imageOpacity / 100));
  style.setProperty("--yal-video-shadow-size", `${settings.videoShadowSize}px`);
  style.setProperty("--yal-video-shadow-opacity", String(settings.videoShadowOpacity / 100));
  style.setProperty("--yal-video-brightness", String(settings.videoBrightness / 100));
  style.setProperty("--yal-video-contrast", String(settings.videoContrast / 100));
  style.setProperty("--yal-video-saturation", String(settings.videoSaturation / 100));
  style.setProperty("--yal-spread-scale", String(1 + settings.spread / 200));
  style.setProperty("--yal-debanding", String(settings.debanding / 100));
  style.setProperty("--yal-fade-duration", `${settings.fadeDuration}s`);
  resizeCanvas();
  updateDirectionMask();
  updateAmbientOrigin();

  const onHome = location.pathname === "/";
  const hasAmbientSource = Boolean((isWatchPage() && (video || previewUrl)) || (onHome && previewUrl));
  const modeAllowed = onHome || matchesViewMode();
  const active = Boolean(settings.enabled && hasAmbientSource && modeAllowed);
  document.documentElement.classList.toggle("yal-active", active);
  document.documentElement.classList.toggle("yal-home-page", onHome);
  document.documentElement.classList.toggle("yal-watch-page", isWatchPage());
  document.documentElement.classList.toggle("yal-header-shadows", settings.headerShadows);
  document.documentElement.classList.toggle("yal-text-shadows-only", settings.textShadowsOnly);
  document.documentElement.classList.toggle("yal-clean-theater", settings.cleanTheater);
  document.documentElement.classList.toggle("yal-hide-scrollbar", settings.hideScrollbar);
  document.documentElement.classList.toggle("yal-fill-video", settings.fillVideo);
  document.documentElement.classList.toggle("yal-theme-light", settings.appearance === "light");
  document.documentElement.classList.toggle("yal-theme-dark", settings.appearance === "dark");
  updateVideoCrop();
  playerButton?.classList.toggle("yal-on", Boolean(settings.enabled));
  playerButton?.setAttribute("aria-pressed", String(Boolean(settings.enabled)));
  playerButton?.setAttribute("title", `Ambient light settings (${settings.enabled ? "on" : "off"})`);
  updateStats(performance.now());
  restartRendering();
}

function drawFrame() {
  if (!isWatchPage() || !settings.enabled || !video || video.paused || video.ended || video.readyState < 2 || document.hidden) return;

  try {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    if (shouldSkipUnstableFrame()) return;

    const targetRatio = canvas.width / canvas.height;
    const videoRatio = vw / vh;
    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    if (videoRatio > targetRatio) {
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / targetRatio;
      sy = (vh - sh) / 2;
    }

    const now = performance.now();
    context.globalAlpha = settings.smoothMotion ? 0.58 : 1;
    baseContext.globalAlpha = settings.smoothMotion ? 0.46 : 1;
    baseContext.drawImage(video, sx, sy, sw, sh, 0, 0, baseCanvas.width, baseCanvas.height);
    baseContext.globalAlpha = 1;
    context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    root.classList.add("yal-frame-ready");
    updateStats(now);
    detectVideoBars(now);
  } catch (error) {
    stopRendering();
    console.debug("YouTube Ambient Light could not sample this video.", error);
  }
}

function shouldSkipUnstableFrame() {
  if (!flashProbeContext || !flashProbeCanvas) return false;
  try {
    flashProbeContext.drawImage(video, 0, 0, flashProbeCanvas.width, flashProbeCanvas.height);
    const pixels = flashProbeContext.getImageData(0, 0, flashProbeCanvas.width, flashProbeCanvas.height).data;
    let luminance = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      luminance += pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
    }
    luminance /= pixels.length / 4;

    const initialBlank = lastFrameLuminance === null && luminance < 6;
    const suddenDarkDrop = lastFrameLuminance !== null
      && lastFrameLuminance > 18
      && luminance < 8
      && luminance < lastFrameLuminance * 0.3;
    if (initialBlank || suddenDarkDrop) {
      darkFrameStreak += 1;
      if (darkFrameStreak < 4) return true;
    } else {
      darkFrameStreak = 0;
    }

    lastFrameLuminance = lastFrameLuminance === null
      ? luminance
      : lastFrameLuminance * 0.72 + luminance * 0.28;
    return false;
  } catch {
    return false;
  }
}

function stopRendering() {
  if (timer) window.clearInterval(timer);
  timer = null;
}

function restartRendering() {
  stopRendering();
  if (!settings.enabled || !video || !isWatchPage()) return;
  drawFrame();
  timer = window.setInterval(drawFrame, Math.max(50, Math.round(1000 / settings.fps)));
}

