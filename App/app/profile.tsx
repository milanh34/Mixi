import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useImagePicker } from '../hooks/useImagePicker';
import { MotiView } from 'moti';
import { Timestamp } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile, loading } = useAuthStore();
  const { theme } = useThemeStore();
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
      Alert.alert('Error', 'Name is required');
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
          updates.dateOfBirth = Timestamp.fromDate(new Date(dateOfBirth));
        } catch (error) {
          Alert.alert('Error', 'Invalid date format');
          return;
        }
      }

      await updateUserProfile(updates);
      setIsEditing(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
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
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
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
      Alert.alert('Success', 'Password updated successfully!');
    } catch (error: any) {
      setPasswordLoading(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  if (!user || !user.stats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
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
        >
          <MaterialIcons
            name={isEditing ? 'close' : 'edit'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

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
              <View
                style={[
                  styles.photoPlaceholder,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <MaterialIcons
                  name="person"
                  size={64}
                  color={theme.colors.textSecondary}
                />
              </View>
            )}
            {isEditing && !uploading && (
              <View
                style={[
                  styles.photoOverlay,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
              </View>
            )}
            {uploading && (
              <View style={styles.photoOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {!isEditing && (
            <>
              <Text style={[styles.nameDisplay, { color: theme.colors.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.emailDisplay, { color: theme.colors.textSecondary }]}>
                {user.email}
              </Text>
            </>
          )}
        </MotiView>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <MaterialIcons name="group" size={32} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
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
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <MaterialIcons name="receipt" size={32} color={theme.colors.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
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
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
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
                      : theme.colors.text,
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

        {/* Profile Information */}
        {isEditing && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Bio
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Date of Birth
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+91 1234567890"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Password Section */}
        <TouchableOpacity
          style={[
            styles.passwordButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPasswordModal(true);
          }}
        >
          <MaterialIcons name="lock" size={24} color={theme.colors.text} />
          <Text style={[styles.passwordButtonText, { color: theme.colors.text }]}>
            Change Password
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
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
              <MaterialIcons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Change Password
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Current Password *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                New Password *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Confirm New Password *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    backgroundColor: '#4285F4',
  },
  nameDisplay: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  emailDisplay: {
    fontSize: 14,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
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
