// components/profile/EditForm.tsx
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useToast } from '../../utils/toastManager';
import * as Haptics from 'expo-haptics';

interface EditFormProps {
  name: string;
  bio: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  onNameChange: (text: string) => void;
  onBioChange: (text: string) => void;
  onDateOfBirthChange: (text: string) => void;
  onPhoneNumberChange: (text: string) => void;
  onAddressChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function EditForm({
  name,
  bio,
  dateOfBirth,
  phoneNumber,
  address,
  onNameChange,
  onBioChange,
  onDateOfBirthChange,
  onPhoneNumberChange,
  onAddressChange,
  onSave,
  onCancel,
  loading,
}: EditFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useThemeStore();
  const { showToast } = useToast();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      onDateOfBirthChange(selectedDate.toISOString().split('T')[0]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // ✅ FIXED: Proper phone number handling
  const handlePhoneChange = (text: string) => {
    const cleanText = text.replace(/[^0-9+]/g, '');
    
    if (cleanText.length > 13) {
      showToast('Phone number too long (max 13 characters)', 'error');
      return;
    }
    
    onPhoneNumberChange(cleanText);
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <InputField
        icon="person"
        label="Name *"
        value={name}
        onChangeText={onNameChange}
        placeholder="Enter your name"
      />

      <InputField
        icon="description"
        label="Bio"
        value={bio}
        onChangeText={onBioChange}
        placeholder="Tell us about yourself..."
        multiline
        numberOfLines={3}
      />

      <InputField
        icon="cake"
        label="Date of Birth"
        value={dateOfBirth}
        placeholder="Tap to select date"
        editable={false}
        onPress={handleDatePress}
      />

      {/* ✅ FIXED: Phone input now works perfectly */}
      <InputField
        icon="phone"
        label="Phone Number"
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        placeholder="+91 1234567890"
        keyboardType="phone-pad"
      />

      <InputField
        icon="location-on"
        label="Address"
        value={address}
        onChangeText={onAddressChange}
        placeholder="Enter your address..."
        multiline
        numberOfLines={2}
      />

      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* ✅ NEW: Circular buttons on right side */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={onCancel} 
          style={[
            styles.circularButton,
            styles.cancelButton,
            { borderColor: theme.colors.textSecondary }
          ]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onSave} 
          disabled={loading}
          activeOpacity={0.7}
          style={[
            styles.circularButton,
            styles.saveButton,
            loading && styles.disabledButton
          ]}
        >
          <LinearGradient
            colors={[
              loading ? '#9CA3AF' : theme.colors.primary,
              loading ? '#6B7280' : theme.colors.gradientEnd
            ]}
            style={styles.gradientButton}
          >
            <MaterialIcons 
              name={loading ? "hourglass-empty" : "check"} 
              size={24} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface InputFieldProps {
  icon: string;
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: string;
  editable?: boolean;
  onPress?: () => void;
}

function InputField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
  editable = true,
  onPress,
}: InputFieldProps) {
  const { theme } = useThemeStore();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.inputContainer} 
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.labelRow}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
          <MaterialIcons name={icon as any} size={18} color={theme.colors.primary} />
        </View>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
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
        multiline={multiline}
        numberOfLines={numberOfLines || 1}
        keyboardType={keyboardType as any}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={!!onChangeText}
        selectTextOnFocus={true}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputContainer: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingLeft: 48,
    fontSize: 16,
    borderWidth: 1,
    fontWeight: '500',
  },
  textArea: {
    height: 90,
    paddingTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  circularButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
