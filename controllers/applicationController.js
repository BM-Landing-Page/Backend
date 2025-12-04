import supabase from '../config/supabaseClient.js';
import nodemailer from 'nodemailer';

// ----------------- EMAIL TRANSPORTER -----------------
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx", // Gmail App Password
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) console.error("❌ Email transporter error:", error);
  else console.log("✅ Email transporter is ready");
});

// ----------------- CREATE APPLICATION -----------------
export async function createApplication(req, res) {
  try {
    const {
      full_name, date_of_birth, gender, contact_number, email_id,
      address, school_name, designation, preferred_course, reason_to_pursue
    } = req.body;

    // Validate required fields
    if (
      !full_name || !date_of_birth || !gender || !contact_number || !email_id ||
      !address || !school_name || !designation || !preferred_course || !reason_to_pursue
    ) {
      return res.status(400).json({ error: 'All fields except resume are required.' });
    }

    // Handle resume upload
    let resumeUrl = null;
    if (req.file) {
      const file = req.file;
      const ext = file.originalname.split('.').pop();
      const filePath = `gallery/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')          // bucket name
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) return res.status(500).json({ error: 'Resume upload failed' });

      resumeUrl = supabase.storage.from('gallery').getPublicUrl(filePath).data.publicUrl;
    }

    // Insert into database
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        full_name, date_of_birth, gender, contact_number, email_id,
        address, school_name, designation, preferred_course, reason_to_pursue,
        resume_file: resumeUrl
      }])
      .select();

    if (error) throw error;

    // Send email
    const mailOptions = {
      from: '"Budding Minds" <career.applications.bmis@gmail.com>',
      to: 'pdq_cidtl@buddingminds.net',
      subject: 'New Application Submitted',
      html: `
        <h3>New Application Submitted</h3>
        <p><strong>Full Name:</strong> ${full_name}</p>
        <p><strong>Date of Birth:</strong> ${date_of_birth}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Contact Number:</strong> ${contact_number}</p>
        <p><strong>Email ID:</strong> ${email_id}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>School Name:</strong> ${school_name}</p>
        <p><strong>Designation:</strong> ${designation}</p>
        <p><strong>Preferred Course:</strong> ${preferred_course}</p>
        <p><strong>Reason to Pursue:</strong> ${reason_to_pursue}</p>
        <p><strong>Resume:</strong> ${resumeUrl ? `<a href="${resumeUrl}" target="_blank">View Resume</a>` : "No resume uploaded"}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Application submitted and email sent', data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ----------------- GET ALL APPLICATIONS -----------------
export async function getAllApplications(req, res) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ----------------- UPDATE APPLICATION -----------------
export async function updateApplication(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.submitted_at;

    // Ensure all fields are provided
    const requiredFields = [
      'full_name', 'date_of_birth', 'gender', 'contact_number', 'email_id',
      'address', 'school_name', 'designation', 'preferred_course', 'reason_to_pursue'
    ];
    for (const field of requiredFields) {
      if (!updates[field]) return res.status(400).json({ error: `Field '${field}' is required.` });
    }

    // Handle resume update
    if (req.file) {
      const file = req.file;
      const ext = file.originalname.split('.').pop();
      const filePath = `gallery/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });

      if (uploadError) return res.status(500).json({ error: 'Resume upload failed' });

      updates.resume_file = supabase.storage.from('gallery').getPublicUrl(filePath).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Application updated', data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ----------------- DELETE APPLICATION -----------------
export async function deleteApplication(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Application deleted' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
