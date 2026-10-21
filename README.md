# Photobooth Studio OS

A lightweight, professional, production-minded desktop photobooth application built for Windows PCs, supporting dual displays, modular camera adapters, 300 DPI high-resolution canvas composition, Epson EcoTank L3250 printing, animated GIF generation, and instant QR-code digital delivery.

---

## Hardware Telemetry & Verified Environment

- **Operating System:** Windows 10/11 (Node `v24.8.0`, npm `11.6.0`)
- **Dual Display Setup:**
  - `Monitor A (DISPLAY1)`: 1920x1080 (Operator Mission Control Dashboard)
  - `Monitor B (DISPLAY2)`: 1920x1080 (Borderless Guest-Facing Display)
- **Active Printer:** `EPSON83442C (L3250 Series)` with Windows Driver `EPSON L3250 Series`
- **Supported Camera Adapters:**
  - `Mock Camera Adapter`: High-fidelity studio simulator for UI testing and demos without external hardware.
  - `Webcam Adapter`: DirectShow / Media Foundation adapter for the onboard `Integrated Webcam` or USB webcams.
  - `DSLR Camera Adapter`: Modular tethered adapter interface for Canon EOS (EDSDK), Sony Alpha (Remote SDK), or Nikon.

---

## Key Features

1. **Dual-Monitor Orchestration:**
   - **Operator Workspace:** Complete control over events, templates, hardware status, camera triggers, retakes, and print queues.
   - **Guest Screen:** Distraction-free, borderless screen showing event branding, countdown animations, capture shutter flash, confetti celebrations, and instant QR download codes.
2. **Simplified Operator Mode:**
   - Single-click toggle on the status bar that hides complex configuration menus during live events, providing non-technical booth attendants with a clean, foolproof interface.
3. **High-Resolution 300 DPI Compositions:**
   - Renders 4x6 inch (1200x1800 px) and 2x6 strip (600x1800 px) layouts with exact aspect-ratio preservation (`cover-fit`), custom typography, background images, and safe margins.
4. **Animated GIF Engine:**
   - Uses `gifenc` to compile captured photos into a lightweight, animated GIF with event branding overlays.
5. **Local-First & Offline Resilience:**
   - All session files, raw camera frames, composition exports, and print jobs are written immediately to local disk (`%APPDATA%/PhotoboothData`). An internet outage never interrupts live photography or printing.

---

## Quick Start

### 1. Development Mode
```bash
# Start Vite and Electron simultaneously
npm run electron:dev

# Or run Vite web dev server standalone
npm run dev
```

### 2. Build for Production
```bash
# Compiles React frontend and Electron main/preload TypeScript
npm run build
```

---

## Project Structure

```
├── electron/
│   ├── main.ts              # Window management, IPC handlers, Windows print & storage
│   └── preload.ts           # Sandboxed, context-isolated photoboothAPI bridge
├── src/
│   ├── components/
│   │   ├── layout/          # Navbar, Sidebar, status telemetry
│   │   ├── guest/           # Dedicated guest-facing display (Monitor B)
│   │   └── features/        # LiveBooth, Events, Templates, Sessions, Hardware, Settings, Wizard
│   ├── services/
│   │   ├── hardware/        # MockCameraAdapter, WebcamAdapter, DslrAdapter
│   │   ├── processing/      # CompositionService (300 DPI), GifService (gifenc)
│   │   ├── storage/         # LocalStorageService (local-first data store)
│   │   └── gallery/         # QrService (high-contrast QR code generator)
│   ├── state/               # photoboothContext (session state machine & sync)
│   ├── types/               # Strict TypeScript definitions
│   ├── App.tsx              # Root component & mode router (operator vs guest)
│   └── index.css            # Tailwind design system & animations
```
