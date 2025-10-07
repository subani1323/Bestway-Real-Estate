const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");

// ✅ Get next available trade number (filling missing gaps)
router.get("/next-number", async (req, res) => {
  try {
    const trades = await Trade.find({}, "tradeNumber").sort({ tradeNumber: 1 });

    if (trades.length === 0) {
      // If no trades exist, start from 200
      return res.json({ nextNumber: 200 });
    }

    // Find the maximum trade number
    const maxNo = trades.reduce(
      (max, t) => (t.tradeNumber > max ? t.tradeNumber : max),
      0
    );

    // Ensure the next number is at least 200
    const nextNumber = Math.max(maxNo + 1, 200);

    res.json({ nextNumber });
  } catch (error) {
    res.status(500).json({
      message: "Error getting next trade number",
      error: error.message,
    });
  }
});

// ✅ POST - Save a complete trade
router.post("/full", async (req, res) => {
  try {
    const tradeNumber = Number(req.body.tradeNumber);

    console.log("Received trade data:", JSON.stringify(req.body, null, 2));
    console.log("Conditions data:", req.body.conditions);

    const tradeData = {
      ...req.body,
      tradeNumber,
      keyInfo: {
        ...req.body.keyInfo,
        tradeNumber,
      },
      agentCommissionList: req.body.agentCommissionList || [],
    };

    console.log("Trade data to save:", JSON.stringify(tradeData, null, 2));

    // Check for duplicate
    const existing = await Trade.findOne({ tradeNumber });
    if (existing) {
      return res.status(400).json({ message: "Trade number already exists" });
    }

    const trade = new Trade(tradeData);
    await trade.save();
    res.status(201).json(trade);
  } catch (err) {
    console.error("Error saving trade:", err);
    res.status(400).json({ message: err.message });
  }
});

// ✅ GET all trades
router.get("/", async (req, res) => {
  try {
    const trades = await Trade.find().sort({ tradeNumber: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET single trade by ID
router.get("/:id", async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUT - Update a trade
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.agentCommissionInfo) {
      updateData.agentCommissionList =
        updateData.agentCommissionInfo.agents || [];
      delete updateData.agentCommissionInfo;
    }

    if (updateData.tradeNumber) {
      updateData.tradeNumber = Number(updateData.tradeNumber);
    }

    if (updateData.keyInfo?.tradeNumber) {
      updateData.keyInfo.tradeNumber = Number(updateData.keyInfo.tradeNumber);
    }

    const updatedTrade = await Trade.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTrade)
      return res.status(404).json({ message: "Trade not found" });

    res.json(updatedTrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE - Remove a trade
router.delete("/:id", async (req, res) => {
  try {
    const deletedTrade = await Trade.findByIdAndDelete(req.params.id);
    if (!deletedTrade)
      return res.status(404).json({ message: "Trade not found" });

    res.json({ message: "Trade deleted", trade: deletedTrade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET trade with all EFTs (Real Estate Trust and Commission Trust)
router.get("/:id/with-efts", async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("realEstateTrustEFTs")
      .populate("commissionTrustEFTs");

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.json(trade);
  } catch (error) {
    console.error("Error fetching trade with EFTs:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching trade with EFTs" });
  }
});

// Finalize a trade (can only be done once)
router.post("/finalize/:tradeNumber", async (req, res) => {
  try {
    const { tradeNumber } = req.params;
    const { finalizedDate } = req.body;
    const trade = await Trade.findOne({ tradeNumber: Number(tradeNumber) });
    if (!trade) {
      return res
        .status(404)
        .json({ success: false, message: "Trade not found" });
    }
    if (trade.isFinalized) {
      return res
        .status(400)
        .json({ success: false, message: "Trade already finalized" });
    }

    // Set finalized date and mark as finalized
    trade.isFinalized = true;
    if (finalizedDate) {
      trade.keyInfo = trade.keyInfo || {};
      trade.keyInfo.finalizedDate = finalizedDate;
    }

    await trade.save();
    res.json({ success: true, message: "Trade finalized successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
