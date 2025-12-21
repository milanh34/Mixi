// components/forms/AddEventForm.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useThemeStore } from '../../stores/themeStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useAuthStore } from '../../stores/authStore';
import { useImagePicker } from '../../hooks/useImagePicker';

interface AddEventFormProps {
  visible: boolean;
  groupId: string;
  onClose: () => void;
}

const EVENT_TYPES = [
  { id: 'milestone', label: 'Milestone', icon: 'flag' },
  { id: 'payment', label: 'Payment', icon: 'payment' },
  { id: 'movement', label: 'Location', icon: 'place' },
] as const;

export function AddEventForm({ visible, groupId, onClose }: AddEventFormProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { createEvent, loading } = useTimelineStore();
  const { pickImage, takePhoto, uploading } = useImagePicker();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'milestone' | 'payment' | 'movement'>('milestone');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!user) return;

    try {
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

      Alert.alert('Success', 'Event added to timeline!');
      handleClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddPhoto = async (source: 'gallery' | 'camera') => {
    const uri = source === 'gallery' ? await pickImage() : await takePhoto();
    if (uri) setPhotos([...photos, uri]);
  };

  const handleRemovePhoto = (index: number) => {
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <MaterialIcons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Add Timeline Event
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Title *
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
              placeholder="e.g., Arrived at hotel"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Event Type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Type
            </Text>
            <View style={styles.typeRow}>
              {EVENT_TYPES.map((eventType) => (
                <TouchableOpacity
                  key={eventType.id}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        type === eventType.id
                          ? theme.colors.primary + '20'
                          : theme.colors.surface,
                      borderColor:
                        type === eventType.id
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setType(eventType.id)}
                >
                  <MaterialIcons
                    name={eventType.icon as any}
                    size={24}
                    color={
                      type === eventType.id ? theme.colors.primary : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          type === eventType.id
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {eventType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Description (Optional)
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
              placeholder="Add details..."
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Location */}
          {type === 'movement' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Location
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
                placeholder="e.g., Goa Beach Resort"
                placeholderTextColor={theme.colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          )}

          {/* Photos */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Photos (Optional)
            </Text>
            
            {photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosRow}
              >
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={[
                        styles.removeButton,
                        { backgroundColor: theme.colors.error },
                      ]}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <MaterialIcons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleAddPhoto('gallery')}
                disabled={uploading}
              >
                <MaterialIcons
                  name="photo-library"
                  size={24}
                  color={theme.colors.text}
                />
                <Text style={[styles.photoButtonText, { color: theme.colors.text }]}>
                  Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.photoButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleAddPhoto('camera')}
                disabled={uploading}
              >
                <MaterialIcons
                  name="camera-alt"
                  size={24}
                  color={theme.colors.text}
                />
                <Text style={[styles.photoButtonText, { color: theme.colors.text }]}>
                  Camera
                </Text>
              </TouchableOpacity>
            </View>
            
            {uploading && (
              <Text style={[styles.uploadingText, { color: theme.colors.textSecondary }]}>
                Uploading...
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Adding...' : 'Add Event'}
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
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
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
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
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
