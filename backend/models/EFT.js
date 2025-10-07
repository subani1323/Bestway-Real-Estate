const mongoose = require("mongoose");

const EFTRecordSchema = new mongoose.Schema(
  {
    eftNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 4000,
    },
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      required: true,
    },
    // You can add other details from the receipt you want to store
    amount: Number,
    date: Date,
    recipient: String,
  },
  { timestamps: true }
);

const EFTCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: "eftCounter",
  },
  seq: {
    type: Number,
    default: 3999,
  },
});

EFTCounterSchema.statics.getNextEFTNumber = async function () {
  const counter = await this.findByIdAndUpdate(
    { _id: "eftCounter" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

EFTCounterSchema.statics.initializeCounter = async function () {
  // Check if counter exists and initialize to 3999 if it doesn't (so next will be 4000)
  let counter = await this.findById("eftCounter");
  if (!counter) {
    counter = new this({ _id: "eftCounter", seq: 3999 });
    await counter.save();
  } else if (counter.seq < 3999) {
    // If counter exists but is below 3999, update it
    counter.seq = 3999;
    await counter.save();
  }
  return counter.seq;
};

const EFTRecord = mongoose.model("EFTRecord", EFTRecordSchema);
const EFTCounter = mongoose.model("EFTCounter", EFTCounterSchema);

module.exports = { EFTRecord, EFTCounter };
