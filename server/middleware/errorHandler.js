module.exports = function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ error: "Email already exists" });
  }

  res.status(500).json({ error: err.message || "Server Error" });
};

