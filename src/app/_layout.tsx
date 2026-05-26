import { Stack } from 'expo-router';
import { NotesProvider } from '../context/NotesContext';

export default function RootLayout() {
  return (
    <NotesProvider>
      {/* Stack замість Slot дозволить керувати кольором усього екрана */}
      <Stack screenOptions={{ headerShown: false }} />
    </NotesProvider>
  );
}