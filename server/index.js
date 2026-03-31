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

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text });
  } catch {
    res.json({ text: "" });
  }
});

app.post("/generate", async (req, res) => {
  try {
    const { type, input, role } = req.body;

    let prompt = "";

    if (type === "resume") {
      prompt = `Rewrite this resume professionally in clean paragraph English:\n${input}`;
    } else if (type === "career") {
      prompt = `Suggest best career paths, roadmap and courses for:\n${input}`;
    } else {
      prompt = `Find skill gaps for ${role} based on:\n${input}`;
    }

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: response.choices[0].message.content });

  } catch (err) {
    res.json({ result: "Error occurred" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));