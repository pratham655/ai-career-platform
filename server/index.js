import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import multer from "multer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ✅ PDF UPLOAD ROUTE
app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF processing failed" });
  }
});

// ✅ MAIN AI ROUTE
app.post("/generate", async (req, res) => {
  try {
    const { type, input, role } = req.body;

    if (!type || !input) {
      return res.status(400).json({
        error: "Type and input required",
      });
    }

    let prompt = "";

    // 🎯 RESUME MODE
    if (type === "resume") {
      prompt = `
You are a professional career coach.

Resume Data:
${input}

Target Role:
${role || "Not specified"}

Instructions:
- Write in clear paragraph form
- Do NOT use symbols like **, *, or markdown
- Keep it human-like and professional

Explain:
- Improved resume
- What improvements were made
- Interview preparation with answers

Courses you should take:
1. Course name - platform
2. Course name - platform
3. Course name - platform
`;
    }

    // 🧠 CAREER MODE
    else if (type === "career") {
      prompt = `
You are a career expert.

User Skills:
${input}

Instructions:
- Write everything in paragraph form
- No symbols or markdown

Explain:
- Best career paths
- Required skills
- Roadmap
- Salary insights in India

Courses you should take:
1. Course name - platform
2. Course name - platform
3. Course name - platform
`;
    }

    // 📊 SKILL GAP MODE
    else if (type === "skillgap") {
      prompt = `
You are a tech mentor.

User Skills:
${input}

Target Role:
${role}

Instructions:
- Write explanation in paragraph form
- No symbols or markdown

Explain:
- Missing skills
- What to learn
- Roadmap

Courses you should take:
1. Course name - platform
2. Course name - platform
3. Course name - platform
`;
    }

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error generating response",
    });
  }
});

// 🚀 START SERVER
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});