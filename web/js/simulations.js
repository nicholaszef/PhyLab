let jatuhAnim, proyektilAnim, pendulumAnim;

export function startJatuhBebas() {
  cancelAnimationFrame(jatuhAnim);
  const canvas = document.getElementById('labCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = canvas.offsetHeight || 400;

  const g = parseFloat(document.getElementById('g').value) || 9.8;
  const e = parseFloat(document.getElementById('e').value) || 0.8;
  const drag = parseFloat(document.getElementById('drag').value) || 0.004;

  let ball = { x: canvas.width / 2, y: 50, vy: 0, r: 20 };
  let paused = false;
  let lastTime = performance.now();

  function draw(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (!paused) {
      ball.vy += g * dt;
      ball.vy *= (1 - drag);
      ball.y += ball.vy * 10;
      if (ball.y + ball.r > canvas.height - 10) {
        ball.y = canvas.height - 10 - ball.r;
        ball.vy *= -e;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();

    jatuhAnim = requestAnimationFrame(draw);
  }

  draw(performance.now());

  document.getElementById('pause').onclick = () => {
    paused = !paused;
    document.getElementById('pause').textContent = paused ? '▶ Lanjut' : '⏸ Jeda';
  };

  document.getElementById('reset').onclick = () => {
    ball.y = 50;
    ball.vy = 0;
  };
}

export function startProyektil() {
  cancelAnimationFrame(proyektilAnim);
  const canvas = document.getElementById('proyektilCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = canvas.offsetHeight || 400;

  const v0 = parseFloat(document.getElementById('velocityProyektil').value) || 50;
  const angle = (parseFloat(document.getElementById('angleProyektil').value) || 45) * Math.PI / 180;
  const h0 = parseFloat(document.getElementById('heightProyektil').value) || 0;
  const g = 9.8;

  let t = 0;
  let paused = false;
  const x0 = 30, y0 = canvas.height - 30;

  function draw() {
    if (!paused) t += 0.03;

    const x = x0 + v0 * Math.cos(angle) * t * 3;
    const y = y0 - (v0 * Math.sin(angle) * t - 0.5 * g * t * t) * 3;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    if (y < canvas.height - 10 && x < canvas.width) {
      proyektilAnim = requestAnimationFrame(draw);
    } else {
      paused = true;
    }
  }

  draw();

  document.getElementById('resetProyektil').onclick = () => {
    t = 0;
    paused = false;
    draw();
  };
}

export function startPendulum() {
  cancelAnimationFrame(pendulumAnim);
  const canvas = document.getElementById('pendulumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = canvas.offsetHeight || 400;

  const length = (parseFloat(document.getElementById('lengthPendulum').value) || 1.5) * 80;
  const damping = parseFloat(document.getElementById('dampingPendulum').value) || 0.02;
  const mass = parseFloat(document.getElementById('massPendulum').value) || 1;
  const g = 9.8;

  const origin = { x: canvas.width / 2, y: 30 };
  let angle = Math.PI / 4;
  let angVel = 0;

  function draw() {
    const angAcc = (-g / length) * Math.sin(angle);
    angVel += angAcc;
    angVel *= (1 - damping);
    angle += angVel;

    const bobX = origin.x + length * Math.sin(angle);
    const bobY = origin.y + length * Math.cos(angle);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bobX, bobY, 18 * mass, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.fill();

    pendulumAnim = requestAnimationFrame(draw);
  }

  draw();
}
