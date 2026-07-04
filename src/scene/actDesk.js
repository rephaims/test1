import * as THREE from 'three';
import { createDesktopTexture, createGridTexture } from './textures.js';

export function buildDeskAct() {
  const group = new THREE.Group();

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(24, 14, 24),
    new THREE.MeshStandardMaterial({ color: 0x0b0912, side: THREE.BackSide, roughness: 1 })
  );
  room.position.set(0, 3, -2);
  group.add(room);

  const floorTex = createGridTexture('#3a2f22');
  floorTex.repeat.set(6, 6);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ map: floorTex, color: 0x2a2118, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3;
  group.add(floor);

  // Desk
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.2, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x4a3826, roughness: 0.7 })
  );
  desk.position.set(0, -0.4, 1);
  group.add(desk);
  for (const x of [-2.1, 2.1]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.6, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x2c2015 })
    );
    leg.position.set(x, -1.7, 1.9);
    group.add(leg);
  }

  // Monitor
  const monitor = new THREE.Group();
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 2.1, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xd8d0bd, roughness: 0.55 })
  );
  monitor.add(bezel);

  const screenTex = createDesktopTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.05, 1.55),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })
  );
  screen.position.set(0, 0.05, 0.76);
  monitor.add(screen);

  const glow = new THREE.PointLight(0x6bffb0, 6, 6, 2);
  glow.position.set(0, 0.1, 1.4);
  monitor.add(glow);

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0xc9c0aa })
  );
  stand.position.set(0, -1.25, 0);
  monitor.add(stand);

  monitor.position.set(0, 0.15, 0.2);
  group.add(monitor);

  // Floppy disks scattered on the desk
  const floppyColors = [0xff5ec4, 0xffb454, 0x6bfff2];
  floppyColors.forEach((c, i) => {
    const floppy = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.03, 0.32),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })
    );
    floppy.position.set(-1.6 + i * 0.36, -0.28, 1.5 + (i % 2) * 0.2);
    floppy.rotation.y = i * 0.4;
    group.add(floppy);
  });

  // Ambient + rim light
  const ambient = new THREE.AmbientLight(0x1a1428, 1.2);
  group.add(ambient);
  const rim = new THREE.PointLight(0xff5ec4, 3, 12, 2);
  rim.position.set(-4, 3, -3);
  group.add(rim);

  return {
    group,
    screen,
    update(elapsed) {
      // subtle CRT flicker
      glow.intensity = 5.2 + Math.sin(elapsed * 14) * 0.6 + Math.sin(elapsed * 3.1) * 0.3;
    },
  };
}
