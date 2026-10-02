"use strict";

function updateVideoCrop() {
  const horizontal = settings.removeBlackBars
    ? Math.max(detectedHorizontalCrop, settings.blackBarsSize / 100)
    : 0;
  const vertical = settings.removeBlackSidebars
    ? Math.max(detectedVerticalCrop, settings.blackSidebarsSize / 100)
    : 0;
  const croppedFraction = Math.min(0.48, Math.max(horizontal, vertical) * 2);
  const cropScale = croppedFraction ? 1 / (1 - croppedFraction) : 1;
  const finalScale = (settings.videoSize / 100) * cropScale;
  document.documentElement.style.setProperty("--yal-video-scale", finalScale.toFixed(4));
}

function edgeLineIsBar(data, width, height, index, horizontal, colored) {
  const length = horizontal ? width : height;
  let brightness = 0;
  let brightnessSquared = 0;
  for (let position = 0; position < length; position += 1) {
    const x = horizontal ? position : index;
    const y = horizontal ? index : position;
    const offset = (y * width + x) * 4;
    const value = data[offset] * 0.2126 + data[offset + 1] * 0.7152 + data[offset + 2] * 0.0722;
    brightness += value;
    brightnessSquared += value * value;
  }
  const mean = brightness / length;
  const variance = brightnessSquared / length - mean * mean;
  const darkThreshold = 12 + settings.barDetectionOffset * 3;
  return (mean <= darkThreshold && variance < 140) || (colored && variance < 35);
}

function countEdgeBars(data, width, height, horizontal) {
  const dimension = horizontal ? height : width;
  const limit = Math.floor(dimension * 0.3);
  let start = 0;
  let end = 0;
  for (let i = 0; i < limit; i += 1) {
    if (!edgeLineIsBar(data, width, height, i, horizontal, settings.removeColoredBars)) break;
    start += 1;
  }
  for (let i = dimension - 1; i >= dimension - limit; i -= 1) {
    if (!edgeLineIsBar(data, width, height, i, horizontal, settings.removeColoredBars)) break;
    end += 1;
  }
  if (!start && !end) return 0;
  if (!start || !end || Math.abs(start - end) > 2) return 0;
  return Math.min(0.24, (start + end) / (dimension * 2));
}

function stabilizeDetectedCrop(axis, candidate) {
  const horizontal = axis === "horizontal";
  const previous = horizontal ? horizontalCandidate : verticalCandidate;
  let frames = horizontal ? horizontalCandidateFrames : verticalCandidateFrames;
  if (Math.abs(candidate - previous) <= 0.012) frames += 1;
  else frames = 1;

  let changed = false;
  if (horizontal) {
    horizontalCandidate = candidate;
    horizontalCandidateFrames = frames;
    if (frames >= 3 && Math.abs(detectedHorizontalCrop - candidate) > 0.012) {
      detectedHorizontalCrop = candidate;
      changed = true;
    }
  } else {
    verticalCandidate = candidate;
    verticalCandidateFrames = frames;
    if (frames >= 3 && Math.abs(detectedVerticalCrop - candidate) > 0.012) {
      detectedVerticalCrop = candidate;
      changed = true;
    }
  }
  return changed;
}

function detectVideoBars(now) {
  if (!detectionAvailable || now - lastDetectionAt < 900 || (!settings.removeBlackBars && !settings.removeBlackSidebars)) return;
  lastDetectionAt = now;
  try {
    analysisContext.drawImage(video, 0, 0, analysisCanvas.width, analysisCanvas.height);
    const frame = analysisContext.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
    let stable = false;
    if (settings.removeBlackBars) {
      stable = stabilizeDetectedCrop("horizontal", countEdgeBars(frame.data, frame.width, frame.height, true)) || stable;
    }
    if (settings.removeBlackSidebars) {
      stable = stabilizeDetectedCrop("vertical", countEdgeBars(frame.data, frame.width, frame.height, false)) || stable;
    }
    if (stable) updateVideoCrop();
  } catch (error) {
    detectionAvailable = false;
    console.debug("Automatic bar detection is unavailable for this video; manual crop controls still work.", error);
  }
}

