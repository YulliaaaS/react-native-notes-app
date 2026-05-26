import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotesProvider } from '../context/NotesContext';

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <NotesProvider>
      <View style={{ flex: 1 }}>
        <View style={{ height: insets.top, backgroundColor: '#000000' }} />
        <StatusBar style="light" backgroundColor="#000000" translucent={false} />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </NotesProvider>
  );
}