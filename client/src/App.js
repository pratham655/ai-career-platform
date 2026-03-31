import { useState } from "react";

function App() {
  const [tab, setTab] = useState("resume");
  const [input, setInput] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    let finalInput = input;

    // ✅ PDF handling
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const pdfRes = await fetch(
        "https://ai-career-platform-xpan.onrender.com/upload-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const pdfData = await pdfRes.json();
      finalInput = pdfData.text;
    }

    if (!finalInput) {
      alert("Enter text or upload PDF");
      setLoading(false);
      return;
    }

    // add user msg
    setMessages((prev) => [
      ...prev,
      { type: "user", text: finalInput },
    ]);

    const res = await fetch(
      "https://ai-career-platform-xpan.onrender.com/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: tab,
          input: finalInput,
          role,
        }),
      }
    );

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { type: "ai", text: data.result },
    ]);

    setInput("");
    setFile(null);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>🚀 AI Career Chat</h1>

      <div>
        <button onClick={() => setTab("resume")}>Resume</button>
        <button onClick={() => setTab("career")}>Career</button>
        <button onClick={() => setTab("skillgap")}>Skill Gap</button>
      </div>

      <div style={styles.chat}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={msg.type === "user" ? styles.user : styles.ai}
          >
            {msg.text}
          </div>
        ))}

        {loading && <p>Thinking...</p>}
      </div>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <input
        placeholder="Role (optional)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <textarea
        placeholder="Type message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={generate}>Send</button>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "linear-gradient(135deg,#ff6a00,#ee0979)",
    minHeight: "100vh",
    color: "white",
  },
  chat: {
    minHeight: "300px",
    margin: "10px 0",
  },
  user: {
    textAlign: "right",
    margin: "10px",
    background: "#00c6ff",
    padding: "10px",
  },
  ai: {
    textAlign: "left",
    margin: "10px",
    background: "white",
    color: "black",
    padding: "10px",
  },
};

export default App;