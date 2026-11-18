import * as React from "react";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/incidents";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    location: "",
    priority: "Medium"
  });

  // Get emergency reports from backend
  async function fetchIncidents() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load incidents");
      }

      const data = await response.json();
      setIncidents(data);
      setError("");
    } catch (err) {
      setError("Cannot connect to backend. Check your server.");
    } finally {
      setLoading(false);
    }
  }

  // Load incidents when page opens
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Handle form input
  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  // Submit a new emergency report
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Report failed");
      }

      setMessage("Emergency reported successfully!");

      setForm({
        title: "",
        location: "",
        priority: "Medium"
      });

      await fetchIncidents();

    } catch (err) {
      setMessage(err.message);
    }
  }

  const activeCount = incidents.filter(
    (incident) => incident.status === "Active"
  ).length;

  return (
    <div className="app">

      <header className="navbar">
        <h2>SAHAYA <span>AI</span></h2>
        <p>Intelligent Disaster Response Platform</p>
      </header>

      <main className="container">

        <section className="welcome">
          <h1>Emergency Response Dashboard</h1>
          <p>
            Smart coordination. Faster response.
            Safer communities.
          </p>
        </section>

        {error && <p role="alert">{error}</p>}

        <section className="stats">

          <div className="stat-card">
            <h3>Total Incidents</h3>
            <h1>{incidents.length}</h1>
            <p>Reported incidents</p>
          </div>

          <div className="stat-card">
            <h3>Active Emergencies</h3>
            <h1>{activeCount}</h1>
            <p>Requiring attention</p>
          </div>

        </section>

        <section className="report-section">
          <h2>Report an Emergency</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="title"
              placeholder="Emergency type (Flood, Fire, Accident...)"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Enter emergency location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <button type="submit">
              Submit Emergency Report
            </button>

          </form>

          {message && <p role="status">{message}</p>}
        </section>

        <section className="incidents-section">
          <h2>Recent Emergency Reports</h2>

          {loading ? (
            <p>Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p>No emergency reports available.</p>
          ) : (
            incidents.map((incident) => (
              <div className="incident" key={incident.id}>

                <div>
                  <h3>{incident.title}</h3>
                  <p>Location: {incident.location}</p>
                  <p>Status: {incident.status}</p>
                </div>

                <span className="priority">
                  {incident.priority} Priority
                </span>

              </div>
            ))
          )}

        </section>

      </main>

      <footer>
        <p>SAHAYA AI © 2026 | Smart Disaster Response</p>
      </footer>

    </div>
  );
}

export default App;
