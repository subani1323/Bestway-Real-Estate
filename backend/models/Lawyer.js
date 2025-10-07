const mongoose = require("mongoose");

const lawyerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "Tenant",
        "Landlord",
        "Seller",
        "Buyer",
        "Seller Lawyer",
        "Buyer Lawyer",
      ],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    companyName: String,
    email: String,
    end: {
      type: String,
      required: true,
      enum: ["Listing End", "Selling End"],
    },
    primaryPhone: String,
    cellPhone: String,
    address: String,
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      required: false, // Optional, in case lawyer is not associated with a specific trade
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lawyer", lawyerSchema);
