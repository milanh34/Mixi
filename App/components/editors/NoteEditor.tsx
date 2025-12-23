// components/editors/NoteEditor.tsx - FULL WORKING VERSION
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { useNoteStore } from '../../stores/noteStore';
import { useAuthStore } from '../../stores/authStore';
import { ChecklistItem, Note } from '../../lib/schema';

interface NoteEditorProps {
  visible: boolean;
  note?: Note;
  activeNoteType: 'personal' | 'shared';
  groupId: string;
  onClose: () => void;
}

export function NoteEditor({
  visible,
  note,
  activeNoteType,
  groupId,
  onClose,
}: NoteEditorProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { createNote, updateNote } = useNoteStore();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note?.checklist || []
  );

  const addChecklistItem = () => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setChecklist(prev => [
      ...prev,
      { id, text: '', completed: false },
    ]);
  };

  const updateChecklistText = (id: string, text: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, text } : item))
    );
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && checklist.length === 0) {
      onClose();
      return;
    }

    const editorName = user?.name || user?.email?.split('@')[0] || 'Someone';
    const base: Omit<Note, 'id' | 'lastEdited'> = {
      groupId,
      creatorId: note?.creatorId || user?.uid || '',
      lastEditorId: user?.uid || '',
      lastEditorName: editorName,
      title: title.trim(),
      content: content.trim(),
      checklist,
      type: activeNoteType,
      syncedVersion: note ? (note.syncedVersion || 0) + 1 : 1,
    };

    try {
      if (note) {
        await updateNote(note.id, base);
      } else {
        await createNote(base);
      }
      console.log('Saving note for groupId=', groupId, 'type=', activeNoteType)
      onClose();
    } catch (e) {
      console.error('Error saving note', e);
    }
  };

  const renderChecklistItem = ({ item }: { item: ChecklistItem }) => (
    <View style={styles.checklistRow}>
      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => toggleChecklistItem(item.id)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={item.completed ? 'radio-button-checked' : 'radio-button-unchecked'}
          size={24}
          color={item.completed ? theme.colors.success : theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TextInput
        style={[
          styles.checkText,
          {
            color: theme.colors.textPrimary,
            textDecorationLine: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.6 : 1,
          },
        ]}
        placeholder="Checklist item"
        placeholderTextColor={theme.colors.textMuted}
        value={item.text}
        onChangeText={(text) => updateChecklistText(item.id, text)}
        editable={!item.completed}
        multiline
      />

      <TouchableOpacity
        onPress={() => removeChecklistItem(item.id)}
        style={styles.deleteButton}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.gradientStart + '20', theme.colors.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                {note ? 'Edit note' : 'New note'}
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      activeNoteType === 'personal'
                        ? theme.colors.secondary + '20'
                        : theme.colors.primary + '20',
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      activeNoteType === 'personal'
                        ? theme.colors.secondary
                        : theme.colors.primary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {activeNoteType.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
              <MaterialIcons name="check" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ✅ FIXED: View + FlatList instead of ScrollView + map */}
        <View style={styles.content}>
          {/* Title */}
          <TextInput
            style={[styles.titleInput, { color: theme.colors.textPrimary }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {/* Canvas Text */}
          <TextInput
            style={[styles.textArea, { color: theme.colors.textPrimary }]}
            placeholder="Write your note..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          {/* Checklist Section */}
          <View style={styles.checklistHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Checklist
            </Text>
            <TouchableOpacity style={styles.addChecklistButton} onPress={addChecklistItem}>
              <MaterialIcons name="add" size={18} color={theme.colors.primary} />
              <Text style={[styles.addChecklistText, { color: theme.colors.primary }]}>
                Add checklist
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ FlatList for checklists - NO SCROLL CONFLICT */}
          <FlatList
            data={checklist}
            renderItem={renderChecklistItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            removeClippedSubviews={false}
            style={styles.checklistList}
            contentContainerStyle={styles.checklistListContent}
          />

          {/* Empty checklist hint */}
          {checklist.length === 0 && (
            <View style={styles.checkHintContainer}>
              <Text style={[styles.checkHint, { color: theme.colors.textMuted }]}>
                Tap "Add checklist" to insert interactive checkboxes
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 12 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  typeBadge: {
    marginTop: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4
  },

  // ✅ Main content - NO ScrollView wrapper
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100
  },

  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },

  textArea: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  addChecklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  addChecklistText: { fontSize: 14, fontWeight: '600' },

  // ✅ FlatList styles - NO scrolling conflict
  checklistList: {
    flexGrow: 0,
  },
  checklistListContent: {
    paddingBottom: 20,
  },

  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248,250,252,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  checkButton: {
    marginTop: 4,
    paddingHorizontal: 4
  },
  checkText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    minHeight: 28,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4
  },

  checkHintContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    opacity: 0.6,
  },
  checkHint: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22
  },
});
