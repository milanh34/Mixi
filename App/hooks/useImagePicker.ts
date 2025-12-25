// hooks/useImagePicker.ts
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../utils/toastManager';
import { uploadToCloudinary } from '../lib/cloudinary';

export const useImagePicker = () => {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Please allow access to your photos', 'warning');
      return false;
    }
    return true;
  };

  const pickImage = async (): Promise<string | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return null;

      setUploading(true);
      const cloudinaryResult = await uploadToCloudinary(
        result.assets[0].uri,
        'mixi'
      );
      setUploading(false);

      return cloudinaryResult.secure_url;
    } catch (error) {
      console.error('Image picker error:', error);
      setUploading(false);
      showToast('Failed to upload image', 'error');
      return null;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('Please allow access to your camera', 'warning');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return null;

      setUploading(true);
      const cloudinaryResult = await uploadToCloudinary(
        result.assets[0].uri,
        'mixi'
      );
      setUploading(false);

      return cloudinaryResult.secure_url;
    } catch (error) {
      console.error('Camera error:', error);
      setUploading(false);
      showToast('Failed to upload photo', 'error');
      return null;
    }
  };

  return { pickImage, takePhoto, uploading };
};
