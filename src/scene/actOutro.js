import * as THREE from 'three';
import { createDesktopTexture } from './textures.js';

export function buildOutroAct() {
  const group = new THREE.Group();

  const voidSphere = new THREE.Mesh(
    new THREE.SphereGeometry(40, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x120c1e, side: THREE.BackSide, fog: false })
  );
  voidSphere.position.set(0, 2, -62);
  group.add(voidSphere);

  const haloLight = new THREE.PointLight(0xffb454, 4, 30, 2);
  haloLight.position.set(0, 3, -60);
  group.add(haloLight);

  // Tiny echo of the CRT monitor, implying we were always inside it.
  const echo = new THREE.Group();
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xd8d0bd })
  );
  echo.add(bezel);
  const screenTex = createDesktopTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.3),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })
  );
  screen.position.z = 0.16;
  echo.add(screen);
  echo.position.set(0, 0.5, -64);
  group.add(echo);

  const ambient = new THREE.AmbientLight(0x2a2038, 1.6);
  group.add(ambient);

  return {
    group,
    update(elapsed) {
      haloLight.intensity = 3.5 + Math.sin(elapsed * 0.8) * 0.6;
      echo.rotation.y = Math.sin(elapsed * 0.2) * 0.3;
    },
  };
}
