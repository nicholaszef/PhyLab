import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Colors } from '../src/constants/colors';
import { getAuthInstance, listenDiscussions, addDiscussion, listenReplies, addReply } from '../src/services/firebase';

export default function Diskusi() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newQ, setNewQ] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');

  useEffect(() => listenDiscussions(setDiscussions), []);
  useEffect(() => { if (selected) return listenReplies(selected.id, setReplies); }, [selected]);

  const submitQ = async () => {
    const auth = getAuthInstance();
    if (!auth.currentUser) return Alert.alert('Login Dulu');
    if (!newQ.trim()) return;
    await addDiscussion(auth.currentUser.uid, auth.currentUser.displayName || 'User', newQ);
    setNewQ('');
  };

  const submitReply = async () => {
    const auth = getAuthInstance();
    if (!auth.currentUser || !selected) return Alert.alert('Login Dulu');
    if (!newReply.trim()) return;
    await addReply(selected.id, auth.currentUser.uid, auth.currentUser.displayName || 'User', newReply);
    setNewReply('');
  };

  if (selected) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.back}>← Kembali</Text></TouchableOpacity>
        <Text style={styles.detailTitle}>{selected.title}</Text>
        <Text style={styles.detailAuthor}>oleh {selected.authorName}</Text>
        <FlatList data={replies} keyExtractor={i => i.id} style={styles.list} renderItem={({ item }) => (
          <View style={styles.reply}><Text style={styles.replyAuthor}>{item.authorName}</Text><Text style={styles.replyText}>{item.text}</Text></View>
        )} />
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Tulis balasan..." placeholderTextColor={Colors.muted} value={newReply} onChangeText={setNewReply} />
          <TouchableOpacity style={styles.sendBtn} onPress={submitReply}><Text style={styles.sendTxt}>Kirim</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forum Diskusi</Text>
      <Text style={styles.sub}>Tanya jawab dengan pengguna lain</Text>
      <FlatList data={discussions} keyExtractor={i => i.id} style={styles.list} renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => setSelected(item)}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemMeta}>oleh {item.authorName}</Text>
        </TouchableOpacity>
      )} />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Tulis pertanyaan..." placeholderTextColor={Colors.muted} value={newQ} onChangeText={setNewQ} />
        <TouchableOpacity style={styles.sendBtn} onPress={submitQ}><Text style={styles.sendTxt}>Kirim</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 8 },
  sub: { fontSize: 14, color: Colors.muted, marginBottom: 16 },
  list: { flex: 1 },
  item: { backgroundColor: Colors.surface, padding: 16, borderRadius: 10, marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  itemMeta: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  inputRow: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 12, color: Colors.text },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8 },
  sendTxt: { color: '#fff', fontWeight: '600' },
  back: { color: Colors.primary, fontSize: 16, paddingVertical: 8 },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginTop: 8 },
  detailAuthor: { fontSize: 13, color: Colors.muted, marginBottom: 16 },
  reply: { backgroundColor: Colors.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  replyAuthor: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  replyText: { fontSize: 14, color: '#e2e8f0', marginTop: 4 }
});
