// ===== AXEL 3D PORTFOLIO MAP =====
// Three.js - Car on land, Boat on water

const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 80, 280);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 25, 35);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
sun.position.set(60, 80, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 200;
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
scene.add(sun);

const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3a5f0b, 0.35);
scene.add(hemi);

const MAP_SIZE = 200;
const landGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 64, 64);
const pos = landGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const y = pos.getY(i);
  let h = Math.sin(x * 0.04) * Math.cos(y * 0.035) * 2.5;
  h += Math.sin(x * 0.09 + y * 0.07) * 1.2;
  pos.setZ(i, h);
}
landGeo.computeVertexNormals();

const landMat = new THREE.MeshStandardMaterial({
  color: 0x3d8b37,
  roughness: 0.85,
  metalness: 0.05
});
const land = new THREE.Mesh(landGeo, landMat);
land.rotation.x = -Math.PI / 2;
land.receiveShadow = true;
scene.add(land);

const waterGeo = new THREE.PlaneGeometry(MAP_SIZE * 1.2, MAP_SIZE * 1.2);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x1a6fb5,
  transparent: true,
  opacity: 0.85,
  roughness: 0.2,
  metalness: 0.3
});
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.8;
scene.add(water);

function addRoad(x1, z1, x2, z2, width = 4) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const geo = new THREE.PlaneGeometry(width, len);
  const mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
  const road = new THREE.Mesh(geo, mat);
  road.rotation.x = -Math.PI / 2;
  road.position.set((x1 + x2) / 2, 0.15, (z1 + z2) / 2);
  road.rotation.z = Math.atan2(x2 - x1, z2 - z1);
  road.receiveShadow = true;
  scene.add(road);
}
addRoad(-40, -40, 40, -40);
addRoad(0, -40, 0, 40);
addRoad(-40, 20, 50, 20);

const car = new THREE.Group();
const carBody = new THREE.Mesh(
  new THREE.BoxGeometry(4.2, 1.2, 2.2),
  new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.6, roughness: 0.3 })
);
carBody.position.y = 0.9;
carBody.castShadow = true;
car.add(carBody);
const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(2.2, 1.0, 1.9),
  new THREE.MeshStandardMaterial({ color: 0x007a99, metalness: 0.4, roughness: 0.3 })
);
cabin.position.set(-0.3, 1.7, 0);
cabin.castShadow = true;
car.add(cabin);
const winMat = new THREE.MeshStandardMaterial({ color: 0x88e0ff, transparent: true, opacity: 0.7 });
const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.95), winMat);
win.position.set(-0.3, 1.75, 0);
car.add(win);
const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
[[1.3, 0.45, 1.15], [1.3, 0.45, -1.15], [-1.4, 0.45, 1.15], [-1.4, 0.45, -1.15]].forEach(([x, y, z]) => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.rotation.z = Math.PI / 2;
  w.position.set(x, y, z);
  w.castShadow = true;
  car.add(w);
});
const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffff66, emissiveIntensity: 0.6 });
[[1.9, 1.0, 0.7], [1.9, 1.0, -0.7]].forEach(([x, y, z]) => {
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.35), lightMat);
  l.position.set(x, y, z);
  car.add(l);
});
car.position.set(-20, 0, -20);
scene.add(car);

const boat = new THREE.Group();
const hull = new THREE.Mesh(
  new THREE.BoxGeometry(5, 1.0, 2.2),
  new THREE.MeshStandardMaterial({ color: 0xff5c2e, metalness: 0.3, roughness: 0.4 })
);
hull.position.y = 0.4;
hull.castShadow = true;
boat.add(hull);
const bow = new THREE.Mesh(
  new THREE.ConeGeometry(1.1, 2.2, 4),
  new THREE.MeshStandardMaterial({ color: 0xff5c2e, metalness: 0.3, roughness: 0.4 })
);
bow.rotation.z = -Math.PI / 2;
bow.position.set(2.8, 0.4, 0);
boat.add(bow);
const boatCabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.3, 1.6),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
boatCabin.position.set(-0.3, 1.3, 0);
boatCabin.castShadow = true;
boat.add(boatCabin);
const boatWin = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.9, 1.65),
  new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.75 })
);
boatWin.position.set(-0.3, 1.4, 0);
boat.add(boatWin);
boat.visible = false;
boat.position.set(30, -1.2, 30);
scene.add(boat);

const zonesData = [
  { x: -20, z: -20, r: 8, id: 'home', label: 'ACCUEIL', color: 0x00f0ff },
  { x: 25, z: -25, r: 8, id: 'about', label: 'À PROPOS', color: 0xff2d95 },
  { x: 40, z: 15, r: 8, id: 'skills', label: 'COMPÉTENCES', color: 0xa855f7 },
  { x: -30, z: 30, r: 8, id: 'projects', label: 'PROJETS', color: 0x22d3ee },
  { x: 10, z: 45, r: 8, id: 'contact', label: 'CONTACT', color: 0xf472b6 },
  { x: 0, z: 0, r: 7, id: 'cv', label: 'CV', color: 0x34d399 }
];

zonesData.forEach(z => {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(z.r - 0.8, z.r, 32),
    new THREE.MeshBasicMaterial({ color: z.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(z.x, 0.3, z.z);
  scene.add(ring);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(z.r, 32),
    new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(z.x, 0.2, z.z);
  scene.add(glow);
});

let currentVehicle = 'car';
let speed = 0;
const maxSpeed = 0.55;
const keys = {};
const mobileDir = { up: false, down: false, left: false, right: false };
let currentZone = null;
let canOpenPanel = false;
setTimeout(() => canOpenPanel = true, 2000);

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space') { e.preventDefault(); switchVehicle(); }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

document.getElementById('btnCar').addEventListener('click', () => setVehicle('car'));
document.getElementById('btnBoat').addEventListener('click', () => setVehicle('boat'));
document.getElementById('switchMobile').addEventListener('click', switchVehicle);

document.querySelectorAll('#mobileControls [data-dir]').forEach(btn => {
  const dir = btn.dataset.dir;
  ['touchstart', 'mousedown'].forEach(ev => btn.addEventListener(ev, e => { e.preventDefault(); mobileDir[dir] = true; }));
  ['touchend', 'mouseup', 'mouseleave'].forEach(ev => btn.addEventListener(ev, () => mobileDir[dir] = false));
});

function setVehicle(type) {
  currentVehicle = type;
  car.visible = type === 'car';
  boat.visible = type === 'boat';
  document.getElementById('btnCar').classList.toggle('active', type === 'car');
  document.getElementById('btnBoat').classList.toggle('active', type === 'boat');
  if (type === 'car') {
    car.position.copy(boat.position);
    car.position.y = 0;
  } else {
    boat.position.copy(car.position);
    boat.position.y = -1.2;
  }
}
function switchVehicle() {
  setVehicle(currentVehicle === 'car' ? 'boat' : 'car');
}

function isWater(x, z) {
  if (z > 15 && z < 55 && x > -15 && x < 55) return true;
  if (Math.hypot(x - 35, z - 35) < 25) return true;
  if (z < -30 && x > 10) return true;
  return false;
}

const contents = {
  home: `<h2>KOUASSI KOFFI DEVIS AXEL HEROLDE</h2><p class="subtitle">BTS Informatique Développeur d'Applications (IDA) · 2026</p><p>Bienvenue dans mon univers 3D ! Conduis la voiture sur la terre et le bateau sur l'eau.</p><p>Approche les anneaux colorés pour découvrir mon profil, mes compétences et mes projets.</p>`,
  about: `<h2>À propos de moi</h2><p class="subtitle">Jeune diplômé · Recherche de stage</p><p>Jeune diplômé titulaire d'un BTS en Informatique Développeur d'Applications (IDA) obtenu en 2026. Je suis actuellement à la recherche d'un stage pour acquérir une première expérience professionnelle.</p><p>Sérieux, motivé et désireux d'apprendre.</p><p><strong>Qualités :</strong> Sérieux • Ponctuel • Motivé • Dynamique • Apprenant rapide</p>`,
  skills: `<h2>Compétences</h2><p class="subtitle">Techniques & IA</p><div class="skill-list"><span class="skill-item">HTML5 / CSS3 <small>Intermédiaire</small></span><span class="skill-item">JavaScript <small>Débutant</small></span><span class="skill-item">Bootstrap <small>Débutant</small></span><span class="skill-item">Git & GitHub <small>Débutant</small></span><span class="skill-item">MySQL <small>Intermédiaire</small></span><span class="skill-item">Responsive <small>Débutant</small></span></div><div class="skill-list" style="margin-top:0.8rem"><span class="skill-item">ChatGPT</span><span class="skill-item">Claude</span><span class="skill-item">Gemini</span><span class="skill-item">DeepSeek</span><span class="skill-item">GitHub Copilot</span></div>`,
  projects: `<h2>Projets</h2><p class="subtitle">Académiques & personnels</p><p><strong>🛒 Davisshop</strong> – E-commerce React + Node + Prisma</p><p><strong>🚗 Site vente de voitures</strong> – HTML/CSS/JS/MySQL (BTS)</p><p><strong>🌐 Portfolio 3D Map</strong> – Ce portfolio interactif</p><p><strong>🇨🇮 Quiz-Ivoire</strong> – Quiz culture ivoirienne</p>`,
  contact: `<h2>Contact</h2><p class="subtitle">Restons connectés</p><p>📧 heroldekouassi15@gmail.com</p><p>📞 +225 07 68 20 47 69</p><p>💻 GitHub : Davis7-design</p><p>📍 Yopougon, Abidjan, Côte d'Ivoire</p><p style="margin-top:1.2rem">Ouvert aux opportunités de stage en développement.</p>`,
  cv: `<h2>Mon CV</h2><p class="subtitle">Télécharge mon curriculum vitae</p><a href="CV_KOUASSI_AXEL.pdf" download class="btn-cv" style="display:inline-flex;margin-top:1rem;padding:0.75rem 1.4rem;">📄 Télécharger le CV</a>`
};

function openPanel(id) {
  const panel = document.getElementById('panel');
  document.getElementById('panelContent').innerHTML = contents[id] || '';
  panel.classList.remove('hidden');
  requestAnimationFrame(() => panel.classList.add('open'));
}
function closePanel() {
  const panel = document.getElementById('panel');
  panel.classList.remove('open');
  setTimeout(() => panel.classList.add('hidden'), 450);
  currentZone = null;
}
document.getElementById('panelClose').addEventListener('click', closePanel);

function getActiveVehicle() {
  return currentVehicle === 'car' ? car : boat;
}

function update(dt) {
  const veh = getActiveVehicle();
  let forward = 0;
  let turn = 0;

  if (keys['w'] || keys['arrowup'] || mobileDir.up) forward += 1;
  if (keys['s'] || keys['arrowdown'] || mobileDir.down) forward -= 1;
  if (keys['a'] || keys['arrowleft'] || mobileDir.left) turn += 1;
  if (keys['d'] || keys['arrowright'] || mobileDir.right) turn -= 1;

  if (forward !== 0) {
    speed = THREE.MathUtils.clamp(speed + forward * 0.025, -maxSpeed * 0.6, maxSpeed);
  } else {
    speed *= 0.92;
  }

  if (Math.abs(speed) > 0.01) {
    veh.rotation.y += turn * 0.04 * Math.sign(speed);
  }

  const dx = Math.sin(veh.rotation.y) * speed;
  const dz = Math.cos(veh.rotation.y) * speed;
  const nextX = veh.position.x + dx;
  const nextZ = veh.position.z + dz;

  const onWater = isWater(nextX, nextZ);
  const allowed = (currentVehicle === 'boat' && onWater) || (currentVehicle === 'car' && !onWater);

  if (allowed) {
    veh.position.x = THREE.MathUtils.clamp(nextX, -90, 90);
    veh.position.z = THREE.MathUtils.clamp(nextZ, -90, 90);
  } else {
    speed *= 0.5;
  }

  if (currentVehicle === 'car') {
    veh.position.y = 0;
  } else {
    veh.position.y = -1.2;
  }

  let found = null;
  for (const z of zonesData) {
    const dist = Math.hypot(veh.position.x - z.x, veh.position.z - z.z);
    if (dist < z.r - 1) {
      found = z;
      break;
    }
  }
  if (found && found !== currentZone && canOpenPanel) {
    currentZone = found;
    openPanel(found.id);
  } else if (!found) {
    currentZone = null;
  }

  const target = new THREE.Vector3(
    veh.position.x - Math.sin(veh.rotation.y) * 18,
    veh.position.y + 12,
    veh.position.z - Math.cos(veh.rotation.y) * 18
  );
  camera.position.lerp(target, 0.06);
  camera.lookAt(veh.position.x, veh.position.y + 1, veh.position.z);

  water.position.y = -1.8 + Math.sin(Date.now() * 0.001) * 0.15;
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let last = performance.now();
function animate(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1200);
  animate(performance.now());
});
