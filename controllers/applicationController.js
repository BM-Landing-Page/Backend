import supabase from '../config/supabaseClient.js';

// Public - Create application
export async function createApplication(req, res) {
  try {
    const { 
      first_name, last_name, date_of_birth,
      educational_qualification, institution_name, designation,
      address, email, mobile, reason 
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !date_of_birth || !email || !reason) {
      return res.status(400).json({ 
        error: 'Required fields: first_name, last_name, date_of_birth, email, reason' 
      });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert([{ 
        first_name, last_name, date_of_birth,
        educational_qualification, institution_name, designation,
        address, email, mobile, reason
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Application submitted', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Get all applications
export async function getAllApplications(req, res) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Update application
export async function updateApplication(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.submitted_at; // Prevent modification of submission time

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Application updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete application
export async function deleteApplication(req, res) {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
