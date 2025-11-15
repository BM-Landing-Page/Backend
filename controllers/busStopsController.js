import supabase from '../config/supabaseClient.js';

// Public - Get all bus stops
export async function getAllStops(req, res) {
  try {
    const { data, error } = await supabase
      .from('bus_stops')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public - Get all stops for a specific route
export async function getStopsByRoute(req, res) {
  try {
    const { routeId } = req.params;

    const { data, error } = await supabase
      .from('bus_stops')
      .select('*')
      .eq('route', routeId)
      .order('order', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public - Get single bus stop by ID
export async function getStopById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bus_stops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Bus stop not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Create bus stop
export async function createStop(req, res) {
  try {
    const { name, pickup, drop, order, route } = req.body;

    if (!name || !route) {
      return res.status(400).json({ error: 'Stop name and route ID are required' });
    }

    // Verify route exists
    const { data: routeExists } = await supabase
      .from('bus_routes')
      .select('id')
      .eq('id', route)
      .single();

    if (!routeExists) {
      return res.status(404).json({ error: 'Bus route not found' });
    }

    const { data, error } = await supabase
      .from('bus_stops')
      .insert([{
        name,
        pickup: pickup || null,
        drop: drop || null,
        order: order !== undefined ? parseInt(order) : null,
        route
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Bus stop created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Update bus stop
export async function updateStop(req, res) {
  try {
    const { id } = req.params;
    const { name, pickup, drop, order, route } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (pickup !== undefined) updates.pickup = pickup || null;
    if (drop !== undefined) updates.drop = drop || null;
    if (order !== undefined) updates.order = parseInt(order);
    if (route !== undefined) {
      // Verify route exists
      const { data: routeExists } = await supabase
        .from('bus_routes')
        .select('id')
        .eq('id', route)
        .single();

      if (!routeExists) {
        return res.status(404).json({ error: 'Bus route not found' });
      }
      updates.route = route;
    }

    const { data, error } = await supabase
      .from('bus_stops')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: 'Bus stop not found' });
    }

    res.status(200).json({ message: 'Bus stop updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete bus stop
export async function deleteStop(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('bus_stops')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Bus stop deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
