const express = require("express");
const router = express.Router();
const Ledger = require("../models/Ledger");
const { RealEstateTrustEFT } = require("../models/RealEstateTrustEFT");
const { CommissionTrustEFT } = require("../models/CommissionTrustEFT");
const { GeneralAccountEFT } = require("../models/GeneralAccountEFT");
const Trade = require("../models/Trade");
const JournalEntryCounter = require("../models/JournalEntryCounter");
const mongoose = require("mongoose"); // Added for database connection check

// Test route to check database contents
router.get("/test/contents", async (req, res) => {
  try {
    console.log("Testing database contents...");

    // Get total count
    const totalCount = await Ledger.countDocuments();
    console.log("Total ledger entries:", totalCount);

    // Get count by account
    const accountCounts = await Ledger.aggregate([
      {
        $group: {
          _id: "$accountNumber",
          count: { $sum: 1 },
          accountName: { $first: "$accountName" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Account counts:", accountCounts);

    // Get sample entries
    const sampleEntries = await Ledger.find().limit(5);
    console.log("Sample entries:", sampleEntries);

    res.json({
      totalCount,
      accountCounts,
      sampleEntries,
    });
  } catch (error) {
    console.error("Error testing database contents:", error);
    res.status(500).json({ message: error.message });
  }
});

// Test route specifically for CommissionTrust account
router.get("/test/commission-trust", async (req, res) => {
  try {
    console.log("Testing CommissionTrust account data...");

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    // Get basic ledger entries for CommissionTrust account
    const ledgerEntries = await Ledger.find({ accountNumber: "10004" }).limit(
      10
    );
    console.log("CommissionTrust ledger entries found:", ledgerEntries.length);

    // Get CommissionTrustEFT records
    const eftRecords = await CommissionTrustEFT.find().limit(5);
    console.log("CommissionTrustEFT records found:", eftRecords.length);

    res.json({
      ledgerEntries: ledgerEntries.length,
      eftRecords: eftRecords.length,
      sampleLedger: ledgerEntries[0] || null,
      sampleEFT: eftRecords[0] || null,
    });
  } catch (error) {
    console.error("Error testing CommissionTrust account:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Get all ledger entries
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};
    if (from && to) {
      const startDate = new Date(from);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setUTCHours(23, 59, 59, 999);

      query.$or = [
        {
          chequeDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        {
          date: {
            $gte: from,
            $lte: to,
          },
        },
      ];
    }

    console.log("General ledger search query:", query);
    const ledgers = await Ledger.find(query).sort({ chequeDate: -1, date: -1 });
    console.log("Fetched ledger entries:", ledgers.length);
    console.log("Sample ledger entry:", ledgers[0]);

    // Debug: Check if date field is present
    if (ledgers.length > 0) {
      console.log("Sample entry fields:", Object.keys(ledgers[0]._doc));
      console.log("Sample entry date field:", ledgers[0].date);
      console.log("Sample entry createdAt field:", ledgers[0].createdAt);
    }

    res.json(ledgers);
  } catch (error) {
    console.error("Error fetching ledgers:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get next JE reference number
router.get("/next-reference/:date", async (req, res) => {
  try {
    // Initialize counter to ensure it starts from JE1000
    await JournalEntryCounter.initializeCounter();
    const nextReference = await JournalEntryCounter.getNextJENumber();

    res.json({ nextReference });
  } catch (error) {
    console.error("Error getting next JE reference number:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get ledger entries by account number within a date range
router.get("/account/:accountNumber", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { fromDate, toDate } = req.query;

    console.log("Searching for ledger entries:", {
      accountNumber,
      fromDate,
      toDate,
    });

    // Validate account number
    if (!accountNumber) {
      return res.status(400).json({ message: "Account number is required" });
    }

    // Validate date parameters
    if (!fromDate || !toDate) {
      console.log("Missing date parameters");
      return res
        .status(400)
        .json({ message: "fromDate and toDate are required" });
    }

    // Validate date format
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log("Date range:", { startDate, endDate, fromDate, toDate });

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error("Database not connected");
      return res.status(500).json({ message: "Database connection error" });
    }

    // Find ledger entries for the specific account within the date range
    // Check both chequeDate (Date) and date (String) fields
    const ledgerEntries = await Ledger.find({
      accountNumber: accountNumber,
      $or: [
        {
          chequeDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        {
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      ],
    }).sort({ chequeDate: 1, date: 1 });

    console.log("Raw ledger entries found:", ledgerEntries.length);
    console.log(
      "Sample found entries:",
      ledgerEntries.slice(0, 3).map((entry) => ({
        accountNumber: entry.accountNumber,
        description: entry.description,
        date: entry.date,
        chequeDate: entry.chequeDate,
        createdAt: entry.createdAt,
      }))
    );

    if (ledgerEntries.length === 0) {
      return res.json([]);
    }

    console.log("Sample entry:", ledgerEntries[0]);

    // Transform the data to match the expected format for reconciliation
    const transformedEntries = await Promise.all(
      ledgerEntries.map(async (entry) => {
        try {
          const amount = entry.debit > 0 ? entry.debit : entry.credit;
          const type = entry.debit > 0 ? "Debit" : "Credit";

          // Try to find trade number and payee from EFT records
          let tradeNumber = null;
          let tradeId = null;
          let tradeAddress = null;
          let payee = null;
          let trustReference = null;

          if (entry.eftNumber) {
            try {
              // Check different EFT collections based on account number
              let eftRecord = null;

              if (accountNumber === "10002") {
                // Real Estate Trust Account
                eftRecord = await RealEstateTrustEFT.findOne({
                  eftNumber: entry.eftNumber,
                });
              } else if (accountNumber === "10004") {
                // Commission Trust Account
                eftRecord = await CommissionTrustEFT.findOne({
                  eftNumber: entry.eftNumber,
                });
              } else if (accountNumber === "10001") {
                // General Account
                eftRecord = await GeneralAccountEFT.findOne({
                  eftNumber: entry.eftNumber,
                });
              }

              // Get payee from EFT record
              if (eftRecord && eftRecord.recipient) {
                payee = eftRecord.recipient;
              }

              if (eftRecord && eftRecord.tradeId) {
                try {
                  // Get trade number from Trade model
                  const trade = await Trade.findById(eftRecord.tradeId);
                  if (trade && trade.keyInfo && trade.keyInfo.tradeNumber) {
                    tradeNumber = trade.keyInfo.tradeNumber;
                    tradeId = trade._id;

                    // Build address from trade keyInfo
                    if (
                      trade.keyInfo.streetNumber &&
                      trade.keyInfo.streetName
                    ) {
                      const addressParts = [
                        trade.keyInfo.streetNumber,
                        trade.keyInfo.streetName,
                        trade.keyInfo.unit,
                        trade.keyInfo.city,
                        trade.keyInfo.province,
                      ].filter((part) => part && part.trim() !== "");
                      tradeAddress = addressParts.join(" ");
                    }

                    // Get trust reference from trade's trust records if this is a trust deposit
                    if (trade.trustRecords && trade.trustRecords.length > 0) {
                      // Find the trust record that matches this transaction
                      const matchingTrustRecord = trade.trustRecords.find(
                        (record) =>
                          record.receivedFrom &&
                          entry.description &&
                          entry.description.includes(
                            `Received from: ${record.receivedFrom}`
                          )
                      );
                      if (
                        matchingTrustRecord &&
                        matchingTrustRecord.reference
                      ) {
                        trustReference = matchingTrustRecord.reference;
                      }
                    }
                  }
                } catch (tradeError) {
                  console.error("Error fetching trade:", tradeError);
                  // Continue without trade information
                }
              }
            } catch (eftError) {
              console.error("Error fetching EFT record:", eftError);
              // Continue without EFT information
            }
          }

          // If no trade number found from EFT, try to extract from description
          if (!tradeNumber) {
            try {
              const tradeMatch = entry.description.match(/Trade #:\s*(\d+)/i);
              if (tradeMatch) {
                tradeNumber = parseInt(tradeMatch[1]);

                // Try to find the trade by number to get address and trust reference
                const trade = await Trade.findOne({
                  "keyInfo.tradeNumber": tradeNumber,
                });
                if (trade && trade.keyInfo) {
                  // Build address from trade keyInfo
                  if (trade.keyInfo.streetNumber && trade.keyInfo.streetName) {
                    const addressParts = [
                      trade.keyInfo.streetNumber,
                      trade.keyInfo.streetName,
                      trade.keyInfo.unit,
                      trade.keyInfo.city,
                      trade.keyInfo.province,
                    ].filter((part) => part && part.trim() !== "");
                    tradeAddress = addressParts.join(" ");
                  }

                  // Get trust reference from trade's trust records if this is a trust deposit
                  if (trade.trustRecords && trade.trustRecords.length > 0) {
                    // Find the trust record that matches this transaction
                    const matchingTrustRecord = trade.trustRecords.find(
                      (record) =>
                        record.receivedFrom &&
                        entry.description &&
                        entry.description.includes(
                          `Received from: ${record.receivedFrom}`
                        )
                    );
                    if (matchingTrustRecord && matchingTrustRecord.reference) {
                      trustReference = matchingTrustRecord.reference;
                    }
                  }
                }
              }
            } catch (descriptionError) {
              console.error("Error processing description:", descriptionError);
              // Continue without description-based trade information
            }
          }

          // Build enhanced description with address
          let enhancedDescription = entry.description || "";
          if (tradeAddress) {
            enhancedDescription = `${entry.description} - ${tradeAddress}`;
          }

          // Format reference field - prioritize trust reference, then EFT number
          let formattedReference = null;
          if (trustReference && trustReference.trim() !== "") {
            formattedReference = trustReference;
          } else if (entry.eftNumber) {
            formattedReference = `EFT#${entry.eftNumber}`;
          }

          return {
            _id: entry._id,
            date: entry.date || entry.chequeDate,
            reference: formattedReference,
            description: enhancedDescription,
            amount: amount || 0,
            type: type || "Unknown",
            tradeNumber: tradeNumber,
            tradeId: tradeId,
            payee: payee,
            debitAccount: entry.debit > 0 ? entry.accountNumber : null,
            creditAccount: entry.credit > 0 ? entry.accountNumber : null,
            accountNumber: entry.accountNumber,
            accountName: entry.accountName,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          };
        } catch (entryError) {
          console.error("Error processing ledger entry:", entryError);
          // Return a basic entry if transformation fails
          return {
            _id: entry._id,
            date: entry.date || entry.chequeDate,
            reference: entry.eftNumber ? `EFT#${entry.eftNumber}` : null,
            description: entry.description || "Error processing entry",
            amount: entry.debit > 0 ? entry.debit : entry.credit || 0,
            type: entry.debit > 0 ? "Debit" : "Credit",
            tradeNumber: null,
            tradeId: null,
            payee: null,
            debitAccount: entry.debit > 0 ? entry.accountNumber : null,
            creditAccount: entry.credit > 0 ? entry.accountNumber : null,
            accountNumber: entry.accountNumber,
            accountName: entry.accountName,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          };
        }
      })
    );

    console.log("Transformed entries:", transformedEntries.length);
    if (transformedEntries.length > 0) {
      console.log("Sample transformed entry:", transformedEntries[0]);
    }

    res.json(transformedEntries);
  } catch (error) {
    console.error("Error fetching ledger entries by account:", error);
    console.error("Error stack:", error.stack);

    // Send more detailed error information in development
    const errorResponse = {
      message: "Server error while fetching ledger entries by account",
      error: error.message,
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
});

// Get a single ledger entry
router.get("/:id", async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) {
      return res.status(404).json({ message: "Ledger entry not found" });
    }
    console.log("Fetched single ledger:", ledger);
    res.json(ledger);
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a ledger entry
router.post("/", async (req, res) => {
  console.log("Creating ledger with data:", req.body);
  const ledger = new Ledger(req.body);
  try {
    const newLedger = await ledger.save();
    console.log("Created new ledger:", newLedger);
    res.status(201).json(newLedger);
  } catch (error) {
    console.error("Error creating ledger:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update a ledger entry
router.put("/:id", async (req, res) => {
  console.log("Updating ledger entry");
  console.log("ID:", req.params.id);
  console.log("Received data:", req.body);

  try {
    const updatedLedger = await Ledger.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLedger) {
      return res.status(404).json({ message: "Ledger entry not found" });
    }

    console.log("Successfully updated ledger:", updatedLedger);
    res.json(updatedLedger);
  } catch (error) {
    console.error("Error updating ledger:", error);
    res.status(400).json({ message: error.message });
  }
});

// Clear all ledger entries
router.delete("/", async (req, res) => {
  try {
    const result = await Ledger.deleteMany({});
    console.log(
      `Cleared all ledger entries. Deleted ${result.deletedCount} entries.`
    );
    res.json({
      message: `All trial balance data cleared successfully. Deleted ${result.deletedCount} entries.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing all ledger entries:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a ledger entry
router.delete("/:id", async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) {
      return res.status(404).json({ message: "Ledger entry not found" });
    }
    await Ledger.deleteOne({ _id: req.params.id });
    console.log("Deleted ledger:", req.params.id);
    res.json({ message: "Ledger entry deleted" });
  } catch (error) {
    console.error("Error deleting ledger:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create EFT transfer (debit 10004, credit 10002)
router.post("/eft-transfer", async (req, res) => {
  try {
    const { eftNumber, description, amount, chequeDate } = req.body;
    if (!eftNumber || !description || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Debit Commission Trust Account (10004)
    const debitEntry = new Ledger({
      accountNumber: "10004",
      accountName: "CASH - COMMISSION TRUST ACCOUNT",
      debit: amount,
      credit: 0,
      description,
      eftNumber,
      chequeDate: chequeDate ? new Date(chequeDate) : new Date(),
    });
    await debitEntry.save();

    // Credit Trust Account (10002)
    const creditEntry = new Ledger({
      accountNumber: "10002",
      accountName: "CASH - TRUST",
      debit: 0,
      credit: amount,
      description,
      eftNumber,
      chequeDate: chequeDate ? new Date(chequeDate) : new Date(),
    });
    await creditEntry.save();

    res.status(201).json({ message: "EFT transfer recorded in ledger." });
  } catch (error) {
    console.error("Error recording EFT transfer:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
