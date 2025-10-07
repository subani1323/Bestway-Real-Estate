const mongoose = require("mongoose");

const mlsFeeSchema = new mongoose.Schema(
  {
    fee: {
      type: Number,
      required: true,
    },
    selectionOption: {
      type: String,
      enum: ["% of Sell Price", "Flat Amount"],
      required: true,
    },
    mlsFeeTaxApplicable: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    postToAP: {
      type: String,
      enum: ["Yes Post to A/P", "No dont post to A/P"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MLSFee", mlsFeeSchema);
