const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");

// GET: next vendor number
router.get("/next-vendor-no", async (req, res) => {
  try {
    const vendors = await Vendor.find({}, { vendorNumber: 1 });
    const maxNo = vendors.reduce(
      (max, v) => (v.vendorNumber > max ? v.vendorNumber : max),
      0
    );
    res.json({ nextVendorNo: maxNo + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: all vendors
router.get("/", async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ vendorNumber: 1 });
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: single vendor by vendor number
router.get("/vendor/:vendorNo", async (req, res) => {
  try {
    const vendorNo = parseInt(req.params.vendorNo);
    if (isNaN(vendorNo)) {
      return res.status(400).json({ message: "Invalid vendor number" });
    }

    const vendor = await Vendor.findOne({ vendorNumber: vendorNo });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: single vendor by ID
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: vendor with all EFTs
router.get("/:id/with-efts", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(
      "generalAccountEFTs"
    );

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST: create new vendor
router.post("/", async (req, res) => {
  try {
    const {
      vendorNumber,
      firstName,
      lastName,
      streetNumber,
      streetName,
      unit,
      postalCode,
      city,
      province,
      phoneNumber,
      companyName,
    } = req.body;

    const newVendor = new Vendor({
      vendorNumber,
      firstName,
      lastName,
      streetNumber,
      streetName,
      unit,
      postalCode,
      city,
      province,
      phoneNumber,
      companyName,
    });

    const savedVendor = await newVendor.save();
    res.status(201).json(savedVendor);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PUT: update vendor
router.put("/:id", async (req, res) => {
  try {
    const {
      vendorNumber,
      firstName,
      lastName,
      streetNumber,
      streetName,
      unit,
      postalCode,
      city,
      province,
      phoneNumber,
      companyName,
    } = req.body;

    const updated = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        vendorNumber,
        firstName,
        lastName,
        streetNumber,
        streetName,
        unit,
        postalCode,
        city,
        province,
        phoneNumber,
        companyName,
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Vendor not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE: remove vendor
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vendor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Vendor not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
