const mongoose = require("mongoose");

const CommissionTransferEFTSchema = new mongoose.Schema(
  {
    chequeDate: String,
    bankAccount: String,
    tradeNumber: String,
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
  "CommissionTransferEFT",
  CommissionTransferEFTSchema
);
