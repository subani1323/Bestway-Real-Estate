const mongoose = require("mongoose");

const financeTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "CommissionTransfer",
        "BalanceOfDeposit",
        "AgentCommissionPayment",
        "RefundOfDeposit",
        "APExpense",
        "GeneralExpense",
      ],
    },
    chequeDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    chequeWrittenTo: {
      type: String,
      required: true,
    },
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    expenseCategory: String,
    description: String,
    invoiceNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinanceTransaction", financeTransactionSchema);
