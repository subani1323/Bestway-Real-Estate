const mongoose = require("mongoose");

const reconciliationSettingsSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    statementAmount: {
      type: Number,
      default: null,
    },
    clearedTransactions: [
      {
        ledgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
          required: true,
        },
        clearedAt: {
          type: Date,
          default: Date.now,
        },
        clearedBy: {
          type: String,
          default: "user", // Can be enhanced to store actual user ID
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique combinations of account, fromDate, and toDate
reconciliationSettingsSchema.index(
  { accountNumber: 1, fromDate: 1, toDate: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ReconciliationSettings",
  reconciliationSettingsSchema
);
