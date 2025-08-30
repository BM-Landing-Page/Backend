import supabase from '../config/supabaseClient.js';
import nodemailer from 'nodemailer';

// 📧 setup transporter (using Gmail App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx"
  }
});

// Public API - Send feedback via email only (no database storage)
export async function sendFeedbackEmail(req, res) {
  try {
    const { parent_name, student_name, grade, desc } = req.body;

    if (!parent_name || !student_name || !grade || !desc) {
      return res.status(400).json({ error: 'All fields (parent_name, student_name, grade, desc) are required' });
    }

    // Send email with feedback details
    await transporter.sendMail({
      from: '"Parent Feedback" <career.applications.bmis@gmail.com>',
      to: "bmis@buddingminds.net", // Replace with your feedback email
      subject: `📝 New Parent Feedback - Grade ${grade}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
              📝 New Parent Feedback Received
            </h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #34495e; margin-bottom: 15px;">Feedback Details:</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Parent Name:</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">${parent_name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Student Name:</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">${student_name}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Grade:</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">${grade}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #34495e; margin-bottom: 15px;">Feedback Description:</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                ${desc.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #7f8c8d; font-size: 14px;">
              <p>This feedback was submitted through the school website feedback form.</p>
              <p>Received on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `
    });

    res.status(200).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected API - Create feedback and store in database
export async function createFeedback(req, res) {
  try {
    const { parent_name, student_name, grade, desc } = req.body;

    if (!parent_name || !student_name || !grade || !desc) {
      return res.status(400).json({ error: 'All fields (parent_name, student_name, grade, desc) are required' });
    }

    const { data, error } = await supabase
      .from('parents_voice')
      .insert([{
        parent_name,
        student_name,
        grade: parseInt(grade), // Ensure grade is stored as integer
        desc
      }])
      .select();

    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Feedback created successfully', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Public API - Get all feedback
export async function getAllFeedback(req, res) {
  try {
    const { data, error } = await supabase
      .from('parents_voice')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected API - Update feedback
export async function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { parent_name, student_name, grade, desc } = req.body;

    if (!parent_name || !student_name || !grade || !desc) {
      return res.status(400).json({ error: 'All fields (parent_name, student_name, grade, desc) are required' });
    }

    const { data, error } = await supabase
      .from('parents_voice')
      .update({
        parent_name,
        student_name,
        grade: parseInt(grade),
        desc
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    res.status(200).json({ 
      message: 'Feedback updated successfully', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Protected API - Delete feedback
export async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('parents_voice')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}