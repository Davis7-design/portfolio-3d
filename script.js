// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1200);
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  alert(`Merci ${name} ! Ton message a bien été reçu (simulation). Je te répondrai bientôt 💜`);
  e.target.reset();
});

// ===== THREE.JS 3D MAP =====
(function init3DMap() {
  const canvas = document.getElementById('map3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 12, 18);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0f, 1);
  renderer.shadowMap.enabled = true;

  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 8;
  controls.maxDistance = 35;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.target.set(0, 0, 0);

  // Lights
  const ambient = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const point1 = new THREE.PointLight(0xff2d95, 1.5, 40);
  point1.position.set(-8, 6, 5);
  scene.add(point1);

  const point2 = new THREE.PointLight(0xa855f7, 1.2, 40);
  point2.position.set(8, 5, -5);
  scene.add(point2);

  // Ground plane (water / base)
  const groundGeo = new THREE.CircleGeometry(25, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a1520,
    metalness: 0.8,
    roughness: 0.3,
    transparent: true,
    opacity: 0.9
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper subtle
  const grid = new THREE.GridHelper(40, 40, 0x00f0ff, 0x1a1a2e);
  grid.position.y = 0.01;
  grid.material.opacity = 0.15;
  grid.material.transparent = true;
  scene.add(grid);

  // Floating platforms (islands)
  const platforms = [];
  const platformData = [
    { x: 0, z: 0, color: 0x00f0ff, label: 'HOME', scale: 1.4 },
    { x: -7, z: -4, color: 0xff2d95, label: 'ABOUT', scale: 1 },
    { x: 7, z: -3, color: 0xa855f7, label: 'SKILLS', scale: 1 },
    { x: -5, z: 6, color: 0x22d3ee, label: 'PROJECTS', scale: 1.1 },
    { x: 6, z: 5, color: 0xf472b6, label: 'CONTACT', scale: 0.95 }
  ];

  platformData.forEach((data, i) => {
    const group = new THREE.Group();

    // Platform base
    const geo = new THREE.CylinderGeometry(1.8 * data.scale, 2.2 * data.scale, 0.6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: data.color,
      metalness: 0.6,
      roughness: 0.25,
      emissive: data.color,
      emissiveIntensity: 0.15
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Top glowing disc
    const discGeo = new THREE.CircleGeometry(1.5 * data.scale, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.35;
    group.add(disc);

    // Floating ring
    const ringGeo = new THREE.TorusGeometry(2.1 * data.scale, 0.06, 8, 40);
    const ringMat = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.4;
    group.add(ring);

    group.position.set(data.x, 0.5 + Math.random() * 0.3, data.z);
    group.userData = { baseY: group.position.y, speed: 0.8 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2, label: data.label };
    scene.add(group);
    platforms.push(group);
  });

  // Floating particles
  const particlesCount = 400;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Central crystal / monument
  const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.4
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.set(0, 2.5, 0);
  crystal.castShadow = true;
  scene.add(crystal);

  // Animate
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Platforms floating
    platforms.forEach(p => {
      p.position.y = p.userData.baseY + Math.sin(t * p.userData.speed + p.userData.phase) * 0.25;
      p.rotation.y += 0.003;
    });

    // Crystal
    crystal.rotation.y += 0.01;
    crystal.rotation.x = Math.sin(t * 0.5) * 0.15;
    crystal.position.y = 2.5 + Math.sin(t * 1.2) * 0.2;

    // Particles slow drift
    particles.rotation.y = t * 0.02;

    // Lights pulse
    point1.intensity = 1.2 + Math.sin(t * 1.5) * 0.4;
    point2.intensity = 1.0 + Math.sin(t * 1.2 + 1) * 0.3;

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
