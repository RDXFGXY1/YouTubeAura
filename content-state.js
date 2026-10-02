"use strict";

var SCRIPT_VERSION = "2.9.0";

globalThis.__YAL_CLEANUP__?.();

document.querySelectorAll("#yal-ambient-root, #yal-performance-stats, #yal-settings-panel, .yal-player-button")
  .forEach((element) => element.remove());
document.documentElement.dataset.yalVersion = SCRIPT_VERSION;

var DEFAULTS = {
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

var settings = { ...DEFAULTS };
var video = null;
var root = null;
var preview = null;
var previewAlt = null;
var activePreview = 0;
var previewUrl = "";
var canvas = null;
var context = null;
var baseCanvas = null;
var baseContext = null;
var analysisCanvas = null;
var analysisContext = null;
var flashProbeCanvas = null;
var flashProbeContext = null;
var lastFrameLuminance = null;
var darkFrameStreak = 0;
var noise = null;
var playerButton = null;
var settingsPanel = null;
var stats = null;
var timer = null;
var lastUrl = location.href;
var framesSinceReport = 0;
var lastReportAt = performance.now();
var lastFrameAt = 0;
var measuredFps = 0;
var measuredFrametime = 0;
var detectedHorizontalCrop = 0;
var detectedVerticalCrop = 0;
var lastDetectionAt = 0;
var detectionAvailable = true;
var mutationScheduled = false;
var mutationObserver = null;
var lastHomeHoverAt = 0;
var horizontalCandidate = 0;
var verticalCandidate = 0;
var horizontalCandidateFrames = 0;
var verticalCandidateFrames = 0;

