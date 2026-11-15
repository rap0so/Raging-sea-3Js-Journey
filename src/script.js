import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import waterFragment from "./shaders/water/fragment.glsl";
import waterVertex from "./shaders/water/vertex.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const fogColor = new THREE.Color("#022c23");
/**
 * Para que a cor daqui bata com a cor do fragment
 */
fogColor.convertSRGBToLinear();

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(fogColor, 0.02);
scene.background = fogColor;
gui.add(scene.fog, "density", 0, 1, 0.001).name("fog density");

/**
 * Water
 */
// Geometry
const geometrySize = 8;
const waterGeometry = new THREE.PlaneGeometry(
  geometrySize,
  geometrySize,
  128,
  128,
);

// Debug Color
const debugColor = {
  depthColor: "#069090",
  surfaceColor: "yellow",
  fogColor: "#022c23",
};

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertex,
  fragmentShader: waterFragment,
  side: THREE.DoubleSide,
  // activate fog - SUPER NECESSARIO!!
  fog: true,
  uniforms: {
    ...THREE.UniformsLib["fog"],
    // vertex focused
    uTime: {
      value: 0,
    },
    // big waves
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: {
      value: new THREE.Vector3(4, 0, 1.5),
    },
    uBigWavesSpeed: {
      value: 0.75,
    },
    // small waves
    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: {
      value: 3,
    },
    uSmallWavesSpeed: {
      value: 0.2,
    },
    uSmallWavesIteration: {
      value: 8.0,
    },
    // fragment focused
    uDepthColor: { value: new THREE.Color(debugColor.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugColor.surfaceColor) },
  },
});

const guiWavesFolder = gui.addFolder("Waves");
const guiColorsFolder = gui.addFolder("Colors");

guiWavesFolder
  .add(waterMaterial.uniforms.uBigWavesElevation, "value", 0.1, 1, 0.1)
  .name("big waves elevation");
guiWavesFolder
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x", 1, 20, 0.5)
  .name("big waves frequency in X");
guiWavesFolder
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "z", 1, 20, 0.5)
  .name("big waves frequency in Z");
guiWavesFolder
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value", 0.5, 20, 0.25)
  .name("big waves speed");

guiWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value", 0.1, 1, 0.05)
  .name("small waves elevation");
guiWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value", 1, 20, 1)
  .name("small waves frequency");
guiWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value", 0, 20, 0.1)
  .name("small waves speed");
guiWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesIteration, "value", 5, 20, 1)
  .name("small waves iteration");

guiColorsFolder
  .addColor(debugColor, "fogColor")
  .name("fog color")
  .onChange(() => {
    renderer.setClearColor(debugColor.fogColor);
    scene.background = debugColor.fogColor;
    // waterMaterial.uniforms.fog.value.set(debugColor.fogColor);
    // waterMaterial.uniforms.uDepthColor.value.set(debugColor.depthColor);
  });
guiColorsFolder
  .addColor(debugColor, "depthColor")
  .name("depth color")
  .onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugColor.depthColor);
  });
guiColorsFolder
  .addColor(debugColor, "surfaceColor")
  .name("surface color")
  .onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugColor.surfaceColor);
  });

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(0, 2, 6);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.maxDistance = 6;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setClearColor(fogColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  // controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
