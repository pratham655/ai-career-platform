import { useState } from "react";

function App() {
  const [tab, setTab] = useState("resume");
  const [input, setInput] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setInput("");
    setRole("");
    setMessages([]);
    setFile(null);
  };

  const generate = async () => {
    setLoading(true);

    try {
      let finalInput = input;

      // ✅ PDF upload handling
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const pdfRes = await fetch("http://127.0.0.1:5000/upload-pdf", {
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

      setMessages((prev) => [
        ...prev,
        { type: "user", text: finalInput },
      ]);

      const res = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: tab,
          input: finalInput,
          role,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { type: "ai", text: data.result },
      ]);

      setInput("");
      setFile(null);

    } catch (err) {
      console.error(err);
      alert("Error");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 AI Career Chat</h1>

      <div style={styles.tabs}>
        <button onClick={() => handleTabChange("resume")}>Resume</button>
        <button onClick={() => handleTabChange("career")}>Career</button>
        <button onClick={() => handleTabChange("skillgap")}>Skill Gap</button>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={msg.type === "user" ? styles.user : styles.ai}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p>⏳ Thinking...</p>}
      </div>

      <div style={styles.inputArea}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <textarea
          placeholder="Type or upload PDF..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={generate}>Send 🚀</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #ff6a00, #ee0979)",
    color: "white",
  },
  title: { textAlign: "center", padding: "10px" },
  tabs: { textAlign: "center" },
  chatBox: { flex: 1, overflowY: "auto", padding: "20px" },
  user: {
    alignSelf: "flex-end",
    background: "#00c6ff",
    color: "black",
    padding: "10px",
    margin: "10px",
    borderRadius: "10px",
  },
  ai: {
    alignSelf: "flex-start",
    background: "#fff",
    color: "black",
    padding: "10px",
    margin: "10px",
    borderRadius: "10px",
  },
  inputArea: {
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default App;