const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    listingNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 100,
    },
    address: {
      streetNumber: String,
      streetName: String,
      unit: String,
      city: String,
      province: String,
      postalCode: String,
    },
    seller: {
      name: String,
      phoneNumber: String,
    },
    commission: {
      list: Number,
      sell: Number,
    },
    propertyType: String,
    status: String,
    agent: {
      employeeNo: String,
      officeNumber: String,
      isLead: Boolean,
    },
    mlsNumber: String,
    dates: {
      listing: Date,
      entry: Date,
      expiry: Date,
      sold: Date,
      lastEdit: {
        type: Date,
        default: Date.now,
      },
    },
    weManage: Boolean,
    prices: {
      listed: Number,
      sold: Number,
    },
    // People details schema
    people: [
      {
        firstName: String,
        lastName: String,
        address: String,
        phone: String,
      },
    ],
    // Agent details schema
    agents: [
      {
        agentNo: String,
        firstName: String,
        lastName: String,
        officeNo: String,
        lead: String,
        sendPage: String,
        expense: String,
        amount: String,
        cooperation: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Listing", listingSchema);
