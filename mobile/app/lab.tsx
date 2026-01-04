import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../src/constants/colors';
import { labHTML } from '../src/components/LabWebView';

export default function Lab() {
  return (
    <View style={styles.container}>
      <WebView source={{ html: labHTML }} style={styles.webview} scrollEnabled javaScriptEnabled />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  webview: { flex: 1, backgroundColor: Colors.bg }
});
