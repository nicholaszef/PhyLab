// Firebase service using REST API for both Auth and Firestore (Expo Go compatible)
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: "AIzaSyC95BePVEo1eMG3QldJgeeYnF3mn52gvdo",
  projectId: "phylab-cfe0a",
};

const API_KEY = config.apiKey;
const PROJECT_ID = config.projectId;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// User type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  idToken: string;
  refreshToken: string;
}

// Auth state
let currentUser: User | null = null;
let authListeners: ((user: User | null) => void)[] = [];

export function getAuthInstance() {
  return { currentUser };
}

// Auth state listener
export function onAuthStateChanged(_auth: any, callback: (user: User | null) => void) {
  authListeners.push(callback);
  
  // Check stored user and refresh token
  AsyncStorage.getItem('phylab_auth').then(async stored => {
    if (stored) {
      const user = JSON.parse(stored);
      // Try to refresh token
      try {
        const refreshed = await refreshIdToken(user.refreshToken);
        currentUser = { ...user, idToken: refreshed.idToken };
        await AsyncStorage.setItem('phylab_auth', JSON.stringify(currentUser));
        callback(currentUser);
      } catch (e) {
        // Token expired, need re-login
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
}

async function refreshIdToken(refreshToken: string) {
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return { idToken: data.id_token, refreshToken: data.refresh_token };
}

function notifyAuthListeners() {
  authListeners.forEach(l => l(currentUser));
}

// Firebase Auth REST API - Sign In
export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  
  const data = await response.json();
  
  if (data.error) {
    const code = data.error.message;
    if (code === 'EMAIL_NOT_FOUND') throw new Error('Email tidak terdaftar');
    if (code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') throw new Error('Email atau password salah');
    throw new Error(data.error.message);
  }
  
  // Get user info
  const userInfo = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: data.idToken })
    }
  );
  const userInfoData = await userInfo.json();
  const user = userInfoData.users?.[0];
  
  if (!user?.emailVerified) {
    throw new Error('Email belum diverifikasi. Cek inbox email kamu.');
  }
  
  currentUser = {
    uid: data.localId,
    email: data.email,
    displayName: user?.displayName || null,
    emailVerified: user?.emailVerified || false,
    idToken: data.idToken,
    refreshToken: data.refreshToken
  };
  
  await AsyncStorage.setItem('phylab_auth', JSON.stringify(currentUser));
  notifyAuthListeners();
  return currentUser;
}

// Firebase Auth REST API - Sign Up
export async function register(name: string, email: string, password: string): Promise<void> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  
  const data = await response.json();
  
  if (data.error) {
    const code = data.error.message;
    if (code === 'EMAIL_EXISTS') throw new Error('Email sudah terdaftar');
    if (code.includes('WEAK_PASSWORD')) throw new Error('Password minimal 6 karakter');
    throw new Error(data.error.message);
  }
  
  // Update display name
  if (name) {
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: data.idToken, displayName: name, returnSecureToken: true })
      }
    );
  }
  
  // Create user document in Firestore via REST
  await firestoreSet(`users/${data.localId}`, {
    displayName: { stringValue: name },
    email: { stringValue: email },
    createdAt: { timestampValue: new Date().toISOString() },
    quizzes: { mapValue: { fields: {} } }
  }, data.idToken);
  
  // Send verification email
  await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken: data.idToken })
    }
  );
}

export async function logout(): Promise<void> {
  currentUser = null;
  await AsyncStorage.removeItem('phylab_auth');
  notifyAuthListeners();
}

// Firestore REST helpers
async function firestoreGet(path: string, token: string) {
  const response = await fetch(`${FIRESTORE_URL}/${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return await response.json();
}

async function firestoreSet(path: string, fields: any, token: string) {
  await fetch(`${FIRESTORE_URL}/${path}`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
}

async function firestoreAdd(collectionPath: string, fields: any, token: string) {
  const response = await fetch(`${FIRESTORE_URL}/${collectionPath}`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  return await response.json();
}

async function firestoreQuery(collectionPath: string, orderBy?: string) {
  // Public read - no auth needed for discussions
  const url = `${FIRESTORE_URL}/${collectionPath}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.documents || []).map((doc: any) => {
    const id = doc.name.split('/').pop();
    return { id, ...parseFirestoreDoc(doc.fields) };
  });
}

function parseFirestoreDoc(fields: any): any {
  if (!fields) return {};
  const result: any = {};
  for (const key in fields) {
    const val = fields[key];
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.integerValue !== undefined) result[key] = parseInt(val.integerValue);
    else if (val.doubleValue !== undefined) result[key] = val.doubleValue;
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) result[key] = val.timestampValue;
    else if (val.mapValue !== undefined) result[key] = parseFirestoreDoc(val.mapValue.fields);
    else if (val.arrayValue !== undefined) result[key] = (val.arrayValue.values || []).map((v: any) => parseFirestoreDoc({ v }).v);
  }
  return result;
}

// Firestore functions
export async function getUserData(uid: string) {
  if (!currentUser?.idToken) return { quizzes: {} };
  try {
    const doc = await firestoreGet(`users/${uid}`, currentUser.idToken);
    return doc?.fields ? parseFirestoreDoc(doc.fields) : { quizzes: {} };
  } catch (e) {
    console.log('getUserData error:', e);
    return { quizzes: {} };
  }
}

export async function saveQuizResult(uid: string, moduleId: string, score: number, total: number) {
  if (!currentUser?.idToken) return;
  try {
    // Get current quizzes
    const userData = await getUserData(uid);
    const quizzes = userData.quizzes || {};
    quizzes[moduleId] = { score, total, passed: score / total >= 0.6, finishedAt: new Date().toISOString() };
    
    // Convert to Firestore format
    const quizzesFields: any = {};
    for (const key in quizzes) {
      quizzesFields[key] = {
        mapValue: {
          fields: {
            score: { integerValue: quizzes[key].score.toString() },
            total: { integerValue: quizzes[key].total.toString() },
            passed: { booleanValue: quizzes[key].passed },
            finishedAt: { stringValue: quizzes[key].finishedAt }
          }
        }
      };
    }
    
    await firestoreSet(`users/${uid}`, {
      quizzes: { mapValue: { fields: quizzesFields } }
    }, currentUser.idToken);
  } catch (e) {
    console.log('saveQuizResult error:', e);
  }
}

export function listenDiscussions(callback: (items: any[]) => void) {
  // Initial fetch
  fetchDiscussions().then(callback);
  
  // Poll every 10 seconds for updates
  const interval = setInterval(() => {
    fetchDiscussions().then(callback);
  }, 10000);
  
  return () => clearInterval(interval);
}

async function fetchDiscussions() {
  try {
    const items = await firestoreQuery('discussions');
    return items.sort((a: any, b: any) => 
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  } catch (e) {
    console.log('fetchDiscussions error:', e);
    return [];
  }
}

export async function addDiscussion(uid: string, name: string, title: string) {
  if (!currentUser?.idToken) throw new Error('Harus login dulu');
  try {
    await firestoreAdd('discussions', {
      title: { stringValue: title },
      authorUid: { stringValue: uid },
      authorName: { stringValue: name },
      createdAt: { timestampValue: new Date().toISOString() }
    }, currentUser.idToken);
  } catch (e) {
    console.log('addDiscussion error:', e);
    throw new Error('Gagal menambah diskusi');
  }
}

export function listenReplies(discussionId: string, callback: (items: any[]) => void) {
  // Initial fetch
  fetchReplies(discussionId).then(callback);
  
  // Poll every 5 seconds
  const interval = setInterval(() => {
    fetchReplies(discussionId).then(callback);
  }, 5000);
  
  return () => clearInterval(interval);
}

async function fetchReplies(discussionId: string) {
  try {
    const items = await firestoreQuery(`discussions/${discussionId}/replies`);
    return items.sort((a: any, b: any) => 
      (a.createdAt || '').localeCompare(b.createdAt || '')
    );
  } catch (e) {
    console.log('fetchReplies error:', e);
    return [];
  }
}

export async function addReply(discussionId: string, uid: string, name: string, text: string) {
  if (!currentUser?.idToken) throw new Error('Harus login dulu');
  try {
    await firestoreAdd(`discussions/${discussionId}/replies`, {
      text: { stringValue: text },
      authorUid: { stringValue: uid },
      authorName: { stringValue: name },
      createdAt: { timestampValue: new Date().toISOString() }
    }, currentUser.idToken);
  } catch (e) {
    console.log('addReply error:', e);
    throw new Error('Gagal menambah balasan');
  }
}
