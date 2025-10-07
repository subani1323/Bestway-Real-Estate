const mongoose = require("mongoose");

const KeyInfoSchema = new mongoose.Schema(
  {
    listingNumber: String,
    tradeNumber: Number,
    status: String,
    streetNumber: String,
    streetName: String,
    unit: String,
    city: String,
    province: String,
    postalCode: String,
    offerDate: String,
    firmDate: String,
    closeDate: String,
    entryDate: String,
    finalizedDate: String,
    sellPrice: String,
    mlsNumber: String,
    propertyType: String,
    dealType: String,
    weManage: String,
    classification: String,
    firm: String,
    listCommission: String,
    sellCommission: String,
  },
  { _id: false }
);

const ConditionSchema = new mongoose.Schema(
  {
    conditionText: { type: String, required: true },
    dueDate: { type: String, required: true },
    conditionMetDate: { type: String, default: "" },
  },
  { _id: false }
);

const PersonSchema = new mongoose.Schema(
  {
    type: String,
    firstName: String,
    lastName: String,
    email: String,
    primaryPhone: String,
    cellPhone: String,
    address: String,
    end: String,
    companyName: String,
  },
  { _id: false }
);

const BrokerSchema = new mongoose.Schema(
  {
    type: String,
    firstName: String,
    lastName: String,
    company: String,
    email: String,
    payBroker: String,
    end: String,
    primaryPhone: String,
    chargedHST: String,
    address: String,
    sellingAmount: String,
    tax: String,
    total: String,
  },
  { _id: false }
);

const TrustRecordSchema = new mongoose.Schema(
  {
    weHold: String,
    heldBy: String,
    received: String,
    depositDate: String,
    receivedFrom: String,
    amount: String,
    reference: String,
    paymentType: String,
    currency: String,
    earnInterest: String,
    // Add more fields if needed
  },
  { _id: false }
);

const CommissionSchema = new mongoose.Schema(
  {
    saleClosingRows: Array,
    commissionIncomeRows: Array,
    outsideBrokersRows: Array,
    // Add more fields if needed
  },
  { _id: false }
);

const AgentCommissionSchema = new mongoose.Schema(
  {
    agentId: String,
    agentName: String,
    classification: String,
    ytdCommission: String,
    awardAmount: String,
    percentage: Number,
    amount: String,
    feeInfo: String,
    feesDeducted: String,
    tax: String,
    taxOnFees: String,
    total: String,
    totalFees: String,
    netCommission: String,
    lead: String,
    buyerRebateIncluded: String,
    buyerRebateAmount: String,
  },
  { _id: false }
);

const TradeSchema = new mongoose.Schema(
  {
    tradeNumber: { type: Number, required: true, unique: true, min: 200 },
    keyInfo: KeyInfoSchema,
    people: [PersonSchema],
    outsideBrokers: [BrokerSchema],
    trustRecords: [TrustRecordSchema],
    commission: CommissionSchema,
    agentCommissionList: [AgentCommissionSchema],
    conditions: [ConditionSchema],
    // EFT References
    realEstateTrustEFTs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RealEstateTrustEFT",
      },
    ],
    commissionTrustEFTs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommissionTrustEFT",
      },
    ],
    isFinalized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", TradeSchema);
