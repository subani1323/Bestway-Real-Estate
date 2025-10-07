const express = require("express");
const router = express.Router();
const {
  CommissionTrustEFT,
  CommissionTrustEFTCounter,
} = require("../models/CommissionTrustEFT");
const Trade = require("../models/Trade");

// POST to reset the EFT counter to 1999 (so next EFT will be 2000)
router.post("/reset-counter", async (req, res) => {
  try {
    await CommissionTrustEFTCounter.findByIdAndUpdate(
      { _id: "commissionTrustEFTCounter" },
      { seq: 1999 },
      { upsert: true }
    );
    res.json({ message: "EFT counter reset to 1999. Next EFT will be 2000." });
  } catch (error) {
    console.error("Error resetting EFT counter:", error);
    res.status(500).json({ message: "Server error while resetting counter" });
  }
});

// POST to migrate existing EFT records and update counter to start from 2000
router.post("/migrate-to-2000", async (req, res) => {
  try {
    // Get all existing Commission Trust EFTs
    const existingEFTs = await CommissionTrustEFT.find().sort({ eftNumber: 1 });

    if (existingEFTs.length === 0) {
      // No existing EFTs, just set counter to 1999
      await CommissionTrustEFTCounter.findByIdAndUpdate(
        { _id: "commissionTrustEFTCounter" },
        { seq: 1999 },
        { upsert: true }
      );
      return res.json({
        message:
          "No existing EFTs found. Counter set to 1999. Next EFT will be 2000.",
        migratedCount: 0,
      });
    }

    // Check if any EFT numbers are below 2000
    const lowEFTs = existingEFTs.filter((eft) => eft.eftNumber < 2000);

    if (lowEFTs.length === 0) {
      // All EFTs are already 2000+, just ensure counter is set correctly
      const maxEFTNumber = Math.max(
        ...existingEFTs.map((eft) => eft.eftNumber)
      );
      await CommissionTrustEFTCounter.findByIdAndUpdate(
        { _id: "commissionTrustEFTCounter" },
        { seq: maxEFTNumber },
        { upsert: true }
      );
      return res.json({
        message: `All EFTs are already 2000+. Counter set to ${maxEFTNumber}. Next EFT will be ${
          maxEFTNumber + 1
        }.`,
        migratedCount: 0,
      });
    }

    // Migrate EFTs starting from 2000
    let newEFTNumber = 2000;
    for (const eft of lowEFTs) {
      // Update the EFT number
      await CommissionTrustEFT.findByIdAndUpdate(eft._id, {
        eftNumber: newEFTNumber,
      });

      // Update any related ledger entries
      const Ledger = require("../models/Ledger");
      await Ledger.updateMany(
        { eftNumber: eft.eftNumber },
        { eftNumber: newEFTNumber }
      );

      newEFTNumber++;
    }

    // Set counter to the last used number
    await CommissionTrustEFTCounter.findByIdAndUpdate(
      { _id: "commissionTrustEFTCounter" },
      { seq: newEFTNumber - 1 },
      { upsert: true }
    );

    res.json({
      message: `Successfully migrated ${
        lowEFTs.length
      } EFT records to start from 2000. Counter set to ${
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

// POST to create a new Commission Trust EFT for Agent Commission Transfer
router.post("/agent-commission", async (req, res) => {
  try {
    const { tradeId, amount, recipient, agentId, agentName, chequeDate } =
      req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 1999 (so next will be 2000)
    await CommissionTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await CommissionTrustEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new CommissionTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "AgentCommissionTransfer",
      agentId: agentId,
      agentName: agentName,
      description: "Agent Commission Payment",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    await newEFT.save();

    // Link EFT to Trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { commissionTrustEFTs: newEFT._id },
    });

    // --- Add ledger entries for debit and credit ---
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${agentName}`;
    // Debit 21500 Commission Payable
    const debitEntry = new (require("../models/Ledger"))({
      accountNumber: "21500",
      accountName: "Commission Payable",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await debitEntry.save();
    // Credit 10004 Cash - Commission Trust Account
    const creditEntry = new (require("../models/Ledger"))({
      accountNumber: "10004",
      accountName: "CASH - COMMISSION TRUST ACCOUNT",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await creditEntry.save();
    // --- End ledger entries ---

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating Commission Trust EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// POST to create a new Commission Trust EFT for Refund of Deposit
router.post("/refund-deposit", async (req, res) => {
  try {
    const { tradeId, amount, recipient, description, chequeDate } = req.body;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Initialize counter to ensure it starts from 1999 (so next will be 2000)
    await CommissionTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await CommissionTrustEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new CommissionTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "RefundOfDeposit",
      description: description || "Transfer Refund",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    await newEFT.save();

    // Link EFT to Trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { commissionTrustEFTs: newEFT._id },
    });

    // --- Add ledger entries for debit and credit ---
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${recipient}`;
    // Debit 21300 Liability For Trust Funds
    const debitEntry = new (require("../models/Ledger"))({
      accountNumber: "21300",
      accountName: "Liability For Trust Funds",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await debitEntry.save();
    // Credit 10002 Cash - Trust
    const creditEntry = new (require("../models/Ledger"))({
      accountNumber: "10002",
      accountName: "CASH - TRUST",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await creditEntry.save();
    // --- End ledger entries ---

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating Commission Trust EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// POST to create a new Commission Trust EFT for Outside Broker Commission
router.post("/outside-broker", async (req, res) => {
  try {
    console.log("Outside broker EFT request received:", req.body);
    const { tradeId, amount, recipient, description, chequeDate } = req.body;

    if (!tradeId) {
      console.log("Trade ID missing");
      return res.status(400).json({ message: "Trade ID is required" });
    }

    console.log("Looking for trade with ID:", tradeId);
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      console.log("Trade not found");
      return res.status(404).json({ message: "Trade not found" });
    }

    console.log("Trade found, getting next EFT number");
    // Initialize counter to ensure it starts from 1999 (so next will be 2000)
    await CommissionTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await CommissionTrustEFTCounter.getNextEFTNumber();
    console.log("Next EFT number:", nextEFTNumber);

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    console.log("Creating new EFT record");
    const newEFT = new CommissionTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "OutsideBrokerCommission",
      description: description || "Transfer commission to outside broker",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    console.log("Saving EFT record");
    await newEFT.save();
    console.log("EFT record saved successfully");

    // Link EFT to Trade
    console.log("Linking EFT to trade");
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { commissionTrustEFTs: newEFT._id },
    });

    // --- Add ledger entries for debit and credit ---
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${recipient}`;
    // Debit 21100 A/P - Other Brokers & Referrals
    const debitEntry = new (require("../models/Ledger"))({
      accountNumber: "21100",
      accountName: "A/P - Other Brokers & Referrals",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await debitEntry.save();
    // Credit 10004 Cash - Commission Trust Account
    const creditEntry = new (require("../models/Ledger"))({
      accountNumber: "10004",
      accountName: "CASH - COMMISSION TRUST ACCOUNT",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await creditEntry.save();
    // --- End ledger entries ---

    console.log("Sending success response");
    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating Commission Trust EFT record:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error while creating EFT record",
      error: error.message,
    });
  }
});

// POST to create a new Commission Trust EFT for Our Brokerage Commission
router.post("/our-brokerage", async (req, res) => {
  try {
    const { tradeId, amount, recipient, description, chequeDate } = req.body;
    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required" });
    }
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }
    // Initialize counter to ensure it starts from 1999 (so next will be 2000)
    await CommissionTrustEFTCounter.initializeCounter();
    const nextEFTNumber = await CommissionTrustEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new CommissionTrustEFT({
      eftNumber: nextEFTNumber,
      tradeId: tradeId,
      amount: amount,
      recipient: recipient,
      type: "OurBrokerageCommission",
      description: description || "Transfer Office Share",
      date: new Date(),
      chequeDate: parsedChequeDate,
    });
    await newEFT.save();
    // Link EFT to Trade
    await Trade.findByIdAndUpdate(tradeId, {
      $push: { commissionTrustEFTs: newEFT._id },
    });
    // --- Add ledger entries for debit and credit ---
    const ledgerDescription = `Trade #: ${trade.tradeNumber}, Paid to: ${recipient}`;
    // Debit 10001 Cash - Current Account
    const debitEntry = new (require("../models/Ledger"))({
      accountNumber: "10001",
      accountName: "CASH - CURRENT ACCOUNT",
      debit: amount,
      credit: 0,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await debitEntry.save();
    // Credit 10004 Cash - Commission Trust Account
    const creditEntry = new (require("../models/Ledger"))({
      accountNumber: "10004",
      accountName: "CASH - COMMISSION TRUST ACCOUNT",
      debit: 0,
      credit: amount,
      description: ledgerDescription,
      eftNumber: nextEFTNumber,
      chequeDate: parsedChequeDate,
    });
    await creditEntry.save();
    // --- End ledger entries ---
    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating Our Brokerage Commission EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// GET all Commission Trust EFTs
router.get("/", async (req, res) => {
  try {
    const efts = await CommissionTrustEFT.find().populate("tradeId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching Commission Trust EFTs:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// GET EFTs by trade ID
router.get("/trade/:tradeId", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const efts = await CommissionTrustEFT.find({ tradeId }).populate("tradeId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching EFTs for trade:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// GET EFTs by agent ID
router.get("/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const efts = await CommissionTrustEFT.find({ agentId }).populate("tradeId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching EFTs for agent:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
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

// Check if EFT already exists for a trade and type
router.get("/check-existing/:tradeId/:type", async (req, res) => {
  try {
    const { tradeId, type } = req.params;

    const existingEFT = await CommissionTrustEFT.findOne({
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

module.exports = router;
