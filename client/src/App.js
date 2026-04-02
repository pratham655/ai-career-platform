import { useState } from "react";

function App() {
  const [tab, setTab] = useState("resume");
  const [input, setInput] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = "https://ai-career-platform-xpan.onrender.com";

  const generate = async () => {
    setLoading(true);

    let finalInput = input;

    // PDF handling
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const pdfRes = await fetch(`${API}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const pdfData = await pdfRes.json();
      finalInput = pdfData.text;
    }

    if (!finalInput) {
      alert("Enter text or upload PDF");
      setLoading(false);
      return;
    }

    setMessages((prev) => [...prev, { type: "user", text: finalInput }]);

    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: tab, input: finalInput, role }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { type: "ai", text: data.result }]);

    setInput("");
    setFile(null);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>🚀 AI Career Chat</div>

      <div style={styles.tabs}>
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

      <div style={styles.inputArea}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <input
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={generate} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
    color: "white",
  },

  header: {
    textAlign: "center",
    padding: "15px",
    fontSize: "22px",
    fontWeight: "bold",
    borderBottom: "1px solid #333",
  },

  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
  },

  chat: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  user: {
    alignSelf: "flex-end",
    background: "#2563eb",
    padding: "12px",
    borderRadius: "12px",
    margin: "10px",
    maxWidth: "60%",
  },

  ai: {
    alignSelf: "flex-start",
    background: "#1e293b",
    padding: "12px",
    borderRadius: "12px",
    margin: "10px",
    maxWidth: "60%",
  },

  inputArea: {
    padding: "10px",
    borderTop: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  input: {
    padding: "8px",
    borderRadius: "6px",
  },

  textarea: {
    padding: "10px",
    borderRadius: "6px",
  },

  button: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default App;