<div align="center">
   <h1>StitchCraft 3D</h1>
   <p>Design crochet patterns with a 2D chart and real-time 3D visualization. Optional hardware sensor integration via Web Serial for interactive stitch input.</p>
</div>

## Overview

StitchCraft 3D is a small React + Vite app that helps visualize crochet patterns:

- 2D pattern chart with zoom/pan and per-stitch color editing
- 3D render of rows or rounds using Three.js
- Manual stitch entry and row management
- Optional hardware input via Web Serial (Touch + Potentiometer)

No AI features are included.

## Tech Stack

- React + Vite
- Three.js for 3D rendering
- TailwindCSS (via CDN) for basic styling

## Requirements

- Node.js (LTS recommended)
- A modern browser. Web Serial requires Chrome or Microsoft Edge.
- Optional hardware (for sensor mode):
   - KS0012 Touch sensor (or similar)
   - KS0031 Potentiometer (or similar)
   - A microcontroller that sends newline-delimited commands at 9600 baud

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

3. Open the dev server URL shown in the terminal (default http://localhost:3000).

4. Build for production (optional):

```bash
npm run build
npm run preview
```

## Using the App

- Choose construction mode (Flat Rows or In the Round) from the top bar.
- In the sidebar:
   - Select a `stitch type`.
   - Use "Add {STITCH} manually" to append stitches to the current row.
   - "New Row" creates a new empty row.
   - "Undo Last" removes the most recent stitch or the last empty row.
- In the 2D chart, click a stitch to change its color. Use the controls in the bottom-right to zoom in/out or reset view.
- Toggle between Split Screen, 3D Only, or 2D Chart views from the top bar.

## Hardware Sensor Mode (Optional)

The sensor panel allows connecting a serial device to preview and trigger stitches.

- Click "Initialize Sensor Hook" to request a serial port and start listening.
- The app expects newline-delimited text commands at 9600 baud.
- Supported commands:
   - `preview:sc` (and `dc`, `hdc`, `tr`, `inc`, `dec`, `slst`) — updates the selected stitch type shown in the selector.
   - `sc`, `dc`, `hdc`, `tr`, `inc`, `dec`, `slst` — adds a stitch of the given type to the current row.

If your browser reports Web Serial is not supported, use Chrome or Edge.

## Project Structure

- `App.tsx` — Main layout and view toggles
- `components/PatternControls.tsx` — Sidebar controls and sensor integration
- `components/Pattern2D.tsx` — 2D chart with zoom/pan and color picker
- `components/CrochetCanvas.tsx` — Three.js 3D rendering of the pattern
- `services/serialService.ts` — Web Serial handling
- `services/soundService.ts` — Small audio feedback for stitches/connect
- `types.ts` — Pattern and stitch type definitions
- `constants.tsx` — Stitch colors, heights, and descriptions
- `vite.config.ts` — Vite config (dev server runs on port 3000)

## Troubleshooting

- Web Serial permission: The browser will prompt for access the first time; select your device.
- No sensor data: Check baud rate `9600`, newline termination, and command format.
- Audio not playing: Some browsers require a user gesture (click) before audio can play.
- Rendering issues: Ensure WebGL is enabled; try the latest Chrome/Edge.

## Notes

- No environment variables are required.
- AI features and dependencies have been removed.
