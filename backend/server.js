
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Active"
  }
}, {
  timestamps: true
});

// MongoDB Model
const Incident = mongoose.model("Incident", incidentSchema);

// Home API
app.get("/", (req, res) => {
  res.send("SAHAYA AI Backend is Running!");
});

// Get all incidents
app.get("/api/incidents", async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(incidents.map(item => ({
      ...item,
      id: item._id.toString()
    })));

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch incidents"
    });
  }
});

// Report a new incident
app.post("/api/incidents", async (req, res) => {
  try {
    const { title, location, priority } = req.body;

    if (!title || !location || !priority) {
      return res.status(400).json({
        message: "Please provide title, location and priority."
      });
    }

    const newIncident = await Incident.create({
      title,
      location,
      priority,
      status: "Active"
    });

    res.status(201).json({
      message: "Incident reported successfully!",
      incident: {
        ...newIncident.toObject(),
        id: newIncident._id.toString()
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to report incident"
    });
  }
});

// Start server after MongoDB connects
mongoose.connect(process.env.MONGO_URI, {
  dbName: "sahaya_ai"
})
  .then(async () => {
    console.log("MongoDB Connected Successfully!");

    // Add demo incidents only if database is empty
    const count = await Incident.countDocuments();

    if (count === 0) {
      await Incident.insertMany([
        {
          title: "Flood Alert",
          location: "Coastal Area",
          priority: "High",
          status: "Active"
        },
        {
          title: "Medical Emergency",
          location: "City Centre",
          priority: "Medium",
          status: "Active"
        }
      ]);

      console.log("Demo incidents added!");
    }

    app.listen(PORT, () => {
      console.log(
        `SAHAYA AI server running at http://localhost:${PORT}`
      );
    });
  })
  .catch(error => {
    console.error("MongoDB Connection Failed:", error.message);
  });
