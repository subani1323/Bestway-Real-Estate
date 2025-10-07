const express = require("express");
const router = express.Router();
const GeneralLedgerSetup = require("../models/GeneralLedgerSetup");

// Get all general ledger setups
router.get("/", async (req, res) => {
  try {
    const setups = await GeneralLedgerSetup.find().sort({ createdAt: -1 });
    console.log("Fetched general ledger setups:", setups);
    res.json(setups);
  } catch (error) {
    console.error("Error fetching general ledger setups:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single general ledger setup
router.get("/:id", async (req, res) => {
  try {
    const setup = await GeneralLedgerSetup.findById(req.params.id);
    if (!setup) {
      return res
        .status(404)
        .json({ message: "General ledger setup not found" });
    }
    console.log("Fetched single general ledger setup:", setup);
    res.json(setup);
  } catch (error) {
    console.error("Error fetching general ledger setup:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get the latest general ledger setup
router.get("/latest", async (req, res) => {
  try {
    const latestSetup = await GeneralLedgerSetup.findOne().sort({
      createdAt: -1,
    });
    if (!latestSetup) {
      return res.status(404).json({ message: "No general ledger setup found" });
    }
    console.log("Fetched latest general ledger setup:", latestSetup);
    res.json(latestSetup);
  } catch (error) {
    console.error("Error fetching latest general ledger setup:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new general ledger setup
router.post("/", async (req, res) => {
  console.log("Creating general ledger setup with data:", req.body);

  try {
    // Validate required fields
    const requiredFields = [
      "ARCommissionEarned",
      "APGeneralCommissionExpense",
      "AROtherDebit",
      "unpaidFileTrustReceivable",
      "commissionReceivablePayable",
      "heldFundsReceivableAgent",
      "heldFundsPayableAgent",
      "suspense",
      "unpaidExpensesManagement",
      "unpaidExpensesNonMgmt",
      "payrollAgent",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const setup = new GeneralLedgerSetup(req.body);
    const newSetup = await setup.save();
    console.log("Created new general ledger setup:", newSetup);
    res.status(201).json(newSetup);
  } catch (error) {
    console.error("Error creating general ledger setup:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update a general ledger setup
router.put("/:id", async (req, res) => {
  console.log("Updating general ledger setup");
  console.log("ID:", req.params.id);
  console.log("Received data:", req.body);

  try {
    const updatedSetup = await GeneralLedgerSetup.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSetup) {
      return res
        .status(404)
        .json({ message: "General ledger setup not found" });
    }

    console.log("Successfully updated general ledger setup:", updatedSetup);
    res.json(updatedSetup);
  } catch (error) {
    console.error("Error updating general ledger setup:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a general ledger setup
router.delete("/:id", async (req, res) => {
  try {
    const setup = await GeneralLedgerSetup.findById(req.params.id);
    if (!setup) {
      return res
        .status(404)
        .json({ message: "General ledger setup not found" });
    }
    await GeneralLedgerSetup.deleteOne({ _id: req.params.id });
    console.log("Deleted general ledger setup:", req.params.id);
    res.json({ message: "General ledger setup deleted" });
  } catch (error) {
    console.error("Error deleting general ledger setup:", error);
    res.status(500).json({ message: error.message });
  }
});

// Clear all general ledger setups
router.delete("/", async (req, res) => {
  try {
    const result = await GeneralLedgerSetup.deleteMany({});
    console.log(
      `Cleared all general ledger setups. Deleted ${result.deletedCount} entries.`
    );
    res.json({
      message: `All general ledger setups cleared successfully. Deleted ${result.deletedCount} entries.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing all general ledger setups:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
