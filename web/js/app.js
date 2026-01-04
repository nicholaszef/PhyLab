import { auth, onAuthStateChanged, login, register, logout, resendVerification, getUserData, saveQuizResult, listenDiscussions, addDiscussion, listenReplies, addReply, saveProgress } from './firebase.js';
import { QUIZ_DATA, MATERI_DATA } from './data.js';
import { startJatuhBebas, startProyektil, startPendulum } from './simulations.js';

const $ = id => document.getElementById(id);

let quizState = { moduleId: null, currentIndex: 0, answers: [] };
let tempLoginData = { email: '', password: '' };

function initUI() {
  $('year').textContent = new Date().getFullYear();

  document.querySelector('.nav-toggle')?.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !expanded);
    document.querySelector('.menu').setAttribute('aria-expanded', !expanded);
    this.textContent = expanded ? 'Menu' : 'Tutup';
  });

  document.querySelectorAll('.menu a').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
      document.querySelector('.menu').setAttribute('aria-expanded', 'false');
      document.querySelector('.nav-toggle').textContent = 'Menu';
    });
  });

  document.querySelectorAll('input[type="range"]').forEach(range => {
    const out = $(range.id + 'Out');
    if (out) {
      out.textContent = range.value;
      range.addEventListener('input', () => out.textContent = range.value);
    }
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.lab-content').forEach(c => c.classList.toggle('active', c.id === btn.dataset.lab));
    });
  });
}

function renderMateri() {
  const grid = $('materiGrid');
  if (!grid) return;
  grid.innerHTML = MATERI_DATA.map(m => `
    <div class="materi-card">
      <div class="materi-icon">${m.icon}</div>
      <h3>${m.title}</h3>
      <p>${m.desc}</p>
      <a href="${m.video}" class="btn youtube-btn" target="_blank">▶ Video</a>
      <button class="btn quiz-btn" data-module="${m.id}">Kuis</button>
    </div>
  `).join('');
}

function initAuth() {
  $('loginBtn').onclick = () => $('loginDialog').showModal();
  $('signUpBtn').onclick = () => $('signUpDialog').showModal();
  $('logoutBtn').onclick = () => logout();
  $('profileBtn').onclick = () => { renderProfile(); $('profileDialog').showModal(); };

  $('loginFormElement').onsubmit = async e => {
    e.preventDefault();
    const email = $('username').value.trim();
    const password = $('password').value;
    tempLoginData = { email, password };
    try {
      await login(email, password);
      $('loginDialog').close();
      $('loginFormElement').reset();
      $('loginError').textContent = '';
    } catch (err) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        $('verifyMsg').textContent = `Email ${email} belum diverifikasi. Cek inbox/spam.`;
        $('verifyNotice').style.display = 'block';
      } else {
        $('loginError').textContent = err.message;
      }
    }
  };

  $('resendVerifyBtn').onclick = async () => {
    try {
      await resendVerification(tempLoginData.email, tempLoginData.password);
      $('verifyMsg').textContent = 'Email verifikasi terkirim ulang.';
    } catch (err) {
      $('verifyMsg').textContent = 'Gagal: ' + err.message;
    }
  };

  $('dismissVerifyBtn').onclick = () => $('verifyNotice').style.display = 'none';

  $('signUpForm').onsubmit = async e => {
    e.preventDefault();
    const name = $('signup-username').value.trim();
    const email = $('signup-email').value.trim();
    const password = $('signup-password').value;
    try {
      await register(name, email, password);
      alert('Akun dibuat! Cek email untuk verifikasi.');
      $('signUpDialog').close();
      $('signUpForm').reset();
    } catch (err) {
      $('signupError').textContent = err.message;
    }
  };

  onAuthStateChanged(auth, user => {
    const loggedIn = user && user.emailVerified;
    $('loginBtn').style.display = loggedIn ? 'none' : '';
    $('signUpBtn').style.display = loggedIn ? 'none' : '';
    $('logoutBtn').style.display = loggedIn ? '' : 'none';
    $('profileBtn').style.display = loggedIn ? '' : 'none';
    $('userInfo').textContent = loggedIn ? `Halo, ${user.displayName || user.email}` : '';
  });
}

async function renderProfile() {
  const user = auth.currentUser;
  if (!user) return;
  $('profileUserInfo').textContent = user.displayName || user.email;
  const data = await getUserData(user.uid);
  const quizzes = data?.quizzes || {};
  $('quizProgressList').innerHTML = Object.keys(QUIZ_DATA).map(mid => {
    const q = quizzes[mid];
    return `<div class="quiz-progress-item">
      <strong>${QUIZ_DATA[mid].title}</strong>
      <span>${q ? `${q.score}/${q.total} (${q.passed ? 'Lulus' : 'Gagal'})` : 'Belum'}</span>
    </div>`;
  }).join('');
}

function initQuiz() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.quiz-btn');
    if (!btn) return;
    if (!auth.currentUser) return $('loginDialog').showModal();
    const moduleId = btn.dataset.module;
    const quiz = QUIZ_DATA[moduleId];
    quizState = { moduleId, currentIndex: 0, answers: new Array(quiz.questions.length).fill(null) };
    renderQuiz();
    $('quizDialog').showModal();
  });

  $('quizPrev').onclick = () => { saveAnswer(); quizState.currentIndex--; renderQuiz(); };
  $('quizNext').onclick = () => { saveAnswer(); quizState.currentIndex++; renderQuiz(); };
  $('quizSubmit').onclick = async () => { saveAnswer(); await submitQuiz(); $('quizDialog').close(); };
}

function renderQuiz() {
  const quiz = QUIZ_DATA[quizState.moduleId];
  const q = quiz.questions[quizState.currentIndex];
  $('quizTitle').textContent = `${quiz.title} (${quizState.currentIndex + 1}/${quiz.questions.length})`;
  $('quizQuestionText').textContent = q.q;
  $('quizOptions').innerHTML = q.opts.map((opt, i) => `
    <label class="quiz-option"><input type="radio" name="quizOpt" value="${i}" ${quizState.answers[quizState.currentIndex] === i ? 'checked' : ''}> ${opt}</label>
  `).join('');
  $('quizProgress').textContent = `Soal ${quizState.currentIndex + 1} dari ${quiz.questions.length}`;
  $('quizPrev').style.display = quizState.currentIndex === 0 ? 'none' : '';
  $('quizNext').style.display = quizState.currentIndex === quiz.questions.length - 1 ? 'none' : '';
  $('quizSubmit').style.display = quizState.currentIndex === quiz.questions.length - 1 ? '' : 'none';
}

function saveAnswer() {
  const sel = document.querySelector('input[name="quizOpt"]:checked');
  quizState.answers[quizState.currentIndex] = sel ? parseInt(sel.value) : null;
}

async function submitQuiz() {
  const quiz = QUIZ_DATA[quizState.moduleId];
  let correct = 0;
  quiz.questions.forEach((q, i) => { if (quizState.answers[i] === q.a) correct++; });
  const total = quiz.questions.length;
  await saveQuizResult(auth.currentUser.uid, quizState.moduleId, correct, total);
  alert(`Skor: ${correct}/${total}. ${correct / total >= 0.6 ? 'Lulus!' : 'Belum lulus.'}`);
  renderProfile();
}

function initSimulations() {
  $('play').onclick = () => startJatuhBebas();
  $('playProyektil').onclick = () => startProyektil();
  $('playPendulum').onclick = () => startPendulum();
}

function initDiscussions() {
  let currentDiscussion = null;
  
  listenDiscussions(items => {
    $('discussionList').innerHTML = items.map(d => `
      <div class="diskusi-item" data-id="${d.id}">
        <h3>${d.title}</h3>
        <p class="muted">oleh ${d.authorName} · ${d.createdAt?.toDate?.().toLocaleString() || ''}</p>
      </div>
    `).join('');
  });

  $('discussionList').onclick = e => {
    const item = e.target.closest('.diskusi-item');
    if (!item) return;
    currentDiscussion = item.dataset.id;
    $('discussionListView').style.display = 'none';
    $('discussionDetailView').style.display = 'block';
    $('detailTitle').textContent = item.querySelector('h3').textContent;
    listenReplies(currentDiscussion, replies => {
      $('detailReplies').innerHTML = replies.map(r => `
        <div class="reply-item"><strong>${r.authorName}:</strong> ${r.text}</div>
      `).join('');
    });
  };

  document.querySelector('.back-link').onclick = e => {
    e.preventDefault();
    $('discussionListView').style.display = 'block';
    $('discussionDetailView').style.display = 'none';
  };

  $('diskusiForm').onsubmit = async e => {
    e.preventDefault();
    if (!auth.currentUser) return $('loginDialog').showModal();
    const val = $('pertanyaanInput').value.trim();
    if (!val) return;
    await addDiscussion(auth.currentUser.uid, auth.currentUser.displayName || 'User', val);
    $('pertanyaanInput').value = '';
  };

  $('replyForm').onsubmit = async e => {
    e.preventDefault();
    if (!auth.currentUser || !currentDiscussion) return $('loginDialog').showModal();
    const val = $('replyInput').value.trim();
    if (!val) return;
    await addReply(currentDiscussion, auth.currentUser.uid, auth.currentUser.displayName || 'User', val);
    $('replyInput').value = '';
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  renderMateri();
  initAuth();
  initQuiz();
  initSimulations();
  initDiscussions();
});
