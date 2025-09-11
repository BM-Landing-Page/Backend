import supabase from '../config/supabaseClient.js';
import { uploadImage, deleteImage } from '../utils/storage.js';

// Get the popup (public route)
export async function getPopup(req, res) {
  try {
    const { data, error } = await supabase
      .from('popup')
      .select('*')
      .single();

    if (error) {
      // If no record exists, return null instead of error
      if (error.code === 'PGRST116') {
        return res.status(200).json(null);
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create/Update popup (only one record allowed)
export async function createPopup(req, res) {
  try {
    // First, get existing record to clean up old image
    const { data: existingPopup } = await supabase
      .from('popup')
      .select('*')
      .single();

    // Delete existing record if it exists
    if (existingPopup) {
      // Delete old image if exists
      if (existingPopup.image) {
        await deleteImage(existingPopup.image);
      }
      
      // Delete the record
      await supabase
        .from('popup')
        .delete()
        .eq('id', existingPopup.id);
    }

    // Prepare new popup data
    const popupData = {
      url: req.body.url || null
    };

    // Handle image upload
    if (req.file) {
      popupData.image = await uploadImage(req.file);
    }

    // Insert new record
    const { data: popup, error: insertError } = await supabase
      .from('popup')
      .insert(popupData)
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(popup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update popup
export async function updatePopup(req, res) {
  try {
    // Get existing popup
    const { data: existingPopup, error: fetchError } = await supabase
      .from('popup')
      .select('*')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'No popup record found' });
      }
      throw fetchError;
    }

    // Prepare update data
    const updates = {
      url: req.body.url || null
    };

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (existingPopup.image) {
        await deleteImage(existingPopup.image);
      }
      updates.image = await uploadImage(req.file);
    }

    // Update the record
    const { data: updatedPopup, error: updateError } = await supabase
      .from('popup')
      .update(updates)
      .eq('id', existingPopup.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json(updatedPopup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete popup with image cleanup
export async function deletePopup(req, res) {
  try {
    // Get existing popup for image cleanup
    const { data: existingPopup } = await supabase
      .from('popup')
      .select('*')
      .single();

    if (!existingPopup) {
      return res.status(404).json({ error: 'No popup record found' });
    }

    // Delete the record
    const { error } = await supabase
      .from('popup')
      .delete()
      .eq('id', existingPopup.id);

    if (error) throw error;

    // Delete image if exists
    if (existingPopup.image) {
      await deleteImage(existingPopup.image);
    }

    res.status(200).json({ message: 'Popup deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}