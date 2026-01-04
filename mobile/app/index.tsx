import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../src/constants/colors';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🔬</Text>
        <Text style={styles.title}>PhyLab</Text>
        <Text style={styles.tagline}>Virtual lab fisika berbasis mobile untuk belajar konsep inti fisika melalui simulasi interaktif.</Text>
        <View style={styles.buttons}>
          <Link href="/lab" asChild>
            <TouchableOpacity style={styles.btnPrimary}><Text style={styles.btnText}>Coba Mini Lab</Text></TouchableOpacity>
          </Link>
          <Link href="/materi" asChild>
            <TouchableOpacity style={styles.btnGhost}><Text style={styles.btnGhostText}>Jelajahi Materi</Text></TouchableOpacity>
          </Link>
        </View>
      </View>
      <View style={styles.features}>
        {[
          { icon: '📚', title: '7 Modul Materi', desc: 'Silabus FI-1101 dengan kuis' },
          { icon: '🧪', title: '3 Simulasi Lab', desc: 'Jatuh bebas, proyektil, pendulum' },
          { icon: '💬', title: 'Forum Diskusi', desc: 'Tanya jawab dengan pengguna lain' }
        ].map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: { padding: 24, alignItems: 'center', paddingTop: 60 },
  logo: { fontSize: 64 },
  title: { fontSize: 36, fontWeight: 'bold', color: Colors.text, marginTop: 12 },
  tagline: { fontSize: 16, color: Colors.muted, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnPrimary: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnGhost: { borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnGhostText: { color: Colors.primary, fontWeight: '600' },
  features: { padding: 24, gap: 16 },
  featureCard: { backgroundColor: Colors.surface, padding: 20, borderRadius: 12 },
  featureIcon: { fontSize: 32 },
  featureTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 8 },
  featureDesc: { fontSize: 14, color: Colors.muted, marginTop: 4 }
});
