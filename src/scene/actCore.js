import * as THREE from 'three';

export function buildCoreAct() {
  const group = new THREE.Group();
  const CORE_Z = -45;

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x6bfff2,
      emissiveIntensity: 1.4,
      roughness: 0.15,
      metalness: 0.4,
      wireframe: false,
    })
  );
  core.position.set(0, 0.2, CORE_Z);
  group.add(core);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.55, 1),
    new THREE.MeshBasicMaterial({ color: 0xff5ec4, wireframe: true, transparent: true, opacity: 0.5 })
  );
  wire.position.copy(core.position);
  group.add(wire);

  const coreLight = new THREE.PointLight(0x6bfff2, 8, 20, 2);
  coreLight.position.copy(core.position);
  group.add(coreLight);

  const rings = [];
  const ringColors = [0xffb454, 0xff5ec4, 0x6bfff2];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2 + i * 0.5, 0.02, 8, 64),
      new THREE.MeshBasicMaterial({ color: ringColors[i], transparent: true, opacity: 0.7 })
    );
    ring.position.copy(core.position);
    ring.rotation.x = Math.PI / 2 + i * 0.5;
    ring.rotation.y = i * 0.7;
    ring.userData.speed = 0.15 + i * 0.08;
    ring.userData.axis = i % 2 === 0 ? 'x' : 'y';
    group.add(ring);
    rings.push(ring);
  }

  // Orbiting sparks
  const sparkCount = 60;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkAngle = new Float32Array(sparkCount);
  const sparkRadius = new Float32Array(sparkCount);
  for (let i = 0; i < sparkCount; i++) {
    sparkAngle[i] = Math.random() * Math.PI * 2;
    sparkRadius[i] = 2.5 + Math.random() * 2;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({ color: 0xf4f1e8, size: 0.06, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(sparks);

  return {
    group,
    update(elapsed, delta) {
      core.rotation.y += delta * 0.25;
      core.rotation.x += delta * 0.1;
      wire.rotation.y -= delta * 0.18;
      coreLight.intensity = 7 + Math.sin(elapsed * 2) * 1.2;

      for (const ring of rings) {
        ring.rotation[ring.userData.axis] += ring.userData.speed * delta;
      }

      const posAttr = sparkGeo.getAttribute('position');
      for (let i = 0; i < sparkCount; i++) {
        sparkAngle[i] += delta * 0.4;
        const y = Math.sin(sparkAngle[i] * 1.7 + i) * 1.2;
        posAttr.setXYZ(
          i,
          core.position.x + Math.cos(sparkAngle[i]) * sparkRadius[i],
          core.position.y + y,
          core.position.z + Math.sin(sparkAngle[i]) * sparkRadius[i]
        );
      }
      posAttr.needsUpdate = true;
    },
  };
}
