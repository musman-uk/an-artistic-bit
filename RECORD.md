# RECORD

## 1. Design Style

### Reading & Visual Environment
- Environmental theme system featuring 6 display themes (`Night Studio`, `Day Studio`, `Game Boy Color-Style`, `14" CRT Phillips-Style`, `11" Lenovo-Style`, `PSP-Style`)  
- Automatic first-visit `Night Studio` / `Day Studio` selection via `prefers-color-scheme` with manual override persistence in `localStorage`  
- Dynamic font stack integration switching between Space Grotesk, Fraunces, Press Start 2P, VT323, and Fira Code based on the active display housing  
- Theme-driven color palettes (`Midnight Neon`, `Studio Paper`, `GBC Olive`, `Arcade Classics`, `Paper Pastel`, `Phosphor Matrix`)  
- High-contrast CRT scanline overlay toggles and screen glare highlight effects  

### Interaction & Accessibility
- Responsive press feedback and interactive housing controls  
- Dual workspace interaction modes: Studio Mode (classic pixel drawing tools) and Sandbox Mode (live physics reactor)  
- Unified pointer and touch event handling enabling continuous drawing across desktop and mobile displays  

### Layout System
- Fixed aspect-square canvas viewport nested within scalable display monitor frames  
- Multi-panel architecture: header toolbar → left sidebar control panel → center hardware viewport → bottom telemetry bar  
- Toggleable Focus View mode hiding peripheral toolbars for an uncluttered drawing surface  

---

## 2. Development Process

### Content Model
- Central state container (`state.js`) managing pixel grid matrices, `localStorage` auto-save state, undo history stacks, and tool parameters  
- Preset palette registry (`themes.js`) mapping color swatches and display theme configurations  
- Modular action log recording pixel coordinates and timestamps for time-lapse replay and metadata exports  

### Component & Render System
- HTML5 Canvas 2D engine supporting real-time grid rendering across discrete resolutions (`16x16`, `32x32`, `48x48`) and `256x256` Freehand sketching mode  
- Granular Physics Reactor (`physics.js`) computing `Sand Gravity`, `Chroma Glitch`, `Heat Bleed`, and `Wave Echo` ripples  
- Web Audio API Sound Synthesizer (`synth.js`) outputting theme-tailored audio timbres (chiptune square waves, sine tones, sawtooth waves, triangle waves)  
- Exporter engine (`exporter.js`) generating 2D JSON matrix arrays, scaled PNG sprites, and Souvenir Card collectible PNGs  

### Build Pipeline
- Bundled using Parcel for ES module compilation and asset pipeline processing, paired with Tailwind CSS Play CDN utilities  
- Production output compiled to `./dist` for static hosting  
- `.github/workflows/deploy.yml` automates dependency resolution, Parcel building, and static deployment to GitHub Pages  

---

## 3. Milestones

### Repository & Engine Setup
- Modular project directory structure established (`src/` ES modules architecture)  
- HTML5 Canvas rendering loop, grid coordinate translation, and pointer interaction layers implemented  
- Core drawing suite constructed: pencil, straight line algorithm, flood fill, eraser, and color picker  

### Physics & Web Audio Integration
- Granular `Sand Gravity` physics engine created for falling pixel particle behavior  
- Added `Chroma Glitch`, `Heat Bleed`, and `Wave Echo` physics behaviors  
- Web Audio API synthesizer integrated with theme-aware waveform selection  

### Display Themes & Export Utilities
- Implemented `Night Studio`, `Day Studio` (with `prefers-color-scheme` initial detection), and 3 classic hardware display themes with CRT scanline toggles  
- Added 4-way symmetry drawing axes, `256x256` Freehand mode, `localStorage` persistence, and animated time-lapse replay engine  
- Developed Souvenir Card exporter rendering metadata cards onto an offscreen canvas  
- Configured Parcel build pipeline and GitHub Actions deployment workflow  

---

## 4. Version History

### v1.0.0 - Unpublished
- Complete ES module architecture split across state, themes, synth, tools, physics, and exporter components  
- Integrated `Night Studio`, `Day Studio`, and 3 retro hardware display themes with toggleable CRT scanline overlays  
- Built Studio Mode drawing suite with 4-way symmetry, `256x256` Freehand mode, `localStorage` auto-save, and multi-step undo capabilities  
- Developed Sandbox Mode featuring 4 granular physics behaviors (`Sand Gravity`, `Chroma Glitch`, `Heat Bleed`, `Wave Echo`)  
- Integrated Web Audio sound engine with theme-tailored sound synthesis  
- Added Developer Tools modal supporting 2D JSON matrix export, scaled PNG sprites, and Souvenir Cards  
- Configured Parcel build configuration and automated GitHub Actions deployment workflow
