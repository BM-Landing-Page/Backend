import supabase from '../config/supabaseClient.js';
import { uploadImage, deleteImage } from '../utils/storage.js';

// Public: Get all alumni with batch, current university, and accepted universities
export async function getAllAlumni(req, res) {
  try {
    const { data, error } = await supabase
      .from('alumni')
      .select(`
        *,
        batches:batch_id (batch_year, description),
        universities:current_university_id (university_name, country, logo_url),
        alumni_universities (
          universities:university_id (university_name, country, logo_url)
        )
      `);
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public: Get single alumnus by ID
export async function getAlumnusById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('alumni')
      .select(`
        *,
        batches:batch_id (batch_year, description),
        universities:current_university_id (university_name, country, logo_url),
        alumni_universities (
          universities:university_id (university_name, country, logo_url)
        )
      `)
      .eq('alumni_id', id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Alumnus not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Create alumnus
export async function createAlumnus(req, res) {
  try {
    const alumnusData = {
      name: req.body.name,
      testimonial: req.body.testimonial,
      batch_id: req.body.batch_id,
      current_university_id: req.body.current_university_id || null,
    };
    if (req.file) {
      alumnusData.photo_url = await uploadImage(req.file);
    }
    const { data: alumnus, error: alumnusError } = await supabase
      .from('alumni')
      .insert(alumnusData)
      .select()
      .single();
    if (alumnusError) throw alumnusError;
    // Handle accepted universities (many-to-many)
    const acceptedUniversities = req.body.accepted_university_ids;
    if (acceptedUniversities && Array.isArray(acceptedUniversities)) {
      const linkRows = acceptedUniversities.map(university_id => ({
        alumni_id: alumnus.alumni_id,
        university_id
      }));
      if (linkRows.length > 0) {
        await supabase.from('alumni_universities').insert(linkRows);
      }
    }
    // Return created alumnus with relationships
    return getAlumnusById({ params: { id: alumnus.alumni_id } }, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Update alumnus
export async function updateAlumnus(req, res) {
  try {
    const { id } = req.params;
    const updates = {
      name: req.body.name,
      testimonial: req.body.testimonial,
      batch_id: req.body.batch_id,
      current_university_id: req.body.current_university_id || null,
    };
    // Handle photo update
    if (req.file) {
      const { data: oldAlumnus } = await supabase
        .from('alumni')
        .select('photo_url')
        .eq('alumni_id', id)
        .single();
      if (oldAlumnus?.photo_url) {
        await deleteImage(oldAlumnus.photo_url);
      }
      updates.photo_url = await uploadImage(req.file);
    }
    const { error: updateError } = await supabase
      .from('alumni')
      .update(updates)
      .eq('alumni_id', id);
    if (updateError) throw updateError;
    // Update accepted universities (replace all)
    if (req.body.accepted_university_ids && Array.isArray(req.body.accepted_university_ids)) {
      await supabase.from('alumni_universities').delete().eq('alumni_id', id);
      const linkRows = req.body.accepted_university_ids.map(university_id => ({
        alumni_id: id,
        university_id
      }));
      if (linkRows.length > 0) {
        await supabase.from('alumni_universities').insert(linkRows);
      }
    }
    // Return updated alumnus with relationships
    return getAlumnusById({ params: { id } }, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Delete alumnus
export async function deleteAlumnus(req, res) {
  try {
    const { id } = req.params;
    // Get photo for cleanup
    const { data: alumnus } = await supabase
      .from('alumni')
      .select('photo_url')
      .eq('alumni_id', id)
      .single();
    // Delete alumnus (cascade deletes alumni_universities)
    const { error } = await supabase
      .from('alumni')
      .delete()
      .eq('alumni_id', id);
    if (error) throw error;
    // Delete photo if exists
    if (alumnus?.photo_url) {
      await deleteImage(alumnus.photo_url);
    }
    res.status(200).json({ message: 'Alumnus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
