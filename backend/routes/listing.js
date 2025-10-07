const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/Listing");

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

// Get next listing number
router.get("/next-number", async (req, res) => {
  try {
    // Find the highest valid sequential listing number
    const validListings = await Listing.find({
      listingNumber: { $lt: 1000 }, // Only consider reasonable listing numbers
    }).sort({ listingNumber: -1 });

    if (validListings.length === 0) {
      // If no listings exist, start from 100
      return res.json({ nextNumber: 100 });
    }

    // Get the highest valid listing number
    const maxNo = validListings[0].listingNumber;

    // Ensure the next number is at least 100
    const nextNumber = Math.max(maxNo + 1, 100);

    console.log("Next sequential listing number:", nextNumber);

    res.json({ nextNumber });
  } catch (error) {
    console.error("Error getting next listing number:", error);
    res.status(500).json({
      message: "Error getting next listing number",
      error: error.message,
    });
  }
});

// Create a new listing - ensure sequential numbering
router.post("/", async (req, res) => {
  try {
    // Get the next sequential number
    const validListings = await Listing.find({
      listingNumber: { $lt: 1000 }, // Only consider reasonable listing numbers
    }).sort({ listingNumber: -1 });

    let nextNumber = 100; // Default start

    if (validListings.length > 0) {
      // Get the highest valid listing number and ensure it's at least 100
      const maxNo = validListings[0].listingNumber;
      nextNumber = Math.max(maxNo + 1, 100);
    }

    // Destructure nested objects from req.body
    const {
      address = {},
      seller = {},
      commission = {},
      agent = {},
      dates = {},
      prices = {},
      propertyType,
      dealType,
      status,
      mlsNumber,
      weManage,
      people = [], // Ensure people array is captured
      agents = [], // Ensure agents array is captured
    } = req.body;

    console.log("Received listing data:", req.body);
    console.log("People data:", people);
    console.log("Agents data:", agents);
    console.log("Using listing number:", nextNumber);

    // Transform the data to match the schema
    const listingData = {
      listingNumber: nextNumber, // Use the sequential number
      address: {
        streetNumber: (address.streetNumber || "").trim(),
        streetName: (address.streetName || "").trim(),
        unit: (address.unit || "").trim(),
        city: (address.city || "").trim(),
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
      dealType: dealType || "",
      status: status || "",
      agent: {
        employeeNo: (agent.employeeNo || "").trim(),
        officeNumber: (agent.officeNumber || "").trim(),
        isLead: agent.isLead === true || agent.isLead === "true",
      },
      mlsNumber: (mlsNumber || "").trim(),
      dates: {
        listing: dates.listing ? createLocalDate(dates.listing) : null,
        entry: dates.entry ? createLocalDate(dates.entry) : null,
        expiry: dates.expiry ? createLocalDate(dates.expiry) : null,
        sold: dates.sold ? createLocalDate(dates.sold) : null,
      },
      weManage: weManage === true || weManage === "true",
      prices: {
        listed: parseFloat(prices.listed) || 0,
        sold: prices.sold ? parseFloat(prices.sold) : null,
      },
      people: people, // Add people array directly
      agents: agents, // Add agents array directly
    };

    console.log("Creating listing with data:", listingData);
    const listing = new Listing(listingData);
    const savedListing = await listing.save();

    console.log("Listing saved:", savedListing);
    res.status(201).json(savedListing);
  } catch (error) {
    console.error(
      "Full error object during listing creation:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    res.status(500).json({
      message: "Error creating listing",
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      details: error.errors
        ? Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
            kind: error.errors[key].kind,
            value: error.errors[key].value,
          }))
        : error.reason
        ? { reason: error.reason }
        : null,
    });
  }
});

// Get all listings
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ listingNumber: 1 });
    res.json(listings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching listings", error: error.message });
  }
});

// Get a single listing by ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching listing", error: error.message });
  }
});

// Get listing by listing number
router.get("/by-number/:number", async (req, res) => {
  console.log("Route hit: GET /api/listings/by-number/" + req.params.number);
  try {
    const listingNumber = parseInt(req.params.number);

    if (isNaN(listingNumber)) {
      return res.status(400).json({ message: "Invalid listing number" });
    }

    const listing = await Listing.findOne({ listingNumber });
    console.log("Listing search result:", listing ? "Found" : "Not found");

    if (!listing) {
      console.log("No listing found with number:", listingNumber);
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log("Found listing:", listing.listingNumber);
    res.json(listing);
  } catch (error) {
    console.error("Error fetching listing by number:", error);
    res.status(500).json({
      message: "Error fetching listing by number",
      error: error.message,
    });
  }
});

// Get people for a specific listing by listing number
router.get("/:number/people", async (req, res) => {
  try {
    const listingNumber = parseInt(req.params.number);
    if (isNaN(listingNumber)) {
      return res.status(400).json({ message: "Invalid listing number" });
    }
    const listing = await Listing.findOne({ listingNumber });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing.people || []);
  } catch (error) {
    console.error("Error fetching people for listing:", error);
    res.status(500).json({
      message: "Error fetching people for listing",
      error: error.message,
    });
  }
});

// Get agents for a specific listing by listing number
router.get("/:number/agents", async (req, res) => {
  try {
    const listingNumber = parseInt(req.params.number);
    if (isNaN(listingNumber)) {
      return res.status(400).json({ message: "Invalid listing number" });
    }
    const listing = await Listing.findOne({ listingNumber });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing.agents || []);
  } catch (error) {
    console.error("Error fetching agents for listing:", error);
    res.status(500).json({
      message: "Error fetching agents for listing",
      error: error.message,
    });
  }
});

// Update a listing
router.put("/:id", async (req, res) => {
  try {
    const {
      address = {},
      seller = {},
      commission = {},
      agent = {},
      dates = {},
      prices = {},
      propertyType,
      dealType,
      status,
      mlsNumber,
      weManage,
      people = [],
      agents = [],
    } = req.body;

    console.log("Updating listing with data:", req.body);

    const listingData = {
      address: {
        streetNumber: (address.streetNumber || "").trim(),
        streetName: (address.streetName || "").trim(),
        unit: (address.unit || "").trim(),
        city: (address.city || "").trim(),
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
      dealType: dealType || "",
      status: status || "",
      agent: {
        employeeNo: (agent.employeeNo || "").trim(),
        officeNumber: (agent.officeNumber || "").trim(),
        isLead: agent.isLead === true || agent.isLead === "true",
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

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      listingData,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log("Listing updated:", updatedListing);
    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({
      message: "Error updating listing",
      error: error.message,
    });
  }
});

// Delete a listing
router.delete("/:id", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting listing", error: error.message });
  }
});

// Add note endpoints
router.get("/:id/note", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ note: listing.note || "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching note", error: error.message });
  }
});

router.put("/:id/note", async (req, res) => {
  try {
    const { note } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { note },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ note: listing.note });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating note", error: error.message });
  }
});

module.exports = router;
