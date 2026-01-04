import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';

export default function Layout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.text,
      tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.muted
    }}>
      <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="materi" options={{ title: 'Materi', tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> }} />
      <Tabs.Screen name="lab" options={{ title: 'Lab', tabBarIcon: ({ color, size }) => <Ionicons name="flask" size={size} color={color} /> }} />
      <Tabs.Screen name="diskusi" options={{ title: 'Diskusi', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}
