# Portal Studio

A retro-futuristic, scroll-driven cinematic experience: an old CRT computer acts as a portal into a surreal digital dream world.

Built with Three.js (WebGL) + GSAP ScrollTrigger. No external assets — every scene, texture, and glow is generated procedurally at runtime.

## The journey

1. **Desk** — a dim room with a glowing CRT monitor, waiting to be woken up.
2. **Tunnel** — scrolling dollies the camera straight into the screen and through a neon ring tunnel.
3. **Dream field** — surreal floating debris and retro "error window" objects you can click to reveal messages.
4. **Core** — a glowing wireframe core with orbiting rings and a call-to-action.
5. **Outro** — the camera pulls back to a tiny echo of the machine, ending on a contact screen.

## Stack

- [Three.js](https://threejs.org/) for the 3D scene, camera path, and postprocessing (bloom + custom CRT shader: scanlines, chromatic aberration, vignette, grain, glitch)
- [GSAP](https://gsap.com/) + ScrollTrigger to drive the camera and DOM overlay off scroll position
- [Vite](https://vitejs.dev/) for dev/build tooling
- Web Audio API for the ambient drone (synthesized, no audio files)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL and scroll.

## Build

```bash
npm run build
npm run preview
```
