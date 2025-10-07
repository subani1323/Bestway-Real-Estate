const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // Import mongoose
const Reminder = require("../models/Reminder");

// GET /api/reminders - Fetch all reminders
router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ date: 1 }); // Sort by date, or as preferred
    res.json(reminders);
  } catch (err) {
    console.error("❌ Failed to fetch reminders:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/reminders
router.post("/", async (req, res) => {
  const { date, reminder } = req.body;

  if (!date || !reminder) {
    return res.status(400).json({ message: "Date and reminder are required." });
  }

  try {
    const newReminder = new Reminder({ date, reminder });
    await newReminder.save();
    res.status(201).json({ message: "Reminder saved successfully." });
  } catch (err) {
    console.error("❌ Failed to save reminder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT /api/reminders/:id - Update a reminder
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { date, reminder } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid reminder ID." });
  }

  if (!date || !reminder) {
    return res
      .status(400)
      .json({ message: "Date and reminder are required for update." });
  }

  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(
      id,
      { date, reminder },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found." });
    }

    res.json({
      message: "Reminder updated successfully.",
      reminder: updatedReminder,
    });
  } catch (err) {
    console.error("❌ Failed to update reminder:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/reminders/testdelete - DIAGNOSTIC ROUTE
router.delete("/testdelete", async (req, res) => {
  // const { id } = req.params; // No ID in this test route

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ message: "Invalid reminder ID for test." });
  // }

  try {
    // const deletedReminder = await Reminder.findByIdAndDelete(id); // Cannot delete without an ID

    // if (!deletedReminder) {
    //   return res.status(404).json({ message: "Reminder not found for test." });
    // }

    res.json({ message: "Test delete route reached successfully." });
  } catch (err) {
    console.error("❌ Error in test delete route:", err);
    res.status(500).json({ message: "Internal Server Error in test delete" });
  }
});

// Original DELETE /api/reminders/:id - Delete a reminder
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid reminder ID." });
  }

  try {
    const deletedReminder = await Reminder.findByIdAndDelete(id);

    if (!deletedReminder) {
      return res.status(404).json({ message: "Reminder not found." });
    }

    res.json({ message: "Reminder deleted successfully." });
  } catch (err) {
    console.error("❌ Failed to delete reminder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
