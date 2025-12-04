import supabase from '../config/supabaseClient.js';

// Public - Get all accomplishments
export async function getAll(req, res) {
  const { data, error } = await supabase
    .from('accomplishments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

// Public - Create a new achievement
export async function createAchievement(req, res) {
  try {
    const { name, grade, tagline, title, desc, category } = req.body;

    if (!name || !tagline || !title || !desc) {
      return res.status(400).json({ error: 'Name, tagline, title and desc are required' });
    }

    const { data, error } = await supabase
      .from('accomplishments')
      .insert([{
        name,
        grade: grade?.trim() ? grade : null,
        tagline,
        title,
        desc,
        category: category?.trim() ? category : null   // 👈 New field added
      }]);

    if (error) throw error;

    res.status(201).json({ message: 'Achievement created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Update achievement
export async function updateAchievement(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };   // automatically includes 'category'

    const { data, error } = await supabase
      .from('accomplishments')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json({ message: 'Achievement updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete achievement
export async function deleteAchievement(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('accomplishments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Achievement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
