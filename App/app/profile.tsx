// app/profile.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useToast } from '../utils/toastManager';
import { useImagePicker } from '../hooks/useImagePicker';
import { MotiView } from 'moti';
import { Timestamp } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile, loading } = useAuthStore();
  const { theme } = useThemeStore();
  const { showToast } = useToast();
  const { pickImage, uploading } = useImagePicker();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? user.dateOfBirth.toDate().toISOString().split('T')[0] : ''
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setDateOfBirth(
        user.dateOfBirth ? user.dateOfBirth.toDate().toISOString().split('T')[0] : ''
      );
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    if (name.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'error');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const updates: any = {
        name: name.trim(),
        bio: bio.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
        profilePicture: profilePicture || undefined,
      };

      if (dateOfBirth) {
        try {
          const date = new Date(dateOfBirth);
          if (isNaN(date.getTime())) {
            showToast('Invalid date format. Use YYYY-MM-DD', 'error');
            return;
          }
          updates.dateOfBirth = Timestamp.fromDate(date);
        } catch (error) {
          showToast('Invalid date format', 'error');
          return;
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

  const handleChangePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const uri = await pickImage();
    if (uri) {
      setProfilePicture(uri);
      setIsEditing(true);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (currentPassword === newPassword) {
      showToast('New password must be different from current password', 'warning');
      return;
    }

    setPasswordLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No authenticated user');
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setPasswordLoading(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Password updated successfully!', 'success');
    } catch (error: any) {
      setPasswordLoading(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      if (error.code === 'auth/wrong-password') {
        showToast('Current password is incorrect', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showToast('Too many attempts. Please try again later', 'error');
      } else {
        showToast(error.message || 'Failed to update password', 'error');
      }
    }
  };

  if (!user || !user.stats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.gradientStart + '15', theme.colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Profile
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                setIsEditing(false);
                setName(user.name);
                setBio(user.bio || '');
                setDateOfBirth(
                  user.dateOfBirth ? user.dateOfBirth.toDate().toISOString().split('T')[0] : ''
                );
                setPhoneNumber(user.phoneNumber || '');
                setAddress(user.address || '');
                setProfilePicture(user.profilePicture);
              } else {
                setIsEditing(true);
              }
            }}
            style={styles.headerButton}
          >
            <MaterialIcons
              name={isEditing ? 'close' : 'edit'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600 }}
          style={styles.photoSection}
        >
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={isEditing ? handleChangePhoto : undefined}
            disabled={!isEditing || uploading}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.photo} />
            ) : (
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.photoPlaceholder}
              >
                <MaterialIcons name="person" size={64} color="#FFFFFF" />
              </LinearGradient>
            )}
            {isEditing && !uploading && (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.photoOverlay}
              >
                <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
              </LinearGradient>
            )}
            {uploading && (
              <View style={[styles.photoOverlay, { backgroundColor: theme.colors.primary }]}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {!isEditing && (
            <>
              <Text style={[styles.nameDisplay, { color: theme.colors.textPrimary }]}>
                {user.name}
              </Text>
              <Text style={[styles.emailDisplay, { color: theme.colors.textSecondary }]}>
                @{user.username} • {user.email}
              </Text>
              {user.bio && (
                <Text style={[styles.bioDisplay, { color: theme.colors.textMuted }]}>
                  {user.bio}
                </Text>
              )}
            </>
          )}
        </MotiView>

        {/* Stats Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
        >
          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <MaterialIcons name="group" size={32} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {user.stats.totalGroups}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Groups
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <MaterialIcons name="receipt" size={32} color={theme.colors.secondary} />
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {user.stats.totalExpenses}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Expenses
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <MaterialIcons
                name="account-balance-wallet"
                size={32}
                color={
                  user.stats.totalBalance > 0
                    ? theme.colors.success
                    : user.stats.totalBalance < 0
                    ? theme.colors.error
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      user.stats.totalBalance > 0
                        ? theme.colors.success
                        : user.stats.totalBalance < 0
                        ? theme.colors.error
                        : theme.colors.textPrimary,
                  },
                ]}
              >
                ₹{Math.abs(user.stats.totalBalance)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {user.stats.totalBalance > 0 ? 'Owed' : user.stats.totalBalance < 0 ? 'Owe' : 'Balance'}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Profile Information */}
        {isEditing && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.form}
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.inputPlaceholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Bio
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={theme.colors.inputPlaceholder}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Date of Birth
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.inputPlaceholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+91 1234567890"
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address..."
                placeholderTextColor={theme.colors.inputPlaceholder}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.8}>
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={[
                  styles.saveButton,
                  loading && { opacity: 0.7 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Password Section */}
        <TouchableOpacity
          style={[
            styles.passwordButton,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPasswordModal(true);
          }}
        >
          <View style={[styles.passwordIconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
            <MaterialIcons name="lock" size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.passwordButtonText, { color: theme.colors.textPrimary }]}>
            Change Password
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
          edges={['top']}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <MaterialIcons name="close" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Change Password
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Current Password *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.colors.inputPlaceholder}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                New Password *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor={theme.colors.inputPlaceholder}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Confirm New Password *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.inputPlaceholder}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={passwordLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={[
                  styles.saveButton,
                  passwordLoading && { opacity: 0.7 },
                ]}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  headerGradient: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nameDisplay: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  emailDisplay: {
    fontSize: 14,
    fontWeight: '500',
  },
  bioDisplay: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
  },
  passwordIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
});
