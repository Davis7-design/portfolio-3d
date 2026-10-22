// ===== PORTFOLIO MAP INTERACTIVE =====
// Car on land, Boat on water + smooth panel transitions

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

let width, height;
const MAP_W = 2400;
const MAP_H = 1600;

const player = {
  x: 280,
  y: 280,
  angle: 0,
  speed: 0,
  maxSpeed: 4.5,
  vehicle: 'car',
  radius: 18
};

const keys = {};
const mobileDir = { up: false, down: false, left: false, right: false };

const zones = [
  { x: 380, y: 380, r: 90, id: 'home', label: 'ACCUEIL', color: '#00f0ff' },
  { x: 900, y: 320, r: 85, id: 'about', label: 'À PROPOS', color: '#ff2d95' },
  { x: 1500, y: 450, r: 85, id: 'skills', label: 'COMPÉTENCES', color: '#a855f7' },
  { x: 700, y: 900, r: 90, id: 'projects', label: 'PROJETS', color: '#22d3ee' },
  { x: 1600, y: 1000, r: 90, id: 'contact', label: 'CONTACT', color: '#f472b6' },
  { x: 1100, y: 700, r: 70, id: 'cv', label: 'CV', color: '#34d399' }
];

let currentZone = null;
let canOpenPanel = false;
setTimeout(() => { canOpenPanel = true; }, 1800);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    switchVehicle();
  }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

document.getElementById('btnCar').addEventListener('click', () => setVehicle('car'));
document.getElementById('btnBoat').addEventListener('click', () => setVehicle('boat'));
document.getElementById('switchMobile').addEventListener('click', switchVehicle);

document.querySelectorAll('#mobileControls [data-dir]').forEach(btn => {
  const dir = btn.dataset.dir;
  btn.addEventListener('touchstart', e => { e.preventDefault(); mobileDir[dir] = true; });
  btn.addEventListener('touchend', e => { e.preventDefault(); mobileDir[dir] = false; });
  btn.addEventListener('mousedown', () => mobileDir[dir] = true);
  btn.addEventListener('mouseup', () => mobileDir[dir] = false);
  btn.addEventListener('mouseleave', () => mobileDir[dir] = false);
});

function setVehicle(type) {
  player.vehicle = type;
  document.getElementById('btnCar').classList.toggle('active', type === 'car');
  document.getElementById('btnBoat').classList.toggle('active', type === 'boat');
}
function switchVehicle() {
  setVehicle(player.vehicle === 'car' ? 'boat' : 'car');
}

function isWater(x, y) {
  if (y > 550 && y < 850 && x > 200 && x < 2000) return true;
  if (Math.hypot(x - 1800, y - 300) < 220) return true;
  if (Math.hypot(x - 500, y - 1200) < 280) return true;
  if (y > 1200 && x > 900 && x < 1700) return true;
  return false;
}

function update() {
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup'] || mobileDir.up) dy -= 1;
  if (keys['s'] || keys['arrowdown'] || mobileDir.down) dy += 1;
  if (keys['a'] || keys['arrowleft'] || mobileDir.left) dx -= 1;
  if (keys['d'] || keys['arrowright'] || mobileDir.right) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    player.angle = Math.atan2(dy, dx);
    player.speed = Math.min(player.speed + 0.25, player.maxSpeed);
  } else {
    player.speed *= 0.92;
    if (player.speed < 0.1) player.speed = 0;
  }

  const nextX = player.x + Math.cos(player.angle) * player.speed;
  const nextY = player.y + Math.sin(player.angle) * player.speed;

  const onWater = isWater(nextX, nextY);
  const allowed = (player.vehicle === 'boat' && onWater) || (player.vehicle === 'car' && !onWater);

  if (allowed || player.speed < 0.5) {
    if (!allowed) player.speed *= 0.6;
    player.x = Math.max(40, Math.min(MAP_W - 40, nextX));
    player.y = Math.max(40, Math.min(MAP_H - 40, nextY));
  } else {
    player.speed *= 0.5;
  }

  let found = null;
  for (const z of zones) {
    if (Math.hypot(player.x - z.x, player.y - z.y) < z.r - 10) {
      found = z;
      break;
    }
  }
  if (found && found !== currentZone && canOpenPanel) {
    currentZone = found;
    openPanel(found.id);
  } else if (!found && currentZone) {
    currentZone = null;
  }
}

function draw() {
  const camX = player.x - width / 2;
  const camY = player.y - height / 2;

  ctx.save();
  ctx.translate(-camX, -camY);

  ctx.fillStyle = '#0a1520';
  ctx.fillRect(camX - 100, camY - 100, width + 200, height + 200);

  const tile = 40;
  const startX = Math.floor(camX / tile) * tile;
  const startY = Math.floor(camY / tile) * tile;
  for (let x = startX; x < camX + width + tile; x += tile) {
    for (let y = startY; y < camY + height + tile; y += tile) {
      if (isWater(x + tile/2, y + tile/2)) {
        ctx.fillStyle = `hsl(200, 70%, ${28 + Math.sin(x*0.01 + y*0.01)*4}%)`;
      } else {
        ctx.fillStyle = `hsl(140, 35%, ${22 + Math.sin(x*0.008)*3}%)`;
      }
      ctx.fillRect(x, y, tile + 1, tile + 1);
    }
  }

  ctx.strokeStyle = 'rgba(0,240,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < MAP_W; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_H); ctx.stroke();
  }
  for (let y = 0; y < MAP_H; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_W, y); ctx.stroke();
  }

  for (const z of zones) {
    const dist = Math.hypot(player.x - z.x, player.y - z.y);
    const glow = dist < z.r + 40 ? 1 : 0.5;

    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r + 15, 0, Math.PI * 2);
    ctx.fillStyle = z.color + (glow > 0.8 ? '33' : '15');
    ctx.fill();

    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.strokeStyle = z.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7 + glow * 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = 'bold 14px Orbitron, sans-serif';
    ctx.fillStyle = z.color;
    ctx.textAlign = 'center';
    ctx.fillText(z.label, z.x, z.y + 5);
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  if (player.vehicle === 'car') {
    // Bigger clearer car
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-22, -14, 44, 28);
    ctx.fillStyle = '#007a99';
    ctx.fillRect(-12, -10, 18, 20);
    // lights
    ctx.fillStyle = '#ffff66';
    ctx.fillRect(16, -10, 8, 8);
    ctx.fillRect(16, 2, 8, 8);
    // wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(-18, -18, 10, 6);
    ctx.fillRect(-18, 12, 10, 6);
    ctx.fillRect(8, -18, 10, 6);
    ctx.fillRect(8, 12, 10, 6);
  } else {
    // Bigger boat
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(-18, -16);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-18, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -8, 14, 16);
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(player.x, player.y, 38, 0, Math.PI * 2);
  ctx.strokeStyle = player.vehicle === 'car' ? 'rgba(0,240,255,0.4)' : 'rgba(255,107,53,0.4)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

const contents = {
  home: `<h2>KOUASSI KOFFI DEVIS AXEL HEROLDE</h2><p class="subtitle">BTS Informatique Développeur d'Applications (IDA) · 2026</p><p>Bienvenue sur mon portfolio interactif ! Explore la map avec la voiture sur la terre et le bateau sur l'eau.</p><p>Approche-toi des zones colorées pour découvrir mon parcours, mes compétences et mes projets.</p>`,
  about: `<h2>À propos de moi</h2><p class="subtitle">Jeune diplômé · Recherche de stage</p><p>Jeune diplômé titulaire d'un BTS en Informatique Développeur d'Applications (IDA) obtenu en 2026, je suis actuellement à la recherche d'un stage afin d'acquérir une première expérience professionnelle.</p><p>Sérieux, motivé et désireux d'apprendre, je souhaite intégrer une structure pour mettre en pratique mes connaissances et développer mes compétences techniques.</p><p><strong>Qualités :</strong> Sérieux • Ponctuel • Motivé • Discret • Dynamique • Apprenant rapide</p>`,
  skills: `<h2>Compétences</h2><p class="subtitle">Techniques & Transversales</p><h3 style="color:#00f0ff;margin:1rem 0 0.5rem;font-size:1rem;">Techniques</h3><div class="skill-list"><span class="skill-item">HTML5 / CSS3 <small>Intermédiaire</small></span><span class="skill-item">JavaScript <small>Débutant</small></span><span class="skill-item">Bootstrap <small>Débutant</small></span><span class="skill-item">Git & GitHub <small>Débutant</small></span><span class="skill-item">MySQL <small>Intermédiaire</small></span><span class="skill-item">Responsive Design <small>Débutant</small></span></div><h3 style="color:#a855f7;margin:1.2rem 0 0.5rem;font-size:1rem;">IA & Outils</h3><div class="skill-list"><span class="skill-item">ChatGPT</span><span class="skill-item">Claude</span><span class="skill-item">Gemini</span><span class="skill-item">DeepSeek</span><span class="skill-item">GitHub Copilot</span><span class="skill-item">Perplexity</span></div>`,
  projects: `<h2>Projets</h2><p class="subtitle">Projets académiques & personnels</p><p><strong>🛒 Davisshop</strong><br>Plateforme e-commerce (React + Node + Prisma)</p><p><strong>🚗 Site de vente de voitures</strong><br>HTML/CSS, JS, MySQL (projet BTS local)</p><p><strong>🌐 Portfolio Map Interactive</strong><br>Ce portfolio unique avec navigation véhicule</p><p><strong>🇨🇮 Quiz-Ivoire</strong><br>Quiz culture générale Côte d'Ivoire</p>`,
  contact: `<h2>Contact</h2><p class="subtitle">Restons connectés</p><p>📧 heroldekouassi15@gmail.com</p><p>📞 +225 07 68 20 47 69</p><p>💻 GitHub : Davis7-design</p><p>📍 Yopougon, Abidjan, Côte d'Ivoire</p><p style="margin-top:1.5rem;">Je suis ouvert aux opportunités de stage en développement d'applications.</p>`,
  cv: `<h2>Mon CV</h2><p class="subtitle">Télécharge mon curriculum vitae</p><p>Tu peux télécharger mon CV complet au format PDF.</p><a href="CV_KOUASSI_AXEL.pdf" download class="btn-cv" style="display:inline-flex;margin-top:1rem;padding:0.8rem 1.5rem;">📄 Télécharger le CV</a>`
};

function openPanel(id) {
  const panel = document.getElementById('panel');
  const content = document.getElementById('panelContent');
  content.innerHTML = contents[id] || '<p>Zone inconnue</p>';
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

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1000);
  loop();
});
