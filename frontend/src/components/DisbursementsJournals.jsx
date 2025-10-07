import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import axiosInstance from "../config/axios";

const DisbursementsJournals = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("real-estate-trust");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to format date without timezone conversion issues
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      // Handle date strings in YYYY-MM-DD format without timezone conversion
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        return new Date(year, month - 1, day).toLocaleDateString("en-US");
      }
      return new Date(dateStr).toLocaleDateString("en-US");
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr || "-";
    }
  };

  // Account information mapping
  const accountInfo = {
    "real-estate-trust": {
      name: "Real Estate Trust Account",
      accountNumber: "10002",
      accountName: "Cash - Trust",
    },
    "commission-trust": {
      name: "Commission Trust Account",
      accountNumber: "10004",
      accountName: "Cash - Commission Trust Account",
    },
    "general-account": {
      name: "General Account",
      accountNumber: "10001",
      accountName: "Cash - Current Account",
    },
  };

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }

    setLoading(true);
    try {
      // Fetch ledger data using the same endpoint as TrialBalance
      // Don't filter on backend - get all data and filter on frontend
      const response = await axiosInstance.get("/ledger");

      // Get cash receipt transactions from localStorage (same as TrialBalance)
      const cashReceiptTransactions = JSON.parse(
        localStorage.getItem("trialBalanceTransactions") || "[]"
      );

      // Filter localStorage transactions by date range
      let filteredCashReceiptTransactions = cashReceiptTransactions;
      if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(toDate);
        endDate.setUTCHours(23, 59, 59, 999);

        console.log("Date range filtering:", {
          fromDate,
          toDate,
          startDate,
          endDate,
        });

        filteredCashReceiptTransactions = cashReceiptTransactions.filter(
          (entry) => {
            // Use the same date field priority as in the display logic - prioritize chequeDate
            const entryDate =
              entry.chequeDate ||
              entry.date ||
              entry.transactionDate ||
              entry.eftDate ||
              entry.paymentDate ||
              entry.processedDate ||
              entry.createdAt;
            const parsedDate = new Date(entryDate);
            const isInRange = parsedDate >= startDate && parsedDate <= endDate;
            if (!isInRange) {
              console.log("Entry filtered out by date:", {
                entryDate,
                parsedDate,
                startDate,
                endDate,
                description: entry.description,
              });
            }
            return isInRange;
          }
        );
      }

      // Filter backend data by date range as well
      let filteredBackendData = response.data;
      if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(toDate);
        endDate.setUTCHours(23, 59, 59, 999);

        filteredBackendData = response.data.filter((entry) => {
          // Use the same date field priority as in the display logic - prioritize chequeDate
          const entryDate =
            entry.chequeDate ||
            entry.date ||
            entry.transactionDate ||
            entry.eftDate ||
            entry.paymentDate ||
            entry.processedDate ||
            entry.createdAt;
          const parsedDate = new Date(entryDate);
          const isInRange = parsedDate >= startDate && parsedDate <= endDate;

          if (
            !isInRange &&
            entry.accountNumber === accountInfo[activeSection].accountNumber
          ) {
            console.log("Backend entry filtered out by date:", {
              entryDate,
              parsedDate,
              startDate,
              endDate,
              description: entry.description,
              accountNumber: entry.accountNumber,
            });
          }

          return isInRange;
        });
      }

      // Combine backend data with filtered cash receipt transactions
      const allEntries = [
        ...filteredCashReceiptTransactions,
        ...filteredBackendData,
      ];

      // Debug logging
      console.log("=== Disbursements Journals Debug ===");
      console.log("All entries count:", allEntries.length);
      console.log("Backend response count:", response.data.length);
      console.log("Filtered backend data count:", filteredBackendData.length);
      console.log(
        "LocalStorage transactions count:",
        filteredCashReceiptTransactions.length
      );
      console.log("Active section:", activeSection);
      console.log("Account number:", accountInfo[activeSection].accountNumber);
      console.log("Sample entries:", allEntries.slice(0, 3));

      // Check what account numbers are present in the data
      const uniqueAccountNumbers = [
        ...new Set(allEntries.map((entry) => entry.accountNumber)),
      ];
      console.log("Unique account numbers in data:", uniqueAccountNumbers);

      // Check entries for the specific account
      const entriesForAccount = allEntries.filter(
        (entry) =>
          entry.accountNumber === accountInfo[activeSection].accountNumber
      );
      console.log(
        `Entries for account ${accountInfo[activeSection].accountNumber}:`,
        entriesForAccount.length
      );

      // Show sample dates to debug date filtering
      const sampleDates = entriesForAccount.slice(0, 5).map((entry) => ({
        description: entry.description,
        date: entry.date,
        createdAt: entry.createdAt,
        chequeDate: entry.chequeDate,
        transactionDate: entry.transactionDate,
        allDateFields: Object.keys(entry).filter(
          (key) =>
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("time")
        ),
        allFields: Object.keys(entry), // Show all fields to see what's available
        parsedDate: entry.date
          ? new Date(entry.date)
          : new Date(entry.createdAt || 0),
      }));
      console.log("Sample dates for debugging:", sampleDates);

      // Show a specific EFT#1015 entry if it exists
      const eft1015Entry = entriesForAccount.find(
        (entry) =>
          entry.description?.includes("EFT#1015") ||
          entry.eftNumber === "1015" ||
          entry.referenceNumber === "1015"
      );
      if (eft1015Entry) {
        console.log("EFT#1015 entry details:", eft1015Entry);
      }

      // Show sample entries with trade-related fields
      const tradeFields = entriesForAccount.slice(0, 3).map((entry) => ({
        description: entry.description,
        tradeNumber: entry.tradeNumber,
        tradeId: entry.tradeId,
        allTradeFields: Object.keys(entry).filter(
          (key) =>
            key.toLowerCase().includes("trade") ||
            key.toLowerCase().includes("number")
        ),
        allFields: Object.keys(entry),
      }));
      console.log("Trade fields for debugging:", tradeFields);

      // Filter for the specific account
      // For General Account: show both debit and credit transactions
      // For other accounts: show only credit transactions (disbursements)
      const accountTransactions = allEntries.filter((entry) => {
        const matchesAccount =
          entry.accountNumber === accountInfo[activeSection].accountNumber;

        let hasValidAmount;
        if (activeSection === "general-account") {
          // General Account: show both debit and credit transactions
          hasValidAmount = entry.debit > 0 || entry.credit > 0;
        } else {
          // Other accounts: show only credit transactions (money going out)
          hasValidAmount = entry.credit > 0;
        }

        if (!matchesAccount) {
          console.log("Entry filtered out by account number:", {
            entryAccountNumber: entry.accountNumber,
            expectedAccountNumber: accountInfo[activeSection].accountNumber,
            description: entry.description,
          });
        }

        if (matchesAccount && !hasValidAmount) {
          console.log("Entry filtered out - no valid amount:", {
            description: entry.description,
            debit: entry.debit,
            credit: entry.credit,
            activeSection: activeSection,
          });
        }

        return matchesAccount && hasValidAmount;
      });

      console.log(
        "Filtered account transactions count:",
        accountTransactions.length
      );
      console.log("Account transactions:", accountTransactions);

      // Transform the data to match the report format
      const disbursementTransactions = accountTransactions.map((entry) => {
        // Extract EFT number from description or use eftNumber
        let eftNumber = "N/A";
        if (entry.eftNumber) {
          eftNumber = `EFT#${entry.eftNumber}`;
        } else if (entry.description && entry.description.includes("EFT")) {
          const eftMatch = entry.description.match(/EFT#?(\d+)/i);
          if (eftMatch) {
            eftNumber = `EFT#${eftMatch[1]}`;
          }
        }

        // Extract payee name from description
        let payeeName = "N/A";
        if (entry.payee) {
          payeeName = entry.payee;
        } else if (entry.description) {
          // Try to extract name from common patterns
          const patterns = [
            /Paid to:\s*([^,]+)/i,
            /Received from:\s*([^,]+)/i,
            /Payee:\s*([^,]+)/i,
            /To:\s*([^,]+)/i,
            /From:\s*([^,]+)/i,
          ];

          for (const pattern of patterns) {
            const match = entry.description.match(pattern);
            if (match) {
              payeeName = match[1].trim();
              break;
            }
          }

          // If no pattern matches, clean up the description
          if (payeeName === "N/A") {
            payeeName = entry.description;

            // Remove EFT numbers and extra text to get clean company names
            payeeName = payeeName
              .replace(/^EFT#?\d+[-\s]*/i, "") // Remove EFT#1015- or EFT#1015
              .replace(/^EET#?\d+[-\s]*/i, "") // Remove EET#100--
              .replace(/^Trade #:?\s*\d+,\s*Paid to:\s*/i, "") // Remove Trade #: 47, Paid to:
              .replace(/^Trade #:?\s*\d+,\s*Received from:\s*/i, "") // Remove Trade #: 47, Received from:
              .replace(/\s*\([^)]*\)$/, "") // Remove (Adjusted to Trust Amount) at the end
              .replace(/\s*,\s*Brokerage$/, "") // Remove , Brokerage at the end
              .replace(/\s*Brokerage$/, "") // Remove Brokerage at the end
              .trim();
          }
        }

        // Use the correct date field - prioritize chequeDate as it contains the user-selected date
        let transactionDate =
          entry.chequeDate ||
          entry.date ||
          entry.transactionDate ||
          entry.eftDate ||
          entry.paymentDate ||
          entry.processedDate ||
          entry.createdAt;

        if (!transactionDate) {
          // If no date found, try to extract from description
          const dateMatch = entry.description?.match(
            /(\d{1,2}\/\d{1,2}\/\d{4})/
          );
          if (dateMatch) {
            transactionDate = dateMatch[1];
          }
        }

        // Debug logging for date extraction
        if (entry.description?.includes("EFT#1015")) {
          console.log("EFT#1015 date extraction debug:", {
            description: entry.description,
            date: entry.date,
            createdAt: entry.createdAt,
            chequeDate: entry.chequeDate,
            transactionDate: entry.transactionDate,
            eftDate: entry.eftDate,
            paymentDate: entry.paymentDate,
            processedDate: entry.processedDate,
            allFields: Object.keys(entry),
            finalTransactionDate: transactionDate,
          });
        }

        // Calculate amount based on account type
        let amount;
        if (activeSection === "general-account") {
          // General Account: show both debit and credit amounts
          amount = entry.debit || entry.credit || 0;
        } else {
          // Other accounts: show only credit amounts for disbursements
          amount = entry.credit || 0;
        }

        return {
          payee: payeeName,
          date: formatDate(transactionDate),
          referenceNumber: eftNumber,
          amount: amount,
          reversed: "", // Empty for reversed column
        };
      });

      setTransactions(disbursementTransactions);
      setShowReport(true);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      alert("Error fetching data. Please try again.");
    }
    setLoading(false);
  };

  const handlePrint = () => {
    // Create a new window for printing with only the table content
    const printWindow = window.open("", "_blank");

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Disbursements Journal - Bestway Real Estate Ltd., Brokerage</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.4;
              color: #000000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000000;
              padding-bottom: 15px;
            }
            .company-logo {
              width: 60px;
              height: 60px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 20px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 10px;
            }
            .period-info {
              font-size: 14px;
              color: #000000;
              margin-bottom: 5px;
            }
            .account-info {
              font-size: 14px;
              color: #000000;
            }
            .table-container {
              width: 100%;
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000000;
            }
            th, td {
              border: 1px solid #000000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .amount-column {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              border-top: 2px solid #000000;
            }
            .total-row td {
              border-top: 2px solid #000000;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
              .header {
                margin-bottom: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo1.jpg" alt="Company Logo" class="company-logo" />
            <div class="company-name">SAVEMAX 365 REALTY, BROKERAGE</div>
            <div class="report-title">${
              activeSection === "general-account"
                ? "AR & Disbursements Journal"
                : "Disbursements Journal"
            }</div>
            <div class="period-info">Period: ${formatDate(
              fromDate
            )} to ${formatDate(toDate)}</div>
            <div class="account-info">Bank Account: ${
              accountInfo[activeSection].accountName
            }</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Payee</th>
                  <th>Date</th>
                  <th>Reference #</th>
                  <th class="amount-column">Amount</th>
                  <th>Reversed</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .map(
                    (transaction) => `
                  <tr>
                    <td>${transaction.payee}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.referenceNumber}</td>
                    <td class="amount-column">${transaction.amount.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}</td>
                    <td>${transaction.reversed}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                  <td class="amount-column">${getTotalAmount().toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getTotalAmount = () => {
    return transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Left Sidebar */}
        <FinanceSidebar />
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {activeSection === "general-account"
                ? "AR & Disbursements Journal"
                : "Disbursements Journals"}
            </h2>

            {/* Secondary Horizontal Navbar */}
            <div className="bg-white py-4 border-b mb-6">
              <nav className="flex space-x-8">
                <button
                  className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                    activeSection === "real-estate-trust"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => {
                    setActiveSection("real-estate-trust");
                    setShowReport(false);
                    setTransactions([]);
                  }}
                >
                  Real Estate Trust Account
                </button>
                <button
                  className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                    activeSection === "commission-trust"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => {
                    setActiveSection("commission-trust");
                    setShowReport(false);
                    setTransactions([]);
                  }}
                >
                  Commission Trust Account
                </button>
                <button
                  className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                    activeSection === "general-account"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => {
                    setActiveSection("general-account");
                    setShowReport(false);
                    setTransactions([]);
                  }}
                >
                  General Account
                </button>
              </nav>
            </div>

            {/* Date Range Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="fromDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    From Date:
                  </label>
                  <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="toDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    To Date:
                  </label>
                  <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </button>
                {showReport && (
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 print:hidden"
                  >
                    <FaPrint />
                    Print Report
                  </button>
                )}
              </div>
            </div>

            {/* Report Display */}
            {showReport && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Company Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center mb-4">
                    <img
                      src="/logo1.jpg"
                      alt="Company Logo"
                      className="h-16 w-16 mr-4"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">
                        Bestway Real Estate Ltd., Brokerage
                      </h1>
                      <h2 className="text-xl font-semibold text-gray-700 mt-2">
                        {activeSection === "general-account"
                          ? "AR & Disbursements Journal"
                          : "Disbursements Journal"}
                      </h2>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Period: {formatDate(fromDate)} to {formatDate(toDate)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Bank Account: {accountInfo[activeSection].accountName}
                  </div>
                </div>

                {/* Transaction Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Payee
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Date
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Reference #
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          Amount
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Reversed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            {transaction.payee}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {transaction.date}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {transaction.referenceNumber}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {transaction.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {transaction.reversed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="3"
                          className="border border-gray-300 px-4 py-2 text-right font-semibold"
                        >
                          Total:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold border-t-2 border-b-2">
                          {getTotalAmount().toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {/* Empty for reversed column */}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisbursementsJournals;
