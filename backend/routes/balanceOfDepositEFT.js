const express = require("express");
const router = express.Router();
const BalanceOfDepositEFT = require("../models/BalanceOfDepositEFT");

// POST route to save Balance of Deposit EFT data
router.post("/", async (req, res) => {
  try {
    const eft = new BalanceOfDepositEFT(req.body);
    await eft.save();
    res.status(201).json({ message: "Balance of Deposit EFT saved", eft });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving Balance of Deposit EFT", error });
  }
});

module.exports = router;
