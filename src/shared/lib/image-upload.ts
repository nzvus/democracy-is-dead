import imageCompression from 'browser-image-compression';
import { createClient } from '@/shared/api/supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (file: File): Promise<string> => {
  const supabase = createClient();

  // 1. Compress Image
  const options = {
    maxSizeMB: 0.5, // Max 500KB
    maxWidthOrHeight: 800, // Resize to max 800px width/height
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // 2. Generate Unique Path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('public-images') // Must match your bucket name
      .upload(filePath, compressedFile);

    if (uploadError) throw uploadError;

    // 4. Get Public URL
    const { data } = supabase.storage
      .from('public-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};