// components/profile/ProfilePhoto.tsx
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { useImagePicker } from '../../hooks/useImagePicker';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../utils/toastManager';
import * as Haptics from 'expo-haptics';

interface ProfilePhotoProps {
  profilePicture: string | undefined;
  isEditing: boolean;
  onPhotoChange: (url: string) => void;
}

export function ProfilePhoto({ profilePicture, isEditing, onPhotoChange }: ProfilePhotoProps) {
  const { theme } = useThemeStore();
  const { showToast } = useToast();
  const { pickImage, uploading } = useImagePicker();

  const handleChangePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const uri = await pickImage();
    if (uri) {
      try {
        showToast('Uploading photo...', 'info');
        const result = await uploadToCloudinary(uri, 'mixi/profiles');
        onPhotoChange(result.secure_url);
        showToast('Profile photo updated!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to upload photo', 'error');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={isEditing ? handleChangePhoto : undefined}
        disabled={!isEditing || uploading}
        activeOpacity={0.7}
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.photo} />
        ) : (
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.photoPlaceholder}
          >
            <MaterialIcons name="person" size={56} color="#FFFFFF" />
          </LinearGradient>
        )}
        {isEditing && !uploading && (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.photoOverlay}
          >
            <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
          </LinearGradient>
        )}
        {uploading && (
          <View style={[styles.photoOverlay, { backgroundColor: theme.colors.primary + '80' }]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    alignItems: 'center',
    marginBottom: 24,
  } as const,
  photoContainer: {
    position: 'relative',
  } as const,
  photo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  } as const,
  photoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
};
