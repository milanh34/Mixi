// components/ui/NotesTab.tsx - COMPLETE UPDATED CODE
import React, { useEffect, useState } from 'react';
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
import { Note } from '../../lib/schema';
import { EmptyState } from './EmptyState';
import { NoteEditor } from '../editors/NoteEditor';
import { useAuthStore } from '../../stores/authStore';
import { useGroupStore } from '@/stores/groupStore';
import { useToast } from '../../utils/toastManager';

type NoteType = 'personal' | 'shared';

interface NotesTabProps {
  groupId: string;
}

export function NotesTab({ groupId }: NotesTabProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { currentGroup } = useGroupStore();
  const { notes, fetchGroupNotes, deleteNote } = useNoteStore();
  const [activeNoteType, setActiveNoteType] = useState<NoteType>('shared');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    console.log('🔄 NotesTab useEffect triggered:', { groupId, hasNotes: notes.length });
    if (groupId && currentGroup?.id === groupId) {
      console.log('📥 Calling fetchGroupNotes for:', groupId);
      fetchGroupNotes(groupId);
    } else {
      console.log('⏳ Skipping fetchGroupNotes - missing groupId or currentGroup:', { groupId, currentGroupId: currentGroup?.id });
    }
  }, [groupId, fetchGroupNotes]);

  // ✅ NEW: Filter notes - only show user's personal notes + all shared notes
  const allVisibleNotes = notes.filter(note =>
    note.type === 'shared' ||
    note.creatorId === user?.uid
  );

  const personalNotes = allVisibleNotes.filter(n => n.type === 'personal');
  const sharedNotes = allVisibleNotes.filter(n => n.type === 'shared');

  // ✅ NEW: Use correct notes based on active filter
  const filteredNotes = activeNoteType === 'personal' ? personalNotes : sharedNotes;

  const handleDelete = (id: string, title: string) => {
  showToast(
    `Delete "${title}"?`,
    'warning',
    {
      confirmAction: async () => {
        await deleteNote(id);
        showToast('Note deleted', 'success');
      },
      confirmText: 'Delete'
    }
  );
};

  const renderNoteItem = (item: Note) => {
    const checklistCount = item.checklist?.length || 0;
    const lastEditedLabel = item.lastEdited
      ? new Date(item.lastEdited.seconds * 1000).toLocaleString()
      : '';

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.noteItem,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          },
        ]}
        onPress={() => {
          setEditingNote(item);
          setShowEditor(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.noteHeader}>
          <Text
            style={[styles.noteTitle, { color: theme.colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.title || '(Untitled)'}
          </Text>
          <View
            style={[
              styles.noteTypeBadge,
              {
                backgroundColor:
                  item.type === 'personal'
                    ? theme.colors.secondary + '20'
                    : theme.colors.primary + '20',
              },
            ]}
          >
            <Text
              style={{
                color:
                  item.type === 'personal'
                    ? theme.colors.secondary
                    : theme.colors.primary,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {!!item.content && (
          <Text
            style={[styles.notePreview, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.content.substring(0, 120)}
          </Text>
        )}

        <View style={styles.noteFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {checklistCount > 0 && (
              <Text style={[styles.noteMeta, { color: theme.colors.textMuted }]}>
                📋 {checklistCount}
              </Text>
            )}
            {item.lastEditorName && (
              <Text style={[styles.noteMeta, { color: theme.colors.textMuted }]}>
                · {item.lastEditorName.length > 12
                  ? item.lastEditorName.substring(0, 12) + '..'
                  : item.lastEditorName}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {lastEditedLabel.length > 0 && (
              <Text
                style={[styles.noteMeta, { color: theme.colors.textMuted }]}
                numberOfLines={1}
              >
                {lastEditedLabel}
              </Text>
            )}
            <TouchableOpacity onPress={() => handleDelete(item.id, item.title || '(Untitled)')}>
              <MaterialIcons
                name="delete-outline"
                size={18}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeNoteType === 'personal' && styles.filterButtonActive,
            {
              backgroundColor:
                activeNoteType === 'personal'
                  ? theme.colors.secondary + '20'
                  : theme.colors.cardBackground,
              borderColor:
                activeNoteType === 'personal'
                  ? theme.colors.secondary
                  : theme.colors.cardBorder,
            },
          ]}
          onPress={() => setActiveNoteType('personal')}
        >
          <MaterialIcons
            name="person"
            size={16}
            color={
              activeNoteType === 'personal'
                ? theme.colors.secondary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.filterText,
              {
                color:
                  activeNoteType === 'personal'
                    ? theme.colors.secondary
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Personal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeNoteType === 'shared' && styles.filterButtonActive,
            {
              backgroundColor:
                activeNoteType === 'shared'
                  ? theme.colors.primary + '20'
                  : theme.colors.cardBackground,
              borderColor:
                activeNoteType === 'shared'
                  ? theme.colors.primary
                  : theme.colors.cardBorder,
            },
          ]}
          onPress={() => setActiveNoteType('shared')}
        >
          <MaterialIcons
            name="group"
            size={16}
            color={
              activeNoteType === 'shared'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.filterText,
              {
                color:
                  activeNoteType === 'shared'
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Shared
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary card - ✅ UPDATED with correct count */}
      <View
        style={[
          styles.totalCard,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
          {activeNoteType === 'personal' ? 'Personal notes' : 'Shared group notes'}
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.textPrimary }]}>
          {filteredNotes.length}
        </Text>
        <Text style={[styles.totalSubtext, { color: theme.colors.textMuted }]}>
          notes
        </Text>
      </View>

      {/* List */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon="edit-note"
          title={`No ${activeNoteType} notes yet`}
          description="Tap + to create one"
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotes.map(renderNoteItem)}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setEditingNote(undefined);
          setShowEditor(true);
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Editor modal */}
      <NoteEditor
        visible={showEditor}
        note={editingNote}
        activeNoteType={activeNoteType}
        groupId={groupId}
        onClose={() => {
          setShowEditor(false);
          setEditingNote(undefined);
        }}
      />
    </View>
  );
}

// styles remain exactly the same
const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterButtonActive: {
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, marginBottom: 4 },
  totalValue: { fontSize: 30, fontWeight: '800' },
  totalSubtext: { fontSize: 14, opacity: 0.7, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  noteItem: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitle: { fontSize: 16, fontWeight: '700' },
  noteTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  notePreview: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteMeta: { fontSize: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
