// === IMPORT FIREBASE ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// === KONFIGURASI FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyC95BePVEo1eMG3QldJgeeYnF3mn52gvdo",
  authDomain: "phylab-cfe0a.firebaseapp.com",
  projectId: "phylab-cfe0a",
  storageBucket: "phylab-cfe0a.firebasestorage.app",
  messagingSenderId: "132714193685",
  appId: "1:132714193685:web:8d7bcefca4110baea4ff1c",
  measurementId: "G-QLECFSNYHB"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

'use strict';

// === UTILITAS DASAR ===
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// === SETUP UI NAVBAR & MOBILE ===
const setupNavAndMobile = () => {
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.menu');
  const yearEl = $('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      menu.setAttribute('aria-expanded', !isExpanded);
      navToggle.textContent = !isExpanded ? 'Tutup' : 'Menu';
    });
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-expanded', 'false');
        navToggle.textContent = 'Menu';
      });
    });
  }
};

// === ERROR HANDLER ===
const showError = (el, message) => {
  if (!el) return;
  if (!message) {
    el.style.display = 'none';
    el.textContent = '';
  } else {
    el.style.display = 'block';
    el.textContent = message;
  }
};

// === INISIALISASI TAB LAB ===
const initTabs = () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const labContents = document.querySelectorAll('.lab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.lab;
      labContents.forEach(c => c.classList.toggle('active', c.id === target));
    });
  });
};

// === SLIDER RANGE OUTPUT ===
const initRanges = () => {
  document.querySelectorAll('input[type="range"]').forEach(range => {
    const out = document.getElementById(range.id + 'Out');
    if (out) out.textContent = range.value;
    range.addEventListener('input', () => {
      if (out) out.textContent = range.value;
    });
  });
};

// === FUNGSI RESPONSIF UNTUK CANVAS ===
function ensureCanvasSize(id, minW = 400, minH = 300) {
  const c = document.getElementById(id);
  if (!c) return;
  const w = Math.max(c.offsetWidth || 600, minW);
  const h = Math.max(c.offsetHeight || 400, minH);
  c.width = w;
  c.height = h;
}

// === SIMULASI: JATUH BEBAS ===
function startJatuhBebasSimulation() {
  const canvas = $('labCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const g = parseFloat($('g').value) || 9.8;
  const restitution = parseFloat($('e').value) || 0.8;
  const drag = parseFloat($('drag').value) || 0.004;
  let ball = { x: canvas.width / 2, y: 50, vy: 0, r: 20, color: '#60a5fa' };
  let lastTime = performance.now(), paused = false;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
  };

  const update = (delta) => {
    if (paused) return;
    ball.vy += g * (delta / 1000);
    ball.vy *= (1 - drag);
    ball.y += ball.vy;
    if (ball.y + ball.r > canvas.height - 10) {
      ball.y = canvas.height - 10 - ball.r;
      ball.vy *= -restitution;
    }
  };

  const loop = (t) => {
    const d = t - lastTime;
    lastTime = t;
    update(d);
    draw();
    requestAnimationFrame(loop);
  };
  draw();
  requestAnimationFrame(loop);

  const pauseBtn = $('pause'), resetBtn = $('reset');
  pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ Lanjut' : '⏸ Jeda';
  };
  resetBtn.onclick = () => {
    ball.y = 50; ball.vy = 0;
  };
}

// === SIMULASI: PROYEKtil ===
function startProyektilSimulation() {
  const canvas = $('proyektilCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const v0 = parseFloat($('velocityProyektil').value);
  const angle = parseFloat($('angleProyektil').value) * (Math.PI / 180);
  const h0 = parseFloat($('heightProyektil').value);
  const g = 9.8;
  let ball = { x: 40, y: canvas.height - h0 - 20, r: 10, color: '#facc15', vx: v0 * Math.cos(angle), vy: -v0 * Math.sin(angle) };
  let t = 0, paused = false;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
  };

  const update = () => {
    if (paused) return;
    t += 0.016;
    ball.x = 40 + ball.vx * t;
    const yPos = h0 + ball.vy * t - 0.5 * g * t * t;
    ball.y = canvas.height - yPos - 20;
    if (ball.y + ball.r > canvas.height - 10) paused = true;
  };

  const loop = () => {
    update();
    draw();
    if (!paused && ball.x < canvas.width) requestAnimationFrame(loop);
  };
  loop();

  const resetBtn = $('resetProyektil');
  resetBtn.onclick = () => { t = 0; paused = false; ball.x = 40; ball.y = canvas.height - h0 - 20; loop(); };
}

// === SIMULASI: PENDULUM ===
function startPendulumSimulation() {
  const canvas = $('pendulumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const length = parseFloat($('lengthPendulum').value) * 100;
  const damping = parseFloat($('dampingPendulum').value);
  const mass = parseFloat($('massPendulum').value);
  const g = 9.8;
  const origin = { x: canvas.width / 2, y: 40 };
  let angle = Math.PI / 4, aVel = 0, aAcc = 0;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bx = origin.x + length * Math.sin(angle);
    const by = origin.y + length * Math.cos(angle);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(bx, by);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, 20 * mass, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399'; ctx.fill();
  };

  const update = () => {
    aAcc = (-g / length) * Math.sin(angle);
    aVel += aAcc; aVel *= (1 - damping);
    angle += aVel;
  };

  const loop = () => { update(); draw(); requestAnimationFrame(loop); };
  loop();
}

// === FIRESTORE DISKUSI ===
function listenToDiscussions() {
  const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const list = $('discussionList');
    if (!list) return;
    list.innerHTML = '';
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement('div');
      div.className = 'diskusi-item';
      div.innerHTML = `<h3>${data.title}</h3><p class="muted">oleh ${data.authorName || 'Anon'} · ${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ''}</p>`;
      div.onclick = () => openDiscussion(docSnap.id, data);
      list.appendChild(div);
    });
  });
}

async function addNewDiscussionToDB() {
  const user = auth.currentUser;
  if (!user) { loginDialog?.showModal(); return; }
  const val = $('pertanyaanInput').value.trim();
  if (!val) return alert('Tulis pertanyaan dulu.');
  await addDoc(collection(db, "discussions"), {
    title: val, authorUid: user.uid, authorName: user.displayName || user.email,
    createdAt: serverTimestamp()
  });
  $('pertanyaanInput').value = '';
}

function openDiscussion(id, data) {
  const listView = $('discussionListView'), detailView = $('discussionDetailView');
  listView.style.display = 'none';
  detailView.style.display = 'block';
  $('detailTitle').textContent = data.title;
  loadReplies(id);
  $('replyForm').onsubmit = (e) => { e.preventDefault(); sendReply(id); };
}

function loadReplies(id) {
  const q = query(collection(db, "discussions", id, "replies"), orderBy("createdAt", "asc"));
  onSnapshot(q, (snap) => {
    const replies = $('detailReplies');
    replies.innerHTML = '';
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const d = document.createElement('div');
      d.className = 'reply-item';
      d.innerHTML = `<strong>${data.authorName || 'User'}:</strong> ${data.text}<p class="muted" style="font-size:.85rem;">${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ''}</p>`;
      replies.appendChild(d);
    });
  });
}

async function sendReply(id) {
  const user = auth.currentUser;
  if (!user) { loginDialog?.showModal(); return; }
  const txt = $('replyInput').value.trim();
  if (!txt) return;
  await addDoc(collection(db, "discussions", id, "replies"), {
    text: txt, authorUid: user.uid, authorName: user.displayName || user.email,
    createdAt: serverTimestamp()
  });
  $('replyInput').value = '';
}

// === DOMCONTENTLOADED ===
document.addEventListener('DOMContentLoaded', () => {
  setupNavAndMobile();
  initTabs();
  initRanges();
  ensureCanvasSize('labCanvas');
  ensureCanvasSize('proyektilCanvas');
  ensureCanvasSize('pendulumCanvas');

  window.addEventListener('resize', () => {
    ensureCanvasSize('labCanvas');
    ensureCanvasSize('proyektilCanvas');
    ensureCanvasSize('pendulumCanvas');
  });

  $('play')?.addEventListener('click', startJatuhBebasSimulation);
  $('playProyektil')?.addEventListener('click', startProyektilSimulation);
  $('playPendulum')?.addEventListener('click', startPendulumSimulation);

  listenToDiscussions();
  $('diskusiForm')?.addEventListener('submit', (e) => { e.preventDefault(); addNewDiscussionToDB(); });

  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('fade-in'); });
  }, observerOptions);
  document.querySelectorAll('.fade-in').forEach(sec => observer.observe(sec));
});