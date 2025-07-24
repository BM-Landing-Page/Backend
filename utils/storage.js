import supabase from '../config/supabaseClient.js';

export async function uploadImage(file) {
  const filename = `${Date.now()}-${file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600'
    });

  if (error) throw error;
  
  const { data: publicURL } = supabase.storage
    .from('gallery')
    .getPublicUrl(filename);

  return publicURL.publicUrl;
}

export async function deleteImage(url) {
  try {
    // Extract filename from URL
    const path = url.split('/').pop();
    if (!path) throw new Error('Invalid image URL');

    const { error } = await supabase.storage
      .from('gallery')
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
