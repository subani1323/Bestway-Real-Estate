const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    fax: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    trustStatusCompany: {
      type: Boolean,
      default: false,
    },
    trebNumber: {
      type: String,
      required: true,
    },
    recoNumber: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);

module.exports = CompanyProfile;
