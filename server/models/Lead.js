const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/.+\@.+\..+/, "Invalid email format"],
    },
    source: {
      type: String,
      enum: ["Website", "LinkedIn", "Referral", "Cold Email", "Event", "Social Media", "Other"],
      required: [true, "Source is required"],
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    followUpDate: { type: Date },
    notes: [noteSchema],
    // Track which user created this lead
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);

