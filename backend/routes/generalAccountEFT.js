const express = require("express");
const router = express.Router();
const {
  GeneralAccountEFT,
  GeneralAccountEFTCounter,
} = require("../models/GeneralAccountEFT");
const Vendor = require("../models/Vendor");

// POST to reset the EFT counter to 2999 (so next EFT will be 3000)
router.post("/reset-counter", async (req, res) => {
  try {
    await GeneralAccountEFTCounter.findByIdAndUpdate(
      { _id: "generalAccountEFTCounter" },
      { seq: 2999 },
      { upsert: true }
    );
    res.json({ message: "EFT counter reset to 2999. Next EFT will be 3000." });
  } catch (error) {
    console.error("Error resetting EFT counter:", error);
    res.status(500).json({ message: "Server error while resetting counter" });
  }
});

// POST to migrate existing EFT records and update counter to start from 3000
router.post("/migrate-to-3000", async (req, res) => {
  try {
    // Get all existing General Account EFTs
    const existingEFTs = await GeneralAccountEFT.find().sort({ eftNumber: 1 });

    if (existingEFTs.length === 0) {
      // No existing EFTs, just set counter to 2999
      await GeneralAccountEFTCounter.findByIdAndUpdate(
        { _id: "generalAccountEFTCounter" },
        { seq: 2999 },
        { upsert: true }
      );
      return res.json({
        message:
          "No existing EFTs found. Counter set to 2999. Next EFT will be 3000.",
        migratedCount: 0,
      });
    }

    // Check if any EFT numbers are below 3000
    const lowEFTs = existingEFTs.filter((eft) => eft.eftNumber < 3000);

    if (lowEFTs.length === 0) {
      // All EFTs are already 3000+, just ensure counter is set correctly
      const maxEFTNumber = Math.max(
        ...existingEFTs.map((eft) => eft.eftNumber)
      );
      await GeneralAccountEFTCounter.findByIdAndUpdate(
        { _id: "generalAccountEFTCounter" },
        { seq: maxEFTNumber },
        { upsert: true }
      );
      return res.json({
        message: `All EFTs are already 3000+. Counter set to ${maxEFTNumber}. Next EFT will be ${
          maxEFTNumber + 1
        }.`,
        migratedCount: 0,
      });
    }

    // Migrate EFTs starting from 3000
    let newEFTNumber = 3000;
    for (const eft of lowEFTs) {
      // Update the EFT number
      await GeneralAccountEFT.findByIdAndUpdate(eft._id, {
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
    await GeneralAccountEFTCounter.findByIdAndUpdate(
      { _id: "generalAccountEFTCounter" },
      { seq: newEFTNumber - 1 },
      { upsert: true }
    );

    res.json({
      message: `Successfully migrated ${
        lowEFTs.length
      } EFT records to start from 3000. Counter set to ${
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

// POST to create a new General Account EFT for A/P Expenses
router.post("/ap-expense", async (req, res) => {
  try {
    const {
      vendorId,
      amount,
      recipient,
      expenseCategory,
      description,
      invoiceNumber,
      hst,
      dueDate,
      chequeDate,
    } = req.body;

    if (!recipient) {
      return res.status(400).json({ message: "Recipient is required" });
    }

    // Check if vendor exists if vendorId is provided
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
    }

    // Initialize counter to ensure it starts from 2999 (so next will be 3000)
    await GeneralAccountEFTCounter.initializeCounter();
    const nextEFTNumber = await GeneralAccountEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new GeneralAccountEFT({
      eftNumber: nextEFTNumber,
      vendorId: vendorId,
      amount: amount,
      recipient: recipient,
      hst: hst,
      dueDate: dueDate,
      type: "APExpense",
      expenseCategory: expenseCategory,
      description: description,
      invoiceNumber: invoiceNumber,
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    await newEFT.save();

    // Link EFT to Vendor if vendorId is provided
    if (vendorId) {
      await Vendor.findByIdAndUpdate(vendorId, {
        $push: { generalAccountEFTs: newEFT._id },
      });
    }

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating General Account EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// POST to create a new General Account EFT for General Expenses
router.post("/general-expense", async (req, res) => {
  try {
    const { amount, recipient, expenseCategory, description, chequeDate } =
      req.body;

    if (!recipient) {
      return res.status(400).json({ message: "Recipient is required" });
    }

    // Initialize counter to ensure it starts from 2999 (so next will be 3000)
    await GeneralAccountEFTCounter.initializeCounter();
    const nextEFTNumber = await GeneralAccountEFTCounter.getNextEFTNumber();

    // Parse MM/DD/YYYY format correctly to avoid timezone issues
    let parsedChequeDate = new Date();
    if (chequeDate) {
      const [month, day, year] = chequeDate.split("/");
      parsedChequeDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
      );
    }

    const newEFT = new GeneralAccountEFT({
      eftNumber: nextEFTNumber,
      amount: amount,
      recipient: recipient,
      type: "GeneralExpense",
      expenseCategory: expenseCategory,
      description: description,
      date: new Date(),
      chequeDate: parsedChequeDate,
    });

    await newEFT.save();

    res.status(201).json({ eftNumber: nextEFTNumber });
  } catch (error) {
    console.error("Error creating General Account EFT record:", error);
    res.status(500).json({ message: "Server error while creating EFT record" });
  }
});

// GET all General Account EFTs
router.get("/", async (req, res) => {
  try {
    const efts = await GeneralAccountEFT.find().populate("vendorId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching General Account EFTs:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// GET single EFT by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eft = await GeneralAccountEFT.findById(id).populate("vendorId");
    if (!eft) {
      return res.status(404).json({ message: "EFT not found" });
    }
    res.json(eft);
  } catch (error) {
    console.error("Error fetching EFT:", error);
    res.status(500).json({ message: "Server error while fetching EFT" });
  }
});

// GET EFTs by vendor ID
router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const efts = await GeneralAccountEFT.find({ vendorId }).populate(
      "vendorId"
    );
    res.json(efts);
  } catch (error) {
    console.error("Error fetching EFTs for vendor:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// GET EFTs by expense category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const efts = await GeneralAccountEFT.find({
      expenseCategory: category,
    }).populate("vendorId");
    res.json(efts);
  } catch (error) {
    console.error("Error fetching EFTs by category:", error);
    res.status(500).json({ message: "Server error while fetching EFTs" });
  }
});

// GET vendor with all related EFTs
router.get("/vendor/:vendorId/with-efts", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findById(vendorId).populate(
      "generalAccountEFTs"
    );
    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor with EFTs:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching vendor with EFTs" });
  }
});

// GET to check if an invoice number already exists
router.get("/check-invoice/:invoiceNumber", async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const existing = await GeneralAccountEFT.findOne({ invoiceNumber });
    if (existing) {
      res.json({
        exists: true,
        paymentDate: existing.date,
        amount: existing.amount,
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while checking invoice number" });
  }
});

// PUT to update EFT status and other fields
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { eftCreated, eftNumber, hst, chequeDate } = req.body;

    const updateData = {};
    if (eftCreated !== undefined) updateData.eftCreated = eftCreated;
    if (eftNumber !== undefined) updateData.eftNumber = eftNumber;
    if (hst !== undefined) updateData.hst = hst;
    if (chequeDate !== undefined) updateData.chequeDate = new Date(chequeDate);

    const updatedEFT = await GeneralAccountEFT.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEFT) {
      return res.status(404).json({ message: "EFT not found" });
    }

    res.json(updatedEFT);
  } catch (error) {
    console.error("Error updating EFT:", error);
    res.status(500).json({ message: "Server error while updating EFT" });
  }
});

module.exports = router;
