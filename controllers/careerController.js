import supabase from '../config/supabaseClient.js';
import nodemailer from 'nodemailer';

// 📧 Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx" // replace with your Gmail App Password
  }
});

// 🔹 Public - Create new career application
export async function createCareer(req, res) {
  try {
    const {
      name,
      gender,
      email,
      contact_number,
      date_of_birth,
      marital_status,
      address,
      position_id
    } = req.body;

    if (!name || !gender || !email || !date_of_birth || !position_id) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Upload resume to Supabase Storage if file exists
    let resumeUrl = null;
    if (req.file) {
      const bucketName = 'gallery'; // Using gallery bucket consistently
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`resumes/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);
      
      resumeUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('career')
      .insert([{
        name,
        gender,
        email,
        contact_number,
        date_of_birth,
        marital_status,
        address,
        position_id,
        resume: resumeUrl
      }])
      .select();

    if (error) throw error;

    // Send email notification asynchronously (don't block the response)
    transporter.sendMail({
      from: '"Career Portal" <career.applications.bmis@gmail.com>',
      to: "hr@bmischool.com",
      subject: "📩 New Career Application Received",
      html: `<p>New application received from <b>${name}</b> for position ID <b>${position_id}</b>.</p>
             <p>Email: ${email}<br>Phone: ${contact_number || "N/A"}<br>Resume: ${resumeUrl || "N/A"}</p>`
    }).catch(err => console.error('Email failed:', err));

    res.status(201).json({ message: 'Application submitted successfully', data });
  } catch (err) {
    console.error('Career application error:', err);
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Get all career applications
export async function getAllCareers(req, res) {
  try {
    const { data, error } = await supabase
      .from('career')
      .select('*, positions(name)') // join to get position name
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Get single career application by ID
export async function getCareerById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('career')
      .select('*, positions(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Update a career application
export async function updateCareer(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Upload updated resume if provided
    if (req.file) {
      const bucketName = 'gallery'; // Changed to gallery for consistency
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`resumes/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);
      
      updates.resume = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('career')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Application updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔒 Protected - Delete a career application
export async function deleteCareer(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('career')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}