const mongoose = require("mongoose");

const BalanceOfDepositEFTSchema = new mongoose.Schema(
  {
    chequeDate: String,
    bankAccount: String,
    chequeNumber: String,
    tradeNumber: String,
    status: String,
    tradeAddress: String,
    todayDate: String,
    balance: String,
    amountOfCheque: String,
    chequeWrittenTo: String,
    address: String,
    city: String,
    province: String,
    postalCode: String,
    noteOnStub: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BalanceOfDepositEFT",
  BalanceOfDepositEFTSchema
);
