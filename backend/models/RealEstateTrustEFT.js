const mongoose = require("mongoose");

const RealEstateTrustEFTSchema = new mongoose.Schema(
  {
    eftNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1000,
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
        "CommissionTransfer",
        "BalanceOfDeposit",
        "RefundOfDeposit",
        "TrustDeposit",
      ],
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

const RealEstateTrustEFTCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: "realEstateTrustEFTCounter",
  },
  seq: {
    type: Number,
    default: 999,
  },
});

RealEstateTrustEFTCounterSchema.statics.getNextEFTNumber = async function () {
  const counter = await this.findByIdAndUpdate(
    { _id: "realEstateTrustEFTCounter" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

RealEstateTrustEFTCounterSchema.statics.initializeCounter = async function () {
  // Check if counter exists and initialize to 999 if it doesn't (so next will be 1000)
  let counter = await this.findById("realEstateTrustEFTCounter");
  if (!counter) {
    counter = new this({ _id: "realEstateTrustEFTCounter", seq: 999 });
    await counter.save();
  } else if (counter.seq < 999) {
    // If counter exists but is below 999, update it
    counter.seq = 999;
    await counter.save();
  }
  return counter.seq;
};

const RealEstateTrustEFT = mongoose.model(
  "RealEstateTrustEFT",
  RealEstateTrustEFTSchema
);
const RealEstateTrustEFTCounter = mongoose.model(
  "RealEstateTrustEFTCounter",
  RealEstateTrustEFTCounterSchema
);

module.exports = { RealEstateTrustEFT, RealEstateTrustEFTCounter };
