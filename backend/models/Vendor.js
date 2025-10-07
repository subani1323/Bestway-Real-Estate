const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorNumber: { type: Number, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    streetNumber: { type: String, required: true },
    streetName: { type: String, required: true },
    unit: { type: String },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    companyName: { type: String },
    // EFT References
    generalAccountEFTs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GeneralAccountEFT",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
