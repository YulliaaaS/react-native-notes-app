import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotes } from '../context/NotesContext';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { notes, isDarkMode, toggleTheme, addNote, deleteNote } = useNotes(); 
  const insets = useSafeAreaInsets();

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    // Пастельна палітра кольорів
    const colors = ['#FFF9C4', '#E8F5E9', '#E1F5FE', '#FCE4EC', '#F3E5F5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addNote('Нова Нотатка', 'Це текст нотатки, створеної через професійний інтерфейс.', randomColor);
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDarkMode ? '#121212' : '#F2F2F7',
        paddingTop: insets.top > 0 ? insets.top : 20,
        paddingBottom: insets.bottom
      }
    ]}>
      
      {/* Шапка додатку з професійною кнопкою */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }]}>Мої Нотатки</Text>
        
        <TouchableOpacity 
          style={[styles.themeIconButton, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]} 
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Feather 
            name={isDarkMode ? "sun" : "moon"} 
            size={20} 
            color={isDarkMode ? "#FFD700" : "#4A4A4A"} 
          />
        </TouchableOpacity>
      </View>

      {/* Сучасний пошуковий рядок */}
      <TextInput
        style={[styles.searchInput, {
          backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
          borderColor: isDarkMode ? '#2C2C2C' : '#EAEAEA'
        }]}
        placeholder="Пошук нотаток..."
        placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Список нотаток у дві колонки */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        numColumns={2} 
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          // Використовуємо м'який білий для карток у світлій темі, щоб не різало око
          const cardBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
          // Покращений контраст для кращої видимості
          const textColor = isDarkMode ? '#FFFFFF' : '#000000';      
          const subTextColor = isDarkMode ? '#E5E5EA' : '#1C1C1E';   
          const dateColor = isDarkMode ? '#B0B0B5' : '#3A3A3C';      
          const trashColor = isDarkMode ? '#FF6B6B' : '#FF3B30'; 
          const accentColor = item.color;

          return (
            <TouchableOpacity 
              style={[
                styles.noteCard, 
                {
                  backgroundColor: isDarkMode ? cardBg : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'transparent' : '#E5E5E5',
                  shadowColor: '#000',
                  elevation: isDarkMode ? 2 : 5,
                }
              ]}
              activeOpacity={0.9}
            >
              {/* Декоративна смужка зверху для акценту */}
              <View style={{ height: 4, backgroundColor: accentColor }} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  
                  {/* Кнопка видалення кошика */}
                  <TouchableOpacity 
                    onPress={() => deleteNote(item.id)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={15} color={trashColor} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.noteText, { color: subTextColor }]} numberOfLines={4}>
                  {item.text}
                </Text>
                
                {/* Дата */}
                <Text style={[styles.noteDate, { color: dateColor }]}>
                  {item.date}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: isDarkMode ? '#444444' : '#999999' }]}>
            Нічого не знайдено 🔍
          </Text>
        }
      />

      {/* Кругла кнопка додавання "FAB" */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNote} activeOpacity={0.8}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  themeIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
  
  marginBottom: 20,
  },
  listContent: {
    paddingBottom: 100, // Відступ знизу, щоб FAB не перекривав останню нотатку
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  noteCard: {
    width: cardWidth,
    borderRadius: 20,
    minHeight: 140,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 13,
    lineHeight: 17,
  },
  noteDate: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF', 
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});