const mongoose = require("mongoose");

const completeListingInfoSchema = new mongoose.Schema(
  {
    listingNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 100,
      default: function () {
        return Math.floor(Math.random() * 900000) + 100000; // 6-digit number
      },
    },
    // Property Information
    address: {
      streetNumber: String,
      streetName: String,
      unit: String,
      province: String,
      postalCode: String,
    },
    propertyType: String,
    status: String,
    mlsNumber: String,
    weManage: Boolean,

    // Financial Information
    commission: {
      list: Number,
      sell: Number,
    },
    prices: {
      listed: Number,
      sold: Number,
    },

    // Dates
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

    // Primary Agent Information
    primaryAgent: {
      name: String,
      officeNumber: String,
      isLead: Boolean,
    },

    // Seller Information
    seller: {
      name: String,
      phoneNumber: String,
    },

    // People details
    people: [
      {
        type: String, // Add type (Tenant, Landlord, Seller, Buyer, etc.)
        firstName: String,
        lastName: String,
        email: String, // Add email
        primaryPhone: String, // Add primary phone
        cellPhone: String, // Add cell phone
        address: String,
        end: String, // Add end (Listing End, Selling End)
        companyName: String, // Add company name
      },
    ],

    // Agent details
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
  { timestamps: true }
);

module.exports = mongoose.model(
  "CompleteListingInfo",
  completeListingInfoSchema
);
