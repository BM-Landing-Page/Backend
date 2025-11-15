import supabase from '../config/supabaseClient.js';

// Public: Get all alumni-university links
export async function getAlumniUniversities(req, res) {
  try {
    const { data, error } = await supabase
      .from('alumni_universities')
      .select('*, alumni:alumni_id (name), university:university_id (university_name, country, logo_url)');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Add alumni-university link
export async function addAlumniUniversity(req, res) {
  try {
    const { alumni_id, university_id } = req.body;
    if (!alumni_id || !university_id) {
      return res.status(400).json({ error: 'alumni_id and university_id required' });
    }
    const { data, error } = await supabase
      .from('alumni_universities')
      .insert({ alumni_id, university_id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected: Delete alumni-university link
export async function deleteAlumniUniversity(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('alumni_universities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
