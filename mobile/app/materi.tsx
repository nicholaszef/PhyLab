import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../src/constants/colors';
import { MATERI_DATA, QUIZ_DATA } from '../src/constants/data';
import { getAuthInstance, saveQuizResult } from '../src/services/firebase';

export default function Materi() {
  const [quizModal, setQuizModal] = useState(false);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const openVideo = (url: string) => WebBrowser.openBrowserAsync(url);

  const startQuiz = (id: string) => {
    const auth = getAuthInstance();
    if (!auth.currentUser) return Alert.alert('Login Dulu', 'Silakan login untuk mengerjakan kuis');
    const quiz = QUIZ_DATA[id];
    setModuleId(id);
    setIdx(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setQuizModal(true);
  };

  const select = (i: number) => {
    const newAns = [...answers];
    newAns[idx] = i;
    setAnswers(newAns);
  };

  const submit = async () => {
    const auth = getAuthInstance();
    if (!moduleId || !auth.currentUser) return;
    const quiz = QUIZ_DATA[moduleId];
    let correct = 0;
    answers.forEach((a, i) => { if (a === quiz.questions[i].a) correct++; });
    await saveQuizResult(auth.currentUser.uid, moduleId, correct, quiz.questions.length);
    Alert.alert('Hasil', `Skor: ${correct}/${quiz.questions.length}\n${correct / quiz.questions.length >= 0.6 ? 'Lulus!' : 'Belum lulus'}`);
    setQuizModal(false);
  };

  const quiz = moduleId ? QUIZ_DATA[moduleId] : null;
  const q = quiz?.questions[idx];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Materi Fisika Dasar 1A</Text>
      <Text style={styles.sub}>Silabus FI-1101 untuk TPB ITB</Text>
      {MATERI_DATA.map(m => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.icon}>{m.icon}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{m.title}</Text>
            <Text style={styles.cardDesc}>{m.desc}</Text>
            <View style={styles.cardBtns}>
              <TouchableOpacity style={styles.btnVideo} onPress={() => openVideo(m.video)}><Text style={styles.btnTxt}>▶ Video</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnQuiz} onPress={() => startQuiz(m.id)}><Text style={styles.btnTxt}>Kuis</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <Modal visible={quizModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            {quiz && q && (<>
              <Text style={styles.modalTitle}>{quiz.title} ({idx + 1}/{quiz.questions.length})</Text>
              <Text style={styles.qText}>{q.q}</Text>
              {q.opts.map((opt, i) => (
                <TouchableOpacity key={i} style={[styles.opt, answers[idx] === i && styles.optSel]} onPress={() => select(i)}>
                  <Text style={styles.optTxt}>{opt}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.modalBtns}>
                {idx > 0 && <TouchableOpacity onPress={() => setIdx(idx - 1)}><Text style={styles.navTxt}>Sebelumnya</Text></TouchableOpacity>}
                {idx < quiz.questions.length - 1 
                  ? <TouchableOpacity style={styles.navPrimary} onPress={() => setIdx(idx + 1)}><Text style={styles.navPrimaryTxt}>Berikutnya</Text></TouchableOpacity>
                  : <TouchableOpacity style={styles.navPrimary} onPress={submit}><Text style={styles.navPrimaryTxt}>Kirim</Text></TouchableOpacity>
                }
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setQuizModal(false)}><Text style={styles.closeTxt}>Batal</Text></TouchableOpacity>
            </>)}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 8 },
  sub: { fontSize: 14, color: Colors.muted, marginBottom: 20 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row' },
  icon: { fontSize: 32, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  cardDesc: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  cardBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btnVideo: { backgroundColor: Colors.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnQuiz: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  qText: { fontSize: 16, color: '#e2e8f0', marginBottom: 16 },
  opt: { backgroundColor: Colors.border, padding: 14, borderRadius: 8, marginBottom: 8 },
  optSel: { backgroundColor: Colors.primary },
  optTxt: { color: '#fff', fontSize: 14 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navTxt: { color: Colors.muted, padding: 12 },
  navPrimary: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8 },
  navPrimaryTxt: { color: '#fff', fontWeight: '600' },
  closeBtn: { alignItems: 'center', marginTop: 16 },
  closeTxt: { color: Colors.muted }
});
