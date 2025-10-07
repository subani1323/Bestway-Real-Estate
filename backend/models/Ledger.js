const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    eftNumber: {
      type: String,
      required: false,
    },
    apNumber: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    reference: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: false,
    },
    chequeDate: {
      type: Date,
      required: false,
    },
    // Optionally, add date, reference, etc.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ledger", ledgerSchema);
