const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Ledger = require("../models/Ledger");

// Create a new transaction
router.post("/", async (req, res) => {
  try {
    const {
      date,
      reference,
      description,
      debitAccount,
      creditAccount,
      amount,
      tradeId,
    } = req.body;

    const newTransaction = new Transaction({
      date,
      reference,
      description,
      debitAccount,
      creditAccount,
      amount,
      tradeId,
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res
      .status(500)
      .json({ message: "Server error while creating transaction" });
  }
});

// Get all transactions within a date range
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};
    if (from && to) {
      const startDate = new Date(from);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setUTCHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    const transactions = await Transaction.find(query).sort({ date: 1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching transactions" });
  }
});

// Get transactions by account number within a date range
router.get("/account/:accountNumber", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "fromDate and toDate are required" });
    }

    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    // Find transactions where the account appears in either debitAccount or creditAccount
    const transactions = await Transaction.find({
      $or: [{ debitAccount: accountNumber }, { creditAccount: accountNumber }],
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("tradeId")
      .sort({ date: 1 });

    // Transform the data to include type (Credit/Debit) and trade information
    const transformedTransactions = transactions.map((transaction) => {
      const isCredit = transaction.creditAccount === accountNumber;
      const isDebit = transaction.debitAccount === accountNumber;

      return {
        _id: transaction._id,
        date: transaction.date,
        reference: transaction.reference,
        description: transaction.description,
        amount: isCredit ? transaction.amount : -transaction.amount, // Negative for debits
        type: isCredit ? "Credit" : "Debit",
        tradeNumber: transaction.tradeId?.tradeNumber || null,
        tradeId: transaction.tradeId?._id || null,
        debitAccount: transaction.debitAccount,
        creditAccount: transaction.creditAccount,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };
    });

    res.json(transformedTransactions);
  } catch (error) {
    console.error("Error fetching transactions by account:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching transactions by account" });
  }
});

// Get income statement totals for specified accounts within a date range
router.post("/income-statement", async (req, res) => {
  try {
    const { from, to } = req.query;
    const { localStorageTransactions = [] } = req.body;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "From and to dates are required" });
    }

    const startDate = new Date(from);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(to);
    endDate.setUTCHours(23, 59, 59, 999);

    // Account mappings and section structure as per original sample
    const structure = [
      { type: "header", label: "GROSS COMMISSION EARNED" },
      { type: "line", acct: "40100", label: "COMMISSION INCOME" },
      { type: "line", acct: "51100", label: "COMMISSION TO OTHER BROKERS" },
      {
        type: "subtotal",
        key: "grossCommissionEarned",
        label: "GROSS COMMISSION EARNED",
      },
      { type: "header", label: "AGENT'S COMMISSION EXPENSE" },
      { type: "line", acct: "50100", label: "AGENT'S COMMISSION" },
      {
        type: "subtotal",
        key: "agentsCommissionExpense",
        label: "AGENT'S COMMISSION EXPENSE",
      },
      { type: "header", label: "NET COMMISSION" },
      { type: "line", acct: "44100", label: "BROKERAGE PORTION OF COMMISSION" },
      { type: "subtotal", key: "netCommission", label: "NET COMMISSION" },
      { type: "header", label: "OTHER INCOME" },
      { type: "line", acct: "43100", label: "OTHER INCOME" },
      { type: "subtotal", key: "otherIncome", label: "OTHER INCOME" },
      { type: "subtotal", key: "grossIncome", label: "GROSS INCOME" },
      { type: "header", label: "SELLING & ADMINISTRATIVE EXPENSES" },
      { type: "header", label: "RENT & OCCUPANCY", indent: 1 },
      {
        type: "line",
        acct: "62101",
        label: "RENT & OCC. - RENT EXPENSE",
        indent: 2,
      },
      {
        type: "line",
        acct: "62102",
        label: "RENT & OCC. - RENT EXPENSE",
        indent: 2,
      },
      {
        type: "line",
        acct: "62103",
        label: "RENT & OCC. - UTILITIES",
        indent: 2,
      },
      {
        type: "line",
        acct: "62104",
        label: "RENT & OCC. - UTILITIES",
        indent: 2,
      },
      {
        type: "line",
        acct: "62105",
        label: "RENT & OCC. - UTILITIES",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "rentOccupancy",
        label: "TOTAL RENT & OCCUPANCY",
        indent: 1,
      },

      { type: "header", label: "LICENSES & INSURANCE", indent: 1 },
      { type: "line", acct: "63199", label: "LIC. & INS. - MISC.", indent: 2 },
      { type: "line", acct: "63102", label: "LIC. & INS. - MISC.", indent: 2 },
      { type: "line", acct: "63103", label: "LIC. & INS. - MISC.", indent: 2 },
      {
        type: "subtotal",
        key: "licensesInsurance",
        label: "TOTAL LICENSES & INSURANCE",
        indent: 1,
      },

      { type: "header", label: "FRANCHISE COSTS", indent: 1 },
      {
        type: "line",
        acct: "69101",
        label: "FRANCHISE COSTS - MEMBERSHIP",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "franchiseCosts",
        label: "TOTAL FRANCHISE COSTS",
        indent: 1,
      },

      { type: "header", label: "LABOUR EXPENSES", indent: 1 },
      {
        type: "line",
        acct: "70101",
        label: "PAYROLL EXP. - FULL-TIME",
        indent: 2,
      },
      {
        type: "line",
        acct: "70103",
        label: "PAYROLL EXP. - PART-TIME",
        indent: 2,
      },
      {
        type: "line",
        acct: "70104",
        label: "PAYROLL EXP. - PAYROLL",
        indent: 2,
      },
      {
        type: "line",
        acct: "70105",
        label: "PAYROLL EXP. - CONTRACTORS",
        indent: 2,
      },
      {
        type: "line",
        acct: "70199",
        label: "PAYROLL EXP. - MISC.",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "labourExpenses",
        label: "TOTAL LABOUR EXPENSES",
        indent: 1,
      },

      { type: "header", label: "BANK CHARGES", indent: 1 },
      {
        type: "line",
        acct: "71102",
        label: "BANK CHARGES - LOAN INTEREST",
        indent: 2,
      },
      {
        type: "line",
        acct: "71104",
        label: "BANK CHARGES - SERVICE CHARGES",
        indent: 2,
      },
      {
        type: "line",
        acct: "71199",
        label: "BANK CHARGES - MISC.",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "bankCharges",
        label: "TOTAL BANK CHARGES",
        indent: 1,
      },

      { type: "header", label: "COMMUNICATION EXPENSES", indent: 1 },
      {
        type: "line",
        acct: "72101",
        label: "COMMUN. EXP. - TELEPHONE LINES",
        indent: 2,
      },
      {
        type: "line",
        acct: "72102",
        label: "COMMUN. EXP. - INTERNET",
        indent: 2,
      },
      {
        type: "line",
        acct: "72103",
        label: "COMMUN. EXP. - ANSWERING SERVICE",
        indent: 2,
      },
      {
        type: "line",
        acct: "72199",
        label: "COMMUN. EXP. - MISC.",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "communicationExpenses",
        label: "TOTAL COMMUNICATION EXPENSES",
        indent: 1,
      },

      { type: "header", label: "OFFICE EXPENSES & SUPPLIES", indent: 1 },
      {
        type: "line",
        acct: "75102",
        label: "OFFICE EXP. - SUPPLIES",
        indent: 2,
      },
      {
        type: "line",
        acct: "75103",
        label: "OFFICE EXP. - EQUIPMENT",
        indent: 2,
      },
      {
        type: "line",
        acct: "75104",
        label: "OFFICE EXP. - POSTAGE",
        indent: 2,
      },
      {
        type: "line",
        acct: "75105",
        label: "OFFICE EXP. - VEHICLE EXP",
        indent: 2,
      },
      {
        type: "line",
        acct: "75117",
        label: "OFFICE EXP. - MAINTENANCE",
        indent: 2,
      },
      {
        type: "line",
        acct: "75199",
        label: "OFFICE EXP. - MISC.",
        indent: 2,
      },
      {
        type: "line",
        acct: "52100",
        label: "REFERRAL FEES",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "officeExpenses",
        label: "TOTAL OFFICE EXPENSES & SUPPLIES",
        indent: 1,
      },

      { type: "header", label: "PROFESSIONAL FEES", indent: 1 },
      {
        type: "line",
        acct: "76103",
        label: "PROFESSIONAL FEES - CONSULTING",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "professionalFees",
        label: "TOTAL PROFESSIONAL FEES",
        indent: 1,
      },

      { type: "header", label: "DEPRECIATION", indent: 1 },
      {
        type: "line",
        acct: "79101",
        label: "DEPRECIATION EXPENSE",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "depreciation",
        label: "TOTAL DEPRECIATION",
        indent: 1,
      },

      { type: "header", label: "FEDERAL INCOME TAXES", indent: 1 },
      {
        type: "line",
        acct: "90101",
        label: "FEDERAL INCOME TAXES",
        indent: 2,
      },
      {
        type: "subtotal",
        key: "federalIncomeTaxes",
        label: "TOTAL FEDERAL INCOME TAXES",
        indent: 1,
      },
      {
        type: "subtotal",
        key: "totalSellingAdmin",
        label: "TOTAL SELLING & ADMINISTRATIVE EXPENSES",
        indent: 0,
      },
      {
        type: "subtotal",
        key: "netIncomeBeforeTax",
        label: "NET INCOME BEFORE TAX",
        indent: 0,
      },
      {
        type: "subtotal",
        key: "netIncome",
        label: "NET INCOME",
        indent: 0,
      },
    ];

    // Account mappings for calculation
    const accountMappings = {
      40100: "COMMISSION INCOME",
      51100: "COMMISSION TO OTHER BROKERS",
      50100: "AGENT'S COMMISSION",
      44100: "BROKERAGE PORTION OF COMMISSION",
      43100: "OTHER INCOME",
      62101: "RENT & OCC. - RENT EXPENSE",
      62102: "RENT & OCC. - RENT EXPENSE",
      62103: "RENT & OCC. - UTILITIES",
      62104: "RENT & OCC. - UTILITIES",
      62105: "RENT & OCC. - UTILITIES",
      63199: "LIC. & INS. - MISC.",
      63102: "LIC. & INS. - MISC.",
      63103: "LIC. & INS. - MISC.",
      69101: "FRANCHISE COSTS - MEMBERSHIP",
      70101: "PAYROLL EXP. - FULL-TIME",
      70103: "PAYROLL EXP. - PART-TIME",
      70104: "PAYROLL EXP. - PAYROLL",
      70105: "PAYROLL EXP. - CONTRACTORS",
      70199: "PAYROLL EXP. - MISC.",
      71102: "BANK CHARGES - LOAN INTEREST",
      71104: "BANK CHARGES - SERVICE CHARGES",
      71199: "BANK CHARGES - MISC.",
      72101: "COMMUN. EXP. - TELEPHONE LINES",
      72102: "COMMUN. EXP. - INTERNET",
      72103: "COMMUN. EXP. - ANSWERING SERVICE",
      72199: "COMMUN. EXP. - MISC.",
      75102: "OFFICE EXP. - SUPPLIES",
      75103: "OFFICE EXP. - EQUIPMENT",
      75104: "OFFICE EXP. - POSTAGE",
      75105: "OFFICE EXP. - VEHICLE EXP",
      75117: "OFFICE EXP. - MAINTENANCE",
      75199: "OFFICE EXP. - MISC.",
      52100: "REFERRAL FEES",
      76103: "PROFESSIONAL FEES - CONSULTING",
      79101: "DEPRECIATION EXPENSE",
      90101: "FEDERAL INCOME TAXES",
    };
    const accountNumbers = Object.keys(accountMappings);

    // Helper to get all ledger entries for an account up to a date (for closing balance)
    async function getClosingBalance(accountNumber, upToDate) {
      const entries = await Ledger.find({
        accountNumber,
        $or: [
          { chequeDate: { $lte: upToDate } },
          { date: { $lte: upToDate.toISOString().split('T')[0] } }
        ],
      });
      let debit = 0,
        credit = 0;
      entries.forEach((e) => {
        debit += e.debit || 0;
        credit += e.credit || 0;
      });
      return { debit, credit };
    }

    // Get all ledger entries for the period for all relevant accounts
    const ledgers = await Ledger.find({
      accountNumber: { $in: accountNumbers },
      $or: [
        { chequeDate: { $gte: startDate, $lte: endDate } },
        { date: { $gte: from, $lte: to } }
      ],
    });

    // Combine backend data with localStorage transactions
    const allEntries = [...localStorageTransactions, ...ledgers];

    // Debug logging
    console.log("Income Statement Debug:");
    console.log(
      "localStorageTransactions count:",
      localStorageTransactions.length
    );
    console.log("Backend ledgers count:", ledgers.length);
    console.log("Total allEntries count:", allEntries.length);
    console.log(
      "Sample localStorage transaction:",
      localStorageTransactions[0]
    );
    console.log("Sample backend ledger:", ledgers[0]);

    // Note: 46100 is mapped to 45100 in the database
    // This is handled in the accountTotals calculation above

    // Calculate totals for each account (same logic as trial balance)
    const accountTotals = {};
    for (const acct of accountNumbers) {
      accountTotals[acct] = {
        accountName: accountMappings[acct],
        debit: 0,
        credit: 0,
        total: 0,
      };
    }

    // Process all entries to calculate totals (same as trial balance)
    allEntries.forEach((entry) => {
      let acct = entry.accountNumber;
      if (acct === "45100") acct = "46100";
      if (accountTotals[acct]) {
        accountTotals[acct].debit += entry.debit || 0;
        accountTotals[acct].credit += entry.credit || 0;
      }
    });

    // Calculate balance for each account (same as trial balance)
    Object.keys(accountTotals).forEach((acct) => {
      const openingBalance = 0; // Assume opening balance is 0 for now
      const balance =
        openingBalance + accountTotals[acct].debit - accountTotals[acct].credit;
      accountTotals[acct].total = balance;
    });

    // Debug: Log account totals for expense accounts
    console.log("Account totals for expense accounts:");
    [
      "62101",
      "62102",
      "62103",
      "62104",
      "62105",
      "63199",
      "63102",
      "63103",
    ].forEach((acct) => {
      if (accountTotals[acct]) {
        console.log(
          `${acct}: debit=${accountTotals[acct].debit}, credit=${accountTotals[acct].credit}, total=${accountTotals[acct].total}`
        );
      }
    });

    // Debug: Check if localStorage transactions are being processed
    const localStorageAccountNumbers = localStorageTransactions.map(
      (t) => t.accountNumber
    );
    console.log("localStorage account numbers:", localStorageAccountNumbers);
    console.log("Expected account numbers:", accountNumbers);

    // Use trial balance calculation logic for all accounts
    // The total is already calculated as balance = openingBalance + debit - credit
    // For income statement purposes, we need to adjust some accounts:

    // For expense accounts (6xxxx, 7xxxx, 8xxxx, 9xxxx), show as positive values
    // For income accounts (4xxxx), show as positive values
    // For contra accounts like 51100 (commission to other brokers), show as negative

    // Special handling for 51100 - show as negative (contra account)
    if (accountTotals["51100"]) {
      accountTotals["51100"].total = -accountTotals["51100"].total;
    }

    // For expense accounts, we want to show the total as a positive value
    // The trial balance calculation gives us the net change (debit - credit)
    // For income statement, we want to show the total expenses as positive
    const expenseAccounts = [
      "62101",
      "62102",
      "62103",
      "62104",
      "62105", // Rent & Occupancy
      "63199",
      "63102",
      "63103", // Licenses & Insurance
      "69101", // Franchise Costs
      "70101",
      "70103",
      "70104",
      "70105",
      "70199", // Labour Expenses
      "71102",
      "71104",
      "71199", // Bank Charges
      "72101",
      "72102",
      "72103",
      "72199", // Communication Expenses
      "75102",
      "75103",
      "75104",
      "75105",
      "75117",
      "75199", // Office Expenses
      "76103", // Professional Fees
      "79101", // Depreciation
      "90101", // Federal Income Taxes
    ];

    // Ensure expense accounts show as positive values
    expenseAccounts.forEach((acct) => {
      if (accountTotals[acct]) {
        // For expense accounts, we want the absolute value
        accountTotals[acct].total = Math.abs(accountTotals[acct].total);
      }
    });

    // Subtotals for each section (fix: only sum the lines directly under each section)
    const grossCommissionEarned =
      (accountTotals["40100"]?.total || 0) -
      (accountTotals["51100"]?.total || 0);
    const agentsCommissionExpense = accountTotals["50100"]?.total || 0;
    const netCommission = accountTotals["44100"]?.total || 0;
    const otherIncome = accountTotals["43100"]?.total || 0;
    const grossIncome = netCommission + otherIncome;
    const rentOccupancy =
      (accountTotals["62101"]?.total || 0) +
      (accountTotals["62102"]?.total || 0) +
      (accountTotals["62103"]?.total || 0) +
      (accountTotals["62104"]?.total || 0) +
      (accountTotals["62105"]?.total || 0);
    const licensesInsurance =
      (accountTotals["63199"]?.total || 0) +
      (accountTotals["63102"]?.total || 0) +
      (accountTotals["63103"]?.total || 0);
    const franchiseCosts = accountTotals["69101"]?.total || 0;
    const labourExpenses =
      (accountTotals["70101"]?.total || 0) +
      (accountTotals["70103"]?.total || 0) +
      (accountTotals["70104"]?.total || 0) +
      (accountTotals["70105"]?.total || 0) +
      (accountTotals["70199"]?.total || 0);
    const bankCharges =
      (accountTotals["71102"]?.total || 0) +
      (accountTotals["71104"]?.total || 0) +
      (accountTotals["71199"]?.total || 0);
    const communicationExpenses =
      (accountTotals["72101"]?.total || 0) +
      (accountTotals["72102"]?.total || 0) +
      (accountTotals["72103"]?.total || 0) +
      (accountTotals["72199"]?.total || 0);
    const officeExpenses =
      (accountTotals["75102"]?.total || 0) +
      (accountTotals["75103"]?.total || 0) +
      (accountTotals["75104"]?.total || 0) +
      (accountTotals["75105"]?.total || 0) +
      (accountTotals["75117"]?.total || 0) +
      (accountTotals["75199"]?.total || 0);
    const professionalFees = accountTotals["76103"]?.total || 0;
    const depreciation = accountTotals["79101"]?.total || 0;
    const federalIncomeTaxes = accountTotals["90101"]?.total || 0;
    const totalSellingAdmin =
      rentOccupancy +
      licensesInsurance +
      franchiseCosts +
      labourExpenses +
      bankCharges +
      communicationExpenses +
      officeExpenses +
      professionalFees +
      depreciation +
      federalIncomeTaxes;
    const netIncomeBeforeTax = grossIncome + totalSellingAdmin;
    const netIncome = netIncomeBeforeTax;

    // Build output as per structure
    const output = structure.map((item) => {
      if (item.type === "header") {
        return { type: "header", label: item.label, indent: item.indent || 0 };
      } else if (item.type === "line") {
        return {
          type: "line",
          acct: item.acct,
          label: item.label,
          value: accountTotals[item.acct]?.total || 0,
          indent: item.indent || 0,
        };
      } else if (item.type === "subtotal") {
        let value = 0;
        switch (item.key) {
          case "grossCommissionEarned":
            value = grossCommissionEarned;
            break;
          case "agentsCommissionExpense":
            value = agentsCommissionExpense;
            break;
          case "netCommission":
            value = netCommission;
            break;
          case "otherIncome":
            value = otherIncome;
            break;
          case "grossIncome":
            value = grossIncome;
            break;
          case "rentOccupancy":
            value = rentOccupancy;
            break;
          case "licensesInsurance":
            value = licensesInsurance;
            break;
          case "franchiseCosts":
            value = franchiseCosts;
            break;
          case "labourExpenses":
            value = labourExpenses;
            break;
          case "bankCharges":
            value = bankCharges;
            break;
          case "communicationExpenses":
            value = communicationExpenses;
            break;
          case "officeExpenses":
            value = officeExpenses;
            break;
          case "professionalFees":
            value = professionalFees;
            break;
          case "depreciation":
            value = depreciation;
            break;
          case "federalIncomeTaxes":
            value = federalIncomeTaxes;
            break;
          case "totalSellingAdmin":
            value = totalSellingAdmin;
            break;
          case "netIncomeBeforeTax":
            value = netIncomeBeforeTax;
            break;
          case "netIncome":
            value = netIncome;
            break;
          default:
            value = 0;
        }
        return {
          type: "subtotal",
          label: item.label,
          value,
          indent: item.indent || 0,
        };
      }
      return null;
    });

    console.log("Final output structure:");
    console.log("Total items:", output.length);
    console.log(
      "Subtotal items:",
      output.filter((item) => item.type === "subtotal")
    );
    console.log("Last 5 items:", output.slice(-5));

    res.json({ statement: output });
  } catch (error) {
    console.error("Error calculating income statement:", error);
    res
      .status(500)
      .json({ message: "Server error while calculating income statement" });
  }
});

module.exports = router;
