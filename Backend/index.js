// server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
// adjust origin to your frontend origin in production
app.use(cors({ origin: "http://localhost:3000" }));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY in environment");
  process.exit(1);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message string" });
    }

    // Example system prompt to make responses portfolio-specific
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that answers questions about the developer's portfolio. Keep answers concise and friendly."
      },
      { role: "user", content: message }
    ];

    // Call OpenAI Chat Completions
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change to your available model
        messages,
        max_tokens: 400,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return res.status(500).json({ error: "LLM error" });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content ?? "No reply";
    return res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));