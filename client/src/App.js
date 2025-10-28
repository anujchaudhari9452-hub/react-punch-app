import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [manualTime, setManualTime] = useState("");
  const [localTime, setLocalTime] = useState(new Date());
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    fetchPunches();
    return () => clearInterval(timer);
  }, []);

  const fetchPunches = async () => {
    try {
      const res = await fetch("/api/punches");
      const data = await res.json();
      setPunches(data);
    } catch (err) {
      console.error("Failed to fetch punches", err);
    }
  };

  const handlePunch = async () => {
    const timeToSave =
      manualTime.trim() !== "" ? manualTime : localTime.toLocaleString();

    setLoading(true);
    try {
      const res = await fetch("/api/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: timeToSave }),
      });

      if (res.ok) {
        setManualTime("");
        fetchPunches();
      } else {
        alert("Failed to save punch");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving punch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>⏰ Punch In App</h2>
      <p>
        <strong>Local Time:</strong> {localTime.toLocaleString()}
      </p>
      <input
        type="text"
        placeholder="Enter time manually (optional)"
        value={manualTime}
        onChange={(e) => setManualTime(e.target.value)}
      />
      <br />
      <button
        onClick={handlePunch}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Saving..." : "Punch In"}
      </button>

      <h3 style={{ marginTop: "30px" }}>Recent Punches</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {punches.length === 0 && <p>No punches yet.</p>}
        {punches.map((p, i) => (
          <li
            key={i}
            style={{
              margin: "5px 0",
              background: "#f8f9fa",
              padding: "8px",
              borderRadius: "5px",
              width: "300px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {p.time}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
