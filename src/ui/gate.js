import { gsap } from 'gsap';

const BOOT_LINES = [
  'BOOTING PORTAL STUDIO OS...',
  'CHECKING SIGNAL INTEGRITY... OK',
  'LOADING DREAM LAYER... OK',
  'MACHINE IS AWAKE.',
];

function typeLines(el, lines, onDone) {
  let li = 0;

  function typeLine() {
    if (li >= lines.length) {
      onDone();
      return;
    }
    const line = lines[li];
    let ci = 0;
    const interval = setInterval(() => {
      ci++;
      el.textContent = [...lines.slice(0, li), line.slice(0, ci)].join('\n');
      if (ci >= line.length) {
        clearInterval(interval);
        li++;
        setTimeout(typeLine, 220);
      }
    }, 18);
  }

  typeLine();
}

function startAmbientDrone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.05;
    master.connect(ctx.destination);

    const freqs = [55, 82.4, 110];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 1 ? 'triangle' : 'sine';
      osc.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.value = i === 0 ? 0.6 : 0.3;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      lfo.start();
    });
  } catch (e) {
    // Web Audio unavailable — silently continue without ambient sound.
  }
}

export function initGate(onPowerOn) {
  const bootLog = document.getElementById('boot-log');
  const powerBtn = document.getElementById('power-btn');
  const gate = document.getElementById('gate');

  document.body.classList.add('locked');

  typeLines(bootLog, BOOT_LINES, () => {
    powerBtn.classList.add('ready');
  });

  powerBtn.addEventListener('click', () => {
    startAmbientDrone();
    gsap.to(gate, {
      opacity: 0,
      duration: 0.9,
      onComplete: () => {
        gate.classList.add('hidden');
        document.body.classList.remove('locked');
        onPowerOn?.();
      },
    });
  }, { once: true });
}
