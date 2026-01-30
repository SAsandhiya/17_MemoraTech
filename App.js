import { useState } from "react";
import DecisionForm from "./DecisionForm";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (email && password) {
      setLoggedIn(true);
    } else {
      alert("Enter email & password");
    }
  };

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={{ marginBottom: "10px" }}>Decision AI 🧠</h1>
          <p style={{ marginBottom: "20px", color: "#555" }}>
            Login to access your decision memory
          </p>

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.loginBtn} onClick={login}>
            Login →
          </button>
        </div>
      </div>
    );
  }

  return <DecisionForm />;
}

const styles = {
  loginPage: {
    height: "100vh",
    background: "linear-gradient(120deg, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif"
  },
  loginCard: {
    width: "350px",
    background: "#fff",
    padding: "35px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default App;
