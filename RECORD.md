# RECORD

## 1. Design Style

### Reading & Visual Environment
- Environmental theme system featuring 4 physical display housings (`Midnight Studio`, `Game Boy Color-Style`, `14" CRT Phillips-Style`, `16" Workstation CRT`)  
- Dynamic font stack integration switching between Space Grotesk, Press Start 2P, VT323, and Fira Code based on the active hardware housing  
- Theme-driven color palettes (Midnight Neon, GBC Olive, Arcade Classics, Paper Pastel, Phosphor Matrix)  
- High-contrast CRT scanline overlay toggles and screen glare highlight effects  

### Interaction & Accessibility
- Tactile press mechanics with active CSS button feedback and physical housing controls  
- Dual workspace interaction modes: Studio Mode (classic pixel drawing tools) and Sandbox Mode (live physics reactor)  
- Unified pointer and touch event handling enabling continuous drawing across desktop and mobile displays  

### Layout System
- Fixed aspect-square canvas viewport nested within scalable physical hardware monitor frames  
- Multi-panel architecture: header toolbar → left sidebar control panel → center hardware viewport → bottom telemetry bar  
- Toggleable Focus View mode hiding peripheral toolbars for an uncluttered drawing surface  

---

## 2. Development Process

### Content Model
- Central state container (`state.js`) managing pixel grid matrices, undo history stacks, and tool parameters  
- Preset palette registry (`themes.js`) mapping color swatches and hardware theme configurations  
- Modular action log recording pixel coordinates and timestamps for time-lapse replay and metadata exports  

### Component & Render System
- HTML5 Canvas 2D engine supporting real-time grid rendering across multiple resolutions (16x16, 32x32, 48x48)  
- Granular Physics Reactor (`physics.js`) computing sand particle gravity, glitch color shifting, heat diffusion, and harmonic wave ripples  
- Web Audio API Sound Synthesizer (`synth.js`) outputting theme-tailored audio timbres (chiptune square waves, CRT thumps, sawtooth tones)  
- Exporter engine (`exporter.js`) generating 2D JSON matrix arrays, scaled PNG sprites, and souvenir collectible cards  

### Build Pipeline
- Bundled using Parcel for zero-configuration ES module compilation and asset pipeline processing  
- Production output compiled to `./dist` for static hosting  
- `.github/workflows/deploy.yml` automates dependency resolution, Parcel building, and static deployment to GitHub Pages  

---

## 3. Milestones

### Repository & Engine Setup
- Modular project directory structure established (`src/` ES modules architecture)  
- HTML5 Canvas rendering loop, grid coordinate translation, and pointer interaction layers implemented  
- Core drawing suite constructed: pencil, straight line algorithm, flood fill, eraser, and color picker  

### Physics & Web Audio Integration
- Granular Sand Gravity physics engine created for falling pixel particle behavior  
- Added Glitch Decay, Heat Bleed, and Harmonic Wave Ripple physics behaviors  
- Web Audio API synthesizer integrated with theme-aware waveform selection  

### Hardware Themes & Export Utilities
- Implemented 4 physical hardware display themes with custom bezels and CRT scanline toggles  
- Added 4-way symmetry drawing axes and animated time-lapse replay engine  
- Developed Souvenir Card exporter rendering metadata cards onto an offscreen canvas  
- Configured Parcel build pipeline and GitHub Actions deployment workflow  

---

## 4. Version History

### v1.0.0 - Unpublished
- Complete ES module architecture split across state, themes, synth, tools, physics, and exporter components  
- Integrated 4 physical hardware display themes with toggleable CRT scanline overlays  
- Built Studio Mode drawing suite with 4-way symmetry and multi-step undo capabilities  
- Developed Sandbox Mode featuring 4 granular physics behaviors  
- Integrated Web Audio sound engine with theme-tailored sound synthesis  
- Added Developer Tools modal supporting 2D JSON matrix export, scaled PNG sprites, and Souvenir Cards  
- Configured Parcel build configuration and automated GitHub Actions deployment workflow
