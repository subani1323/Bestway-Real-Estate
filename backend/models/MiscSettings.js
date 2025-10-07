const mongoose = require("mongoose");

const miscSettingsSchema = new mongoose.Schema(
  {
    // TRADES & LISTINGS
    lastListing: {
      type: Number,
      required: true,
    },
    lastTrade: {
      type: Number,
      required: true,
    },
    lastEFT: {
      type: Number,
      default: 0,
    },
    compassDirection: {
      type: String,
      enum: ["Lorem Ipsum 1", "Lorem Ipsum 2", "Lorem Ipsum 3"],
      required: true,
    },
    cdaAddress: {
      type: String,
      enum: ["Lorem Ipsum 1", "Lorem Ipsum 2", "Lorem Ipsum 3"],
      required: true,
    },

    // COMPANY SETTINGS
    multipleOffices: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    mainOfficeNumber: {
      type: Number,
      required: true,
    },
    hstNumber: {
      type: Number,
      required: true,
    },
    payrollNumber: {
      type: Number,
      required: true,
    },
    expStmtAddress: {
      type: String,
      enum: ["Lorem Ipsum 1", "Lorem Ipsum 2", "Lorem Ipsum 3"],
      required: true,
    },
    openingBalanceFormat: {
      type: String,
      enum: ["Lorem Ipsum 1", "Lorem Ipsum 2", "Lorem Ipsum 3"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MiscSettings", miscSettingsSchema);
