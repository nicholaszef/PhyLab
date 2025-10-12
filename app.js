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

// === Konfigurasi Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyC95BePVEo1eMG3QldJgeeYnF3mn52gvdo",
  authDomain: "phylab-cfe0a.firebaseapp.com",
  projectId: "phylab-cfe0a",
  storageBucket: "phylab-cfe0a.firebasestorage.app",
  messagingSenderId: "132714193685",
  appId: "1:132714193685:web:8d7bcefca4110baea4ff1c",
  measurementId: "G-QLECFSNYHB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === Global Variables ===
let discussionListenerActive = false;
const $ = (id) => document.getElementById(id);

// === NAVIGATION ===
function setupNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.menu');
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();

  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      menu.setAttribute('aria-expanded', !expanded);
    });
  }
}

// === ERROR HANDLER ===
function showError(el, msg) {
  if (!el) return;
  el.style.display = msg ? 'block' : 'none';
  el.textContent = msg || '';
}

// === DISKUSI REALTIME ===
async function addNewDiscussionToDB() {
  const user = auth.currentUser;
  if (!user) return alert('Login dulu sebelum berdiskusi!');
  const input = $('pertanyaanInput');
  if (!input.value.trim()) return alert('Isi pertanyaannya dulu!');

  const payload = {
    title: input.value.trim(),
    authorUid: user.uid,
    authorName: user.displayName || user.email,
    createdAt: serverTimestamp()
  };
  await addDoc(collection(db, "discussions"), payload);
  input.value = '';
}

function listenToDiscussions() {
  if (discussionListenerActive) return;
  discussionListenerActive = true;
  const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const list = $('discussionList');
    if (!list) return;
    list.innerHTML = '';
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const item = document.createElement('div');
      item.className = 'diskusi-item';
      item.innerHTML = `<h3>${d.title}</h3>
      <p class="muted">oleh ${d.authorName || 'Anon'} · ${d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : ''}</p>`;
      item.onclick = () => openDiscussion(docSnap.id, d);
      list.appendChild(item);
    });
  });
}

function openDiscussion(id, data) {
  $('discussionListView').style.display = 'none';
  $('discussionDetailView').style.display = 'block';
  $('detailTitle').textContent = data.title;
  loadReplies(id);
  const replyForm = $('replyForm');
  replyForm.onsubmit = (e) => {
    e.preventDefault();
    sendReply(id);
  };
}

function loadReplies(discussionId) {
  const q = query(collection(db, "discussions", discussionId, "replies"), orderBy("createdAt", "asc"));
  onSnapshot(q, (snapshot) => {
    const replies = $('detailReplies');
    replies.innerHTML = '';
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const div = document.createElement('div');
      div.className = 'reply-item';
      div.innerHTML = `<strong>${d.authorName}:</strong> ${d.text}
      <p class="muted" style="font-size:.85rem;">${d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : ''}</p>`;
      replies.appendChild(div);
    });
  });
}

async function sendReply(id) {
  const user = auth.currentUser;
  if (!user) return alert('Harus login dulu untuk membalas.');
  const input = $('replyInput');
  if (!input.value.trim()) return;
  const payload = {
    text: input.value.trim(),
    authorUid: user.uid,
    authorName: user.displayName || user.email,
    createdAt: serverTimestamp()
  };
  await addDoc(collection(db, "discussions", id, "replies"), payload);
  input.value = '';
}

document.querySelector('.back-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  $('discussionListView').style.display = 'block';
  $('discussionDetailView').style.display = 'none';
});

// === AUTH HANDLER ===
async function doSignUp() {
  const email = $('signup-email').value.trim();
  const password = $('signup-password').value;
  const username = $('signup-username').value.trim();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await setDoc(doc(db, "users", cred.user.uid), {
    displayName: username,
    email,
    createdAt: serverTimestamp()
  });
  await sendEmailVerification(cred.user);
  alert('Akun berhasil dibuat! Silakan verifikasi email sebelum login.');
  await signOut(auth);
}

async function doLogin(e) {
  e.preventDefault();
  const email = $('username').value.trim();
  const password = $('password').value;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!cred.user.emailVerified) {
    alert('Email belum diverifikasi.');
    await signOut(auth);
    return;
  }
  $('loginDialog').close();
}

async function doLogout() {
  await signOut(auth);
  discussionListenerActive = false;
}

// === LOGIN STATE ===
onAuthStateChanged(auth, (user) => {
  const loginBtn = $('loginBtn');
  const signUpBtn = $('signUpBtn');
  const logoutBtn = $('logoutBtn') || document.createElement('button');
  const userInfo = $('userInfo');

  if (user && user.emailVerified) {
    userInfo.textContent = `Halo, ${user.displayName || user.email}`;
    loginBtn.style.display = 'none';
    signUpBtn.style.display = 'none';
    logoutBtn.style.display = '';
    listenToDiscussions();
  } else {
    userInfo.textContent = '';
    loginBtn.style.display = '';
    signUpBtn.style.display = '';
    logoutBtn.style.display = 'none';
  }
});

// === INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  $('diskusiForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    addNewDiscussionToDB();
  });
  $('logoutBtn')?.addEventListener('click', doLogout);
  $('submitSignUp')?.addEventListener('click', doSignUp);
  $('loginFormElement')?.addEventListener('submit', doLogin);
  listenToDiscussions();
});
