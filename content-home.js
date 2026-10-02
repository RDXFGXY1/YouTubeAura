"use strict";

function thumbnailFromElement(element) {
  const cardSelector = "ytd-thumbnail, a#thumbnail, a[href*='/watch'], yt-lockup-view-model, .yt-lockup-view-model-wiz, ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer";
  const thumbnail = element?.closest?.(cardSelector) || element?.querySelector?.(cardSelector);
  const image = thumbnail?.querySelector?.("img");
  const imageUrl = image?.currentSrc || image?.src || "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const anchor = thumbnail?.querySelector?.('a[href*="/watch?v="], a[href^="/shorts/"]');
  if (!anchor?.href) return "";
  const parsed = new URL(anchor.href, location.origin);
  const videoId = parsed.pathname.startsWith("/shorts/")
    ? parsed.pathname.split("/")[2]
    : parsed.searchParams.get("v");
  return videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : "";
}

function findHomeThumbnail() {
  const candidates = document.querySelectorAll(
    "ytd-rich-grid-media a[href*='/watch'], ytd-rich-item-renderer a[href*='/watch'], yt-lockup-view-model a[href*='/watch'], a#thumbnail[href*='/watch']"
  );
  for (const anchor of candidates) {
    const url = thumbnailFromElement(anchor);
    if (url) return url;
  }
  const image = [...document.querySelectorAll("ytd-browse img, ytd-rich-grid-renderer img")]
    .find((candidate) => candidate.currentSrc?.startsWith("http") || candidate.src?.startsWith("http"));
  return image?.currentSrc || image?.src || "";
}

function updateHomePreview(element) {
  if (location.pathname !== "/") return;
  const url = thumbnailFromElement(element)
    || findHomeThumbnail();
  if (url) setAmbientPreview(url);
}

function setWatchPreviewFromUrl() {
  if (!isWatchPage()) return;
  const params = new URLSearchParams(location.search);
  const videoId = location.pathname.startsWith("/shorts/")
    ? location.pathname.split("/")[2]
    : params.get("v");
  if (videoId) setAmbientPreview(`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`);
}

