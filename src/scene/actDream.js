import * as THREE from 'three';
import { createDialogTexture } from './textures.js';

const DEBRIS_SPECS = [
  { geo: () => new THREE.TorusKnotGeometry(0.5, 0.16, 100, 16), color: 0xff5ec4, pos: [-1.6, 0.6, -23] },
  { geo: () => new THREE.IcosahedronGeometry(0.55, 0), color: 0x6bfff2, pos: [1.8, -0.4, -26] },
  { geo: () => new THREE.OctahedronGeometry(0.5, 0), color: 0xffb454, pos: [-2.2, 1.4, -29] },
  { geo: () => new THREE.TorusKnotGeometry(0.35, 0.1, 90, 12, 2, 3), color: 0x6bfff2, pos: [2.0, 0.8, -32] },
  { geo: () => new THREE.IcosahedronGeometry(0.4, 1), color: 0xff5ec4, pos: [-1.2, -0.8, -35] },
];

const WINDOW_SPECS = [
  {
    title: 'DREAM.TMP',
    body: 'we build the weird stuff here. scroll deeper to see what we make.',
    pos: [0.4, 1.6, -24.5],
    accent: '#6bfff2',
  },
  {
    title: 'SYSTEM ERROR',
    body: 'no errors. just curiosity. keep clicking.',
    pos: [-1.9, -0.2, -31],
    accent: '#ff5ec4',
  },
  {
    title: 'MEMORY.OLD',
    body: 'every old machine remembers something. this one remembers us.',
    pos: [1.4, -1.2, -37],
    accent: '#ffb454',
  },
];

export function buildDreamAct() {
  const group = new THREE.Group();
  const interactive = [];
  const idle = [];

  for (const spec of DEBRIS_SPECS) {
    const mesh = new THREE.Mesh(
      spec.geo(),
      new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: spec.color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.2,
      })
    );
    mesh.position.set(...spec.pos);
    mesh.userData.spin = new THREE.Vector3(
      Math.random() * 0.4 + 0.1,
      Math.random() * 0.4 + 0.1,
      0
    );
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.baseY = spec.pos[1];
    group.add(mesh);
    idle.push(mesh);
  }

  for (const spec of WINDOW_SPECS) {
    const tex = createDialogTexture(spec.title, spec.body, spec.accent);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.1),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide })
    );
    plane.position.set(...spec.pos);
    plane.userData.interactive = true;
    plane.userData.revealText = `> ${spec.title}: ${spec.body}`;
    plane.userData.floatOffset = Math.random() * Math.PI * 2;
    plane.userData.baseY = spec.pos[1];
    plane.userData.baseScale = 1;
    group.add(plane);
    interactive.push(plane);
    idle.push(plane);
  }

  // Faint particle haze to give the field depth.
  const hazeCount = 200;
  const hazePositions = new Float32Array(hazeCount * 3);
  for (let i = 0; i < hazeCount; i++) {
    hazePositions[i * 3] = (Math.random() - 0.5) * 8;
    hazePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    hazePositions[i * 3 + 2] = -20 - Math.random() * 20;
  }
  const hazeGeo = new THREE.BufferGeometry();
  hazeGeo.setAttribute('position', new THREE.BufferAttribute(hazePositions, 3));
  const haze = new THREE.Points(
    hazeGeo,
    new THREE.PointsMaterial({
      color: 0xf4f1e8,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(haze);

  const ambient = new THREE.AmbientLight(0x201830, 1.4);
  group.add(ambient);

  return {
    group,
    interactive,
    update(elapsed) {
      for (const obj of idle) {
        if (obj.userData.spin) {
          obj.rotation.x += obj.userData.spin.x * 0.01;
          obj.rotation.y += obj.userData.spin.y * 0.01;
        } else {
          obj.rotation.z = Math.sin(elapsed * 0.3 + obj.userData.floatOffset) * 0.08;
        }
        obj.position.y = obj.userData.baseY + Math.sin(elapsed * 0.6 + obj.userData.floatOffset) * 0.18;
      }
    },
  };
}
