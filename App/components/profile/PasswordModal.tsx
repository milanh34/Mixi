// components/profile/PasswordModal.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { useToast } from '../../utils/toastManager';

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onPasswordChange: (current: string, newPass: string) => Promise<void>;
}

export function PasswordModal({ visible, onClose, onPasswordChange }: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useThemeStore();
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      showToast('Please enter current password', 'error');
      return;
    }

    if (!newPassword.trim()) {
      showToast('Please enter new password', 'error');
      return;
    }

    if (!confirmPassword.trim()) {
      showToast('Please confirm new password', 'error');
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

    setLoading(true);
    try {
      await onPasswordChange(currentPassword, newPassword);
      showToast('Password updated successfully!', 'success');
      onClose();
    } catch (error: any) {
      let errorMsg = 'Failed to update password';
      
      if (error.code === 'auth/wrong-password') {
        errorMsg = 'Current password is incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Try again later';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak';
      }
      
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      statusBarTranslucent={true} // ✅ Key fix: Allows toast to appear above modal
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            Change Password
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
            toggleSecure={() => setShowCurrent(!showCurrent)}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            toggleSecure={() => setShowNew(!showNew)}
            placeholder="Enter new password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            toggleSecure={() => setShowConfirm(!showConfirm)}
            placeholder="Confirm new password"
          />

          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={loading}
            style={[
              styles.saveButton,
              loading && styles.disabledButton,
              { 
                backgroundColor: theme.colors.primary,
              }
            ]}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  toggleSecure: () => void;
  placeholder: string;
}

function PasswordInput({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  toggleSecure, 
  placeholder 
}: PasswordInputProps) {
  const { theme } = useThemeStore();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View style={styles.passwordInputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.inputText,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleSecure} style={styles.eyeButton} activeOpacity={0.7}>
          <MaterialIcons 
            name={secureTextEntry ? 'visibility-off' : 'visibility'} 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
