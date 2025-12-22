// lib/cloudinary.ts
import Constants from 'expo-constants';

const CLOUDINARY_CLOUD_NAME = 
  Constants.expoConfig?.extra?.cloudinaryCloudName || 
  process.env.CLOUDINARY_CLOUD_NAME || '';
  
const CLOUDINARY_UPLOAD_PRESET = 
  Constants.expoConfig?.extra?.cloudinaryUploadPreset || 
  process.env.CLOUDINARY_UPLOAD_PRESET || '';
  
const CLOUDINARY_API_KEY = 
  Constants.expoConfig?.extra?.cloudinaryApiKey || 
  process.env.CLOUDINARY_API_KEY || '';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export const uploadToCloudinary = async (
  imageUri: string,
  folder: string = 'mixi'
): Promise<CloudinaryUploadResult> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing. Check .env file.');
  }

  try {
    const formData = new FormData();
    
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    formData.append('file', {
      uri: imageUri,
      type: blob.type || 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    } as any);
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    if (CLOUDINARY_API_KEY) {
      formData.append('api_key', CLOUDINARY_API_KEY);
    }

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await uploadResponse.json();
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    console.warn('Cloudinary deletion requires server-side implementation with API secret');
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
