const express = require("express");
const router = express.Router();
const MiscSettings = require("../models/MiscSettings");

// Get all misc settings
router.get("/", async (req, res) => {
  try {
    const settings = await MiscSettings.find().sort({ createdAt: -1 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get and increment EFT number
router.get("/next-eft", async (req, res) => {
  try {
    let settings = await MiscSettings.findOne();
    if (!settings) {
      // If no settings exist, create one with default values
      settings = new MiscSettings({
        lastListing: 0,
        lastTrade: 0,
        lastEFT: 0, // Start at 0, will be incremented to 1
        compassDirection: "Lorem Ipsum 1", //Default value
        cdaAddress: "Lorem Ipsum 1", //Default value
        multipleOffices: "No", //Default value
        mainOfficeNumber: 1, //Default value
        hstNumber: 0, //Default value
        payrollNumber: 0, //Default value
        expStmtAddress: "Lorem Ipsum 1", //Default value
        openingBalanceFormat: "Lorem Ipsum 1", //Default value
      });
    }
    settings.lastEFT += 1;
    await settings.save();
    res.json({ eftNumber: settings.lastEFT });
  } catch (error) {
    console.error("Error in /next-eft:", error);
    res
      .status(500)
      .json({
        message: "Error fetching next EFT number",
        error: error.message,
      });
  }
});

// Get a single misc setting
router.get("/:id", async (req, res) => {
  try {
    const setting = await MiscSettings.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create misc settings
router.post("/", async (req, res) => {
  const setting = new MiscSettings({
    lastListing: req.body.lastListing,
    lastTrade: req.body.lastTrade,
    compassDirection: req.body.compassDirection,
    cdaAddress: req.body.cdaAddress,
    multipleOffices: req.body.multipleOffices,
    mainOfficeNumber: req.body.mainOfficeNumber,
    hstNumber: req.body.hstNumber,
    payrollNumber: req.body.payrollNumber,
    expStmtAddress: req.body.expStmtAddress,
    openingBalanceFormat: req.body.openingBalanceFormat,
  });

  try {
    const newSetting = await setting.save();
    res.status(201).json(newSetting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update misc settings
router.put("/:id", async (req, res) => {
  try {
    const setting = await MiscSettings.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    setting.lastListing = req.body.lastListing;
    setting.lastTrade = req.body.lastTrade;
    setting.compassDirection = req.body.compassDirection;
    setting.cdaAddress = req.body.cdaAddress;
    setting.multipleOffices = req.body.multipleOffices;
    setting.mainOfficeNumber = req.body.mainOfficeNumber;
    setting.hstNumber = req.body.hstNumber;
    setting.payrollNumber = req.body.payrollNumber;
    setting.expStmtAddress = req.body.expStmtAddress;
    setting.openingBalanceFormat = req.body.openingBalanceFormat;

    const updatedSetting = await setting.save();
    res.json(updatedSetting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete misc settings
router.delete("/:id", async (req, res) => {
  try {
    const setting = await MiscSettings.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    await MiscSettings.findByIdAndDelete(req.params.id);
    res.json({ message: "Settings deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
