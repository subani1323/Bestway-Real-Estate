const express = require("express");
const router = express.Router();
const CompleteListingInfo = require("../models/CompleteListingInfo");

// Helper function to create dates in local timezone to avoid UTC conversion issues
const createLocalDate = (dateInput) => {
  if (!dateInput) return null;

  // If it's already a Date object, return it
  if (dateInput instanceof Date) {
    return dateInput;
  }

  // If it's a string, parse it and create in local timezone
  if (typeof dateInput === "string") {
    // Handle ISO date strings (YYYY-MM-DD)
    if (dateInput.includes("-")) {
      const [year, month, day] = dateInput.split("-");
      if (year && month && day) {
        // Create date in local timezone (month is 0-indexed in Date constructor)
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
  }

  // Fallback to original method
  return new Date(dateInput);
};

// Add a test endpoint
router.get("/test", (req, res) => {
  try {
    res.json({ message: "Test endpoint is working" });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res
      .status(500)
      .json({ message: "Test endpoint error", error: error.message });
  }
});

// Get next listing number
router.get("/next-number", async (req, res) => {
  try {
    const lastListing = await CompleteListingInfo.findOne().sort({
      listingNumber: -1,
    });
    
    if (!lastListing) {
      // If no listings exist, start from 100
      return res.json({ nextNumber: 100 });
    }
    
    // Ensure the next number is at least 100
    const nextNumber = Math.max(lastListing.listingNumber + 1, 100);
    res.json({ nextNumber });
  } catch (error) {
    console.error("Error getting next listing number:", error);
    res.status(500).json({
      message: "Error getting next listing number",
      error: error.message,
    });
  }
});

// Create a new complete listing with simplified error handling
router.post("/", async (req, res) => {
  try {
    console.log("Received request to create a new listing");

    // Create a minimal listing for testing
    const minimalListing = {
      address: {
        streetNumber: req.body.address?.streetNumber || "",
        streetName: req.body.address?.streetName || "",
      },
      seller: {
        name: req.body.seller?.name || "",
      },
      status: req.body.status || "Available",
    };

    console.log("Creating minimal listing:", minimalListing);

    const listing = new CompleteListingInfo(minimalListing);
    const savedListing = await listing.save();

    console.log("Listing saved successfully with ID:", savedListing._id);
    res.status(201).json(savedListing);
  } catch (error) {
    console.error("Error creating listing:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
    }

    res.status(500).json({
      message: "Error creating listing",
      error: error.message,
    });
  }
});

// Get all complete listings
router.get("/", async (req, res) => {
  try {
    const listings = await CompleteListingInfo.find().sort({
      listingNumber: 1,
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complete listings",
      error: error.message,
    });
  }
});

// Get a single complete listing by ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await CompleteListingInfo.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Complete listing not found" });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complete listing",
      error: error.message,
    });
  }
});

// Update a complete listing
router.put("/:id", async (req, res) => {
  try {
    const {
      address = {},
      seller = {},
      commission = {},
      primaryAgent = {},
      dates = {},
      prices = {},
      propertyType,
      status,
      mlsNumber,
      weManage,
      people = [],
      agents = [],
    } = req.body;

    console.log("Updating complete listing with data:", req.body);

    const listingData = {
      address: {
        streetNumber: (address.streetNumber || "").trim(),
        streetName: (address.streetName || "").trim(),
        unit: (address.unit || "").trim(),
        province: (address.province || "").trim(),
        postalCode: (address.postalCode || "").trim(),
      },
      seller: {
        name: (seller.name || "").trim(),
        phoneNumber: (seller.phoneNumber || "").trim(),
      },
      commission: {
        list: parseFloat(commission.list) || 0,
        sell: parseFloat(commission.sell) || 0,
      },
      propertyType: propertyType || "",
      status: status || "",
      primaryAgent: {
        name: (primaryAgent.name || "").trim(),
        officeNumber: (primaryAgent.officeNumber || "").trim(),
        isLead: primaryAgent.isLead === true || primaryAgent.isLead === "true",
      },
      mlsNumber: (mlsNumber || "").trim(),
      dates: {
        listing: dates.listing ? createLocalDate(dates.listing) : null,
        entry: dates.entry ? createLocalDate(dates.entry) : null,
        expiry: dates.expiry ? createLocalDate(dates.expiry) : null,
        sold: dates.sold ? createLocalDate(dates.sold) : null,
        lastEdit: new Date(),
      },
      weManage: weManage === true || weManage === "true",
      prices: {
        listed: parseFloat(prices.listed) || 0,
        sold: prices.sold ? parseFloat(prices.sold) : null,
      },
      people: people,
      agents: agents,
    };

    const updatedListing = await CompleteListingInfo.findByIdAndUpdate(
      req.params.id,
      listingData,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Complete listing not found" });
    }

    console.log("Complete listing updated:", updatedListing);
    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating complete listing:", error);
    res.status(500).json({
      message: "Error updating complete listing",
      error: error.message,
    });
  }
});

// Delete a complete listing
router.delete("/:id", async (req, res) => {
  try {
    const listing = await CompleteListingInfo.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Complete listing not found" });
    }
    res.json({ message: "Complete listing deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting complete listing",
      error: error.message,
    });
  }
});

module.exports = router;
