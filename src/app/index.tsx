import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Note, PASTEL_COLORS, useNotes } from '../context/NotesContext';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Стейт для підтвердження видалення
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(PASTEL_COLORS[0]);

  const { notes, isDarkMode, toggleTheme, addNote, updateNote, deleteNote } = useNotes(); 
  const insets = useSafeAreaInsets();

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedColorFilter ? note.color === selectedColorFilter : true;
    return matchesSearch && matchesColor;
  });

  const openModal = (note: Note | null = null) => {
    setEditingNote(note);
    setNoteTitle(note ? note.title : '');
    setNoteContent(note ? note.content : '');
    setNoteColor(note ? note.color : PASTEL_COLORS[0]);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      setModalVisible(false);
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim(), noteColor);
    } else {
      addNote(noteTitle.trim(), noteContent.trim(), noteColor);
    }
    
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setModalVisible(false);
  };

  const confirmDelete = (id: string, title: string) => {
    setNoteToDelete({ id, title });
    setDeleteModalVisible(true);
  };

  const executeDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
    }
    setDeleteModalVisible(false);
    setNoteToDelete(null);
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
      
      {/* Шапка додатку */}
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

      {/* Панель фільтрації за кольором */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, !selectedColorFilter && styles.filterChipActive]} 
            onPress={() => setSelectedColorFilter(null)}
          >
            <Text style={[styles.filterText, { color: !selectedColorFilter ? '#FFF' : (isDarkMode ? '#FFF' : '#000') }]}>Всі</Text>
          </TouchableOpacity>
          {PASTEL_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle, 
                { backgroundColor: color },
                selectedColorFilter === color && styles.colorCircleSelected
              ]}
              onPress={() => setSelectedColorFilter(color)}
            >
              {selectedColorFilter === color && <Feather name="check" size={12} color="#000" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Список нотаток у дві колонки */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        numColumns={2} 
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const cardBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
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
              activeOpacity={0.7}
              onPress={() => openModal(item)}
            >
              <View style={{ height: 4, backgroundColor: accentColor }} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => confirmDelete(item.id, item.title)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={15} color={trashColor} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.noteText, { color: subTextColor }]} numberOfLines={4}>
                  {item.content}
                </Text>
                
                <Text style={[styles.noteDate, { color: dateColor }]}>
                  {item.createdAt}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          notes.length > 0 ? (
            <Text style={[styles.emptyText, { color: isDarkMode ? '#8E8E93' : '#999999' }]}>
              Нічого не знайдено за вашим запитом 
            </Text>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather 
                name="edit-3" 
                size={50} 
                color={isDarkMode ? '#3A3A3C' : '#C7C7CC'} 
                style={{ marginBottom: 12 }} 
              />
              <Text style={[styles.emptyTextTitle, { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }]}>У вас ще немає нотаток</Text>
              <Text style={[styles.emptyTextSub, { color: isDarkMode ? '#8E8E93' : '#666666' }]}>Натисніть на плюс знизу, щоб створити свою першу нотатку!</Text>
            </View>
          )
        }
      />

      {/* Кругла кнопка додавання "FAB" */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()} activeOpacity={0.8}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* МОДАЛЬНЕ ВІКНО СТВОРЕННЯ/РЕДАГУВАННЯ */}
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                {editingNote ? 'Редагувати' : 'Нова нотатка'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={24} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { color: isDarkMode ? '#FFF' : '#000', fontWeight: 'bold', borderBottomColor: isDarkMode ? '#333' : '#E5E5E5' }]}
              placeholder="Назва"
              placeholderTextColor="#999"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { color: isDarkMode ? '#FFF' : '#000' }]}
              placeholder="Текст нотатки..."
              placeholderTextColor="#999"
              multiline
              value={noteContent}
              onChangeText={setNoteContent}
            />

            <Text style={[styles.colorLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Оберіть колір:</Text>
            <View style={styles.colorPicker}>
              {PASTEL_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircleLarge, 
                    { backgroundColor: color },
                    noteColor === color && styles.colorCircleSelected
                  ]}
                  onPress={() => setNoteColor(color)}
                >
                  {noteColor === color && <Feather name="check" size={20} color="#000" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: noteColor }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {editingNote ? 'Оновити' : 'Зберегти'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* КАСТОМНЕ МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
            <Feather name="alert-triangle" size={40} color="#FF3B30" style={{ marginBottom: 14 }} />
            
            <Text style={[styles.confirmTitle, { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }]}>
              Видалення нотатки
            </Text>
            
            <Text style={[styles.confirmDescription, { color: isDarkMode ? '#E5E5EA' : '#4E4E52' }]}>
              Ви впевнені, що хочете видалити нотатку "{noteToDelete?.title || 'Без назви'}"? Цю дію не можна буде скасувати.
            </Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelBtn, { borderColor: isDarkMode ? '#333' : '#E5E5E5' }]} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: isDarkMode ? '#FFF' : '#333' }]}>Скасувати</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteBtn]} 
                onPress={executeDelete}
              >
                <Text style={styles.deleteBtnText}>Видалити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    elevation: 2,
  },
  searchInput: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 16,
    height: 40,
  },
  filterScroll: {
    alignItems: 'center',
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100, 
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  noteCard: {
    width: cardWidth,
    borderRadius: 20,
    minHeight: 140,
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
    padding: 4,
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
    elevation: 5,
    zIndex: 99,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalInput: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalTextArea: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderBottomWidth: 0,
  },
  colorLabel: {
    fontSize: 14,
    marginBottom: 12,
    marginTop: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  colorCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
  deleteBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyTextSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});