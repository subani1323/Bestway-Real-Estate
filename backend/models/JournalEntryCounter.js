const mongoose = require("mongoose");

const JournalEntryCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: "journalEntryCounter",
  },
  seq: {
    type: Number,
    default: 1000,
  },
});

JournalEntryCounterSchema.statics.getNextJENumber = async function () {
  const counter = await this.findByIdAndUpdate(
    { _id: "journalEntryCounter" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `JE${counter.seq}`;
};

JournalEntryCounterSchema.statics.initializeCounter = async function () {
  // Check if counter exists and initialize to 1000 if it doesn't
  let counter = await this.findById("journalEntryCounter");
  if (!counter) {
    counter = new this({ _id: "journalEntryCounter", seq: 1000 });
    await counter.save();
  } else if (counter.seq < 1000) {
    // If counter exists but is below 1000, update it
    counter.seq = 1000;
    await counter.save();
  }
  return counter.seq;
};

const JournalEntryCounter = mongoose.model("JournalEntryCounter", JournalEntryCounterSchema);

module.exports = JournalEntryCounter;

