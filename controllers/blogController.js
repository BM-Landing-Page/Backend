import supabase from '../config/supabaseClient.js';
import { uploadImage, deleteImage } from '../utils/storage.js';

// Public - Get all blogs
export async function getAllBlogs(req, res) {
  const { data, error } = await supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

// Protected - Create blog
export async function createBlog(req, res) {
  try {
    const { title, content, author, feature, grade } = req.body;
    if (!title || !content || !grade || !author || !req.file) {
      return res.status(400).json({ error: 'Title, content, author, grade and thumbnail are required' });
    }

    // Upload thumbnail to Supabase storage
    const thumbnail = await uploadImage(req.file);

    const { data, error } = await supabase
      .from('blog')
      .insert([{ 
        title, 
        content, 
        author, 
        thumbnail,
        feature: feature || false,
        grade
      }]);

    if (error) throw error;
    res.status(201).json({ message: 'Blog created', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected - Update blog
export async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // If new image is uploaded, delete old one first
    if (req.file) {
      const { data: oldBlog } = await supabase
        .from('blog')
        .select('thumbnail')
        .eq('id', id)
        .single();

      if (oldBlog?.thumbnail) {
        await deleteImage(oldBlog.thumbnail);
      }
      updates.thumbnail = await uploadImage(req.file);
    }

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

// Protected - Delete blog
export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    // Get blog data first
    const { data: blog } = await supabase
      .from('blog')
      .select('thumbnail')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('blog')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete thumbnail if exists
    if (blog?.thumbnail) {
      await deleteImage(blog.thumbnail);
    }

    res.status(200).json({ message: 'Blog and thumbnail deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
