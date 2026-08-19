import * as THREE from 'three';

const planetDefinitions = [
  { name: 'EARTH', texture: './textures/earth.jpg', radius: 4.2, x: 0, z: 14, tilt: 23.44 },
  { name: 'MARS', texture: './textures/mars.jpg', radius: 3.1, x: -27, z: 0, tilt: 25.19 },
  { name: 'JUPITER', texture: './textures/jupiter.jpg', radius: 6.4, x: 0, z: -14, tilt: 3.13 },
  { name: 'SATURN', texture: './textures/saturn.jpg', radius: 5.2, x: 27, z: 0, tilt: 26.73 }
];

const oldCanvas = document.querySelector('#app canvas');
if (oldCanvas) oldCanvas.style.visibility = 'hidden';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.setClearColor(0x000000, 0);
renderer.domElement.className = 'realistic-planet-layer';
renderer.domElement.setAttribute('aria-hidden', 'true');
renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
document.querySelector('#app')?.append(renderer.domElement);

scene.add(new THREE.AmbientLight(0x8ea5c4, 0.42));
const sun = new THREE.DirectionalLight(0xffe5c0, 3.2);
sun.position.set(22, 24, 30);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x527fbd, 1.15);
fill.position.set(-30, -15, -30);
scene.add(fill);

const loader = new THREE.TextureLoader();
const groups = [];

planetDefinitions.forEach((definition) => {
  const group = new THREE.Group();
  group.name = definition.name;
  group.position.set(definition.x * 0.72, 0, definition.z * 0.72);
  group.rotation.z = THREE.MathUtils.degToRad(definition.tilt);
  const map = loader.load(definition.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({ map, roughness: 0.86, metalness: 0 });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(definition.radius, 96, 64), material);
  group.add(planet);

  if (definition.name === 'EARTH') {
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(definition.radius * 1.035, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0x3c8bff, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, side: THREE.BackSide })
    );
    group.add(atmosphere);
  }

  if (definition.name === 'SATURN') {
    const rings = new THREE.Mesh(
      new THREE.RingGeometry(definition.radius * 1.34, definition.radius * 2.25, 128),
      new THREE.MeshStandardMaterial({ color: 0xbba681, roughness: 0.72, metalness: 0, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    rings.rotation.x = Math.PI / 2;
    group.add(rings);
  }

  scene.add(group);
  groups.push({ group, planet });
});

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener('resize', resize);
let rotation = 0;
function animate() {
  requestAnimationFrame(animate);
  rotation += 0.0014;
  groups.forEach(({ group, planet }, index) => {
    const angle = rotation + index * Math.PI / 2;
    group.position.x = Math.sin(angle) * 19.5;
    group.position.z = Math.cos(angle) * 10;
    planet.rotation.y += index === 2 ? 0.004 : 0.008;
  });
  camera.lookAt(-4, 0, 0);
  renderer.render(scene, camera);
}
animate();