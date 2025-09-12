import supabase from '../config/supabaseClient.js';


// Public - Get all blogs
export async function getAll(req, res) {
  const { data, error } = await supabase
    .from('scroller')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

// Protected - Create scroll
// Protected - Create scroll
export async function createScroll(req, res) {
  try {
    const { text, link } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const { data, error } = await supabase
      .from('scroller')
      .insert([{ 
        text, 
        link: link ?? null  // if link is undefined, set it to null
      }]);

    if (error) throw error;
    res.status(201).json({ message: 'Scroll created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



// Protected - Update scroll
export async function updateScroll(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // No image handling needed since only text & link are stored
    const { data, error } = await supabase
      .from('blog')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json({ message: 'Blog updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete scroll
export async function deleteScroll(req, res) {
  try {
    const { id } = req.params;

    // Delete directly from blog table
    const { error } = await supabase
      .from('blog')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
