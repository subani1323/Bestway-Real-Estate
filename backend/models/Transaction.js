const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reference: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    debitAccount: {
      type: String,
      required: true,
    },
    creditAccount: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
