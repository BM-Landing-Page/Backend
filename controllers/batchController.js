import supabase from '../config/supabaseClient.js';

export async function getAllBatches(req, res) {
  const { data, error } = await supabase.from('batches').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function createBatch(req, res) {
  const { name, year } = req.body;
  if (!name || !year) return res.status(400).json({ error: 'Name and year required' });
  const { data, error } = await supabase.from('batches').insert([{ name, year }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
}

export async function updateBatch(req, res) {
  const { id } = req.params;
  const { name, year } = req.body;
  const { data, error } = await supabase.from('batches').update({ name, year }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
}

export async function deleteBatch(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from('batches').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}
