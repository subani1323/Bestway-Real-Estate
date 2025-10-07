require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet"); // Add this for security
const rateLimit = require("express-rate-limit"); // Add this for rate limiting

const app = express();

// Security middleware - ADD THIS FIRST
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for React app
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting to prevent attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Add request validation middleware to reject malicious requests
app.use((req, res, next) => {
  // Block requests with malicious patterns
  const maliciousPatterns = [
    /cgi-bin/,
    /%32%65/,
    /\.\./,
    /\/bin\/sh/,
    /\/etc\/passwd/,
    /eval\(/,
    /<script/i,
  ];

  const url = decodeURIComponent(req.url);

  for (const pattern of maliciousPatterns) {
    if (pattern.test(url) || pattern.test(req.url)) {
      console.log(
        `=« Blocked malicious request: ${req.method} ${req.url} from ${req.ip}`
      );
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  next();
});

// CORS Configuration for subdomains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5001",
      "http://107.161.34.44:5001",
      "https://savemax.brokeragelead.ca",
      "http://savemax.brokeragelead.ca",
      "https://api.brokeragelead.ca",
      "http://api.brokeragelead.ca",
      "https://brokeragelead.ca",
      "http://brokeragelead.ca",
      "https://www.brokeragelead.ca",
      "http://www.brokeragelead.ca",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  // Skip logging for static files and common bot requests
  if (
    req.url.match(/\.(css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    return next();
  }

  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - Host: ${req.get(
      "host"
    )} - Origin: ${req.get("origin") || "none"} - IP: ${req.ip}`
  );
  next();
});

// Handle different hosts/domains
app.use((req, res, next) => {
  const host = req.get("host");

  // Set proper headers for all domains
  res.header("Access-Control-Allow-Origin", req.get("origin") || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length) {
  console.error(`Missing environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// API Routes - these should come BEFORE the React app serving
app.get("/api", (req, res) => {
  res.json({
    message: "=¬ Savemax 365 Realty API is running...",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    host: req.get("host"),
    endpoints: {
      health: "/api/health",
      listings: "/api/listings",
      agents: "/api/agents",
      reminders: "/api/reminders",
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    host: req.get("host"),
    server_ip: "107.161.34.44",
    mongo: {
      status: statusMap[mongoStatus] || "unknown",
      readyState: mongoStatus,
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      mongoUriConfigured: !!process.env.MONGO_URI,
    },
  });
});

// Test DELETE route
app.delete("/api/pingdelete", (req, res) => {
  console.log("!!! /api/pingdelete route hit !!!");
  res.status(200).json({ message: "DELETE ping successful!" });
});

// API Routes
const reminderRoutes = require("./routes/reminder");
const ledgerRoutes = require("./routes/ledger");
const companyProfileRoutes = require("./routes/companyProfileRoutes");
const mlsFeeRoutes = require("./routes/mlsFee");
const miscSettingsRoutes = require("./routes/miscSettings");
const listingRoutes = require("./routes/listing");
const agentRoutes = require("./routes/agent");
const completeListingInfoRoutes = require("./routes/completeListingInfo");
const tradesRouter = require("./routes/trades");
const eftRouter = require("./routes/eft");
const realEstateTrustEFTRouter = require("./routes/realEstateTrustEFT");
const commissionTrustEFTRouter = require("./routes/commissionTrustEFT");
const generalAccountEFTRouter = require("./routes/generalAccountEFT");
const transactionRouter = require("./routes/transactions");
const financeTransactionRouter = require("./routes/financeTransactions");
const vendorRoutes = require("./routes/vendor");
const generalLedgerSetupRoutes = require("./routes/generalLedgerSetup");
const reconciliationSettingsRoutes = require("./routes/reconciliationSettings");
const outsideBrokerRoutes = require("./routes/outsideBroker");
const lawyerRoutes = require("./routes/lawyer");
const emailRoutes = require('./routes/email'); // Add email router

// API Routes Registration
app.use("/api/reminders", reminderRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/company-profile", companyProfileRoutes);
app.use("/api/mls-fees", mlsFeeRoutes);
app.use("/api/misc-settings", miscSettingsRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/complete-listings", completeListingInfoRoutes);
app.use("/api/trades", tradesRouter);
app.use("/api/eft", eftRouter);
app.use("/api/real-estate-trust-eft", realEstateTrustEFTRouter);
app.use("/api/commission-trust-eft", commissionTrustEFTRouter);
app.use("/api/general-account-eft", generalAccountEFTRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/finance-transactions", financeTransactionRouter);
app.use("/api/vendors", vendorRoutes);
app.use("/api/general-ledger-setup", generalLedgerSetupRoutes);
app.use("/api/reconciliation-settings", reconciliationSettingsRoutes);
app.use("/api/outside-brokers", outsideBrokerRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use('/api/email', emailRoutes); // Use email router

// Test endpoint
app.get("/api/test-listing-route/:number", async (req, res) => {
  try {
    res.json({
      message: "Test endpoint is working",
      number: req.params.number,
      host: req.get("host"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve React App for Frontend Routes (Production only)
if (process.env.NODE_ENV === "production") {
  // Serve static files from React build
  app.use(
    express.static(path.join(__dirname, "../frontend/build"), {
      maxAge: "1h", // Cache static files for 1 hour
      etag: true,
    })
  );

  // Handle React routing - return all non-API requests to React app
  app.get("*", (req, res) => {
    // Check if it's an API request that wasn't handled above
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    // Serve React app for all other routes (including root "/")
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/realestatedb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(" MongoDB connected successfully");
    testMongoConnection();
  })
  .catch((err) => {
    console.error("L MongoDB connection error:", err);
    console.error(
      "Connection string used:",
      process.env.MONGO_URI
        ? "***HIDDEN***"
        : "mongodb://localhost:27017/realestatedb"
    );
  });

// Test MongoDB connection
const testMongoConnection = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "MongoDB connection is not ready. Current state:",
        mongoose.connection.readyState
      );
      return false;
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log(
      " MongoDB connection is healthy. Available collections:",
      collections.map((c) => c.name).join(", ")
    );

    return true;
  } catch (error) {
    console.error("L MongoDB connection is not healthy:", error);
    return false;
  }
};

// Global Error Handling
const errorHandler = (err, req, res, next) => {
  // Don't log URI decode errors from attacks
  if (
    err.name === "URIError" &&
    err.message.includes("Failed to decode param")
  ) {
    console.log(`=« Blocked malicious URI: ${req.url} from ${req.ip}`);
    return res.status(400).json({ error: "Bad Request" });
  }

  console.error("Global error handler caught:");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error:
      process.env.NODE_ENV === "production"
        ? {}
        : {
            stack: err.stack,
            name: err.name,
          },
  });
};

app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n= Received SIGINT. Graceful shutdown...");
  try {
    await mongoose.connection.close();
    console.log(" MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("L Error during graceful shutdown:", error);
    process.exit(1);
  }
});

// Start Server - Bind to all interfaces
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`=€ Server running on port ${PORT}`);
  console.log(`<
 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`=Í Server IP: 107.161.34.44:${PORT}`);
  console.log(`= Available on:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Network: http://107.161.34.44:${PORT}`);
  console.log(`   - API: http://localhost:${PORT}/api`);

  if (process.env.NODE_ENV === "production") {
    console.log(`< Production URLs:`);
    console.log(`   - Frontend: http://savemax.brokeragelead.ca`);
    console.log(`   - API: http://savemax.brokeragelead.ca/api`);
    console.log(`   - Health: http://savemax.brokeragelead.ca/api/health`);
  }
});
