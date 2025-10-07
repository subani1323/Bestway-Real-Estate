const express = require("express");
const router = express.Router();
const Lawyer = require("../models/Lawyer");

// GET: all lawyers
router.get("/", async (req, res) => {
  try {
    const lawyers = await Lawyer.find().sort({ createdAt: -1 });
    res.json(lawyers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: single lawyer
router.get("/:id", async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });
    res.json(lawyer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST: create new lawyer
router.post("/", async (req, res) => {
  try {
    const newLawyer = new Lawyer(req.body);
    const savedLawyer = await newLawyer.save();
    res.status(201).json(savedLawyer);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PUT: update lawyer
router.put("/:id", async (req, res) => {
  try {
    const updated = await Lawyer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Lawyer not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE: remove lawyer
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Lawyer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Lawyer not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
