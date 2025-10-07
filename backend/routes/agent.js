const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");

// GET: next employee number
router.get("/next-employee-no", async (req, res) => {
  try {
    const agents = await Agent.find({}, { employeeNo: 1 });

    if (agents.length === 0) {
      // If no agents exist, start from 100
      res.json({ nextEmployeeNo: 100 });
    } else {
      // Find the maximum employee number
      const maxNo = agents.reduce(
        (max, a) => (a.employeeNo > max ? a.employeeNo : max),
        0
      );

      // Ensure the next number is at least 100
      const nextNo = Math.max(maxNo + 1, 100);
      res.json({ nextEmployeeNo: nextNo });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: all agents
router.get("/", async (req, res) => {
  try {
    const agents = await Agent.find().sort({ employeeNo: 1 });
    res.json(agents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: single agent by employee number
router.get("/employee/:employeeNo", async (req, res) => {
  try {
    const employeeNo = parseInt(req.params.employeeNo);
    if (isNaN(employeeNo)) {
      return res.status(400).json({ message: "Invalid employee number" });
    }

    const agent = await Agent.findOne({ employeeNo: employeeNo });
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: single agent
router.get("/:id", async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST: create new agent
router.post("/", async (req, res) => {
  try {
    const { employeeNo, firstName, lastName, licenses, feeInfo, ...rest } =
      req.body;

    const newAgent = new Agent({
      employeeNo,
      firstName,
      lastName,
      licenses,
      feeInfo,
      ...rest,
    });

    const savedAgent = await newAgent.save();
    res.status(201).json(savedAgent);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PUT: update agent
router.put("/:id", async (req, res) => {
  try {
    console.log("Received update request for agent:", req.params.id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { employeeNo, firstName, lastName, licenses, feeInfo, ...rest } =
      req.body;

    console.log("Extracted fields:", {
      employeeNo,
      firstName,
      lastName,
      licenses: licenses?.length || 0,
      feeInfo,
      restKeys: Object.keys(rest),
    });

    const updated = await Agent.findByIdAndUpdate(
      req.params.id,
      { employeeNo, firstName, lastName, licenses, feeInfo, ...rest },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Agent not found" });

    console.log("Updated agent:", JSON.stringify(updated.toObject(), null, 2));
    res.json(updated);
  } catch (err) {
    console.error("Error updating agent:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE: remove agent
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Agent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Agent not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
