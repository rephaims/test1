import * as THREE from 'three';
import './style.css';
import { buildWorld } from './scene/build.js';
import { getCameraTransform, bellAround } from './scene/path.js';
import { createComposer } from './postprocessing/composer.js';
import { initScrollController, scrollState } from './scroll/scrollController.js';
import { initGate } from './ui/gate.js';
import { initInteractions } from './ui/interactions.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0912, 3, 22);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200);
const initialTransform = getCameraTransform(0);
camera.position.copy(initialTransform.position);
camera.lookAt(initialTransform.lookAt);

const world = buildWorld(scene);
const { composer, crtPass, setSize } = createComposer(renderer, scene, camera);

const scroll = initScrollController({ world, scene });
initInteractions({ camera, world, scroll });
initGate();

window.addEventListener('resize', () => {
  const { innerWidth: w, innerHeight: h } = window;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  setSize(w, h);
});

const pointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
});

const smoothedPosition = camera.position.clone();
const smoothedLookAt = initialTransform.lookAt.clone();
const parallaxOffset = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();

let glitchBurst = 0;
const clock = new THREE.Clock();

function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function tick() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  const progress = scrollState.progress;

  const transform = getCameraTransform(progress);
  smoothedPosition.x = damp(smoothedPosition.x, transform.position.x, 4, delta);
  smoothedPosition.y = damp(smoothedPosition.y, transform.position.y, 4, delta);
  smoothedPosition.z = damp(smoothedPosition.z, transform.position.z, 4, delta);

  if (!prefersReducedMotion) {
    parallaxOffset.x = damp(parallaxOffset.x, pointer.x * 0.18, 3, delta);
    parallaxOffset.y = damp(parallaxOffset.y, -pointer.y * 0.12, 3, delta);
  }

  targetLookAt.copy(transform.lookAt).add(parallaxOffset);
  smoothedLookAt.x = damp(smoothedLookAt.x, targetLookAt.x, 5, delta);
  smoothedLookAt.y = damp(smoothedLookAt.y, targetLookAt.y, 5, delta);
  smoothedLookAt.z = damp(smoothedLookAt.z, targetLookAt.z, 5, delta);

  camera.position.copy(smoothedPosition);
  if (!prefersReducedMotion) {
    camera.position.x += Math.sin(elapsed * 0.7) * 0.015;
    camera.position.y += Math.sin(elapsed * 0.9 + 1.5) * 0.012;
  }
  camera.lookAt(smoothedLookAt);

  if (!prefersReducedMotion) {
    const tunnelRoll = bellAround(progress, 0.28, 0.14) * 0.06;
    camera.rotation.z += Math.sin(elapsed * 1.3) * tunnelRoll;
  }

  world.update(elapsed, delta);

  // Glitch intensity spikes at act transitions, plus rare random bursts.
  let glitch = bellAround(progress, 0.18, 0.03) + bellAround(progress, 0.38, 0.03);
  if (!prefersReducedMotion && Math.random() < 0.004) glitchBurst = 0.7;
  glitchBurst *= 0.9;
  glitch = Math.min(1, glitch + glitchBurst);

  crtPass.uniforms.uTime.value = elapsed;
  crtPass.uniforms.uGlitch.value = prefersReducedMotion ? 0 : glitch;

  composer.render();
  requestAnimationFrame(tick);
}

tick();
