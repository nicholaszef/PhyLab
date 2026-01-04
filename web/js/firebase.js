import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { firebaseConfig } from './config.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!cred.user.emailVerified) {
    await signOut(auth);
    throw new Error('EMAIL_NOT_VERIFIED');
  }
  return cred.user;
}

export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    displayName: name,
    email,
    createdAt: serverTimestamp(),
    progress: {},
    quizzes: {}
  });
  await sendEmailVerification(cred.user);
  await signOut(auth);
}

export async function logout() {
  await signOut(auth);
}

export async function resendVerification(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  await signOut(auth);
}

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveQuizResult(uid, moduleId, score, total) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  const quizzes = snap.exists() ? (snap.data().quizzes || {}) : {};
  quizzes[moduleId] = { score, total, passed: score / total >= 0.6, finishedAt: new Date().toISOString() };
  await updateDoc(userRef, { quizzes, lastUpdated: serverTimestamp() });
}

export async function saveProgress(uid, data) {
  await updateDoc(doc(db, 'users', uid), { progress: data, lastUpdated: serverTimestamp() });
}

export function listenDiscussions(callback) {
  const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function addDiscussion(uid, name, title) {
  await addDoc(collection(db, 'discussions'), { title, authorUid: uid, authorName: name, createdAt: serverTimestamp() });
}

export function listenReplies(discussionId, callback) {
  const q = query(collection(db, 'discussions', discussionId, 'replies'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function addReply(discussionId, uid, name, text) {
  await addDoc(collection(db, 'discussions', discussionId, 'replies'), { text, authorUid: uid, authorName: name, createdAt: serverTimestamp() });
}

export { onAuthStateChanged };
