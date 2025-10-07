const mongoose = require("mongoose");

const CompleteTradeSchema = new mongoose.Schema({
  keyInfo: { type: Object, required: true },
  people: { type: Array, default: [] },
  outsideBrokers: { type: Array, default: [] },
  trust: { type: Array, default: [] },
  commissions: { type: Object, default: {} },
  agentInfo: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CompleteTrade", CompleteTradeSchema);
