import * as THREE from 'three';
import { buildDeskAct } from './actDesk.js';
import { buildTunnelAct } from './actTunnel.js';
import { buildDreamAct } from './actDream.js';
import { buildCoreAct } from './actCore.js';
import { buildOutroAct } from './actOutro.js';

export function buildWorld(scene) {
  const desk = buildDeskAct();
  const tunnel = buildTunnelAct();
  const dream = buildDreamAct();
  const core = buildCoreAct();
  const outro = buildOutroAct();

  scene.add(desk.group, tunnel.group, dream.group, core.group, outro.group);

  const acts = [desk, tunnel, dream, core, outro];

  return {
    acts,
    interactive: dream.interactive,
    update(elapsed, delta) {
      for (const act of acts) act.update?.(elapsed, delta);
    },
    // Cross-fade group visibility/opacity based on how close the current
    // progress is to each act's range, so transitions aren't a hard cut.
    setActVisibility(activeIndex, blend) {
      acts.forEach((act, i) => {
        const group = act.group;
        if (i === activeIndex) {
          group.visible = true;
          setGroupOpacity(group, 1);
        } else if (i === activeIndex - 1 && blend < 0.25) {
          group.visible = true;
          setGroupOpacity(group, 1 - blend / 0.25);
        } else if (i === activeIndex + 1 && blend > 0.75) {
          group.visible = true;
          setGroupOpacity(group, (blend - 0.75) / 0.25);
        } else {
          group.visible = false;
        }
      });
    },
  };
}

function setGroupOpacity(group, factor) {
  group.traverse((obj) => {
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (m.userData.__baseOpacity === undefined) {
          m.userData.__baseOpacity = m.opacity;
        }
        m.transparent = true;
        m.opacity = m.userData.__baseOpacity * factor;
      }
    } else if (obj.isLight) {
      obj.userData.__baseIntensity = obj.userData.__baseIntensity ?? obj.intensity;
      obj.intensity = obj.userData.__baseIntensity * factor;
    }
  });
}
