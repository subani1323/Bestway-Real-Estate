const express = require("express");
const router = express.Router();
const MLSFee = require("../models/MLSFee");

// Get all MLS fees
router.get("/", async (req, res) => {
  try {
    const mlsFees = await MLSFee.find().sort({ createdAt: -1 });
    res.json(mlsFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single MLS fee
router.get("/:id", async (req, res) => {
  try {
    const mlsFee = await MLSFee.findById(req.params.id);
    if (!mlsFee) {
      return res.status(404).json({ message: "MLS fee not found" });
    }
    res.json(mlsFee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new MLS fee
router.post("/", async (req, res) => {
  const mlsFee = new MLSFee({
    fee: req.body.fee,
    selectionOption: req.body.selectionOption,
    mlsFeeTaxApplicable: req.body.mlsFeeTaxApplicable,
    postToAP: req.body.postToAP,
  });

  try {
    const newMLSFee = await mlsFee.save();
    res.status(201).json(newMLSFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an MLS fee
router.put("/:id", async (req, res) => {
  try {
    const mlsFee = await MLSFee.findById(req.params.id);
    if (!mlsFee) {
      return res.status(404).json({ message: "MLS fee not found" });
    }

    mlsFee.fee = req.body.fee;
    mlsFee.selectionOption = req.body.selectionOption;
    mlsFee.mlsFeeTaxApplicable = req.body.mlsFeeTaxApplicable;
    mlsFee.postToAP = req.body.postToAP;

    const updatedMLSFee = await mlsFee.save();
    res.json(updatedMLSFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an MLS fee
router.delete("/:id", async (req, res) => {
  try {
    console.log("Attempting to delete MLS fee with ID:", req.params.id);

    const mlsFee = await MLSFee.findById(req.params.id);
    console.log("Found MLS fee:", mlsFee);

    if (!mlsFee) {
      console.log("MLS fee not found");
      return res.status(404).json({ message: "MLS fee not found" });
    }

    console.log("Deleting MLS fee...");
    const result = await MLSFee.findByIdAndDelete(req.params.id);
    console.log("Delete result:", result);

    res.json({ message: "MLS fee deleted" });
  } catch (error) {
    console.error("Error deleting MLS fee:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
