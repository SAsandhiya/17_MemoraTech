import { useState } from "react";

function DecisionForm() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [reply, setReply] = useState("");

  const ask = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, context })
      });

      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      alert("Backend not running");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* LEFT SIDE */}
        <div style={styles.left}>
          <h1 style={styles.brand}>Decision AI 🧠</h1>
          <p style={styles.tagline}>
            Humans forget <b>why</b> they decided.  
            AI remembers.
          </p>

          <p style={styles.desc}>
            This system stores your past decisions, the situation behind them,
            and helps you make <b>better future choices</b> by comparing context.
          </p>

          <ul style={styles.list}>
            <li>✔ Store decisions</li>
            <li>✔ Recall past context</li>
            <li>✔ Smarter suggestions</li>
          </ul>

          <img
            src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72"
            alt="ai"
            style={styles.image}
          />
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.right}>
          <h2 style={styles.formTitle}>Ask Your Decision</h2>

          <input
            style={styles.input}
            placeholder="What decision are you thinking about?"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          />

          <textarea
            style={styles.textarea}
            placeholder="Describe your current situation / context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />

          <button style={styles.button} onClick={ask}>
            Get Suggestion 🚀
          </button>

          {reply && (
            <div style={styles.replyBox}>
              <h3>💡 AI Suggestion</h3>
              <pre style={styles.reply}>{reply}</pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Segoe UI, sans-serif"
  },
  container: {
    width: "90%",
    maxWidth: "1100px",
    background: "#fff",
    borderRadius: "20px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
  },
  left: {
    width: "45%",
    padding: "35px",
    background: "linear-gradient(160deg, #fdfbfb, #ebedee)"
  },
  right: {
    width: "55%",
    padding: "35px"
  },
  brand: {
    fontSize: "32px",
    marginBottom: "10px"
  },
  tagline: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#333"
  },
  desc: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "15px"
  },
  list: {
    fontSize: "14px",
    marginBottom: "20px"
  },
  image: {
    width: "100%",
    borderRadius: "12px",
    marginTop: "10px"
  },
  formTitle: {
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer"
  },
  replyBox: {
    marginTop: "20px",
    background: "#f5f7ff",
    padding: "15px",
    borderRadius: "10px"
  },
  reply: {
    whiteSpace: "pre-wrap",
    fontSize: "14px"
  }
};

export default DecisionForm;
