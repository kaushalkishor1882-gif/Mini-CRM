const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const leadRoutes = require("./routes/leadRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);

// Error Handler (must be last)
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/crm")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("CRM API is running 🚀");
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));

