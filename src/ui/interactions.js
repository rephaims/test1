import * as THREE from 'three';
import { gsap } from 'gsap';

export function initInteractions({ camera, world, onHit, scroll }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const canvas = document.getElementById('scene');
  const revealPanel = document.getElementById('reveal-panel');
  const revealText = document.getElementById('reveal-text');

  function pointerToNdc(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  canvas.addEventListener('pointerdown', (event) => {
    pointerToNdc(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(world.interactive, false);
    if (hits.length === 0) return;

    const obj = hits[0].object;
    gsap.fromTo(
      obj.scale,
      { x: 1.25, y: 1.25, z: 1.25 },
      { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
    );

    revealText.textContent = obj.userData.revealText || '';
    gsap.killTweensOf(revealPanel);
    gsap.fromTo(revealPanel, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.to(revealPanel, { opacity: 0, delay: 3.2, duration: 0.6 });

    onHit?.();
  });

  const ctaBtn = document.getElementById('cta-enter');
  ctaBtn?.addEventListener('click', () => {
    scroll.scrollToProgress(0.86);
  });
}
