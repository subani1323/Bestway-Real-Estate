const express = require("express");
const router = express.Router();
const CommissionTransferEFT = require("../models/CommissionTransferEFT");

// POST route to save Commission Transfer EFT data
router.post("/", async (req, res) => {
  try {
    const eft = new CommissionTransferEFT(req.body);
    await eft.save();
    res.status(201).json({ message: "Commission Transfer EFT saved", eft });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving Commission Transfer EFT", error });
  }
});

module.exports = router;
