import supabase from '../config/supabaseClient.js';

// Public - Get all scrolls
export async function getAll(req, res) {
  try {
    const { data, error } = await supabase
      .from('scroller')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Create scroll
export async function createScroll(req, res) {
  try {
    const { text, link } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const { data, error } = await supabase
      .from('scroller')
      .insert([
        {
          text,
          link: link && link.trim() !== '' ? link : null, // normalize empty -> null
        },
      ])
      .select();

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
    const { text, link } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const updates = {
      text,
      link: link && link.trim() !== '' ? link : null, // normalize empty -> null
    };

    const { data, error } = await supabase
      .from('scroller')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Scroll not found' });
    }

    res.status(200).json({ message: 'Scroll updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete scroll
export async function deleteScroll(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('scroller')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Scroll deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
