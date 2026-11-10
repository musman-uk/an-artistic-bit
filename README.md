# 🎨 Bytes On Canvas

This repository contains [Bytes On Canvas](https://musman-uk.github.io/bytes-on-canvas/) - an interactive retro hardware pixel studio and physics sandbox web application featuring physical display themes, Web Audio sound synthesis, granular physics, and souvenir card exports built with Parcel and Tailwind CSS.

---

## Project Contents

A short summary of what each part of the project contains:

- `.github/workflows/` – automated GitHub Actions workflow for building and deploying the site  
- `src/app.js` – main application controller, rendering loop, event bindings, and UI coordination  
- `src/exporter.js` – canvas export utilities for matrix JSON arrays, sprite PNGs, and souvenir card generation  
- `src/index.html` – main HTML entry file containing hardware shells, toolbars, and modal structures  
- `src/physics.js` – granular physics reactor logic for sand gravity, glitch decay, heat bleed, and wave echo  
- `src/state.js` – central state container managing pixel grid matrices, tool configurations, and undo history  
- `src/style.css` – custom CSS definitions for hardware themes, CRT scanline effects, glass glare, and layout rules  
- `src/synth.js` – Web Audio API synthesizer for retro theme-specific sound effects and timbres  
- `src/themes.js` – preset color palette data and environmental theme display managers  
- `src/tools.js` – drawing algorithms for pencil, line, flood fill, eraser, color sampling, and symmetry axes  
- `.gitignore` – patterns specifying files and directories excluded from version control  
- `package.json` – project dependencies, Parcel target settings, and build scripts  

---

## Development Overview

A simplified view of how the website is being developed:

| Stage         | Location                | Purpose                                                |
|---------------|-------------------------|--------------------------------------------------------|
| Author        | `src/`                  | Canvas tools, physics reactors, synth, and UI are developed |
| Build         | `package.json` & Parcel | Parcel bundles ES modules, stylesheets, and assets     |
| Automate      | `.github/workflows/`    | Actions workflow compiles code upon commit or manual dispatch |
| Deploy        | GitHub Pages            | Production build output (`dist/`) served directly to the web |

---

## Status

Version `0.0.0` – Unpublished  

---

<sub>© Mohammed Usman</sub>

<sub>All rights reserved. No commercial use, redistribution, or derivatives.</sub>
