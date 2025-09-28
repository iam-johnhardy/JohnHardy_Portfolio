import React, { useState, useRef } from "react";


export default function AssistantChat() {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", text }
  const controllerRef = useRef(null);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // append user message
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsStreaming(true);

    // If an earlier controller exists, abort it
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    // You can use AbortController to cancel fetch if needed
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const url = `/api/stream?message=${encodeURIComponent(trimmed)}`;
      const resp = await fetch(url, { signal: controller.signal });

      if (!resp.ok || !resp.body) {
        throw new Error("Stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      // We'll accumulate assistant text in this variable until we finalize a message
      let assistantText = "";

      // Add an empty assistant message to show streaming UI
      setMessages(prev => [...prev, { role: "assistant", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // The server sends SSE-like chunks separated by double newline `\n\n`
        // Each chunk was encoded server-side with internal newlines escaped as \\n
        const parts = buffer.split("\n\n");
        buffer = parts.pop(); // leftover partial

        for (const part of parts) {
          // Each part may include many lines like `data: <payload>` or `event: done`
          const lines = part.split("\n").map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice("data: ".length);
              // Unescape server's newline escapings
              const unescaped = payload.replace(/\\n/g, "\n");

              // If payload is "[DONE]" then finish
              if (unescaped.trim() === "[DONE]") {
                // finalize
                setIsStreaming(false);
                controllerRef.current = null;
                break;
              }

              // OpenAI streaming typically sends JSON objects per data line.
              // The unescaped content may contain multiple JSON objects or partial JSON.
              // We'll attempt to parse JSON objects found in the string.
              // Simple approach: extract JSON substrings that start with '{' and end with '}'
              // This is basic but works for many cases; for full robustness you need a streaming JSON parser.
              const jsonBlobs = [];
              // try to locate JSON objects: naive scan
              let startIdx = unescaped.indexOf("{");
              while (startIdx !== -1) {
                let braceCount = 0;
                let endIdx = -1;
                for (let i = startIdx; i < unescaped.length; i++) {
                  if (unescaped[i] === "{") braceCount++;
                  if (unescaped[i] === "}") braceCount--;
                  if (braceCount === 0) { endIdx = i; break; }
                }
                if (endIdx === -1) break;
                const blob = unescaped.slice(startIdx, endIdx + 1);
                jsonBlobs.push(blob);
                startIdx = unescaped.indexOf("{", endIdx + 1);
              }

              if (jsonBlobs.length === 0) {
                // If no JSON found, append raw text.
                assistantText += unescaped;
                // update last assistant message progressively
                setMessages(prev => {
                  const copy = [...prev];
                  const idx = copy.length - 1;
                  copy[idx] = { ...copy[idx], text: (copy[idx].text || "") + unescaped };
                  return copy;
                });
              } else {
                // Parse each JSON blob and extract delta content
                for (const blob of jsonBlobs) {
                  try {
                    const parsed = JSON.parse(blob);
                    if (parsed.choices) {
                      for (const ch of parsed.choices) {
                        const delta = ch.delta || ch;
                        const content = (delta && delta.content) || (delta && delta.message && delta.message.content);
                        if (content) {
                          assistantText += content;
                          setMessages(prev => {
                            const copy = [...prev];
                            const idx = copy.length - 1;
                            copy[idx] = { ...copy[idx], text: (copy[idx].text || "") + content };
                            return copy;
                          });
                        }
                      }
                    }
                  } catch (e) {
                    // ignore parse errors for partial JSON
                    console.warn("Partial JSON, skipping:", e);
                  }
                }
              }
            } else if (line.startsWith("event: done")) {
              // server finished
              setIsStreaming(false);
            } else if (line.startsWith("event: error") || line.startsWith("data: {\"error\"")) {
              // show error message
              setMessages(prev => [...prev, { role: "assistant", text: "\n[Stream error]" }]);
              setIsStreaming(false);
              controllerRef.current = null;
              break;
            }
          } // end for lines
        } // end for parts
      } // end read loop

      // Done reading: ensure streaming state reset
      setIsStreaming(false);
      controllerRef.current = null;
    } catch (err) {
      console.error("Streaming error:", err);
      setMessages(prev => [...prev, { role: "assistant", text: "\n[Stream failed]" }]);
      setIsStreaming(false);
      controllerRef.current = null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Portfolio AI Assistant</h2>

      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about the portfolio..."
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring"
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            disabled={isStreaming}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={isStreaming}
          >
            {isStreaming ? "Streaming..." : "Send"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block p-3 rounded-lg ${m.role === "user" ? "bg-gray-200" : "bg-gray-800 text-white"}`}>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}