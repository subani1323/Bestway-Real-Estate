const mongoose = require("mongoose");

const CommissionTrustEFTSchema = new mongoose.Schema(
  {
    eftNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 2000,
    },
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      required: true,
    },
    amount: Number,
    date: Date,
    chequeDate: Date,
    recipient: String,
    type: {
      type: String,
      enum: [
        "AgentCommissionTransfer",
        "RefundOfDeposit",
        "OutsideBrokerCommission",
        "OurBrokerageCommission",
      ],
      required: true,
    },
    agentId: String,
    agentName: String,
    description: String,
  },
  { timestamps: true }
);

const CommissionTrustEFTCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: "commissionTrustEFTCounter",
  },
  seq: {
    type: Number,
    default: 1999,
  },
});

CommissionTrustEFTCounterSchema.statics.getNextEFTNumber = async function () {
  const counter = await this.findByIdAndUpdate(
    { _id: "commissionTrustEFTCounter" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

CommissionTrustEFTCounterSchema.statics.initializeCounter = async function () {
  // Check if counter exists and initialize to 1999 if it doesn't (so next will be 2000)
  let counter = await this.findById("commissionTrustEFTCounter");
  if (!counter) {
    counter = new this({ _id: "commissionTrustEFTCounter", seq: 1999 });
    await counter.save();
  } else if (counter.seq < 1999) {
    // If counter exists but is below 1999, update it
    counter.seq = 1999;
    await counter.save();
  }
  return counter.seq;
};

const CommissionTrustEFT = mongoose.model(
  "CommissionTrustEFT",
  CommissionTrustEFTSchema
);
const CommissionTrustEFTCounter = mongoose.model(
  "CommissionTrustEFTCounter",
  CommissionTrustEFTCounterSchema
);

module.exports = { CommissionTrustEFT, CommissionTrustEFTCounter };
