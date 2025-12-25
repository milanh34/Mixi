// app/group/settings/[id].tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../stores/authStore';
import { useThemeStore } from '../../../stores/themeStore';
import { useGroupStore } from '../../../stores/groupStore';
import { useGroupMembers } from '../../../hooks/useGroupMembers';
import { useToastPortal } from '../../../components/ui/ToastPortal';
import { MemberAvatar } from '../../../components/ui/MemberAvatar';
import * as Haptics from 'expo-haptics';

const GROUP_TYPES = [
  { value: 'trip', label: 'Trip', icon: 'flight', emoji: '✈️' },
  { value: 'project', label: 'Project', icon: 'work', emoji: '💼' },
  { value: 'event', label: 'Event', icon: 'event', emoji: '🎉' },
  { value: 'shopping', label: 'Shopping', icon: 'shopping-bag', emoji: '🛍️' },
  { value: 'dayout', label: 'Day Out', icon: 'wb-sunny', emoji: '🌤️' },
  { value: 'household', label: 'Household', icon: 'home', emoji: '🏠' },
  { value: 'other', label: 'Other', icon: 'more-horiz', emoji: '📌' },
];

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { currentGroup, fetchGroup, updateGroup, deleteGroup } = useGroupStore();
  const { members } = useGroupMembers(id as string);
  const { showToast } = useToastPortal();

  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState<string>('trip');

  useEffect(() => {
    if (id) {
      fetchGroup(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (currentGroup) {
      setGroupName(currentGroup.name);
      setDescription(currentGroup.description || '');
      setGroupType(currentGroup.type);
    }
  }, [currentGroup]);

  if (!currentGroup || !user) {
    return null;
  }

  const isAdmin = currentGroup.adminId === user.uid;
  const activeType = GROUP_TYPES.find((t) => t.value === groupType);

  const handleSave = async () => {
    if (!groupName.trim()) {
      showToast('Group name is required', 'error');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateGroup(currentGroup.id, {
        name: groupName.trim(),
        description: description.trim() || undefined,
        type: groupType as any,
      });
      showToast('Group updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Failed to update group', 'error');
    }
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast(
      `Delete "${currentGroup.name}"? All expenses, notes, and member data will be permanently removed.`,
      'warning',
      {
        confirmAction: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteGroup(currentGroup.id, user.uid);
            router.replace('/(tabs)');
            // Show success after navigation
            setTimeout(() => {
              showToast('Group deleted successfully', 'success');
            }, 500);
          } catch (error) {
            showToast('Failed to delete group', 'error');
          }
        },
        confirmText: 'Delete',
      }
    );
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Group Settings</Text>
          <View style={styles.groupTypeBadge}>
            <Text style={styles.groupTypeEmoji}>{activeType?.emoji}</Text>
            <Text style={styles.groupTypeText}>{activeType?.label}</Text>
          </View>
        </View>
        {isAdmin && !isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editHeaderButton}>
            <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {!isAdmin && <View style={{ width: 40 }} />}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Info Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Group Information
              </Text>
            </View>
          </View>

          {/* Group Name */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>Group Name</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor={theme.colors.textMuted}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: theme.colors.textPrimary }]}>
                {currentGroup.name}
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.fieldInput,
                  styles.fieldTextArea,
                  {
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description (optional)"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
                {currentGroup.description || 'No description'}
              </Text>
            )}
          </View>

          {/* Group Type */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>Group Type</Text>
            {isEditing ? (
              <View style={styles.typeGrid}>
                {GROUP_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          groupType === type.value
                            ? theme.colors.primary + '15'
                            : theme.colors.background,
                        borderColor:
                          groupType === type.value ? theme.colors.primary : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => setGroupType(type.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            groupType === type.value ? theme.colors.primary : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.typeDisplay}>
                <Text style={styles.typeDisplayEmoji}>{activeType?.emoji}</Text>
                <Text style={[styles.fieldValue, { color: theme.colors.textPrimary }]}>
                  {activeType?.label}
                </Text>
              </View>
            )}
          </View>

          {/* Currency & Created Date Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={18} color={theme.colors.textMuted} />
              <View style={styles.infoItemContent}>
                <Text style={[styles.infoItemLabel, { color: theme.colors.textMuted }]}>
                  Created
                </Text>
                <Text style={[styles.infoItemValue, { color: theme.colors.textPrimary }]}>
                  {formatDate(currentGroup.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Edit Actions */}
          {isAdmin && isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[
                  styles.editActionButton,
                  styles.cancelButton,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
                onPress={() => {
                  setIsEditing(false);
                  setGroupName(currentGroup.name);
                  setDescription(currentGroup.description || '');
                  setGroupType(currentGroup.type);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.editActionButtonText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.editActionButton,
                  styles.saveButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <MaterialIcons name="check" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Members Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <MaterialIcons name="people" size={20} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Members</Text>
            </View>
            <View style={[styles.memberCountBadge, { backgroundColor: theme.colors.primary + '15' }]}>
              <Text style={[styles.memberCountText, { color: theme.colors.primary }]}>
                {members.length}
              </Text>
            </View>
          </View>

          <View style={styles.membersList}>
            {members.map((member, index) => (
              <View
                key={member.userId}
                style={[
                  styles.memberItem,
                  {
                    borderBottomWidth: index < members.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.cardBorder + '50',
                  },
                ]}
              >
                <MemberAvatar name={member.userName} photo={member.userProfilePicture} size="medium" />
                <View style={styles.memberItemInfo}>
                  <View style={styles.memberItemHeader}>
                    <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                      {member.userId === user.uid ? 'You' : member.userName}
                    </Text>
                    {member.role === 'admin' && (
                      <View
                        style={[
                          styles.adminBadge,
                          { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                        ]}
                      >
                        <MaterialIcons name="star" size={10} color={theme.colors.primary} />
                        <Text style={[styles.adminBadgeText, { color: theme.colors.primary }]}>
                          Admin
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.memberItemFooter}>
                    <MaterialIcons name="schedule" size={12} color={theme.colors.textMuted} />
                    <Text style={[styles.memberJoinDate, { color: theme.colors.textMuted }]}>
                      Joined {formatDate(member.joinedAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        {isAdmin && (
          <View
            style={[
              styles.card,
              styles.dangerCard,
              {
                backgroundColor: theme.colors.error + '08',
                borderColor: theme.colors.error + '30',
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIcon, { backgroundColor: theme.colors.error + '20' }]}>
                  <MaterialIcons name="warning" size={20} color={theme.colors.error} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.error }]}>Danger Zone</Text>
              </View>
            </View>

            <Text style={[styles.dangerDescription, { color: theme.colors.textSecondary }]}>
              Deleting this group will permanently remove all expenses, notes, and member data. This
              action cannot be undone.
            </Text>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor: theme.colors.error,
                },
              ]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete-forever" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete Group Permanently</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  groupTypeEmoji: {
    fontSize: 12,
  },
  groupTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  fieldTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: '47%',
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeDisplayEmoji: {
    fontSize: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  editActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  cancelButton: {},
  saveButton: {
    borderWidth: 0,
  },
  editActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  membersList: {
    gap: 0,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  memberItemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  memberItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberJoinDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  dangerCard: {},
  dangerDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
