const mongoose = require("mongoose");

const outsideBrokerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Listing Broker", "Cooperating Broker"]
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    company: String,
    email: String,
    payBroker: {
      type: String,
      enum: ["Yes", "No"],
      default: "No"
    },
    end: {
      type: String,
      required: true,
      enum: ["Listing End", "Selling End"]
    },
    primaryPhone: String,
    chargedHST: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes"
    },
    address: String,
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
      required: false // Optional, in case broker is not associated with a specific trade
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("OutsideBroker", outsideBrokerSchema);
