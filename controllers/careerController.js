import supabase from "../config/supabaseClient.js";
import nodemailer from "nodemailer";

// ----------------- EMAIL TRANSPORTER -----------------

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx", // your Gmail App Password
  },
});

// Verify transporter at startup (optional but useful)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

// ----------------- CONTROLLER FUNCTION -----------------

export async function createCareerApplication(req, res) {
  try {
    console.log("📥 Incoming application:", req.body);

    const { name, email, contact_number, position_id } = req.body;

    // ---------- Validate Required Fields ----------
    if (!name || !email || !position_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ---------- Upload Resume (if exists) ----------
    let resumeUrl = null;

    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const filePath = `careers/${Date.now()}.${fileExt}`;

      console.log("📤 Uploading resume...");

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("applications")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Resume upload error:", uploadError);
        return res.status(500).json({ error: "Resume upload failed" });
      }

      resumeUrl = supabase.storage.from("applications").getPublicUrl(filePath)
        .data.publicUrl;

      console.log("✅ Resume uploaded:", resumeUrl);
    }

    // ---------- Insert Application into Table ----------
    console.log("🗄️ Saving to database...");

    const { data, error: insertError } = await supabase
      .from("career_applications")
      .insert([
        {
          name,
          email,
          contact_number,
          position_id,
          resume: resumeUrl,
        },
      ])
      .select();

    if (insertError) {
      console.error("❌ Database insert error:", insertError);
      return res.status(500).json({ error: "Database insert failed" });
    }

    console.log("✅ DB Insert successful:", data);

    // ---------- Send Email (WAIT for it) ----------
    console.log("📧 Sending email notification...");

    try {
      await transporter.sendMail({
        from: '"Career Portal" <career.applications.bmis@gmail.com>',
        to: "hr@bmischool.com",
        subject: `📩 New Career Application — ${name}`,
        html: `
          <h2>New Career Application</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${contact_number || "N/A"}</p>
          <p><b>Position ID:</b> ${position_id}</p>
          <p><b>Resume:</b> ${
            resumeUrl
              ? `<a href="${resumeUrl}" target="_blank">View Resume</a>`
              : "No resume uploaded"
          }</p>
        `,
      });

      console.log("✅ Email sent successfully");
    } catch (err) {
      console.error("❌ Email failed:", err);
      return res.status(500).json({ error: "Email failed to send" });
    }

    // ---------- Final Response ----------
    return res.status(201).json({
      message: "Application submitted successfully",
      data,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
