
// import React, { useState, useRef, useEffect } from "react";
// // import ClientImage from "./ClientImage";

// const Client = () => {
//     //  if (event.key === "Enter") {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([
//     { role: "assistant", content: "Hi — ask me about my projects or skills!" }
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // auto-scroll to bottom when chat updates
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat]);

//   const sendMessage = async () => {
//     if (!message.trim() || loading) return;

//     setError(null);
//     const userMsg = { role: "user", content: message.trim() };

//     // optimistically update chat using functional update to avoid stale state
//     setChat(prev => [...prev, userMsg]);
//     setMessage("");
//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: userMsg.content })
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Server error: ${res.status} ${text}`);
//       }

//       const data = await res.json();
//       // adapt to your backend response shape. expecting { reply: "..." }
//       const aiReply = data.reply ?? data.choices?.[0]?.message?.content ?? "No response";

//       const aiMsg = { role: "assistant", content: aiReply };
//       setChat(prev => [...prev, aiMsg]);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to get a response. Try again.");
//       setChat(prev => [...prev, { role: "assistant", content: "Sorry — something went wrong." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <div className="max-w-[600px] mx-auto p-5" style={{
//         backgroundImage: `url(${chatbot})`
//         }}>
        
//       <h2 className="text-xl font-semibold mb-3">AI Assistant on My Portfolio</h2>

//       <div className="border border-blue-500/50 p-3 h-64 overflow-auto rounded">
//         {chat.map((msg, i) => (
//           <p
//             key={i}
//             className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
//           >
//             <b>{msg.role === "user" ? "You" : "AI"}: </b>
//             <span>{msg.content}</span>
//           </p>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {error && <div className="text-red-500 mt-2">{error}</div>}

//       <div className="mt-3 flex gap-2">
//         <textarea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Ask me about my skills/projects..."
//           className="flex-1 p-3 border rounded resize-none"
//           rows={2}
//           disabled={loading}
//         />

//         <button
//           onClick={sendMessage}
//           disabled={loading}
//           className="py-2 px-4 bg-blue-500 text-white rounded disabled:opacity-50"
//         >
//           {loading ? "Sending..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Client;