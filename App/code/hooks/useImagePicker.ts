// hooks/useImagePicker.ts
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { uploadToCloudinary } from '../lib/cloudinary';

export const useImagePicker = () => {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos');
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
        aspect: [4, 3],
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
      Alert.alert('Error', 'Failed to upload image');
      return null;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
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
      Alert.alert('Error', 'Failed to upload photo');
      return null;
    }
  };

  return { pickImage, takePhoto, uploading };
};
