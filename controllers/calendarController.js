import supabase from '../config/supabaseClient.js';

// Public - Get all events
export async function getAllEvents(req, res) {
  try {
    const { data, error } = await supabase
      .from('calendar')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Create event
export async function createEvent(req, res) {
  try {
    const { event_name, content, event_date } = req.body;

    if (!event_name || !event_date) {
      return res.status(400).json({ error: 'Event name and date are required' });
    }

    const { data, error } = await supabase
      .from('calendar')
      .insert([{ event_name, content, event_date }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Event created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Update event
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.created_at;

    const { data, error } = await supabase
      .from('calendar')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Event updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete event
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
