import supabase from "../config/supabaseClient.js";
import nodemailer from "nodemailer";

// ----------------- EMAIL TRANSPORTER -----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx", // Gmail App Password
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

// ----------------- CREATE -----------------
export async function createCareerApplication(req, res) {
  try {
    const { name, email, contact_number, position_id } = req.body;

    if (!name || !email || !position_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload resume if provided
    let resumeUrl = null;
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const filePath = `careers/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("applications")
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      if (uploadError) return res.status(500).json({ error: "Resume upload failed" });

      resumeUrl = supabase.storage.from("applications").getPublicUrl(filePath).data.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("career_applications")
      .insert([{ name, email, contact_number, position_id, resume: resumeUrl }])
      .select();

    if (insertError) return res.status(500).json({ error: "Database insert failed" });

    // Send email notification
    await transporter.sendMail({
      from: '"Career Portal" <career.applications.bmis@gmail.com>',
      to: "mail2sanjanya@gmail.com",
      subject: `📩 New Career Application — ${name}`,
      html: `
        <h2>New Career Application</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${contact_number || "N/A"}</p>
        <p><b>Position ID:</b> ${position_id}</p>
        <p><b>Resume:</b>${resumeUrl ? `<a href="${resumeUrl}" target="_blank">View Resume</a>` : " No resume uploaded"}</p>
      `
    });

    return res.status(201).json({ message: "Application submitted successfully", data });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ----------------- GET ALL -----------------
export async function getAllCareerApplications(req, res) {
  try {
    const { data, error } = await supabase
      .from("career_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: "Failed to fetch applications" });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------- GET BY ID -----------------
export async function getCareerApplicationById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("career_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Application not found" });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------- UPDATE -----------------
export async function updateCareerApplication(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Upload new resume if provided
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const filePath = `careers/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("applications")
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

      if (uploadError) return res.status(500).json({ error: "Resume upload failed" });

      updates.resume = supabase.storage.from("applications").getPublicUrl(filePath).data.publicUrl;
    }

    const { data, error } = await supabase
      .from("career_applications")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: "Failed to update application" });

    res.status(200).json({ message: "Application updated", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------- DELETE -----------------
export async function deleteCareerApplication(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("career_applications")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: "Failed to delete application" });

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
