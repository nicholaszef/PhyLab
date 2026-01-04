export const labHTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0f172a; font-family: system-ui; color: #fff; }
.tabs { display: flex; gap: 8px; padding: 12px; background: #1e293b; }
.tab { padding: 8px 14px; border: none; border-radius: 6px; background: #334155; color: #94a3b8; font-size: 13px; }
.tab.active { background: #3b82f6; color: #fff; }
.lab { display: none; padding: 12px; }
.lab.active { display: block; }
canvas { width: 100%; height: 260px; background: #1e293b; border-radius: 8px; }
.controls { background: #1e293b; padding: 12px; border-radius: 8px; margin-top: 10px; }
.ctrl { margin-bottom: 10px; }
.ctrl label { display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px; }
.ctrl input { width: 100%; }
.btns { display: flex; gap: 8px; margin-top: 10px; }
.btn { flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
.play { background: #3b82f6; color: #fff; }
.reset { background: #334155; color: #fff; }
output { color: #60a5fa; font-weight: 600; }
</style>
</head>
<body>
<div class="tabs">
  <button class="tab active" onclick="show('jatuh')">Jatuh Bebas</button>
  <button class="tab" onclick="show('proyektil')">Proyektil</button>
  <button class="tab" onclick="show('pendulum')">Pendulum</button>
</div>

<div id="jatuh" class="lab active">
  <canvas id="c1"></canvas>
  <div class="controls">
    <div class="ctrl">
      <label>Gravitasi: <output id="gO">9.8</output> m/s²</label>
      <input type="range" id="g" min="1" max="20" step="0.1" value="9.8" oninput="gO.textContent=this.value">
    </div>
    <div class="ctrl">
      <label>Restitusi: <output id="eO">0.8</output></label>
      <input type="range" id="e" min="0" max="1" step="0.05" value="0.8" oninput="eO.textContent=this.value">
    </div>
    <div class="btns">
      <button class="btn play" onclick="startJatuh()">▶ Mulai</button>
      <button class="btn reset" onclick="resetJatuh()">↺ Reset</button>
    </div>
  </div>
</div>

<div id="proyektil" class="lab">
  <canvas id="c2"></canvas>
  <div class="controls">
    <div class="ctrl">
      <label>Kecepatan: <output id="vO">50</output> m/s</label>
      <input type="range" id="v0" min="10" max="100" value="50" oninput="vO.textContent=this.value">
    </div>
    <div class="ctrl">
      <label>Sudut: <output id="aO">45</output>°</label>
      <input type="range" id="ang" min="5" max="85" value="45" oninput="aO.textContent=this.value">
    </div>
    <div class="btns">
      <button class="btn play" onclick="startProyektil()">▶ Mulai</button>
      <button class="btn reset" onclick="resetProyektil()">↺ Reset</button>
    </div>
  </div>
</div>

<div id="pendulum" class="lab">
  <canvas id="c3"></canvas>
  <div class="controls">
    <div class="ctrl">
      <label>Panjang: <output id="lO">1.5</output> m</label>
      <input type="range" id="len" min="0.5" max="3" step="0.1" value="1.5" oninput="lO.textContent=this.value">
    </div>
    <div class="ctrl">
      <label>Redaman: <output id="dO">0.02</output></label>
      <input type="range" id="damp" min="0" max="0.1" step="0.01" value="0.02" oninput="dO.textContent=this.value">
    </div>
    <div class="btns">
      <button class="btn play" onclick="startPendulum()">▶ Mulai</button>
    </div>
  </div>
</div>

<script>
function show(id) {
  document.querySelectorAll('.lab').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

let a1, a2, a3;

function startJatuh() {
  cancelAnimationFrame(a1);
  const c = document.getElementById('c1'), ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  const g = parseFloat(document.getElementById('g').value);
  const e = parseFloat(document.getElementById('e').value);
  let ball = { x: c.width/2, y: 30, vy: 0, r: 15 };
  let last = performance.now();
  function draw(now) {
    const dt = (now - last) / 1000; last = now;
    ball.vy += g * dt; ball.y += ball.vy * 10;
    if (ball.y + ball.r > c.height - 10) { ball.y = c.height - 10 - ball.r; ball.vy *= -e; }
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#475569'; ctx.fillRect(0, c.height - 10, c.width, 10);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa'; ctx.fill();
    a1 = requestAnimationFrame(draw);
  }
  draw(performance.now());
}

function resetJatuh() {
  cancelAnimationFrame(a1);
  const c = document.getElementById('c1'), ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#475569'; ctx.fillRect(0, c.height - 10, c.width, 10);
  ctx.beginPath(); ctx.arc(c.width/2, 30, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa'; ctx.fill();
}

function startProyektil() {
  cancelAnimationFrame(a2);
  const c = document.getElementById('c2'), ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  const v0 = parseFloat(document.getElementById('v0').value);
  const angle = parseFloat(document.getElementById('ang').value) * Math.PI / 180;
  const g = 9.8;
  let t = 0, x0 = 30, y0 = c.height - 30;
  function draw() {
    t += 0.03;
    const x = x0 + v0 * Math.cos(angle) * t * 3;
    const y = y0 - (v0 * Math.sin(angle) * t - 0.5 * g * t * t) * 3;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#475569'; ctx.fillRect(0, c.height - 10, c.width, 10);
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15'; ctx.fill();
    if (y < c.height - 10 && x < c.width) a2 = requestAnimationFrame(draw);
  }
  draw();
}

function resetProyektil() {
  cancelAnimationFrame(a2);
  const c = document.getElementById('c2'), ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#475569'; ctx.fillRect(0, c.height - 10, c.width, 10);
  ctx.beginPath(); ctx.arc(30, c.height - 30, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#facc15'; ctx.fill();
}

function startPendulum() {
  cancelAnimationFrame(a3);
  const c = document.getElementById('c3'), ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  const length = parseFloat(document.getElementById('len').value) * 80;
  const damping = parseFloat(document.getElementById('damp').value);
  const g = 9.8, origin = { x: c.width / 2, y: 30 };
  let angle = Math.PI / 4, angVel = 0;
  function draw() {
    const angAcc = (-g / length) * Math.sin(angle);
    angVel += angAcc; angVel *= (1 - damping); angle += angVel;
    const bx = origin.x + length * Math.sin(angle);
    const by = origin.y + length * Math.cos(angle);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(bx, by);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399'; ctx.fill();
    a3 = requestAnimationFrame(draw);
  }
  draw();
}

resetJatuh();
</script>
</body>
</html>
`;
