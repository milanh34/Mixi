// app/group/settings/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../../stores/themeStore';
import { useGroupStore } from '../../../stores/groupStore';
import { useAuthStore } from '../../../stores/authStore';
import { useGroupMembers } from '../../../hooks/useGroupMembers';
import { useToast } from '../../../utils/toastManager';
import { MemberAvatar } from '../../../components/ui/MemberAvatar';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getGroupTypeEmoji } from '../../../utils/colors';

const GROUP_TYPES = ['project', 'household', 'trip', 'couple', 'friends', 'other'] as const;
const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD'] as const;
type GroupType = typeof GROUP_TYPES[number];

export default function GroupSettingsScreen() {
  const routerInstance = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    currentGroup,
    fetchGroup,
    updateGroup,
    deleteGroup,
    leaveGroup,
    removeMember,
    setAdmin
  } = useGroupStore();
  const { members } = useGroupMembers(id as string);
  const { showToast } = useToast(); // ✅ Toast ready

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState<GroupType>('project');
  const [currency, setCurrency] = useState('USD');

  const isAdmin = currentGroup?.adminId === user?.uid;

  useEffect(() => {
    if (currentGroup) {
      setName(currentGroup.name);
      setDescription(currentGroup.description || '');
      setGroupType((currentGroup.type as GroupType) || 'project');
      setCurrency(currentGroup.currency);
    }
  }, [currentGroup]);

  const handleSave = async () => {
    if (!currentGroup) return;
    try {
      await updateGroup(currentGroup.id, {
        name,
        description,
        type: groupType,
        currency,
      });
      setEditing(false);
      showToast('Group updated successfully!', 'success');
      await fetchGroup(currentGroup.id);
    } catch (error: any) {
      showToast(error.message || 'Failed to update group', 'error');
    }
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    showToast(
      `Remove ${memberName}?`,
      'warning',
      {
        confirmAction: async () => {
          await removeMember(currentGroup!.id, user!.uid, memberId);
          showToast('Member removed', 'success');
        },
        confirmText: 'Remove'
      }
    );
  };

  const handleTransferAdmin = (memberId: string, memberName: string) => {
    showToast(
      `Transfer admin to ${memberName}?`,
      'warning',
      {
        confirmAction: async () => {
          await setAdmin(currentGroup!.id, memberId);
          showToast('Admin transferred!', 'success');
          routerInstance.back();
        },
        confirmText: 'Transfer'
      }
    );
  };

  const handleLeaveGroup = () => {
    showToast(
      'Leave this group?',
      'warning',
      {
        confirmAction: async () => {
          await leaveGroup(currentGroup!.id, user!.uid);
          showToast('Left group', 'success');
          routerInstance.back();
        },
        confirmText: 'Leave'
      }
    );
  };

  const handleDeleteGroup = () => {
    showToast(
      'Delete entire group and all data?',
      'error',
      {
        confirmAction: async () => {
          await deleteGroup(currentGroup!.id, user!.uid);
          showToast('Group deleted', 'success');
          routerInstance.push('/');
        },
        confirmText: 'Delete Group'
      }
    );
  };

  if (!currentGroup || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loading, { color: theme.colors.textPrimary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => routerInstance.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.cardBackground }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Group Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Group Info Section */}
        <View style={[styles.section, {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          shadowColor: theme.colors.cardShadow,
        }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Group Information
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Group Name
            </Text>
            <TextInput
              style={[
                styles.input,
                editing && styles.inputActive,
                {
                  backgroundColor: editing ? theme.colors.surface : theme.colors.cardBackground,
                  borderColor: editing ? theme.colors.primary : theme.colors.cardBorder,
                  color: theme.colors.textPrimary
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter group name"
              editable={isAdmin && editing}
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                editing && styles.inputActive,
                {
                  backgroundColor: editing ? theme.colors.surface : theme.colors.cardBackground,
                  borderColor: editing ? theme.colors.primary : theme.colors.cardBorder,
                  color: theme.colors.textPrimary
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter group description"
              multiline
              numberOfLines={3}
              editable={isAdmin && editing}
              placeholderTextColor={theme.colors.textMuted}
              textAlignVertical="top"
            />
          </View>

          {/* Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Group Type
            </Text>
            <View style={[styles.selectContainer, {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder
            }]}>
              {GROUP_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.selectItem,
                    groupType === type && styles.selectItemActive
                  ]}
                  onPress={() => setGroupType(type)}
                  disabled={!isAdmin || !editing}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="label"
                    size={16}
                    color={groupType === type ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text style={[
                    styles.selectItemText,
                    {
                      color: groupType === type ? theme.colors.textPrimary : theme.colors.textSecondary
                    }
                  ]}>
                    {getGroupTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Currency Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Currency
            </Text>
            <View style={[styles.selectContainer, {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder
            }]}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.selectItem,
                    currency === curr && styles.selectItemActive
                  ]}
                  onPress={() => setCurrency(curr)}
                  disabled={!isAdmin || !editing}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.selectItemText,
                    {
                      color: currency === curr ? theme.colors.textPrimary : theme.colors.textSecondary
                    }
                  ]}>
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View style={[styles.section, {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          shadowColor: theme.colors.cardShadow,
        }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="group" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Members ({members.length})
            </Text>
          </View>

          {members.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No members"
              description="Group is empty"
            />
          ) : (
            members.map((member) => (
              <TouchableOpacity
                key={member.userId}
                style={[
                  styles.memberRow,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.cardBorder
                  }
                ]}
                activeOpacity={0.7}
              >
                <MemberAvatar
                  name={member.userName}
                  photo={member.userProfilePicture}
                  size="small"
                />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                    {member.userId === user?.uid ? 'You' : member.userName}
                  </Text>
                  <View style={styles.memberRoleContainer}>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: member.role === 'admin' ? theme.colors.primary + '10' : theme.colors.surface }
                    ]}>
                      <Text style={[
                        styles.roleText,
                        { color: member.role === 'admin' ? theme.colors.primary : theme.colors.textSecondary }
                      ]}>
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </Text>
                    </View>
                  </View>
                </View>
                {isAdmin && member.userId !== user?.uid && (
                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.colors.error + '10' }
                      ]}
                      onPress={() => handleDeleteMember(member.userId, member.userName)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="remove-circle-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.colors.primary + '10' }
                      ]}
                      onPress={() => handleTransferAdmin(member.userId, member.userName)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="admin-panel-settings" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {isAdmin ? (
            <>
              {editing ? (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButtonFull,
                      styles.cancelButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.cardBorder
                      }
                    ]}
                    onPress={() => setEditing(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButtonFull,
                      styles.saveButton,
                      { backgroundColor: theme.colors.success }
                    ]}
                    onPress={handleSave}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="check" size={20} color={theme.colors.textInverse} />
                    <Text style={[styles.actionButtonText, { color: theme.colors.textInverse }]}>
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.actionButtonFull,
                    styles.editButton,
                    { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setEditing(true)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={20} color={theme.colors.textInverse} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.textInverse }]}>
                    Edit Group
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButtonFull,
                  styles.dangerButton,
                  { backgroundColor: theme.colors.error }
                ]}
                onPress={handleDeleteGroup}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={20} color={theme.colors.textInverse} />
                <Text style={[styles.actionButtonText, { color: theme.colors.textInverse }]}>
                  Delete Group
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButtonFull,
                styles.leaveButton,
                { backgroundColor: theme.colors.error }
              ]}
              onPress={handleLeaveGroup}
              activeOpacity={0.7}
            >
              <MaterialIcons name="exit-to-app" size={20} color={theme.colors.textInverse} />
              <Text style={[styles.actionButtonText, { color: theme.colors.textInverse }]}>
                Leave Group
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  headerSpacer: { width: 48, height: 48 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700'
  },

  inputGroup: { marginBottom: 24 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputActive: {
    shadowOpacity: 0.15,
    shadowColor: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },

  selectContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  selectItemActive: {
    borderLeftWidth: 4,
  },
  selectItemText: {
    fontSize: 16,
    fontWeight: '600'
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  memberInfo: { flex: 1, marginLeft: 16 },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  memberRoleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 12,
    borderRadius: 12
  },

  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  editActions: {
    flexDirection: 'row',
    gap: 16
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  editButton: {},
  saveButton: {},
  cancelButton: {
    shadowOpacity: 0.1,
  },
  leaveButton: {},
  dangerButton: {},
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700'
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loading: {
    fontSize: 16,
    fontWeight: '600'
  },
});
