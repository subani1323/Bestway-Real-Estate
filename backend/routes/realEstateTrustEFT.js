const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  RealEstateTrustEFT,
  RealEstateTrustEFTCounter,
} = require("../models/RealEstateTrustEFT");
const Trade = require("../models/Trade");
const Ledger = require("../models/Ledger");

// POST to reset the EFT counter to 999 (so next EFT will be 1000)
router.post("/reset-counter", async (req, res) => {
  try {
    await RealEstateTrustEFTCounter.findByIdAndUpdate(
      { _id: "realEstateTrustEFTCounter" },
      { seq: 999 },
      { upsert: true }
    );
    res.json({ message: "EFT counter reset to 999. Next EFT will be 1000." });
  } catch (error) {
    console.error("Error resetting EFT counter:", error);
    res.status(500).json({ message: "Server error while resetting counter" });
  }
});

// POST to migrate existing EFT records and update counter to start from 1000
router.post("/migrate-to-1000", async (req, res) => {
  try {
    // Get all existing Real Estate Trust EFTs
    const existingEFTs = await RealEstateTrustEFT.find().sort({ eftNumber: 1 });

    if (existingEFTs.length === 0) {
      // No existing EFTs, just set counter to 999
      await RealEstateTrustEFTCounter.findByIdAndUpdate(
        { _id: "realEstateTrustEFTCounter" },
        { seq: 999 },
        { upsert: true }
      );
      return res.json({
        message:
          "No existing EFTs found. Counter set to 999. Next EFT will be 1000.",
        migratedCount: 0,
      });
    }

    // Check if any EFT numbers are below 1000
    const lowEFTs = existingEFTs.filter((eft) => eft.eftNumber < 1000);

    if (lowEFTs.length === 0) {
      // All EFTs are already 1000+, just ensure counter is set correctly
      const maxEFTNumber = Math.max(
        ...existingEFTs.map((eft) => eft.eftNumber)
      );
      await RealEstateTrustEFTCounter.findByIdAndUpdate(
        { _id: "realEstateTrustEFTCounter" },
        { seq: maxEFTNumber },
        { upsert: true }
      );
      return res.json({
        message: `All EFTs are already 1000+. Counter set to ${maxEFTNumber}. Next EFT will be ${
          maxEFTNumber + 1
        }.`,
        migratedCount: 0,
      });
    }

    // Migrate EFTs starting from 1000
    let newEFTNumber = 1000;
    for (const eft of lowEFTs) {
      // Update the EFT number
      await RealEstateTrustEFT.findByIdAndUpdate(eft._id, {
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
    await RealEstateTrustEFTCounter.findByIdAndUpdate(
      { _id: "realEstateTrustEFTCounter" },
      { seq: newEFTNumber - 1 },
      { upsert: true }
    );

    res.json({
      message: `Successfully migrated ${
        lowEFTs.length
      } EFT records to start from 1000. Counter set to ${
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

// POST to create a new Real Estate Trust EFT for Commission Transfer
router.post("/commission-transfer", async (req, res) => {
  try {
    const { tradeId, amount, recipient, chequeDate } = req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 999 (so next will be 1000)
    await RealEstateTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await RealEstateTrustEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new RealEstateTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "CommissionTransfer",
      description: "Transfer funds to Commission Trust",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    await newEFT.save();

    // Link EFT to Trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { realEstateTrustEFTs: newEFT._id },
    });

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating Real Estate Trust EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// POST to create a new Real Estate Trust EFT for Balance of Deposit
router.post("/balance-deposit", async (req, res) => {
  try {
    const { tradeId, amount, recipient, description, chequeDate } = req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 999 (so next will be 1000)
    await RealEstateTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await RealEstateTrustEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new RealEstateTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "BalanceOfDeposit",
      description: description || "Refund of Balance of Deposit",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    await newEFT.save();

    // Link EFT to Trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { realEstateTrustEFTs: newEFT._id },
    });

    // --- Add ledger entries for debit and credit ---
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${recipient}`;
    // Debit 21300 LIABILITY FOR TRUST FUNDS HELD
    const debitEntry = new Ledger({
      accountNumber: "21300",
      accountName: "LIABILITY FOR TRUST FUNDS HELD",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber.toString(),
      chequeDate: parsedChequeDate,
    });
    await debitEntry.save();
    console.log("Saved debit ledger entry for 21300:", debitEntry);
    // Credit 10002 CASH - TRUST
    const creditEntry = new Ledger({
      accountNumber: "10002",
      accountName: "CASH - TRUST",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber.toString(),
      chequeDate: parsedChequeDate,
    });
    await creditEntry.save();
    console.log("Saved credit ledger entry for 10002:", creditEntry);
    // --- End ledger entries ---

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating Real Estate Trust EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// POST to create a new Real Estate Trust EFT for Refund of Deposit
router.post("/refund-deposit", async (req, res) => {
  try {
    const { tradeId, amount, recipient, description, chequeDate } = req.body;

    console.log("Refund deposit request received:", {
      tradeId,
      amount,
      recipient,
      description,
      chequeDate,
    });

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    // Validate that tradeId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ message: "Invalid Trade ID format" });
    }

    if (!recipient || recipient === "N/A" || recipient.trim() === "") {
      return res.status(400).json({
        message:
          "Valid recipient is required. Please provide a recipient name.",
      });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message:
          "Valid amount is required. Please provide an amount greater than 0.",
      });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 999 (so next will be 1000)
    await RealEstateTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await RealEstateTrustEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    console.log("Creating EFT with data:", {
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "RefundOfDeposit",
      description: description || "Refund of Deposit",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    const newEFT = new RealEstateTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "RefundOfDeposit",
      description: description || "Refund of Deposit",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    console.log("Saving EFT to database...");
    await newEFT.save();
    console.log("EFT saved successfully:", newEFT);

    // Link EFT to Trade
    console.log("Linking EFT to Trade...");
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { realEstateTrustEFTs: newEFT._id },
    });
    console.log("EFT linked to Trade successfully");

    // --- Add ledger entries for debit and credit ---
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${recipient}`;
    // Debit 21300 LIABILITY FOR TRUST FUNDS HELD
    const debitEntry = new Ledger({
      accountNumber: "21300",
      accountName: "LIABILITY FOR TRUST FUNDS HELD",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber.toString(),
      chequeDate: parsedChequeDate,
    });
    await debitEntry.save();
    console.log("Saved debit ledger entry for 21300:", debitEntry);
    // Credit 10002 CASH - TRUST
    const creditEntry = new Ledger({
      accountNumber: "10002",
      accountName: "CASH - TRUST",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber.toString(),
      chequeDate: parsedChequeDate,
    });
    await creditEntry.save();
    console.log("Saved credit ledger entry for 10002:", creditEntry);
    // --- End ledger entries ---

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error(
      "Error creating Real Estate Trust EFT record (refund):",
      error
    );
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    console.error("Request body:", req.body);
    res.status(500).json({
      message: "Server error while creating EFT record (refund)",
      error: error.message,
    });
  }
});

// POST to create a new Real Estate Trust EFT for Trust Deposit
router.post("/trust-deposit", async (req, res) => {
  try {
    const { tradeId, amount, receivedFrom, reference, description } = req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 999 (so next will be 1000)
    await RealEstateTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await RealEstateTrustEFTCounter.getNextEFTNumber();

    const newEFT = new RealEstateTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: receivedFrom,
      type: "TrustDeposit",
      description: description || `Trust deposit from ${receivedFrom}`,
      date: new Date(),
    });

    await newEFT.save();

    // Link EFT to Trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { realEstateTrustEFTs: newEFT._id },
    });

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error(
      "Error creating Real Estate Trust EFT record for deposit:",
      error
    );
    res
      .status(500)
      .json({ message: "Server error while creating EFT record for deposit" });
  }
});

// GET all Real Estate Trust EFTs
router.get("/", async (req, res) => {
  try {
    const efts = await RealEstateTrustEFT.find().populate("tradeId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching Real Estate Trust EFTs:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// GET EFTs by trade ID
router.get("/trade/:tradeId", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const efts = await RealEstateTrustEFT.find({ tradeId }).populate("tradeId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching EFTs for trade:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// Check if EFT already exists for a trade and type
router.get("/check-existing/:tradeId/:type", async (req, res) => {
  try {
    const { tradeId, type } = req.params;

    const existingEFT = await RealEstateTrustEFT.findOne({
      tradeId: tradeId,
      type: type,
    });

    if (existingEFT) {
      res.json({
        exists: true,
        eftNumber: existingEFT.eftNumber,
        type: existingEFT.type,
        date: existingEFT.date,
        amount: existingEFT.amount,
        recipient: existingEFT.recipient,
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking existing EFT:", error);
    res
      .status(500)
      .json({ message: "Server error while checking existing EFT" });
  }
});

// GET trade with all related EFTs
router.get("/trade/:tradeId/with-efts", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const trade = await Trade.findById(tradeId)
      .populate("realEstateTrustEFTs")
      .populate("commissionTrustEFTs");
    res.json(trade);
  } catch (error) {
    console.error("Error fetching trade with EFTs:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching trade with EFTs" });
  }
});

module.exports = router;
