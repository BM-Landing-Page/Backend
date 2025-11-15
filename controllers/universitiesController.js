import supabase from '../config/supabaseClient.js';
import { uploadImage, deleteImage } from '../utils/storage.js';

// Public: Get all universities
export async function getAllUniversities(req, res) {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public: Get university name and number of students offered
export async function getUniversityOfferCounts(req, res) {
  try {
    const { data, error } = await supabase
      .from('alumni_universities')
      .select('university_id');
    if (error) throw error;

    // Count offers per university_id
    const counts = {};
    data.forEach(row => {
      counts[row.university_id] = (counts[row.university_id] || 0) + 1;
    });

    // Get university names
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('university_id, university_name');
    if (uniError) throw uniError;

    // Map university_id to name and count
    const result = universities.map(u => ({
      university_name: u.university_name,
      count: counts[u.university_id] || 0
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public: Get single university by ID
export async function getUniversityById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('university_id', id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'University not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Create university
export async function createUniversity(req, res) {
  try {
    const universityData = {
      university_name: req.body.university_name,
      country: req.body.country
    };
    if (req.file) {
      universityData.logo_url = await uploadImage(req.file);
    }
    const { data, error } = await supabase
      .from('universities')
      .insert(universityData)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Update university
export async function updateUniversity(req, res) {
  try {
    const { id } = req.params;
    const updates = {
      university_name: req.body.university_name,
      country: req.body.country
    };
    // Handle logo update
    if (req.file) {
      const { data: oldUniversity } = await supabase
        .from('universities')
        .select('logo_url')
        .eq('university_id', id)
        .single();
      if (oldUniversity?.logo_url) {
        await deleteImage(oldUniversity.logo_url);
      }
      updates.logo_url = await uploadImage(req.file);
    }
    const { error } = await supabase
      .from('universities')
      .update(updates)
      .eq('university_id', id);
    if (error) throw error;
    // Return updated university
    return getUniversityById({ params: { id } }, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Delete university
export async function deleteUniversity(req, res) {
  try {
    const { id } = req.params;
    // Get logo for cleanup
    const { data: university } = await supabase
      .from('universities')
      .select('logo_url')
      .eq('university_id', id)
      .single();
    // Delete university
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('university_id', id);
    if (error) throw error;
    // Delete logo if exists
    if (university?.logo_url) {
      await deleteImage(university.logo_url);
    }
    res.status(200).json({ message: 'University deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
