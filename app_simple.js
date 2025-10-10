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

class SimpleParticles {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        if (this.canvas.width < 400) this.canvas.width = 400;
        if (this.canvas.height < 300) this.canvas.height = 300;
        this.balls = [
            { x: 100, y: 50, vx: 2, vy: 0, radius: 10, color: '#60a5fa' },
            { x: 200, y: 80, vx: -1, vy: 0, radius: 12, color: '#f59e0b' },
            { x: 300, y: 60, vx: 0.5, vy: 0, radius: 8, color: '#10b981' }
        ];
        this.render();
    }
    render() {
        const ctx = this.ctx;
        const c = this.canvas;
        ctx.clearRect(0,0,c.width,c.height);
        this.balls.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
            ctx.fillStyle = b.color;
            ctx.fill();
        });
        requestAnimationFrame(() => this.render());
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    setupNavAndMobile();
    initTabs();
    initRanges();
    
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

document.addEventListener('DOMContentLoaded', () => {
    setupNavAndMobile();
    initTabs();
    initRanges();

    if (loginFormElement) {
        loginFormElement.onsubmit = doLogin;
    }

    const submitSignUpBtn = document.getElementById('submitSignUp');
    if (submitSignUpBtn) {
        submitSignUpBtn.addEventListener('click', doSignUp);
    } else {
        if (signUpForm) {
            signUpForm.addEventListener('submit', (ev) => {
                ev.preventDefault();
                doSignUp();
            });
        }
    }

    const playBtn = document.getElementById('play');
    playBtn?.addEventListener('click', async () => {
        const user = auth.currentUser;
        const settings = {
            g: document.getElementById('g')?.value,
            e: document.getElementById('e')?.value,
            drag: document.getElementById('drag')?.value
        };
        if (user) await saveUserProgress(user.uid, { lastLab: 'jatuh-bebas', settings });
        if (typeof startJatuhBebasSimulation === 'function') startJatuhBebasSimulation();
    });
});

async function onSimulationFinished(labName, params, results) {
    const user = auth.currentUser;
    const simPayload = {
        lab: labName,
        params,
        results,
        finishedAt: new Date().toISOString()
    };
    if (user) await appendSimulationResult(user.uid, simPayload);
    console.log('Simulation finished (saved if logged):', simPayload);
}

window.phylab_onSimulationFinished = onSimulationFinished;

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
