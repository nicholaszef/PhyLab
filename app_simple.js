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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let isLoggedIn = false;
let currentUser = '';

const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

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

const initTabs = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const labContents = document.querySelectorAll('.lab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.lab;
            labContents.forEach(c => c.classList.toggle('active', c.id === target));
            
            // Resize canvas when tab changes
            setTimeout(() => {
                const activeCanvas = document.querySelector(`#${target} canvas`);
                if (activeCanvas) {
                    resizeCanvas(activeCanvas);
                    // Redraw based on canvas type
                    if (activeCanvas.id === 'labCanvas') drawJF();
                    if (activeCanvas.id === 'proyektilCanvas') drawP();
                    if (activeCanvas.id === 'pendulumCanvas') drawPend();
                }
            }, 100);
        });
    });
};

const initRanges = () => {
    document.querySelectorAll('input[type="range"]').forEach(range => {
        const out = document.getElementById(range.id + 'Out');
        if (out) out.textContent = range.value;
        range.addEventListener('input', () => {
            if (out) out.textContent = range.value;
        });
    });
};

const addNewDiscussion = () => {
    const qEl = $('pertanyaanInput');
    const listEl = $('discussionList');
    const replyForm = $('replyForm');
    if (!qEl || !listEl) return;
    const val = qEl.value.trim();
    if (!val) return alert('Tulis pertanyaan dulu.');
    const item = document.createElement('div');
    item.className = 'diskusi-item';
    item.innerHTML = `<h3>${val}</h3><p class="muted">oleh ${currentUser || 'Anon'}</p>`;
    listEl.prepend(item);
    qEl.value = '';
};

// Jatuh Bebas Simulation
let animJF = null;
let stateJF = {
    y: 50, vy: 0, radius: 18, g: 9.8, e: 0.8, drag: 0.004, running: false
};

function resizeCanvas(canvas) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (canvas.width < 300) canvas.width = 300;
    if (canvas.height < 200) canvas.height = 200;
}

function drawJF() {
    const canvas = document.getElementById('labCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#e2e8f044';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    
    // Ball
    const gradient = ctx.createRadialGradient(
        canvas.width/2 - 5, stateJF.y - 5, 0,
        canvas.width/2, stateJF.y, stateJF.radius
    );
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(1, '#3b82f6');
    
    ctx.beginPath();
    ctx.arc(canvas.width/2, stateJF.y, stateJF.radius, 0, Math.PI*2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Velocity vector
    if (Math.abs(stateJF.vy) > 0.1) {
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, stateJF.y);
        ctx.lineTo(canvas.width/2 + 5, stateJF.y + stateJF.vy * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function stepJF(dt) {
    const g = parseFloat($('g')?.value || 9.8);
    const e = parseFloat($('e')?.value || 0.8);
    const drag = parseFloat($('drag')?.value || 0.004);
    
    stateJF.vy += g * dt * 60;
    stateJF.vy *= (1 - drag);
    stateJF.y += stateJF.vy * dt;
    
    const canvas = document.getElementById('labCanvas');
    const floor = canvas.height - stateJF.radius - 10;
    
    if (stateJF.y >= floor) {
        stateJF.y = floor;
        stateJF.vy = -Math.abs(stateJF.vy) * e;
        if (Math.abs(stateJF.vy) < 1) stateJF.vy = 0;
    }
}

function loopJF(timestamp) {
    if (!loopJF.lastTime) loopJF.lastTime = timestamp;
    const dt = (timestamp - loopJF.lastTime) / 1000;
    loopJF.lastTime = timestamp;
    
    if (stateJF.running) {
        stepJF(dt);
        drawJF();
        animJF = requestAnimationFrame(loopJF);
    }
}

function startJF() {
    const canvas = document.getElementById('labCanvas');
    resizeCanvas(canvas);
    stateJF.y = 50;
    stateJF.vy = 0;
    stateJF.running = true;
    loopJF.lastTime = null;
    if (animJF) cancelAnimationFrame(animJF);
    animJF = requestAnimationFrame(loopJF);
}

function pauseJF() {
    stateJF.running = false;
    if (animJF) {
        cancelAnimationFrame(animJF);
        animJF = null;
    }
}

function resetJF() {
    pauseJF();
    stateJF.y = 50;
    stateJF.vy = 0;
    drawJF();
}

// Proyektil Simulation
let animP = null;
let stateP = {
    x: 50, y: 0, vx: 0, vy: 0, running: false, trail: []
};

function drawP() {
    const canvas = document.getElementById('proyektilCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#e2e8f044';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    
    // Trail
    if (stateP.trail.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa66';
        ctx.lineWidth = 2;
        for (let i = 0; i < stateP.trail.length - 1; i++) {
            const p1 = stateP.trail[i];
            const p2 = stateP.trail[i + 1];
            if (i === 0) ctx.moveTo(p1.x, canvas.height - p1.y - 10);
            ctx.lineTo(p2.x, canvas.height - p2.y - 10);
        }
        ctx.stroke();
    }
    
    // Projectile
    const projY = canvas.height - stateP.y - 10;
    ctx.beginPath();
    ctx.arc(stateP.x, projY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b35';
    ctx.fill();
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Velocity vector
    if (Math.abs(stateP.vx) > 0.1 || Math.abs(stateP.vy) > 0.1) {
        ctx.beginPath();
        ctx.moveTo(stateP.x, projY);
        ctx.lineTo(stateP.x + stateP.vx * 0.5, projY - stateP.vy * 0.5);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function stepP(dt) {
    const g = parseFloat($('g')?.value || 9.8);
    
    stateP.vy += g * dt * 30;
    stateP.x += stateP.vx * dt * 30;
    stateP.y += stateP.vy * dt * 30;
    
    // Add to trail
    if (stateP.trail.length === 0 || 
        Math.abs(stateP.x - stateP.trail[stateP.trail.length - 1].x) > 5) {
        stateP.trail.push({x: stateP.x, y: stateP.y});
        if (stateP.trail.length > 50) stateP.trail.shift();
    }
    
    const canvas = document.getElementById('proyektilCanvas');
    if (stateP.y <= 0 || stateP.x > canvas.width + 20) {
        stateP.running = false;
    }
}

function loopP(timestamp) {
    if (!loopP.lastTime) loopP.lastTime = timestamp;
    const dt = (timestamp - loopP.lastTime) / 1000;
    loopP.lastTime = timestamp;
    
    if (stateP.running) {
        stepP(dt);
        drawP();
        animP = requestAnimationFrame(loopP);
    }
}

function startP() {
    const canvas = document.getElementById('proyektilCanvas');
    resizeCanvas(canvas);
    
    const speed = parseFloat($('velocityProyektil')?.value || 50);
    const angleDeg = parseFloat($('angleProyektil')?.value || 45);
    const height = parseFloat($('heightProyektil')?.value || 0);
    const angle = angleDeg * Math.PI / 180;
    
    stateP.x = 30;
    stateP.y = height;
    stateP.vx = speed * Math.cos(angle);
    stateP.vy = -speed * Math.sin(angle);
    stateP.running = true;
    stateP.trail = [];
    
    loopP.lastTime = null;
    if (animP) cancelAnimationFrame(animP);
    animP = requestAnimationFrame(loopP);
}

function resetP() {
    stateP.running = false;
    stateP.x = 30;
    stateP.y = 0;
    stateP.vx = 0;
    stateP.vy = 0;
    stateP.trail = [];
    if (animP) {
        cancelAnimationFrame(animP);
        animP = null;
    }
    drawP();
}

// Pendulum Simulation
let animPend = null;
let statePend = {
    theta: 0.5, omega: 0, length: 1.5, running: false
};

function drawPend() {
    const canvas = document.getElementById('pendulumCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = 50;
    const L = statePend.length * 80;
    const x = cx + L * Math.sin(statePend.theta);
    const y = cy + L * Math.cos(statePend.theta);
    
    // Pivot point
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#6b7280';
    ctx.fill();
    
    // String
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Bob
    const mass = parseFloat($('massPendulum')?.value || 1);
    const radius = Math.max(8, Math.min(20, mass * 8));
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Velocity indicator
    if (Math.abs(statePend.omega) > 0.01) {
        const vx = statePend.omega * L * Math.cos(statePend.theta) * 10;
        const vy = -statePend.omega * L * Math.sin(statePend.theta) * 10;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx, y + vy);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function stepPend(dt) {
    const g = parseFloat($('g')?.value || 9.8);
    const L = parseFloat($('lengthPendulum')?.value || 1.5);
    const damping = parseFloat($('dampingPendulum')?.value || 0.02);
    
    const alpha = -(g / L) * Math.sin(statePend.theta) - damping * statePend.omega;
    statePend.omega += alpha * dt;
    statePend.theta += statePend.omega * dt;
}

function loopPend(timestamp) {
    if (!loopPend.lastTime) loopPend.lastTime = timestamp;
    const dt = (timestamp - loopPend.lastTime) / 1000;
    loopPend.lastTime = timestamp;
    
    if (statePend.running) {
        stepPend(dt);
        drawPend();
        animPend = requestAnimationFrame(loopPend);
    }
}

function startPend() {
    const canvas = document.getElementById('pendulumCanvas');
    resizeCanvas(canvas);
    
    statePend.length = parseFloat($('lengthPendulum')?.value || 1.5);
    statePend.running = true;
    
    loopPend.lastTime = null;
    if (animPend) cancelAnimationFrame(animPend);
    animPend = requestAnimationFrame(loopPend);
}

function resetPend() {
    statePend.running = false;
    statePend.theta = 0.5;
    statePend.omega = 0;
    if (animPend) {
        cancelAnimationFrame(animPend);
        animPend = null;
    }
    drawPend();
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavAndMobile();
    initTabs();
    initRanges();
    
    // Initialize canvases
    setTimeout(() => {
        const canvasJF = document.getElementById('labCanvas');
        const canvasP = document.getElementById('proyektilCanvas');
        const canvasPend = document.getElementById('pendulumCanvas');
        
        if (canvasJF) {
            resizeCanvas(canvasJF);
            drawJF();
        }
        if (canvasP) {
            resizeCanvas(canvasP);
            drawP();
        }
        if (canvasPend) {
            resizeCanvas(canvasPend);
            drawPend();
        }
    }, 100);
    
    // Event listeners for controls
    $('play')?.addEventListener('click', startJF);
    $('pause')?.addEventListener('click', pauseJF);
    $('reset')?.addEventListener('click', resetJF);
    
    $('playProyektil')?.addEventListener('click', startP);
    $('resetProyektil')?.addEventListener('click', resetP);
    
    $('playPendulum')?.addEventListener('click', startPend);
    $('resetPendulum')?.addEventListener('click', resetPend);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const lab = activeTab.dataset.lab;
                if (lab === 'jatuh-bebas') {
                    stateJF.running ? pauseJF() : startJF();
                } else if (lab === 'proyektil') {
                    stateP.running ? resetP() : startP();
                } else if (lab === 'pendulum') {
                    statePend.running ? resetPend() : startPend();
                }
            }
        }
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
        const activeCanvas = document.querySelector('.lab-content.active canvas');
        if (activeCanvas) {
            resizeCanvas(activeCanvas);
            if (activeCanvas.id === 'labCanvas') drawJF();
            if (activeCanvas.id === 'proyektilCanvas') drawP();
            if (activeCanvas.id === 'pendulumCanvas') drawPend();
        }
    });
    
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in').forEach(section => {
        observer.observe(section);
    });
});

const loginDialog = document.getElementById('loginDialog');
const signUpDialog = document.getElementById('signUpDialog');
const loginFormElement = document.getElementById('loginFormElement');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginErrorEl = document.getElementById('loginError');
const signUpForm = document.getElementById('signUpForm');
const signUpUsername = document.getElementById('signup-username');
const signUpEmail = document.getElementById('signup-email');
const signUpPassword = document.getElementById('signup-password');
const signupErrorEl = document.getElementById('signupError');
const loginBtn = document.getElementById('loginBtn');
const signUpBtn = document.getElementById('signUpBtn');
let logoutBtn = document.getElementById('logoutBtn');
const userInfoEl = document.getElementById('userInfo');
const verifyNotice = document.getElementById('verifyNotice');
const verifyMsg = document.getElementById('verifyMsg');
const resendVerifyBtn = document.getElementById('resendVerifyBtn');
const dismissVerifyBtn = document.getElementById('dismissVerifyBtn');

if (!logoutBtn) {
    const btn = document.createElement('button');
    btn.id = 'logoutBtn';
    btn.className = 'ghost';
    btn.style.display = 'none';
    btn.textContent = 'Logout';
    document.querySelector('.actions')?.appendChild(btn);
    logoutBtn = btn;
}

loginBtn?.addEventListener('click', () => loginDialog?.showModal());
signUpBtn?.addEventListener('click', () => signUpDialog?.showModal());
logoutBtn?.addEventListener('click', async () => {
    try {
        await doLogout();
    } catch (err) {
        console.error('Logout error', err);
    }
});

async function doSignUp() {
  try {
    const displayName = signUpUsername?.value?.trim() || '';
    const email = signUpEmail?.value?.trim();
    const password = signUpPassword?.value;
    if (!email || !password) {
      showError(signupErrorEl, 'Email & password wajib.');
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    const uid = cred.user.uid;
    await setDoc(doc(db, 'users', uid), {
      displayName,
      email,
      createdAt: serverTimestamp(),
      progress: {},
      simulations: []
    });

    await sendEmailVerification(cred.user);
    await signOut(auth);

    showError(signupErrorEl, '');
    alert('Akun dibuat. Kami sudah mengirim email verifikasi ke ' + email + '. Silakan cek inbox (atau spam). Setelah verifikasi, silakan login lagi.');
    signUpDialog?.close();
  } catch (err) {
    console.error('Signup error', err);
    showError(signupErrorEl, err.message || 'Gagal membuat akun.');
  }
}

async function doLogin(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  const email = usernameInput?.value?.trim();
  const password = passwordInput?.value;
  if (!email || !password) {
    showError(loginErrorEl, 'Email & password harus diisi');
    return;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (!user.emailVerified) {
      await signOut(auth);

      if (verifyMsg) verifyMsg.textContent = `Akun ${email} belum terverifikasi. Cek inbox (atau spam).`;
      if (verifyNotice) verifyNotice.style.display = 'block';

      if (resendVerifyBtn) {
        resendVerifyBtn.onclick = async () => {
          try {
            const tempCred = await signInWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(tempCred.user);
            await signOut(auth);
            if (verifyMsg) verifyMsg.textContent = `Email verifikasi sudah dikirim ulang ke ${email}. Cek inbox / spam.`;
          } catch (err) {
            console.error('resend verify error', err);
            if (verifyMsg) verifyMsg.textContent = 'Gagal mengirim ulang verifikasi: ' + (err.message || '');
          }
        };
      }
      if (dismissVerifyBtn) {
        dismissVerifyBtn.onclick = () => {
          if (verifyNotice) verifyNotice.style.display = 'none';
        };
      }

      return;
    }

    showError(loginErrorEl, '');
    loginDialog?.close();
    loginFormElement?.reset();
  } catch (err) {
    console.error('Login err', err);
    showError(loginErrorEl, err.message || 'Gagal login');
  }
}

async function doLogout() {
    await signOut(auth);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (!user.emailVerified) {
            userInfoEl.textContent = '';
            loginBtn.style.display = '';
            signUpBtn.style.display = '';
            logoutBtn.style.display = 'none';
            return;
        }
        const nameOrEmail = user.displayName || user.email || 'User';
        userInfoEl.textContent = `Halo, ${nameOrEmail}`;
        loginBtn.style.display = 'none';
        signUpBtn.style.display = 'none';
        logoutBtn.style.display = '';

        try {
            const udoc = await getDoc(doc(db, 'users', user.uid));
            if (udoc.exists()) {
                const data = udoc.data();
                console.log('user doc loaded', data);
                loadUserStateToUI(data);
            } else {
                await setDoc(doc(db, 'users', user.uid), {
                    displayName: user.displayName || '',
                    email: user.email || '',
                    createdAt: serverTimestamp(),
                    progress: {},
                    simulations: []
                });
            }
        } catch (err) {
            console.error('Error loading user doc', err);
        }
    } else {
        userInfoEl.textContent = '';
        loginBtn.style.display = '';
        signUpBtn.style.display = '';
        logoutBtn.style.display = 'none';
    }
});

async function saveUserProgress(uid, progressObj) {
    if (!uid) return;
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            progress: progressObj,
            lastUpdated: serverTimestamp()
        });
    } catch (err) {
        try {
            await setDoc(doc(db, 'users', uid), {
                progress: progressObj,
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error('saveUserProgress fallback error', e);
        }
    }
}

async function appendSimulationResult(uid, simResult) {
    if (!uid) return;
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            simulations: arrayUnion(simResult),
            lastUpdated: serverTimestamp()
        });
    } catch (err) {
        try {
            await setDoc(doc(db, 'users', uid), {
                simulations: [simResult],
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error('appendSimulationResult fallback error', e);
        }
    }
}

function loadUserStateToUI(data) {
    if (!data) return;
    const progress = data.progress || {};
    if (progress.lastLab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lab === progress.lastLab);
        });
        document.querySelectorAll('.lab-content').forEach(c => {
            c.classList.toggle('active', c.id === progress.lastLab);
        });
    }
    if (progress.settings) {
        Object.entries(progress.settings).forEach(([k,v]) => {
            const el = document.getElementById(k);
            const out = document.getElementById(k + 'Out');
            if (el) el.value = v;
            if (out) out.textContent = v;
        });
    }
}
