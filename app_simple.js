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

const QUIZ_DATA = {
  mod1: {
    title: "Kuis: Besaran & Satuan",
    questions: [
      { q: "Satuan panjang dalam SI adalah ?", opts: ["meter", "cm", "foot", "inch"], a: 0 },
      { q: "Satuan massa SI adalah ?", opts: ["gram", "kg", "ton", "ounce"], a: 1 }
    ]
  },
  mod2: {
    title: "Kuis: Vektor",
    questions: [
      { q: "Vektor memiliki ...", opts: ["nilai saja", "arah saja", "nilai dan arah", "tidak ada"], a: 2 },
      { q: "Penjumlahan vektor dilakukan dengan ...", opts: ["aljabar biasa", "metode grafis", "metode numerik", "tidak bisa"], a: 1 }
    ]
  },
  mod3: {
    title: "Kuis: Kinematika",
    questions: [
      { q: "Besaran yang berubah terhadap waktu adalah ...", opts: ["jarak", "percepatan", "massa", "gaya"], a: 1 },
      { q: "Jika kecepatan konstan maka percepatan ...", opts: ["nol", "positif", "negatif", "tak terhingga"], a: 0 }
    ]
  },
  mod4: {
    title: "Kuis: Dinamika Partikel",
    questions: [
      { q: "Hukum Newton I berkaitan dengan ...", opts: ["inertia", "gaya", "massa", "gerak melingkar"], a: 0 },
      { q: "Gaya total pada benda = massa × percepatan. Rumus ini milik ...", opts: ["Newton", "Galileo", "Einstein", "Pascal"], a: 0 }
    ]
  },
  mod5: {
    title: "Kuis: Usaha & Energi",
    questions: [
      { q: "Energi kinetik bergantung pada ...", opts: ["kecepatan kuadrat", "jarak", "gaya", "waktu"], a: 0 },
      { q: "Satuan usaha dalam SI adalah ...", opts: ["Joule", "Watt", "Newton", "Pascal"], a: 0 }
    ]
  },
  mod6: {
    title: "Kuis: Momentum & Tumbukan",
    questions: [
      { q: "Momentum didefinisikan sebagai ...", opts: ["massa × kecepatan", "gaya × waktu", "energi × waktu", "jarak × gaya"], a: 0 },
      { q: "Pada tumbukan lenting sempurna, energi kinetik ...", opts: ["terkekalkan", "hilang", "bertambah", "tak terdefinisi"], a: 0 }
    ]
  },
  mod7: {
    title: "Kuis: Dinamika Rotasi",
    questions: [
      { q: "Momen inersia bergantung pada ...", opts: ["massa & distribusi", "warna benda", "kecepatan", "gaya"], a: 0 },
      { q: "Torsi adalah analognya ...", opts: ["gaya linear", "energi", "massa", "waktu"], a: 0 }
    ]
  }
};

let quizState = {
  moduleId: null,
  currentIndex: 0,
  answers: [] // indices
};

const profileBtn = document.getElementById('profileBtn');
if (profileBtn) profileBtn.addEventListener('click', () => {
  const pd = document.getElementById('profileDialog');
  renderProfileUI();
  pd.showModal();
});

function requireLoginThen(actionFn) {
  const user = auth.currentUser;
  if (!user) {
    if (loginDialog) loginDialog.showModal();
    return false;
  }
  return actionFn();
}

function renderProfileUI() {
  const user = auth.currentUser;
  const info = document.getElementById('profileUserInfo');
  const list = document.getElementById('quizProgressList');
  if (!info || !list) return;
  if (!user) {
    info.textContent = 'Anda belum login.';
    list.innerHTML = '';
    return;
  }
  info.textContent = `${user.displayName || user.email}`;
  // load user doc
  getDoc(doc(db, 'users', user.uid)).then(udoc => {
    const data = udoc.exists() ? udoc.data() : {};
    const quizzes = (data.quizzes) || {};
    list.innerHTML = '';
    Object.keys(QUIZ_DATA).forEach(mid => {
      const title = QUIZ_DATA[mid].title;
      const q = quizzes[mid];
      const item = document.createElement('div');
      item.style.padding = '.5rem 0';
      item.style.borderBottom = '1px dashed color-mix(in srgb, var(--ink) 8%, transparent)';
      item.innerHTML = `<strong>${title}</strong><div style="font-size:.95rem; color:var(--muted)">${q ? 'Selesai — skor: ' + q.score + ' / ' + q.total + ' ('+ (q.passed ? 'Lulus':'Gagal') +')' : 'Belum selesai'}</div>`;
      list.appendChild(item);
    });
  }).catch(err => {
    console.error('load profile error', err);
  });
}

// wire quiz buttons (delegation)
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest && ev.target.closest('.quiz-btn');
  if (!btn) return;
  const moduleId = btn.getAttribute('data-module');
  openQuiz(moduleId);
});

function openQuiz(moduleId) {
  const quiz = QUIZ_DATA[moduleId];
  if (!quiz) return;
  const user = auth.currentUser;
  if (!user) {
    if (loginDialog) loginDialog.showModal();
    return;
  }
  quizState.moduleId = moduleId;
  quizState.currentIndex = 0;
  quizState.answers = new Array(quiz.questions.length).fill(null);
  renderQuiz();
  const qd = document.getElementById('quizDialog');
  qd.showModal();
}

function renderQuiz() {
  const moduleId = quizState.moduleId;
  const quiz = QUIZ_DATA[moduleId];
  const qi = quizState.currentIndex;
  const qObj = quiz.questions[qi];
  document.getElementById('quizTitle').textContent = quiz.title + ` (Soal ${qi+1}/${quiz.questions.length})`;
  document.getElementById('quizQuestionText').textContent = qObj.q;
  const opts = document.getElementById('quizOptions');
  opts.innerHTML = '';
  qObj.opts.forEach((opt, idx) => {
    const id = `opt_${idx}`;
    const wrapper = document.createElement('div');
    wrapper.style.margin = '.5rem 0';
    wrapper.innerHTML = `<label style="display:flex; gap:.5rem; align-items:center;">
      <input type="radio" name="quizOpt" value="${idx}" ${quizState.answers[qi] === idx ? 'checked' : ''} /> <span>${opt}</span>
    </label>`;
    opts.appendChild(wrapper);
  });
  // progress text
  document.getElementById('quizProgress').textContent = `Jawab soal ${qi+1} dari ${quiz.questions.length}`;
  // buttons
  document.getElementById('quizPrev').style.display = qi === 0 ? 'none' : '';
  document.getElementById('quizNext').style.display = qi === quiz.questions.length -1 ? 'none' : '';
  document.getElementById('quizSubmit').style.display = qi === quiz.questions.length -1 ? '' : 'none';
}

document.getElementById('quizPrev')?.addEventListener('click', () => {
  saveAnswerForCurrent();
  if (quizState.currentIndex > 0) {
    quizState.currentIndex--;
    renderQuiz();
  }
});
document.getElementById('quizNext')?.addEventListener('click', () => {
  saveAnswerForCurrent();
  const quiz = QUIZ_DATA[quizState.moduleId];
  if (quizState.currentIndex < quiz.questions.length -1) {
    quizState.currentIndex++;
    renderQuiz();
  }
});
document.getElementById('quizSubmit')?.addEventListener('click', async () => {
  saveAnswerForCurrent();
  await submitQuiz();
  document.getElementById('quizDialog').close();
});

function saveAnswerForCurrent() {
  const sel = document.querySelector('input[name="quizOpt"]:checked');
  const val = sel ? parseInt(sel.value,10) : null;
  quizState.answers[quizState.currentIndex] = val;
}

async function submitQuiz() {
  const moduleId = quizState.moduleId;
  const quiz = QUIZ_DATA[moduleId];
  const total = quiz.questions.length;
  let correct = 0;
  for (let i=0;i<total;i++){
    if (quizState.answers[i] === quiz.questions[i].a) correct++;
  }
  const score = correct;
  const passed = (score/total) >= 0.6;
  const payload = {
    score,
    total,
    passed,
    finishedAt: new Date().toISOString()
  };
  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const udoc = await getDoc(userRef);
      const prev = (udoc.exists() && udoc.data().quizzes) ? udoc.data().quizzes : {};
      prev[moduleId] = payload;
      await updateDoc(userRef, {
        quizzes: prev,
        lastUpdated: serverTimestamp()
      });
    } catch (err) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const obj = {};
        obj[moduleId] = payload;
        await setDoc(userRef, { quizzes: obj, lastUpdated: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error('save quiz fallback error', e);
      }
    }
    renderProfileUI();
  }
  alert(`Kuis selesai. Skor: ${score}/${total}. ${passed ? 'Selamat, lulus!' : 'Belum lulus, coba lagi.'}`);
}

onAuthStateChanged(auth, (user) => {
  const pb = document.getElementById('profileBtn');
  if (pb) pb.style.display = user && user.emailVerified ? '' : 'none';
  // also re-render profile if it's open
  const pDialog = document.getElementById('profileDialog');
  if (pDialog && pDialog.open) renderProfileUI();
});


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
