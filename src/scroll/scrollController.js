import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ACTS, getActAt } from '../scene/path.js';

gsap.registerPlugin(ScrollTrigger);

export const scrollState = { progress: 0, hasStarted: false };

const FOG_BY_ACT = [
  { color: 0x0b0912, near: 3, far: 22 }, // desk
  { color: 0x120a1c, near: 1, far: 16 }, // tunnel
  { color: 0x1c1230, near: 2, far: 24 }, // dream
  { color: 0x160c22, near: 2, far: 26 }, // core
  { color: 0x241a34, near: 4, far: 40 }, // outro
];

export function initScrollController({ world, scene }) {
  const copyEls = ACTS.map((_, i) => document.getElementById(`copy-${i}`));
  const hud = document.getElementById('hud');
  const hudSignal = document.getElementById('hud-signal');
  const hudDepth = document.getElementById('hud-depth');
  const progressFill = document.getElementById('progress-fill');
  const scrollCue = document.getElementById('scroll-cue');

  ScrollTrigger.create({
    trigger: '#scroll-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    onUpdate: (self) => {
      const progress = self.progress;
      scrollState.progress = progress;

      if (!scrollState.hasStarted && progress > 0.01) {
        scrollState.hasStarted = true;
        gsap.to(scrollCue, { opacity: 0, duration: 0.6 });
      }

      const act = getActAt(progress);
      world.setActVisibility(act.index, act.localT);

      copyEls.forEach((el, i) => {
        if (!el) return;
        let opacity = 0;
        if (i === act.index) {
          opacity = act.localT < 0.2 ? act.localT / 0.2 : act.localT > 0.75 ? (1 - act.localT) / 0.25 : 1;
        }
        el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      });

      hud.classList.toggle('visible', progress > 0.02 && progress < 0.98);
      hudSignal.textContent = `SIGNAL: ${act.name.toUpperCase()}`;
      hudDepth.textContent = `DEPTH ${(progress * 640).toFixed(1)}m`;
      progressFill.style.width = `${progress * 100}%`;

      const fogA = FOG_BY_ACT[act.index];
      const fogB = FOG_BY_ACT[Math.min(act.index + 1, FOG_BY_ACT.length - 1)];
      if (scene.fog) {
        const colorA = new THREE.Color(fogA.color);
        const colorB = new THREE.Color(fogB.color);
        const mixed = colorA.clone().lerp(colorB, act.localT);
        scene.fog.color.copy(mixed);
        scene.fog.near = fogA.near + (fogB.near - fogA.near) * act.localT;
        scene.fog.far = fogA.far + (fogB.far - fogA.far) * act.localT;
      }
    },
  });

  return {
    scrollToProgress(target) {
      const totalHeight = document.getElementById('scroll-track').offsetHeight - window.innerHeight;
      window.scrollTo({ top: target * totalHeight, behavior: 'smooth' });
    },
  };
}
