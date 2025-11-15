import supabase from '../config/supabaseClient.js';

// Public - Get all bus routes
export async function getAllRoutes(req, res) {
  try {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public - Get single bus route by ID with its stops
export async function getRouteById(req, res) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('bus_routes')
      .select(`
        *,
        bus_stops (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Bus route not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Create bus route
export async function createRoute(req, res) {
  try {
    const { route_name, bus_number, active } = req.body;

    if (!route_name || !bus_number) {
      return res.status(400).json({ error: 'Route name and bus number are required' });
    }

    const { data, error } = await supabase
      .from('bus_routes')
      .insert([{
        route_name,
        bus_number,
        active: active !== undefined ? active : true
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Bus route created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Update bus route
export async function updateRoute(req, res) {
  try {
    const { id } = req.params;
    const { route_name, bus_number, active } = req.body;

    const updates = {};
    if (route_name !== undefined) updates.route_name = route_name;
    if (bus_number !== undefined) updates.bus_number = bus_number;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabase
      .from('bus_routes')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Bus route not found' });
    }

    res.status(200).json({ message: 'Bus route updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Delete bus route and its associated stops
export async function deleteRoute(req, res) {
  try {
    const { id } = req.params;

    // Delete associated bus stops first (cascade)
    const { error: stopsError } = await supabase
      .from('bus_stops')
      .delete()
      .eq('route', id);

    if (stopsError) throw stopsError;

    // Delete the route
    const { error: routeError } = await supabase
      .from('bus_routes')
      .delete()
      .eq('id', id);

    if (routeError) throw routeError;

    res.status(200).json({ message: 'Bus route and associated stops deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
