import imageCompression from 'browser-image-compression';
import { createClient } from '@/shared/api/supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (file: File): Promise<string> => {
  const supabase = createClient();

  // iOS Camera photos can be huge (10MB+). Aggressive compression is needed.
  const options = {
    maxSizeMB: 0.3, // Reduced to 300KB for speed/stability
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: "image/jpeg" // Force JPEG conversion to handle HEIC better
  };

  let fileToUpload = file;

  try {
    // Attempt compression
    fileToUpload = await imageCompression(file, options);
  } catch (error) {
    console.warn("Image compression failed, attempting raw upload...", error);
    // Fallback: If compression fails (common on some iOS versions), try uploading original
    // Check size first to avoid 494 or timeout
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image too large (>5MB) and compression failed.");
    }
    fileToUpload = file;
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public-images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('public-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};