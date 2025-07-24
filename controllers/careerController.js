import supabase from '../config/supabaseClient.js';

// ✅ Public - Create new career application
export async function createCareer(req, res) {
  try {
    const {
      first_name,
      last_name,
      gender,
      email,
      phone,
      date_of_birth,
      marital_status,
      languages_known,
      address,
      how_did_you_know_us,
      educational_qualification,
      work_experience,
      area_of_expertise,
      reason_to_associate
    } = req.body;

    if (!first_name || !gender || !email || !date_of_birth || !reason_to_associate) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data, error } = await supabase
      .from('career')
      .insert([{
        first_name,
        last_name,
        gender,
        email,
        phone,
        date_of_birth,
        marital_status,
        languages_known, // expected to be an array
        address,
        how_did_you_know_us,
        educational_qualification,
        work_experience,
        area_of_expertise,
        reason_to_associate
      }]);

    if (error) throw error;

    res.status(201).json({ message: 'Application submitted', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 🔒 Protected - Get all applications
export async function getAllCareers(req, res) {
  const { data, error } = await supabase
    .from('career')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

// 🔒 Protected - Update a career application
export async function updateCareer(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const { data, error } = await supabase
      .from('career')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Application updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 🔒 Protected - Delete a career application
export async function deleteCareer(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('career')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
