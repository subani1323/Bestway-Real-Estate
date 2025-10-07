const express = require("express");
const router = express.Router();
const CompanyProfile = require("../models/CompanyProfile");

// Create company profile
router.post("/", async (req, res) => {
  try {
    const companyProfile = new CompanyProfile(req.body);
    await companyProfile.save();

    res.status(201).json({
      message: "Company profile created successfully",
      data: companyProfile,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A company with this email already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get company profile
router.get("/", async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne();
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    res.json(companyProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update company profile
router.put("/:id", async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json({
      message: "Company profile updated successfully",
      data: companyProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete company profile
router.delete("/:id", async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findByIdAndDelete(
      req.params.id
    );
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    res.json({ message: "Company profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
