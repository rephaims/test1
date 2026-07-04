import * as THREE from 'three';

const COLORS = [0x6bfff2, 0xff5ec4, 0xffb454];

export function buildTunnelAct() {
  const group = new THREE.Group();

  const ringCount = 26;
  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const t = i / (ringCount - 1);
    const z = -1 - t * 20;
    const radius = 2.4 + Math.sin(t * Math.PI * 2) * 0.3;
    const color = COLORS[i % COLORS.length];
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.03, 8, 24),
      new THREE.MeshBasicMaterial({ color, wireframe: false, toneMapped: false, transparent: true, opacity: 0.85 })
    );
    ring.position.z = z;
    ring.rotation.z = t * Math.PI * 3;
    ring.userData.baseZ = z;
    ring.userData.spin = (i % 2 === 0 ? 1 : -1) * (0.2 + t * 0.3);
    group.add(ring);
    rings.push(ring);
  }

  // Streaming particles for a sense of speed through the tunnel.
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1 + Math.random() * 2.2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = -Math.random() * 24;
    speeds[i] = 0.04 + Math.random() * 0.08;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xf4f1e8,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  return {
    group,
    update(elapsed, delta) {
      for (const ring of rings) {
        ring.rotation.z += ring.userData.spin * delta;
      }
      const posAttr = particleGeo.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        let z = posAttr.getZ(i) + speeds[i] * 60 * delta;
        if (z > 2) z -= 24;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;
    },
  };
}
