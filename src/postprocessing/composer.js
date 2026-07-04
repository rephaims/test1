import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const CrtShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uAberration: { value: 0.0015 },
    uScanlineStrength: { value: 0.12 },
    uVignette: { value: 0.35 },
    uGrain: { value: 0.06 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGlitch;
    uniform float uAberration;
    uniform float uScanlineStrength;
    uniform float uVignette;
    uniform float uGrain;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // Occasional horizontal glitch displacement, driven externally.
      float glitchLine = step(0.5, rand(vec2(floor(uv.y * 40.0), uTime * 3.0)));
      float lineShift = (rand(vec2(uTime * 7.0, floor(uv.y * 40.0))) - 0.5) * uGlitch * glitchLine * 0.06;
      uv.x += lineShift;

      float aberration = uAberration * (1.0 + uGlitch * 4.0);
      float r = texture2D(tDiffuse, uv + vec2(aberration, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(aberration, 0.0)).b;
      vec3 color = vec3(r, g, b);

      float scan = sin(uv.y * uResolution.y * 1.4 + uTime * 6.0) * 0.5 + 0.5;
      color -= scan * uScanlineStrength * 0.5;

      vec2 centered = uv - 0.5;
      float vig = 1.0 - dot(centered, centered) * uVignette * 2.2;
      color *= clamp(vig, 0.0, 1.0);

      float grain = (rand(uv * uResolution.xy + uTime) - 0.5) * uGrain;
      color += grain;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export function createComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.85,
    0.6,
    0.15
  );
  composer.addPass(bloom);

  const crtPass = new ShaderPass(CrtShader);
  crtPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  composer.addPass(crtPass);

  function setSize(width, height) {
    composer.setSize(width, height);
    crtPass.uniforms.uResolution.value.set(width, height);
  }

  return { composer, bloom, crtPass, setSize };
}
