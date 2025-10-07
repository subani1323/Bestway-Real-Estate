const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema({
  licenseNumber: String,
  licenseType: String,
  issueDate: Date,
  expiryDate: Date,
  status: { type: String, default: "Active" },
});

const payrollSchema = new mongoose.Schema({
  position: String,
  hourlyRate: { type: Number, min: 0 },
  hoursWorked: { type: Number, min: 0 },
  grossPay: { type: Number, min: 0 },
  deductions: { type: Number, min: 0, default: 0 },
  netPay: { type: Number, min: 0 },
});

const agentSchema = new mongoose.Schema(
  {
    employeeNo: { type: Number, required: true, unique: true, min: 100 },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    legalName: String,
    nickname: String,
    spouseName: String,
    gender: String,
    email: String,
    website: String,
    phone: String,
    homePhone: String,
    cellPhone: String,
    fax: String,
    streetNumber: String,
    streetName: String,
    unitNumber: String,
    city: String,
    province: String,
    postalCode: String,
    hstNumber: String,
    dateOfBirth: Date,
    startDate: Date,
    endDate: Date,
    contactAnniversary: Date,
    franchiseAnniversary: Date,
    lastPayDate: Date,
    bondExpiryDate: Date,
    incorporatedDate: Date,
    unincorporatedDate: Date,
    status: { type: String, default: "Active" },
    licenses: [licenseSchema],
    payroll: payrollSchema,
    feeInfo: {
      type: String,
      enum: [
        "flatFee",
        "garnishment",
        "plan250",
        "plan500",
        "plan9010",
        "plan955",
        "plan8515",
        "plan5050",
        "plan8020",
        "plan150",
        "buyerRebate",
        "noFee",
        "",
      ],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);
