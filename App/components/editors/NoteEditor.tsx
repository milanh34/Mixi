// components/editors/NoteEditor.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { useNoteStore } from '../../stores/noteStore';
import { useAuthStore } from '../../stores/authStore';
import { ChecklistItem, Note } from '../../lib/schema';
import * as Haptics from 'expo-haptics';
import { useToastPortal } from '../ui/ToastPortal';

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
  const { createNote, updateNote, deleteNote } = useNoteStore();
  const { showToast } = useToastPortal();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note?.checklist || []
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setChecklist(note.checklist || []);
    } else if (visible && !note) {
      setTitle('');
      setContent('');
      setChecklist([]);
    }
  }, [visible, note]);

  const handleClose = () => {
    setTitle('');
    setContent('');
    setChecklist([]);
    onClose();
  };

  const addChecklistItem = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setChecklist((prev) => [...prev, { id, text: '', completed: false }]);
  };

  const updateChecklistText = (id: string, text: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const toggleChecklistItem = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeChecklistItem = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDelete = async () => {
    if (note) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast(
        `Delete "${note.title || 'Untitled Note'}"? This action cannot be undone.`,
        'warning',
        {
          confirmAction: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteNote(note.id);
              handleClose();
              setTimeout(() => {
                showToast('Note deleted successfully', 'success');
              }, 300);
            } catch (error) {
              showToast('Failed to delete note', 'error');
            }
          },
          confirmText: 'Delete',
        }
      );
    }
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

    setSaving(true);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (note) {
        await updateNote(note.id, base);
      } else {
        await createNote(base);
      }

      handleClose();

      // Show success toast after modal closes
      setTimeout(() => {
        showToast(note ? 'Note updated successfully' : 'Note created successfully', 'success');
      }, 300);
    } catch (e) {
      console.error('Error saving note', e);
      showToast('Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };


  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Enhanced Header */}
        <LinearGradient
          colors={[
            activeNoteType === 'personal'
              ? theme.colors.secondary + '15'
              : theme.colors.primary + '15',
            theme.colors.background,
          ]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      activeNoteType === 'personal'
                        ? theme.colors.secondary + '20'
                        : theme.colors.primary + '20',
                    borderColor:
                      activeNoteType === 'personal' ? theme.colors.secondary : theme.colors.primary,
                  },
                ]}
              >
                <MaterialIcons
                  name={activeNoteType === 'personal' ? 'person' : 'group'}
                  size={14}
                  color={activeNoteType === 'personal' ? theme.colors.secondary : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.typeBadgeText,
                    {
                      color:
                        activeNoteType === 'personal' ? theme.colors.secondary : theme.colors.primary,
                    },
                  ]}
                >
                  {activeNoteType.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {note && (
                <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                  <MaterialIcons name="delete-outline" size={22} color={theme.colors.error} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.saveButton,
                  saving && { opacity: 0.6 }
                ]}
                disabled={saving} 
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Last Edited Info */}
          {note && (
            <View style={styles.editorInfoContainer}>
              <View style={styles.editorInfoContent}>
                <MaterialIcons name="schedule" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.editorInfoText, { color: theme.colors.textMuted }]}>
                  Edited by {note.lastEditorName || 'Unknown'} • {getTimeAgo(note.lastEdited)}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <TextInput
            style={[styles.titleInput, { color: theme.colors.textPrimary }]}
            placeholder="Note title..."
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {/* Content Input */}
          <TextInput
            style={[
              styles.contentInput,
              {
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.cardBackground + '50',
                borderColor: theme.colors.cardBorder,
              },
            ]}
            placeholder="Write your note here..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          {/* Checklist Section */}
          <View style={styles.checklistSection}>
            <View style={styles.checklistHeader}>
              <View style={styles.checklistTitleRow}>
                <MaterialIcons
                  name="checklist"
                  size={20}
                  color={theme.colors.textPrimary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                  Checklist
                </Text>
                {checklist.length > 0 && (
                  <View
                    style={[
                      styles.checklistCountBadge,
                      {
                        backgroundColor:
                          checklist.filter((c) => c.completed).length === checklist.length
                            ? theme.colors.success + '20'
                            : theme.colors.warning + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.checklistCountText,
                        {
                          color:
                            checklist.filter((c) => c.completed).length === checklist.length
                              ? theme.colors.success
                              : theme.colors.warning,
                        },
                      ]}
                    >
                      {checklist.filter((c) => c.completed).length}/{checklist.length}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.addChecklistButton,
                  {
                    backgroundColor: theme.colors.primary + '15',
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={addChecklistItem}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Checklist Items */}
            {checklist.length === 0 ? (
              <View style={styles.emptyChecklist}>
                <MaterialIcons name="playlist-add-check" size={40} color={theme.colors.textMuted} />
                <Text style={[styles.emptyChecklistText, { color: theme.colors.textMuted }]}>
                  No checklist items yet
                </Text>
                <Text style={[styles.emptyChecklistHint, { color: theme.colors.textMuted }]}>
                  Tap + to add interactive checkboxes
                </Text>
              </View>
            ) : (
              <View style={styles.checklistItems}>
                {checklist.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.checklistItem,
                      {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={() => toggleChecklistItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={
                          item.completed ? 'check-circle' : 'radio-button-unchecked'
                        }
                        size={24}
                        color={
                          item.completed ? theme.colors.success : theme.colors.textMuted
                        }
                      />
                    </TouchableOpacity>

                    <TextInput
                      style={[
                        styles.checklistInput,
                        {
                          color: theme.colors.textPrimary,
                          textDecorationLine: item.completed ? 'line-through' : 'none',
                          opacity: item.completed ? 0.5 : 1,
                        },
                      ]}
                      placeholder={`Item ${index + 1}`}
                      placeholderTextColor={theme.colors.textMuted}
                      value={item.text}
                      onChangeText={(text) => updateChecklistText(item.id, text)}
                      editable={!item.completed}
                      multiline
                    />

                    <TouchableOpacity
                      onPress={() => removeChecklistItem(item.id)}
                      style={styles.deleteCheckButton}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="close" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  editorInfoContainer: {
    paddingHorizontal: 20,
  },
  editorInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  editorInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 12,
    marginBottom: 16,
    minHeight: 50,
  },
  contentInput: {
    minHeight: 120,
    fontSize: 15,
    lineHeight: 22,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  checklistSection: {
    marginBottom: 20,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checklistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  checklistCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  checklistCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addChecklistButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  emptyChecklist: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChecklistText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyChecklistHint: {
    fontSize: 13,
    marginTop: 4,
  },
  checklistItems: {
    gap: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkButton: {
    padding: 4,
  },
  checklistInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
    minHeight: 24,
  },
  deleteCheckButton: {
    padding: 4,
  },
});
