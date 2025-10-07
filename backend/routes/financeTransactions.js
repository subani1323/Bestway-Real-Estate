const express = require("express");
const router = express.Router();
const FinanceTransaction = require("../models/FinanceTransaction");

// Create a new finance transaction
router.post("/", async (req, res) => {
  try {
    console.log("Received finance transaction data:", req.body);
    const newTransaction = new FinanceTransaction(req.body);
    console.log("Created transaction object:", newTransaction);
    const savedTransaction = await newTransaction.save();
    console.log("Saved transaction:", savedTransaction);
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error creating finance transaction:", error);
    console.error("Error details:", error.message);
    console.error("Validation errors:", error.errors);
    res.status(500).json({
      message: "Server error while creating finance transaction",
      error: error.message,
    });
  }
});

// Get all finance transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await FinanceTransaction.find().sort({
      createdAt: -1,
    });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching finance transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
