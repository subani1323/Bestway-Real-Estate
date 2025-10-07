const express = require("express");
const router = express.Router();
const { EFTRecord, EFTCounter } = require("../models/EFT");
const Trade = require("../models/Trade");
const Ledger = require("../models/Ledger");

// POST to reset the EFT counter to 3999 (so next EFT will be 4000)
router.post("/reset-counter", async (req, res) => {
  try {
    await EFTCounter.findByIdAndUpdate(
      { _id: "eftCounter" },
      { seq: 3999 },
      { upsert: true }
    );
    res.json({ message: "EFT counter reset to 3999. Next EFT will be 4000." });
  } catch (error) {
    console.error("Error resetting EFT counter:", error);
    res.status(500).json({ message: "Server error while resetting counter" });
  }
});

// POST to migrate existing EFT records and update counter to start from 4000
router.post("/migrate-to-4000", async (req, res) => {
  try {
    // Get all existing Standard EFTs
    const existingEFTs = await EFTRecord.find().sort({ eftNumber: 1 });

    if (existingEFTs.length === 0) {
      // No existing EFTs, just set counter to 3999
      await EFTCounter.findByIdAndUpdate(
        { _id: "eftCounter" },
        { seq: 3999 },
        { upsert: true }
      );
      return res.json({
        message:
          "No existing EFTs found. Counter set to 3999. Next EFT will be 4000.",
        migratedCount: 0,
      });
    }

    // Check if any EFT numbers are below 4000
    const lowEFTs = existingEFTs.filter((eft) => eft.eftNumber < 4000);

    if (lowEFTs.length === 0) {
      // All EFTs are already 4000+, just ensure counter is set correctly
      const maxEFTNumber = Math.max(
        ...existingEFTs.map((eft) => eft.eftNumber)
      );
      await EFTCounter.findByIdAndUpdate(
        { _id: "eftCounter" },
        { seq: maxEFTNumber },
        { upsert: true }
      );
      return res.json({
        message: `All EFTs are already 4000+. Counter set to ${maxEFTNumber}. Next EFT will be ${
          maxEFTNumber + 1
        }.`,
        migratedCount: 0,
      });
    }

    // Migrate EFTs starting from 4000
    let newEFTNumber = 4000;
    for (const eft of lowEFTs) {
      // Update the EFT number
      await EFTRecord.findByIdAndUpdate(eft._id, {
        eftNumber: newEFTNumber,
      });

      // Update any related ledger entries
      await Ledger.updateMany(
        { eftNumber: eft.eftNumber },
        { eftNumber: newEFTNumber }
      );

      newEFTNumber++;
    }

    // Set counter to the last used number
    await EFTCounter.findByIdAndUpdate(
      { _id: "eftCounter" },
      { seq: newEFTNumber - 1 },
      { upsert: true }
    );

    res.json({
      message: `Successfully migrated ${
        lowEFTs.length
      } EFT records to start from 4000. Counter set to ${
        newEFTNumber - 1
      }. Next EFT will be ${newEFTNumber}.`,
      migratedCount: lowEFTs.length,
    });
  } catch (error) {
    console.error("Error migrating EFT records:", error);
    res
      .status(500)
      .json({ message: "Server error while migrating EFT records" });
  }
});

// GET to get the next EFT number without creating a record
router.get("/next-number", async (req, res) => {
  try {
    // Initialize counter to ensure it starts from 3999 (so next will be 4000)
    await EFTCounter.initializeCounter();
    const nextEFTNumber = await EFTCounter.getNextEFTNumber();
    res.status(200).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error getting next EFT number:", error);
    res
      .status(500)
      .json({ message: "Server error while getting next EFT number" });
  }
});

// POST to create a new EFT and get the next number
router.post("/", async (req, res) => {
  try {
    const { tradeId, amount, recipient } = req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 3999 (so next will be 4000)
    await EFTCounter.initializeCounter();
    const nextEFTNumber = await EFTCounter.getNextEFTNumber();

    const newEFT = new EFTRecord({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      date: new Date(),
    });

    await newEFT.save();

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// POST to create EFT transaction
router.post("/eft", async (req, res) => {
  try {
    const { tradeId, amount, recipient } = req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 3999 (so next will be 4000)
    await EFTCounter.initializeCounter();
    const nextEFTNumber = await EFTCounter.getNextEFTNumber();

    const newEFT = new EFTRecord({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      date: new Date(),
    });

    await newEFT.save();

    // Create ledger entries
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${recipient}`;
    // Debit Commission Trust Account (10004)
    const debitEntry = new Ledger({
      accountNumber: "10004",
      accountName: "CASH - COMMISSION TRUST ACCOUNT",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
    });
    await debitEntry.save();
    // Credit Trust Account (10002)
    const creditEntry = new Ledger({
      accountNumber: "10002",
      accountName: "CASH - TRUST",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
    });
    await creditEntry.save();

    res.status(201).json({
      message: "EFT transaction created successfully",
      eftNumber: nextEFTNumber,
      eftRecord: newEFT,
    });
  } catch (error) {
    console.error("Error creating EFT transaction:", error);
    res
      .status(500)
      .json({ message: "Server error while creating EFT transaction" });
  }
});

router.post("/balance-deposit", async (req, res) => {
  console.log("Reached balance-deposit endpoint", req.body);
  // ... rest of your code ...
});

module.exports = router;
