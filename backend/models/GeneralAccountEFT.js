const mongoose = require("mongoose");

const GeneralAccountEFTSchema = new mongoose.Schema(
  {
    eftNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 3000,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    amount: Number,
    date: Date,
    chequeDate: Date,
    recipient: String,
    hst: Number,
    dueDate: Date,
    type: {
      type: String,
      enum: ["APExpense", "GeneralExpense"],
      required: true,
    },
    expenseCategory: String,
    description: String,
    invoiceNumber: String,
    eftCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GeneralAccountEFTCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: "generalAccountEFTCounter",
  },
  seq: {
    type: Number,
    default: 2999,
  },
});

GeneralAccountEFTCounterSchema.statics.getNextEFTNumber = async function () {
  const counter = await this.findByIdAndUpdate(
    { _id: "generalAccountEFTCounter" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

GeneralAccountEFTCounterSchema.statics.initializeCounter = async function () {
  // Check if counter exists and initialize to 2999 if it doesn't (so next will be 3000)
  let counter = await this.findById("generalAccountEFTCounter");
  if (!counter) {
    counter = new this({ _id: "generalAccountEFTCounter", seq: 2999 });
    await counter.save();
  } else if (counter.seq < 2999) {
    // If counter exists but is below 2999, update it
    counter.seq = 2999;
    await counter.save();
  }
  return counter.seq;
};

const GeneralAccountEFT = mongoose.model(
  "GeneralAccountEFT",
  GeneralAccountEFTSchema
);
const GeneralAccountEFTCounter = mongoose.model(
  "GeneralAccountEFTCounter",
  GeneralAccountEFTCounterSchema
);

module.exports = { GeneralAccountEFT, GeneralAccountEFTCounter };
