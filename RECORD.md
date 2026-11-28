# RECORD

## 1. Design Style

### Reading & Visual Environment
- Environmental theme system featuring 6 display themes (`Night`, `Day`, `Game Boy Color-Style`, `14" CRT Philips-Style`, `11" Lenovo-Style`, `PSP-Style`)  
- Automatic first-visit `Night` / `Day` selection via `prefers-color-scheme` with manual override persistence in `localStorage`  
- Dynamic font stack integration switching between Space Grotesk, Fraunces, Press Start 2P, VT323, Fira Code, and Caveat based on the active display housing and modals  
- Theme-driven and selectable color palettes (`Daylight Paper`, `Midnight Neon`, `Gameboy Arcade`, `CRT Retro`, `PSP Gloss`, `Lenovo Slate`, `Pastel`, `Cyber`)  
- High-contrast CRT scanline overlay toggles and screen glare highlight effects  

### Interaction & Accessibility
- Responsive press feedback and interactive studio controls  
- Unified workspace combining pixel drawing tools with live physics reactor effects (`Sand`, `Glitch`, `Ember`, `Wave`)  
- Unified pointer and touch event handling with coalesced event sampling enabling continuous drawing across desktop and mobile displays  

### Layout System
- Fixed aspect-square canvas viewport nested within scalable studio and retro hardware monitor frames  
- Responsive multi-panel architecture: header toolbar → left sidebar control panel (tabbed bottom dock on mobile) → center hardware viewport → bottom telemetry bar  
- Toggleable Focus View mode hiding peripheral hardware shells, glare, and action docks for an uncluttered drawing surface  

---

## 2. Development Process

### Content Model
- Central state container (`state.js`) managing pixel grid matrices, sparse `localStorage` auto-save state, undo history stacks, and tool parameters  
- Preset palette and theme registry (`themes.js`) mapping color swatches, dynamic SVG favicons, Souvenir Card styles, and display housing configurations  
- Modular action log recording pixel coordinates, active effect mode, and timestamps for time-lapse replay  

### Component & Render System
- HTML5 Canvas 2D engine supporting real-time grid rendering across discrete resolutions (`16x16`, `32x32`, `48x48`) and `256x256` Freehand sketching mode with quadratic curve interpolation  
- Granular Physics Reactor (`physics.js`) computing `Sand` gravity piles, `Glitch` hue pulses, `Ember` heat diffusion, and `Wave` click ripples  
- Web Audio API Sound Synthesizer (`synth.js`) outputting theme-tailored audio timbres (square waves for Game Boy Color-Style, sine waves for CRT & PSP-Style, triangle waves for Night, Day & Lenovo-Style)  
- Exporter engine (`exporter.js`) generating formatted 2D JSON matrix arrays, scaled PNG sprites, and theme-matched Souvenir Card collectible PNGs  

### Build Pipeline
- Bundled using Parcel for ES module compilation and asset pipeline processing, paired with Tailwind CSS Play CDN utilities  
- Production output compiled to `./dist` for static hosting  
- `.github/workflows/deploy.yml` automates dependency resolution, Parcel building, and static deployment to GitHub Pages  

---

## 3. Milestones

### Repository & Engine Setup
- Modular project directory structure established (`src/` ES modules architecture)  
- HTML5 Canvas rendering loop, grid coordinate translation, and pointer/touch interaction layers implemented  
- Core drawing suite constructed: pencil, quadratic freehand smoothing, straight line algorithm, BFS flood fill, and eraser  

### Physics & Web Audio Integration
- Granular `Sand` gravity physics engine created for falling and diagonally tumbling pixel particles  
- Added `Glitch` hue pulse, `Ember` heat diffusion, and `Wave` click ripple physics behaviors  
- Web Audio API synthesizer integrated with theme-aware waveform selection (`square`, `sine`, and `triangle` oscillators)  

### Display Themes & Export Utilities
- Implemented `Night` and `Day` studio themes (with `prefers-color-scheme` initial detection) and 4 classic hardware display themes (`Game Boy Color-Style`, `14" CRT Philips-Style`, `11" Lenovo-Style`, `PSP-Style`) with toggleable CRT scanline overlays  
- Added 4-way symmetry drawing axes (`Off`, `X`, `Y`, `X & Y`), `256x256` Freehand mode, sparse `localStorage` persistence, Focus View, and animated time-lapse replay engine  
- Developed theme-aware Souvenir Card exporter rendering metadata cards onto an offscreen canvas alongside Developer Tools (`2D JSON` matrix & scaled PNG sprite exports)  
- Configured Parcel build pipeline and GitHub Actions deployment workflow  

---

## 4. Version History

### v1.0.0 - Published
- Complete ES module architecture split across state, themes, synth, tools, physics, and exporter components  
- Integrated `Night`, `Day`, and 4 retro hardware display themes (`Game Boy Color-Style`, `14" CRT Philips-Style`, `11" Lenovo-Style`, `PSP-Style`) with 8 preset palettes, dynamic SVG favicons, and toggleable CRT scanline overlays  
- Built unified drawing suite with pencil, line, flood fill, eraser, 4-way symmetry, `256x256` Freehand mode, `localStorage` auto-save, and multi-step undo capabilities  
- Integrated live physics reactor featuring 4 granular behaviors (`Sand`, `Glitch`, `Ember`, `Wave`)  
- Integrated Web Audio sound engine with theme-tailored sound synthesis  
- Added Developer Tools modal supporting 2D JSON matrix export and scaled PNG sprites, plus theme-matched Souvenir Card exports and Builder's Byte modal  
- Configured Parcel build configuration and automated GitHub Actions deployment workflow
