document.documentElement.classList.toggle("embedded", new URLSearchParams(location.search).has("embedded"));

const DEFAULTS = {
  enabled: true,
  intensity: 78,
  blur: 72,
  saturation: 145,
  dimming: 24,
  fps: 12,
  resolution: 100,
  smoothMotion: true,
  showFps: false,
  showFrametime: false,
  pageShadowSize: 15,
  pageShadowOpacity: 30,
  headerShadows: true,
  textShadowsOnly: true,
  boxOpacity: 10,
  imageOpacity: 100,
  cleanTheater: false,
  hideScrollbar: false,
  videoSize: 100,
  videoShadowSize: 20,
  videoShadowOpacity: 50,
  removeBlackBars: true,
  removeBlackSidebars: true,
  removeColoredBars: false,
  barDetectionOffset: 2,
  blackBarsSize: 0,
  blackSidebarsSize: 0,
  resetBarsNextVideo: true,
  fillVideo: false,
  videoBrightness: 100,
  videoContrast: 100,
  videoSaturation: 100,
  directionTop: true,
  directionRight: true,
  directionBottom: true,
  directionLeft: true,
  edgeSize: 12,
  spread: 50,
  fadeStart: 15,
  fadeCurve: 35,
  debanding: 8,
  fadeDuration: 1.5,
  appearance: "default",
  viewMode: "all",
  ambientOrigin: "player"
};

const rangeIds = [
  "fps", "resolution", "pageShadowSize", "pageShadowOpacity", "boxOpacity",
  "imageOpacity", "videoSize", "videoShadowSize", "videoShadowOpacity",
  "barDetectionOffset", "blackBarsSize", "blackSidebarsSize",
  "videoBrightness", "videoContrast", "videoSaturation",
  "intensity", "blur", "saturation", "dimming", "edgeSize", "spread",
  "fadeStart", "fadeCurve", "debanding", "fadeDuration"
];

function renderValues() {
  for (const id of rangeIds) {
    const range = document.getElementById(id);
    const value = range.value;
    const suffix = id === "fadeDuration" ? "s" : ["blur", "pageShadowSize", "videoShadowSize"].includes(id)
      ? "px"
      : id === "fps" ? " fps" : "%";
    document.querySelector(`[data-for="${id}"]`).textContent = `${value}${suffix}`;
    const progress = ((Number(value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
    range.style.setProperty("--range-progress", `${progress}%`);
  }
}

function createSectionNavigation() {
  const nav = document.getElementById("section-nav");
  const sections = [...document.querySelectorAll("main > section")];
  const shortNames = {
    "Page content": "Page",
    "Black bars": "Crop",
    "Ambient light": "Glow"
  };

  for (const section of sections) {
    const title = section.querySelector("h2")?.textContent.trim();
    if (!title) continue;
    section.id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = shortNames[title] || title;
    button.dataset.target = section.id;
    button.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth", block: "start" }));
    nav.append(button);
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    nav.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("active", button.dataset.target === visible.target.id);
    });
  }, { rootMargin: "-80px 0px -55%", threshold: [0.05, 0.25, 0.6] });
  sections.forEach((section) => observer.observe(section));
  nav.querySelector("button")?.classList.add("active");
}

function notifyActiveTab(patch) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "YAL_SETTINGS_PATCH", patch }, () => {
      // A non-YouTube tab has no listener. Reading lastError prevents a noisy log.
      void chrome.runtime.lastError;
    });
  });
}

function save(id) {
  const element = document.getElementById(id);
  const settingId = id === "enabledGeneral" ? "enabled" : id;
  const value = element.type === "checkbox"
    ? element.checked
    : element.tagName === "SELECT" ? element.value : Number(element.value);
  chrome.storage.sync.set({ [settingId]: value });
  notifyActiveTab({ [settingId]: value });
  if (settingId === "enabled") {
    document.getElementById("enabled").checked = value;
    document.getElementById("enabledGeneral").checked = value;
  }
  renderValues();
}

function load(values) {
  for (const [id, value] of Object.entries(values)) {
    const element = document.getElementById(id);
    if (!element) continue;
    if (element.type === "checkbox") element.checked = value;
    else element.value = value;
  }
  document.getElementById("enabledGeneral").checked = values.enabled;
  renderValues();
}

chrome.storage.sync.get(DEFAULTS, load);

const toggleIds = [
  "enabled", "showFps", "showFrametime", "smoothMotion", "headerShadows",
  "textShadowsOnly", "cleanTheater", "hideScrollbar", "removeBlackBars",
  "removeBlackSidebars", "removeColoredBars", "resetBarsNextVideo", "fillVideo",
  "directionTop", "directionRight", "directionBottom", "directionLeft", "enabledGeneral"
];

for (const id of [...toggleIds, ...rangeIds, "appearance", "viewMode", "ambientOrigin"]) {
  document.getElementById(id).addEventListener("input", () => save(id));
}

document.getElementById("reset").addEventListener("click", () => {
  chrome.storage.sync.set(DEFAULTS, () => {
    load(DEFAULTS);
    notifyActiveTab(DEFAULTS);
  });
});

createSectionNavigation();
