import * as THREE from 'three';

// Act boundaries as fractions of total scroll progress (0..1).
export const ACTS = [
  { name: 'desk', start: 0.0, end: 0.18 },
  { name: 'tunnel', start: 0.18, end: 0.38 },
  { name: 'dream', start: 0.38, end: 0.62 },
  { name: 'core', start: 0.62, end: 0.82 },
  { name: 'outro', start: 0.82, end: 1.0 },
];

// Camera travels forward along -Z through each "world".
// Control points roughly mark the center of each act plus transition points.
const controlPoints = [
  new THREE.Vector3(0, 1.4, 9), // start, facing the CRT
  new THREE.Vector3(0, 1.5, 4), // approaching screen
  new THREE.Vector3(0, 1.5, 0.6), // threshold, right before the glass
  new THREE.Vector3(0, 0.4, -3), // inside the tunnel, falling
  new THREE.Vector3(1.2, -0.4, -9), // tunnel drifting off-axis
  new THREE.Vector3(-1.4, 0.6, -15), // tunnel exit, disoriented drift
  new THREE.Vector3(0.6, 0.2, -21), // entering the dream field
  new THREE.Vector3(-1.8, 1.2, -27), // weaving between debris
  new THREE.Vector3(1.6, -0.6, -33), // deeper into the dream field
  new THREE.Vector3(0, 0.5, -39), // approaching the core
  new THREE.Vector3(3.6, 1.1, -43.5), // orbiting the core, off to one side
  new THREE.Vector3(-3.2, -0.6, -47), // swinging past the far side
  new THREE.Vector3(0, 1.5, -51), // rising past the core
  new THREE.Vector3(0, 3.5, -58), // pulling back for the outro
  new THREE.Vector3(0, 5.5, -66), // final resting drift
];

export const pathCurve = new THREE.CatmullRomCurve3(controlPoints, false, 'catmullrom', 0.5);

const LOOKAHEAD = 0.015;

export function getCameraTransform(progress) {
  const t = THREE.MathUtils.clamp(progress, 0, 0.999);
  const position = pathCurve.getPointAt(t);
  const aheadT = Math.min(t + LOOKAHEAD, 1);
  const lookAt = pathCurve.getPointAt(aheadT);
  return { position, lookAt };
}

export function getActAt(progress) {
  for (let i = 0; i < ACTS.length; i++) {
    const act = ACTS[i];
    if (progress >= act.start && progress < act.end) {
      const localT = (progress - act.start) / (act.end - act.start);
      return { index: i, name: act.name, localT };
    }
  }
  const last = ACTS[ACTS.length - 1];
  return { index: ACTS.length - 1, name: last.name, localT: 1 };
}

// Smooth 0->1->0 bell curve used to spike effects around a transition point.
export function bellAround(progress, center, width) {
  const d = Math.abs(progress - center) / width;
  if (d >= 1) return 0;
  return Math.cos((d * Math.PI) / 2);
}
