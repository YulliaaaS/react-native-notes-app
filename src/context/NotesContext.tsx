import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}

interface NotesContextType {
  notes: Note[];
  isDarkMode: boolean;
  toggleTheme: () => void;
  addNote: (title: string, content: string, color: string) => void;
  updateNote: (id: string, title: string, content: string, color: string) => void;
  deleteNote: (id: string) => void;
}

export const PASTEL_COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B', '#9B72AA'];

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([
    // Додамо відразу початкові нотатки, щоб екран не був пустим
    { id: '1', title: 'Покупки', content: 'Купити молоко, хліб, сир та фрукти на тиждень.', color: '#FFF9C4', createdAt: '24.05.2026' },
    { id: '2', title: 'Проєкт React Native', content: 'Зробити залікову роботу, налаштувати пошук та кольори.', color: '#E8F5E9', createdAt: '24.05.2026' },
    { id: '3', title: 'Ідеї', content: 'Почати вчити дизайн мобільних інтерфейсів.', color: '#E1F5FE', createdAt: '23.05.2026' }
  ]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('@notes');
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedTheme) setIsDarkMode(savedTheme === 'dark');
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem('@notes', JSON.stringify(newNotes));
  };

  const toggleTheme = async () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    await AsyncStorage.setItem('@theme', nextTheme ? 'dark' : 'light');
  };

  const addNote = (title: string, content: string, color: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim() || 'Без назви',
      content,
      color,
      createdAt: new Date().toLocaleDateString('uk-UA'),
    };
    saveNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, title: string, content: string, color: string) => {
    const updated = notes.map(note => 
      note.id === id ? { ...note, title: title.trim() || 'Без назви', content, color } : note
    );
    saveNotes(updated);
  };

  const deleteNote = (id: string) => {
    const filtered = notes.filter(note => note.id !== id);
    saveNotes(filtered);
  };

  return (
    <NotesContext.Provider value={{ notes, isDarkMode, toggleTheme, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within a NotesProvider');
  return context;
}