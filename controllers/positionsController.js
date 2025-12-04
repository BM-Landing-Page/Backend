import supabase from '../config/supabaseClient.js';

// 🔹 Public - Get all positions (for dropdown)
export async function getPositions(req, res) {
  try {
    const { data, error } = await supabase
      .from('positions')
      .select('id, name, description')
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Create a new position
export async function createPosition(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    const { data, error } = await supabase
      .from('positions')
      .insert([{ name, description }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "Position created", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Update a position
export async function updatePosition(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json({ message: "Position updated", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Delete a position
export async function deletePosition(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: "Position deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
