import supabase from '../config/supabaseClient.js';
import { uploadImage, deleteImage } from '../utils/storage.js';

// Get all members with their achievements
export async function getAllMembers(req, res) {
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        achievements (
          id,
          description,
          created_at
        )
      `)
      .order('name');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get single member by ID with their achievements
export async function getMemberById(req, res) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        achievements (
          id,
          description,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create member
export async function createMember(req, res) {
  try {
    // Extract member data from request
    const memberData = {
      name: req.body.name,
      description: req.body.description,
      role: req.body.role,
      years_experience: parseInt(req.body.years_experience) || 0,
      education_background: req.body.education_background,
      joined_month: parseInt(req.body.joined_month) || 1,
      joined_year: parseInt(req.body.joined_year) || new Date().getFullYear(),
      linkedin_url: req.body.linkedin_url
    };

    // Handle image upload
    if (req.file) {
      memberData.image_url = await uploadImage(req.file);
    }

    // Insert member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single();

    if (memberError) throw memberError;

    // Handle achievements
    const achievements = req.body.achievements;
    if (achievements) {
      const achievementArray = Array.isArray(achievements) ? achievements : [achievements];
      if (achievementArray.length > 0) {
        const achievementRows = achievementArray
          .filter(text => text?.trim())
          .map(text => ({
            member_id: member.id,
            description: text.trim()
          }));

        if (achievementRows.length > 0) {
          await supabase.from('achievements').insert(achievementRows);
        }
      }
    }

    // Return created member with achievements
    const { data: result, error: fetchError } = await supabase
      .from('members')
      .select(`
        *,
        achievements (
          id,
          description,
          created_at
        )
      `)
      .eq('id', member.id)
      .single();

    if (fetchError) throw fetchError;
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update member with image handling
export async function updateMember(req, res) {
  try {
    const { id } = req.params;
    
    // Prepare update data
    const updates = {
      name: req.body.name,
      description: req.body.description,
      role: req.body.role,
      years_experience: parseInt(req.body.years_experience) || 0,
      education_background: req.body.education_background,
      joined_month: parseInt(req.body.joined_month) || 1,
      joined_year: parseInt(req.body.joined_year) || new Date().getFullYear(),
      linkedin_url: req.body.linkedin_url
    };

    // Handle image update
    if (req.file) {
      const { data: oldMember } = await supabase
        .from('members')
        .select('image_url')
        .eq('id', id)
        .single();

      if (oldMember?.image_url) {
        await deleteImage(oldMember.image_url);
      }
      updates.image_url = await uploadImage(req.file);
    }

    // Update member
    const { error: updateError } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id);

    if (updateError) throw updateError;

    // Update achievements
    const achievements = req.body.achievements;
    if (achievements) {
      // Delete existing achievements
      await supabase
        .from('achievements')
        .delete()
        .eq('member_id', id);

      // Add new achievements
      const achievementArray = Array.isArray(achievements) ? achievements : [achievements];
      if (achievementArray.length > 0) {
        const achievementRows = achievementArray
          .filter(text => text?.trim())
          .map(text => ({
            member_id: id,
            description: text.trim()
          }));

        if (achievementRows.length > 0) {
          await supabase.from('achievements').insert(achievementRows);
        }
      }
    }

    // Return updated member with achievements
    const { data: result, error: fetchError } = await supabase
      .from('members')
      .select(`
        *,
        achievements (
          id,
          description,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete member with image cleanup
export async function deleteMember(req, res) {
  try {
    const { id } = req.params;

    // Get member data for image cleanup
    const { data: member } = await supabase
      .from('members')
      .select('image_url')
      .eq('id', id)
      .single();

    // Delete member (achievements will be deleted via cascade)
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete image if exists
    if (member?.image_url) {
      await deleteImage(member.image_url);
    }

    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}