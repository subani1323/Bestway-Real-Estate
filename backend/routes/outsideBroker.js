const express = require("express");
const router = express.Router();
const OutsideBroker = require("../models/OutsideBroker");

// GET: all outside brokers
router.get("/", async (req, res) => {
  try {
    const brokers = await OutsideBroker.find().sort({ createdAt: -1 });
    res.json(brokers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: single outside broker
router.get("/:id", async (req, res) => {
  try {
    const broker = await OutsideBroker.findById(req.params.id);
    if (!broker) return res.status(404).json({ message: "Outside broker not found" });
    res.json(broker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST: create new outside broker
router.post("/", async (req, res) => {
  try {
    const newBroker = new OutsideBroker(req.body);
    const savedBroker = await newBroker.save();
    res.status(201).json(savedBroker);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PUT: update outside broker
router.put("/:id", async (req, res) => {
  try {
    const updated = await OutsideBroker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Outside broker not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE: remove outside broker
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await OutsideBroker.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Outside broker not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router; 
