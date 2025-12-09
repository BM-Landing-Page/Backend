import supabase from "../config/supabaseClient.js"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.applications.bmis@gmail.com",
    pass: "thcg yacr tchy rdzx", // Gmail App Password
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error)
  } else {
    console.log("✅ Email transporter is ready")
  }
})

export async function createCareerApplication(req, res) {
  console.log("🔥 BODY RECEIVED:", req.body)
  console.log("📄 FILE RECEIVED:", req.file)

  try {
    const { name, email, contact_number, position_id, gender, date_of_birth, marital_status, address } = req.body

    if (!name || !email || !position_id || !gender || !date_of_birth || !address) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    let resumeUrl = null
    if (req.file) {
      const file = req.file
      const fileExt = file.originalname.split(".").pop()
      const filePath = `careers/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file.buffer, { contentType: file.mimetype })

      if (uploadError) {
        console.error("❌ Resume upload failed:", uploadError)
        return res.status(500).json({ error: "Resume upload failed" })
      }

      const { data: publicData, error: publicError } =
        supabase.storage.from("gallery").getPublicUrl(filePath)

      if (publicError || !publicData) {
        console.error("❌ Failed to get public URL:", publicError)
        return res.status(500).json({ error: "Failed to get resume URL" })
      }

      resumeUrl = publicData.publicUrl
    }

    const { data, error: insertError } = await supabase
      .from("career")
      .insert([
        {
          name,
          email,
          contact_number,
          position_id,
          gender,
          date_of_birth,
          marital_status: marital_status || null,
          address,
          resume: resumeUrl,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()

    if (insertError) {
      console.error("❌ Database insert failed:", insertError)
      return res.status(500).json({ error: insertError.message })
    }

    await transporter.sendMail({
      from: '"Career Portal" <career.applications.bmis@gmail.com>',
      to: "mail2sanjanya@gmail.com",
      subject: `📩 New Career Application — ${name}`,
      html: `
        <h2>New Career Application</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${contact_number || "N/A"}</p>
        <p><b>Gender:</b> ${gender}</p>
        <p><b>Date of Birth:</b> ${date_of_birth}</p>
        <p><b>Marital Status:</b> ${marital_status || "N/A"}</p>
        <p><b>Address:</b> ${address}</p>
        <p><b>Position ID:</b> ${position_id}</p>
        <p><b>Resume:</b> ${
          resumeUrl ? `<a href="${resumeUrl}" target="_blank">View Resume</a>` : "No resume uploaded"
        }</p>
      `,
    })

    return res.status(201).json({ message: "Application submitted successfully", data })
  } catch (err) {
    console.error("❌ Server error:", err)
    return res.status(500).json({ error: err.message })
  }
}

export async function getAllCareerApplications(req, res) {
  try {
    const { data, error } = await supabase
      .from("career")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getCareerApplicationById(req, res) {
  try {
    const { id } = req.params

    const { data, error } = await supabase.from("career").select("*").eq("id", id).single()

    if (error || !data) return res.status(404).json({ error: "Application not found" })

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function updateCareerApplication(req, res) {
  console.log("🔥 BODY RECEIVED (UPDATE):", req.body)
  console.log("📄 FILE RECEIVED (UPDATE):", req.file)

  try {
    const { id } = req.params
    const updates = { ...req.body }

    if (req.file) {
      const file = req.file
      const fileExt = file.originalname.split(".").pop()
      const filePath = `careers/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        })

      if (uploadError) return res.status(500).json({ error: "Resume upload failed" })

      const { data: publicData, error: publicError } =
        supabase.storage.from("gallery").getPublicUrl(filePath)

      if (publicError || !publicData) return res.status(500).json({ error: "Failed to get resume URL" })

      updates.resume = publicData.publicUrl
    }

    const { data, error } = await supabase
      .from("career")
      .update(updates)
      .eq("id", id)
      .select()

    if (error) return res.status(500).json({ error: error.message })

    res.status(200).json({ message: "Application updated", data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function deleteCareerApplication(req, res) {
  try {
    const { id } = req.params

    const { error } = await supabase.from("career").delete().eq("id", id)

    if (error) return res.status(500).json({ error: error.message })

    res.status(200).json({ message: "Application deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
