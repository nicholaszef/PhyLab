import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Colors } from '../src/constants/colors';
import { QUIZ_DATA } from '../src/constants/data';
import { getAuthInstance, onAuthStateChanged, login, register, logout, getUserData, User } from '../src/services/firebase';

export default function Profil() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuthInstance();
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        setUserData(await getUserData(u.uid));
      } else {
        setUser(null);
        setUserData(null);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email dan password wajib');
    setLoading(true);
    try { await login(email, password); setEmail(''); setPassword(''); }
    catch (e: any) { Alert.alert('Gagal', e.message); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email dan password wajib');
    setLoading(true);
    try { await register(name, email, password); Alert.alert('Berhasil', 'Cek email untuk verifikasi'); setMode('login'); setEmail(''); setPassword(''); setName(''); }
    catch (e: any) { Alert.alert('Gagal', e.message); }
    setLoading(false);
  };

  if (user) {
    const quizzes = userData?.quizzes || {};
    return (
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{user.displayName?.[0] || user.email?.[0] || 'U'}</Text></View>
          <Text style={styles.userName}>{user.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <Text style={styles.sectionTitle}>Progress Kuis</Text>
        {Object.keys(QUIZ_DATA).map(mid => {
          const r = quizzes[mid];
          return (
            <View key={mid} style={styles.quizItem}>
              <Text style={styles.quizTitle}>{QUIZ_DATA[mid].title}</Text>
              <Text style={styles.quizStatus}>{r ? `${r.score}/${r.total} (${r.passed ? 'Lulus' : 'Gagal'})` : 'Belum dikerjakan'}</Text>
            </View>
          );
        })}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.authContainer}>
      <Text style={styles.authTitle}>{mode === 'login' ? 'Login' : 'Buat Akun'}</Text>
      {mode === 'register' && <TextInput style={styles.input} placeholder="Nama" placeholderTextColor={Colors.muted} value={name} onChangeText={setName} />}
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.muted} value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.submitBtn} onPress={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
        <Text style={styles.submitTxt}>{loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Daftar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.switchTxt}>{mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  authContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: 14, marginBottom: 12, color: Colors.text, fontSize: 16 },
  submitBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitTxt: { color: '#fff', fontWeight: '600', fontSize: 16 },
  switchTxt: { color: Colors.primary, textAlign: 'center', marginTop: 20 },
  profileHeader: { alignItems: 'center', paddingVertical: 32, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginTop: 12 },
  userEmail: { fontSize: 14, color: Colors.muted, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, padding: 16, paddingBottom: 8 },
  quizItem: { backgroundColor: Colors.surface, marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 10 },
  quizTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  quizStatus: { fontSize: 13, color: Colors.muted, marginTop: 4 },
  logoutBtn: { margin: 16, padding: 16, backgroundColor: Colors.danger, borderRadius: 10, alignItems: 'center' },
  logoutTxt: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
