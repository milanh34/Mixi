// components/ui/NotesTab.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { useNoteStore } from '../../stores/noteStore';
import { useAuthStore } from '../../stores/authStore';
import { Note } from '../../lib/schema';
import { NoteEditor } from '../editors/NoteEditor';
import { EmptyState } from './EmptyState';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface NotesTabProps {
  groupId: string;
}

export function NotesTab({ groupId }: NotesTabProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { notes, fetchGroupNotes } = useNoteStore();
  const [activeType, setActiveType] = useState<'personal' | 'shared'>('shared');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    fetchGroupNotes(groupId);
  }, [groupId]);

  const filteredNotes = notes.filter(
    (n) => n.groupId === groupId && n.type === activeType
  );

  const handleAddNote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingNote(undefined);
    setShowEditor(true);
  };

  const handleEditNote = async (note: Note) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleTypeChange = async (type: 'personal' | 'shared') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveType(type);
  };

  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header with Filter Tabs and Add Button */}
      <View style={styles.header}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeType === 'personal' && styles.filterButtonActive,
              {
                backgroundColor:
                  activeType === 'personal'
                    ? theme.colors.secondary + '20'
                    : theme.colors.cardBackground,
                borderColor:
                  activeType === 'personal' ? theme.colors.secondary : theme.colors.cardBorder,
              },
            ]}
            onPress={() => handleTypeChange('personal')}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="person"
              size={16}
              color={activeType === 'personal' ? theme.colors.secondary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeType === 'personal' ? theme.colors.secondary : theme.colors.textSecondary,
                },
              ]}
            >
              Personal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeType === 'shared' && styles.filterButtonActive,
              {
                backgroundColor:
                  activeType === 'shared' ? theme.colors.primary + '20' : theme.colors.cardBackground,
                borderColor: activeType === 'shared' ? theme.colors.primary : theme.colors.cardBorder,
              },
            ]}
            onPress={() => handleTypeChange('shared')}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="group"
              size={16}
              color={activeType === 'shared' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: activeType === 'shared' ? theme.colors.primary : theme.colors.textSecondary,
                },
              ]}
            >
              Shared
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: activeType === 'personal' ? theme.colors.secondary : theme.colors.primary,
            },
          ]}
          onPress={handleAddNote}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon="note-add"
          title={`No ${activeType} notes yet`}
          description={`Tap the + button to create your first ${activeType} note`}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotes.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: index * 50 }}
            >
              <TouchableOpacity
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
                onPress={() => handleEditNote(item)}
                activeOpacity={0.7}
              >
                {/* Note Icon & Header */}
                <View style={styles.noteCardHeader}>
                  <View
                    style={[
                      styles.noteIcon,
                      {
                        backgroundColor:
                          activeType === 'personal'
                            ? theme.colors.secondary + '15'
                            : theme.colors.primary + '15',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={item.checklist.length > 0 ? 'checklist' : 'description'}
                      size={20}
                      color={activeType === 'personal' ? theme.colors.secondary : theme.colors.primary}
                    />
                  </View>
                  <View style={styles.noteHeaderText}>
                    {item.title ? (
                      <Text
                        style={[styles.noteTitle, { color: theme.colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    ) : (
                      <Text style={[styles.noteTitleEmpty, { color: theme.colors.textMuted }]}>
                        Untitled Note
                      </Text>
                    )}
                    <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
                      {getTimeAgo(item.lastEdited)}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
                </View>

                {/* Note Content Preview */}
                {item.content && (
                  <Text
                    style={[styles.noteContent, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.content}
                  </Text>
                )}

                {/* Checklist Preview */}
                {item.checklist && item.checklist.length > 0 && (
                  <View style={styles.checklistPreview}>
                    <View
                      style={[
                        styles.checklistBadge,
                        {
                          backgroundColor:
                            item.checklist.filter((c) => c.completed).length === item.checklist.length
                              ? theme.colors.success + '20'
                              : theme.colors.warning + '20',
                          borderColor:
                            item.checklist.filter((c) => c.completed).length === item.checklist.length
                              ? theme.colors.success
                              : theme.colors.warning,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name="checklist"
                        size={14}
                        color={
                          item.checklist.filter((c) => c.completed).length === item.checklist.length
                            ? theme.colors.success
                            : theme.colors.warning
                        }
                      />
                      <Text
                        style={[
                          styles.checklistCount,
                          {
                            color:
                              item.checklist.filter((c) => c.completed).length === item.checklist.length
                                ? theme.colors.success
                                : theme.colors.warning,
                          },
                        ]}
                      >
                        {item.checklist.filter((c) => c.completed).length}/{item.checklist.length}
                      </Text>
                    </View>
                    <Text style={[styles.editorText, { color: theme.colors.textMuted }]}>
                      by {item.lastEditorName || 'Unknown'}
                    </Text>
                  </View>
                )}

                {/* Editor Info (if no checklist) */}
                {(!item.checklist || item.checklist.length === 0) && (
                  <View style={styles.editorInfo}>
                    <MaterialIcons name="edit" size={11} color={theme.colors.textMuted} />
                    <Text style={[styles.editorText, { color: theme.colors.textMuted }]}>
                      {item.lastEditorName || 'Unknown'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>
      )}

      {/* Note Editor Modal */}
      <NoteEditor
        visible={showEditor}
        note={editingNote}
        activeNoteType={activeType}
        groupId={groupId}
        onClose={() => {
          setShowEditor(false);
          setEditingNote(undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  filterRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  filterButtonActive: {},
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  noteCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteHeaderText: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  noteTitleEmpty: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  checklistPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checklistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  checklistCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  editorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editorText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
