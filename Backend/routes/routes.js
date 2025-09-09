// server/index.js (add below other routes)
import { PassThrough } from "stream";

app.get("/api/stream", async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) return res.status(400).send("Missing ?message=...");

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // Build messages
    const messages = [
      { role: "system", content: "You are a helpful assistant about the dev's portfolio." },
      { role: "user", content: message }
    ];

    // Call OpenAI with streaming enabled
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 400,
        temperature: 0.3,
        stream: true
      })
    });

    if (!openaiRes.ok || !openaiRes.body) {
      const text = await openaiRes.text();
      console.error("OpenAI stream error:", openaiRes.status, text);
      res.write(`event: error\ndata: ${JSON.stringify({ error: "LLM stream error" })}\n\n`);
      return res.end();
    }

    const reader = openaiRes.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    // Read chunks and forward them as SSE 'message' events
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value);
        // OpenAI streams lines like: "data: {...}\n\n"
        // Forward raw chunk to client (client will parse partials)
        // Escape newlines in SSE data payloads if necessary
        const payload = chunk.replace(/\n/g, "\\n");
        res.write(`data: ${payload}\n\n`);
      }
    }

    // End the SSE stream
    res.write("event: done\ndata: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Stream endpoint error:", err);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "Server stream error" })}\n\n`);
      res.end();
    } catch (e) {
      // ignore
    }
  }
});