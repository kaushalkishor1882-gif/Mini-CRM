const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const auth = require("../middleware/authMiddleware");

// ── All routes require auth ──

// 📊 Dashboard Stats
router.get("/stats/summary", auth, async (req, res, next) => {
  try {
    const total = await Lead.countDocuments();
    const converted = await Lead.countDocuments({ status: "converted" });
    const contacted = await Lead.countDocuments({ status: "contacted" });
    const newLeads = await Lead.countDocuments({ status: "new" });

    // Follow-ups due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const followUpsToday = await Lead.countDocuments({
      followUpDate: { $gte: today, $lt: tomorrow },
    });

    res.json({
      total,
      new: newLeads,
      contacted,
      converted,
      conversionRate: total ? Math.round((converted / total) * 100) : 0,
      followUpsToday,
    });
  } catch (err) {
    next(err);
  }
});

// 📥 Get All Leads (SEARCH + FILTER + PAGINATION)
router.get("/", auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, priority, source } = req.query;

    const query = {};

    if (status && status !== "all") query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ leads, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

// ➕ Create Lead
router.post("/", auth, async (req, res, next) => {
  try {
    const { name, email, source, status, priority, followUpDate, notes } = req.body;

    if (!name || !email || !source) {
      return res.status(400).json({ error: "Name, email, and source are required" });
    }

    const emailRegex = /.+\@.+\..+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const lead = new Lead({
      name,
      email,
      source,
      status: status || "new",
      priority: priority || "low",
      followUpDate: followUpDate || null,
      notes: notes || [],
      createdBy: req.user.id,
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

// ✏️ Update Lead
router.put("/:id", auth, async (req, res, next) => {
  try {
    const { notes, ...rest } = req.body;

    const updateData = { ...rest };

    // If notes is a string (old format), convert to array entry
    if (typeof notes === "string" && notes.trim()) {
      const lead = await Lead.findById(req.params.id);
      if (!lead) return res.status(404).json({ error: "Lead not found" });

      // Replace all notes with single note (simple notes mode)
      updateData.notes = [{ text: notes, date: new Date() }];
    } else if (Array.isArray(notes)) {
      updateData.notes = notes;
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ error: "Lead not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ➕ Add a note to lead
router.post("/:id/notes", auth, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Note text is required" });

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text, date: new Date() } } },
      { new: true }
    );

    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// ❌ Delete Lead
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

