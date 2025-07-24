import supabase from '../config/supabaseClient.js';
import { uploadImage, deleteImage } from '../utils/storage.js';

// Public API – No auth needed
export async function getAllData(req, res) {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

// Protected – Create entry
export async function createData(req, res) {
  try {
    const { description, year } = req.body;
    if (!description || !year || !req.file) {
      return res.status(400).json({ error: 'Description, year and image are required' });
    }

    // Upload image to Supabase storage
    const image_url = await uploadImage(req.file);

    // Create gallery entry with image URL
    const { data, error } = await supabase
      .from('gallery')
      .insert([{ description, year, image_url }]);

    if (error) throw error;
    res.status(201).json({ message: 'Gallery item added', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected – Update entry
export async function updateData(req, res) {
  const { id } = req.params;
  const { description, year, image_url } = req.body;

  const updates = {};
  if (description !== undefined) updates.description = description;
  if (year !== undefined) updates.year = year;
  if (image_url !== undefined) updates.image_url = image_url;

  const { data, error } = await supabase
    .from('gallery')
    .update(updates)
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Gallery item updated', data });
}

// Protected – Delete entry
export async function deleteData(req, res) {
  try {
    const { id } = req.params;

    // First get the image URL
    const { data: item, error: fetchError } = await supabase
      .from('gallery')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from database
    const { error: deleteError } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete image from storage if exists
    if (item?.image_url) {
      await deleteImage(item.image_url);
    }

    res.status(200).json({ message: 'Gallery item and image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
