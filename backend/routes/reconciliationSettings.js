const express = require("express");
const router = express.Router();
const ReconciliationSettings = require("../models/ReconciliationSettings");

// Get reconciliation settings for a specific account and date range
router.get("/:accountNumber", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate are required",
      });
    }

    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const settings = await ReconciliationSettings.findOne({
      accountNumber,
      fromDate: startDate,
      toDate: endDate,
    });

    if (!settings) {
      return res.json({ clearedTransactions: [] });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching reconciliation settings:", error);
    res.status(500).json({ message: error.message });
  }
});

// Save reconciliation settings (create or update)
router.post("/:accountNumber", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { fromDate, toDate, clearedTransactions, statementAmount } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate are required",
      });
    }

    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    // Use upsert to create or update
    const settings = await ReconciliationSettings.findOneAndUpdate(
      {
        accountNumber,
        fromDate: startDate,
        toDate: endDate,
      },
      {
        accountNumber,
        fromDate: startDate,
        toDate: endDate,
        statementAmount: statementAmount !== undefined ? statementAmount : null,
        clearedTransactions: clearedTransactions || [],
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(settings);
  } catch (error) {
    console.error("Error saving reconciliation settings:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update cleared transactions for a specific account and date range
router.put("/:accountNumber/cleared-transactions", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { fromDate, toDate, ledgerId, shouldClear } = req.body;

    if (!fromDate || !toDate || !ledgerId) {
      return res.status(400).json({
        message: "fromDate, toDate, and ledgerId are required",
      });
    }

    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    let settings = await ReconciliationSettings.findOne({
      accountNumber,
      fromDate: startDate,
      toDate: endDate,
    });

    if (!settings) {
      // Create new settings if they don't exist
      settings = new ReconciliationSettings({
        accountNumber,
        fromDate: startDate,
        toDate: endDate,
        clearedTransactions: [],
      });
    }

    if (shouldClear) {
      // Add to cleared transactions if not already present
      const exists = settings.clearedTransactions.some(
        (ct) => ct.ledgerId.toString() === ledgerId
      );
      if (!exists) {
        settings.clearedTransactions.push({
          ledgerId,
          clearedAt: new Date(),
          clearedBy: "user",
        });
      }
    } else {
      // Remove from cleared transactions
      settings.clearedTransactions = settings.clearedTransactions.filter(
        (ct) => ct.ledgerId.toString() !== ledgerId
      );
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Error updating cleared transactions:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update statement amount for a specific account and date range
router.put("/:accountNumber/statement-amount", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { fromDate, toDate, statementAmount } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate are required",
      });
    }

    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    let settings = await ReconciliationSettings.findOne({
      accountNumber,
      fromDate: startDate,
      toDate: endDate,
    });

    if (!settings) {
      // Create new settings if they don't exist
      settings = new ReconciliationSettings({
        accountNumber,
        fromDate: startDate,
        toDate: endDate,
        statementAmount: statementAmount !== undefined ? statementAmount : null,
        clearedTransactions: [],
      });
    } else {
      // Update existing settings
      settings.statementAmount =
        statementAmount !== undefined ? statementAmount : null;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Error updating statement amount:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
