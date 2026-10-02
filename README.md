# YouTube Ambient Light

A lightweight Chrome and Edge extension that turns YouTube videos and thumbnails into a smooth, full-page ambient background.

The extension samples the current video in real time, spreads its colors behind the player, and blends the effect through YouTube's header, navigation, metadata, comments, chat, and playlist areas. On the Home page, hovering over a thumbnail creates the same effect before the video is opened.

## Preview

<video controls width="100%">
  <source src="./assests/%28561%29%20Yves%20V%20&amp;%20Matthew%20Hill%20feat.%20Betsy%20Blue%20-%20Stay%20%28Copyright%20Free%20Music%29%20-%20YouTube%20-%20Brave%202026-10-02%2020-01-03.mp4" type="video/mp4">
</video>

[▶ Watch or download the preview video](<assests/(561) Yves V & Matthew Hill feat. Betsy Blue - Stay (Copyright Free Music) - YouTube - Brave 2026-10-02 20-01-03.mp4>)

## Highlights

- Real-time ambient lighting generated from the playing video
- Player-centered glow that expands across the entire viewport
- Optional whole-screen glow origin
- Home-page ambience generated from hovered thumbnails
- Smooth 0.35-second crossfade between Home thumbnails
- Immediate thumbnail fallback while a video is loading
- Automatic black-bar and sidebar detection
- Adjustable quality, framerate, resolution, blur, intensity, spread, and color
- Independent top, right, bottom, and left glow directions
- Video brightness, contrast, saturation, size, and shadow controls
- Small, theater, and fullscreen targeting
- Integrated settings drawer inside the YouTube player
- Synced settings across the browser profile
- Support for YouTube's in-page navigation and Shorts

## Installation

This project is an unpacked Manifest V3 extension and does not require a build step.

1. Download or clone this project.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the `AmbientLigth` project folder.
6. Open or refresh YouTube.

After changing the source files, press **Reload** on the extension card and refresh YouTube once.

## Using the extension

On a Watch page, select the sun button inside the YouTube player to open the complete settings drawer. You can also select the extension icon in the browser toolbar.

On the Home page, move the pointer over a video thumbnail. Its colors will fade into the page background and follow the next thumbnail you hover.

### Keyboard shortcuts

Shortcuts work while focus is outside text fields.

| Key | Action |
| --- | --- |
| `A` | Enable or disable ambient light |
| `B` | Toggle automatic horizontal black-bar removal |
| `V` | Toggle automatic black-sidebar removal |
| `S` | Toggle fill-video mode |
| `Escape` | Close the embedded settings drawer |

## Settings

### Quality

- Show live FPS and frametime diagnostics
- Limit rendering between 5 and 60 FPS
- Adjust the internal sampling resolution
- Enable frame blending for smoother motion

### Video

- Change the displayed video size
- Adjust the player shadow size and opacity

### Page content

- Configure page-shadow size and opacity
- Apply shadows to the header
- Limit shadows to text and buttons
- Change button, panel, and image opacity
- Hide page content in theater mode
- Hide the scrollbar

### Black bars

- Detect and remove horizontal black bars
- Detect and remove vertical sidebars
- Optionally detect colored bars
- Add a manual detection offset
- Apply manual horizontal or vertical crop corrections
- Reset detected crop when the next video starts
- Fill the player with the video

The detector requires several matching samples before changing the crop. This prevents dark scenes from causing unwanted zoom changes.

### Filters

- Brightness
- Contrast
- Saturation

These controls affect the source video independently from the ambient background.

### Directions

Enable or disable the glow on each viewport edge independently:

- Top
- Right
- Bottom
- Left

### Ambient light

- **Glow origin:** choose **Behind video** or **Whole screen**
- Intensity
- Blur
- Color boost
- Background dimming
- Edge size
- Spread
- Spread fade start and curve
- Debanding noise
- Fade-in duration

**Behind video** is the default. It anchors the sampled image to the exact player rectangle and automatically expands it far enough to cover the viewport.

### General

- Light, default, or dark appearance
- All, small, theater, or fullscreen view modes
- Master enable switch

## Home-page behavior

The Home page uses a separate thumbnail renderer instead of sampling YouTube's temporary hover-preview videos.

- The visible thumbnail fills the viewport as a heavily blurred backdrop.
- Two alternating preview layers create a 0.35-second crossfade.
- Hover work is throttled to avoid unnecessary updates.
- Playlist cards, rich-grid cards, modern lockups, and direct thumbnail links are supported.
- YouTube's high-level frosted-glass header is made visually transparent without changing its native positioning.

## Watch-page behavior

- A thumbnail appears immediately while the player loads.
- Live colors replace the thumbnail after stable video frames become available.
- The glow follows player resizing, scrolling, theater mode, and fullscreen mode.
- Isolated blank frames from buffering, advertisements, or quality changes are rejected.
- Genuinely dark scenes are accepted after several consistent samples.
- Header, metadata, comments, chat, and playlist areas share one continuous ambient background.

## Project structure

The injected code is split by responsibility and loaded in this order:

| File | Responsibility |
| --- | --- |
| `content-state.js` | Shared defaults, state, and stale-instance cleanup |
| `content-layer.js` | Ambient canvases, preview layers, statistics, and settings drawer |
| `content-home.js` | Thumbnail discovery and Home-page preview selection |
| `content-controls.js` | Settings panel state, view modes, direction masks, and video scaling |
| `content-crop.js` | Black-bar analysis and crop stabilization |
| `content-renderer.js` | Canvas rendering, player anchoring, FPS statistics, and flash protection |
| `content-player.js` | Player-button creation and active video discovery |
| `content-main.js` | Startup, storage, navigation, shortcuts, events, and cleanup |
| `popup.html` | Settings interface structure |
| `popup.css` | Settings interface design |
| `popup.js` | Settings persistence and live updates |
| `ambient.css` | YouTube integration and ambient page styling |
| `background.js` | Refreshes already-open YouTube tabs after extension updates |
| `manifest.json` | Manifest V3 configuration and module loading order |

## Performance safeguards

- Rendering stops when the tab is hidden.
- The video is sampled through small internal canvases rather than at full resolution.
- Framerate and sampling resolution are configurable.
- DOM mutation handling is idle-debounced.
- Home hover updates are throttled.
- Expensive video and text effects are scoped to Watch pages.
- Frame stability checks prevent isolated black frames from flashing the page.

## Permissions

| Permission | Purpose |
| --- | --- |
| `storage` | Save and synchronize extension settings |
| `activeTab` | Communicate with the active YouTube tab |
| `scripting` | Refresh the extension in already-open YouTube tabs after an update |
| `https://www.youtube.com/*` | Run the ambient-light interface on YouTube |

## Troubleshooting

### The effect does not appear

1. Confirm the extension is enabled.
2. Reload it from the browser's Extensions page.
3. Refresh the YouTube tab.
4. Open the settings panel and confirm **Enabled** is on.
5. Confirm the selected view mode matches the current player mode.

### The settings button is missing

Refresh the Watch page after reloading the extension. The player button is recreated when YouTube finishes its in-page navigation.

### The background briefly becomes dark

Version 2.7.2 and later filter isolated blank player frames. If the issue persists, lower the FPS, enable smooth motion, or temporarily reduce the sampling resolution.

### YouTube feels slow

Try lowering:

- Framerate
- Resolution
- Blur
- Debanding noise

Disabling page shadows can also help on lower-powered systems.

## Development

There is no compilation or dependency-installation step. Edit the source files directly, reload the unpacked extension, and refresh YouTube.

When adding a new content module:

1. Keep it focused on one responsibility.
2. Add it to `manifest.json` after its dependencies.
3. Add it to the reinjection list in `background.js` using the same order.
4. Preserve cleanup behavior for listeners, timers, and observers.

Current extension version: **2.9.0**
