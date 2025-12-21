// components/forms/AddEventForm.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useThemeStore } from '../../stores/themeStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../utils/toastManager';
import { useImagePicker } from '../../hooks/useImagePicker';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface AddEventFormProps {
  visible: boolean;
  groupId: string;
  onClose: () => void;
}

const EVENT_TYPES = [
  { id: 'milestone', label: 'Milestone', icon: 'flag', color: '#4CAF50' },
  { id: 'payment', label: 'Payment', icon: 'payment', color: '#2196F3' },
  { id: 'movement', label: 'Location', icon: 'place', color: '#FF9800' },
] as const;

export function AddEventForm({ visible, groupId, onClose }: AddEventFormProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { createEvent, loading } = useTimelineStore();
  const { pickImage, takePhoto, uploading } = useImagePicker();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'milestone' | 'payment' | 'movement'>('milestone');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }

    if (!user) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await createEvent({
        groupId,
        creatorId: user.uid,
        type,
        title: title.trim(),
        description: description.trim(),
        date: Timestamp.now(),
        location: location.trim()
          ? { name: location.trim(), lat: 0, lng: 0 }
          : undefined,
        photos,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Event added to timeline!', 'success');
      handleClose();
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to add event', 'error');
    }
  };

  const handleAddPhoto = async (source: 'gallery' | 'camera') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const uri = source === 'gallery' ? await pickImage() : await takePhoto();
    if (uri) {
      setPhotos([...photos, uri]);
      showToast('Photo added', 'success');
    }
  };

  const handleRemovePhoto = async (index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('milestone');
    setLocation('');
    setPhotos([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.colors.gradientStart + '15', theme.colors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Add Timeline Event
            </Text>
            
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="title" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Title *
                </Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.colors.inputText }]}
                  placeholder="e.g., Arrived at hotel"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>
          </MotiView>

          {/* Event Type */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 100 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="category" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Type
                </Text>
              </View>
              <View style={styles.typeRow}>
                {EVENT_TYPES.map((eventType, index) => (
                  <TouchableOpacity
                    key={eventType.id}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          type === eventType.id
                            ? eventType.color + '20'
                            : theme.colors.cardBackground,
                        borderColor:
                          type === eventType.id
                            ? eventType.color
                            : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setType(eventType.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={eventType.icon as any}
                      size={24}
                      color={type === eventType.id ? eventType.color : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color:
                            type === eventType.id
                              ? eventType.color
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {eventType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </MotiView>

          {/* Description */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 200 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="description" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Description (Optional)
                </Text>
              </View>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                placeholder="Add details..."
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </MotiView>

          {/* Location (Only for movement type) */}
          {type === 'movement' && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 400 }}
            >
              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="place" size={18} color={theme.colors.warning} />
                  <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                    Location
                  </Text>
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialIcons name="location-on" size={20} color={theme.colors.textMuted} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.inputText }]}
                    placeholder="e.g., Goa Beach Resort"
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>
            </MotiView>
          )}

          {/* Photos */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 300 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="photo-library" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Photos (Optional)
                </Text>
              </View>
              
              {photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photosRow}
                >
                  {photos.map((photo, index) => (
                    <MotiView
                      key={index}
                      from={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring' }}
                      style={styles.photoContainer}
                    >
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          { backgroundColor: theme.colors.error },
                        ]}
                        onPress={() => handleRemovePhoto(index)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                </ScrollView>
              )}

              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={[
                    styles.photoButton,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleAddPhoto('gallery')}
                  disabled={uploading}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
                    style={styles.photoIconContainer}
                  >
                    <MaterialIcons name="photo-library" size={24} color={theme.colors.primary} />
                  </LinearGradient>
                  <Text style={[styles.photoButtonText, { color: theme.colors.textPrimary }]}>
                    Gallery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.photoButton,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleAddPhoto('camera')}
                  disabled={uploading}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[theme.colors.secondary + '20', theme.colors.accent + '20']}
                    style={styles.photoIconContainer}
                  >
                    <MaterialIcons name="camera-alt" size={24} color={theme.colors.secondary} />
                  </LinearGradient>
                  <Text style={[styles.photoButtonText, { color: theme.colors.textPrimary }]}>
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>
              
              {uploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.uploadingText, { color: theme.colors.textSecondary }]}>
                    Uploading photo...
                  </Text>
                </View>
              )}
            </View>
          </MotiView>
        </ScrollView>

        {/* Submit Button with Gradient */}
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || uploading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={[styles.submitButton, (loading || uploading) && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>Add Event</Text>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
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
    paddingTop: 8,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  photosRow: {
    gap: 12,
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    gap: 12,
  },
  photoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
