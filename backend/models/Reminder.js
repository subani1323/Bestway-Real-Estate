const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  date: { type: String, required: true }, // or Date if you prefer
  reminder: { type: String, required: true },
});

module.exports = mongoose.model("Reminder", reminderSchema);
