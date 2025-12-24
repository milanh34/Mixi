// app/profile.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../stores/authStore';
import { useGroupStore } from '../../stores/groupStore';
import { useThemeStore } from '../../stores/themeStore';
import { useToast } from '../../utils/toastManager';
import { Timestamp } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfilePhoto } from '../../components/profile/ProfilePhoto';
import { StatsCards } from '../../components/profile/StatsCard';
import { ProfileDetails } from '../../components/profile/ProfileDetails';
import { EditForm } from '../../components/profile/EditForm';
import { PasswordModal } from '../../components/profile/PasswordModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile, loading: authLoading } = useAuthStore();
  const { groups, fetchUserGroups, loading: groupsLoading } = useGroupStore();
  const { theme } = useThemeStore();
  const { showToast } = useToast();

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Stats calculation
  const totalGroups = groups.length;
  const totalExpenses = groups.reduce((acc, group) => acc + (group.totalExpenses || 0), 0);
  const totalOwe = Math.abs(user?.stats?.totalBalance || 0);
  const totalOwed = 0; // Calculate from group members owed to you

  useEffect(() => {
    if (user?.uid) {
      fetchUserGroups(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.toDate().toISOString().split('T')[0] : '');
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  const handlePhotoChange = useCallback((url: string) => {
    setProfilePicture(url);
    if (user) {
      updateUserProfile({ profilePicture: url });
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const updates: Record<string, any> = {
        name: name.trim(),
      };

      if (bio.trim()) updates.bio = bio.trim();
      if (phoneNumber.trim()) updates.phoneNumber = phoneNumber.trim();
      if (address.trim()) updates.address = address.trim();
      if (dateOfBirth) {
        const date = new Date(dateOfBirth);
        if (!isNaN(date.getTime())) {
          updates.dateOfBirth = Timestamp.fromDate(date);
        }
      }

      await updateUserProfile(updates);
      setIsEditing(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.toDate().toISOString().split('T')[0] : '');
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
    }
  };

  const handlePasswordChange = async (current: string, newPass: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) {
      throw new Error('No authenticated user');
    }

    const credential = EmailAuthProvider.credential(currentUser.email, current);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPass);
  };

  const isLoading = authLoading || groupsLoading;

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProfileHeader isEditing={isEditing} onEditToggle={() => setIsEditing(!isEditing)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfilePhoto
          profilePicture={profilePicture}
          isEditing={isEditing}
          onPhotoChange={handlePhotoChange}
        />

        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
          {user.email}
        </Text>
        <Text style={[styles.username, { color: theme.colors.textMuted }]}>
          @{user.username}
        </Text>

        <StatsCards
          totalGroups={totalGroups}
          totalExpenses={totalExpenses}
          totalOwe={totalOwe}
          totalOwed={totalOwed}
        />

        {!isEditing ? (
          <ProfileDetails user={user} isEditing={isEditing} />
        ) : (
          <EditForm
            name={name}
            bio={bio}
            dateOfBirth={dateOfBirth}
            phoneNumber={phoneNumber}
            address={address}
            onNameChange={setName}
            onBioChange={setBio}
            onDateOfBirthChange={setDateOfBirth}
            onPhoneNumberChange={setPhoneNumber}
            onAddressChange={setAddress}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={isLoading}
          />
        )}

        <TouchableOpacity
          style={[
            styles.passwordButton,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder
            }
          ]}
          onPress={() => setShowPasswordModal(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="lock" size={20} color={theme.colors.primary} />
          <Text style={[styles.passwordText, { color: theme.colors.textPrimary }]}>
            Change Password
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      <PasswordModal
  visible={showPasswordModal}
  onClose={() => setShowPasswordModal(false)}
  onPasswordChange={handlePasswordChange}
/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  passwordText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
