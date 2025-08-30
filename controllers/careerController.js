import supabase from '../config/supabaseClient.js';
import nodemailer from 'nodemailer';

// 📧 setup transporter (using Gmail App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx" // <-- replace with Gmail App Password
  }
});

// ✅ Public - Create new career application
export async function createCareer(req, res) {
  try {
    const {
      first_name,
      last_name,
      gender,
      email,
      phone,
      date_of_birth,
      marital_status,
      languages_known,
      address,
      how_did_you_know_us,
      educational_qualification,
      work_experience,
      area_of_expertise,
      reason_to_associate
    } = req.body;

    if (!first_name || !gender || !email || !date_of_birth || !reason_to_associate) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data, error } = await supabase
      .from('career')
      .insert([{
        first_name,
        last_name,
        gender,
        email,
        phone,
        date_of_birth,
        marital_status,
        languages_known, // expected to be an array
        address,
        how_did_you_know_us,
        educational_qualification,
        work_experience,
        area_of_expertise,
        reason_to_associate
      }]);

    if (error) throw error;

    // 📧 Send email with application details
    await transporter.sendMail({
      from: '"Career Portal" <website_bmis@gmail.com>',
      to: "hr@bmischool.com", // <-- replace with HR/recruiter email
      subject: "📩 New Career Application Received",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        
        <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 8px;">
          📋 New Career Application
        </h2>
        
        <p style="font-size: 14px; color: #555;">
          A new candidate has submitted an application. Details are as follows:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Name:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${first_name} ${last_name || ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Email:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Phone:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Gender:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${gender}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Date of Birth:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${date_of_birth}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Marital Status:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${marital_status || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Languages Known:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${(languages_known || []).join(", ")}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Address:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${address || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>How did you know us?</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${how_did_you_know_us || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Educational Qualification:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${educational_qualification || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Work Experience:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${work_experience || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Area of Expertise:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${area_of_expertise || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Reason to Associate:</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${reason_to_associate}</td>
          </tr>
        </table>

        <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
          📧 This is an automated notification from the Career Portal.
        </p>
      </div>
    </div>
      `
    });

    res.status(201).json({ message: 'Application submitted & email sent', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 🔒 Protected - Get all applications
export async function getAllCareers(req, res) {
  const { data, error } = await supabase
    .from('career')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

// 🔒 Protected - Update a career application
export async function updateCareer(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const { data, error } = await supabase
      .from('career')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'Application updated', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
