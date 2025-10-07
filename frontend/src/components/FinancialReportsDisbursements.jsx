import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import axiosInstance from "../config/axios";
import logo from "../Assets/logo1.jpg";

const FinancialReportsDisbursements = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("real-estate-trust");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef();

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
    setError("");
    try {
      // Fetch ledger data
      const response = await axiosInstance.get("/ledger");

      // Get cash receipt transactions from localStorage
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

        filteredCashReceiptTransactions = cashReceiptTransactions.filter(
          (entry) => {
            const entryDate =
              entry.chequeDate ||
              entry.date ||
              entry.transactionDate ||
              entry.eftDate ||
              entry.paymentDate ||
              entry.processedDate ||
              entry.createdAt;
            const parsedDate = new Date(entryDate);
            return parsedDate >= startDate && parsedDate <= endDate;
          }
        );
      }

      // Filter backend data by date range
      let filteredBackendData = response.data;
      if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(toDate);
        endDate.setUTCHours(23, 59, 59, 999);

        filteredBackendData = response.data.filter((entry) => {
          const entryDate =
            entry.chequeDate ||
            entry.date ||
            entry.transactionDate ||
            entry.eftDate ||
            entry.paymentDate ||
            entry.processedDate ||
            entry.createdAt;
          const parsedDate = new Date(entryDate);
          return parsedDate >= startDate && parsedDate <= endDate;
        });
      }

      // Combine backend data with filtered cash receipt transactions
      const allEntries = [
        ...filteredCashReceiptTransactions,
        ...filteredBackendData,
      ];

      // Debug logging
      console.log("=== Financial Disbursement Report Debug ===");
      console.log("All entries count:", allEntries.length);
      console.log("Backend response count:", response.data.length);
      console.log("Filtered backend data count:", filteredBackendData.length);
      console.log(
        "LocalStorage transactions count:",
        filteredCashReceiptTransactions.length
      );
      console.log("Active section:", activeSection);
      console.log("Account number:", accountInfo[activeSection].accountNumber);

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
          date: new Date(transactionDate).toLocaleDateString("en-US"),
          referenceNumber: eftNumber,
          amount: amount,
          reversed: "", // Empty for reversed column
        };
      });

      // Sort by date
      disbursementTransactions.sort(
        (a, b) =>
          new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
      );

      setReportData(disbursementTransactions);
      setShowReport(true);
    } catch (err) {
      setError("Failed to fetch disbursement journal data");
      setReportData({});
      console.error("Error fetching disbursement journal data:", err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      // Handle date strings in YYYY-MM-DD format without timezone conversion
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        return new Date(year, month - 1, day).toLocaleDateString();
      }
      return new Date(dateStr).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr || "-";
    }
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "$0.00";
    return `$${numAmount.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="no-print">
        <Navbar />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 no-print">
            <button
              onClick={() => navigate("/financial-reports")}
              className="flex items-center text-blue-900 hover:text-blue-700 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Financial Reports
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeSection === "general-account"
                ? "AR & Disbursement Journal"
                : "Disbursement Journal"}
            </h1>
          </div>

          {/* Account Tabs */}
          <div className="bg-white py-4 border-b mb-6 no-print">
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
                  setReportData({});
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
                  setReportData({});
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
                  setReportData({});
                }}
              >
                General Account
              </button>
            </nav>
          </div>

          {!showReport ? (
            <div className="bg-white rounded-lg shadow-md p-6 no-print">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !fromDate || !toDate}
                  className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Disbursement Journal"}
                </button>
              </div>
            </div>
          ) : (
            <div ref={printRef}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Header with Logo, Title, and Print Button */}
              <div className="flex justify-between items-start mb-6">
                <div className="text-center flex-1">
                  {/* Company Logo */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <img
                        src={logo}
                        alt="Bestway Real Estate Ltd. Logo"
                        className="w-16 h-16"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Bestway Real Estate Ltd., Brokerage
                    </p>
                  </div>

                  {/* Report Title and Period */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeSection === "general-account"
                        ? "AR & Disbursement Journal"
                        : "Disbursement Journal"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Period: {formatDate(fromDate)} to {formatDate(toDate)}
                    </p>
                  </div>
                </div>

                {/* Print Button - Hidden in print preview */}
                <div className="no-print">
                  <button
                    onClick={handlePrint}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center text-sm"
                  >
                    <FaPrint className="mr-2" />
                    Print Report
                  </button>
                </div>
              </div>

              {/* Disbursement Journal Section - Active Account Only */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-4">
                  {accountInfo[activeSection].name} (
                  {accountInfo[activeSection].accountNumber})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Payee
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Date
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Reference #
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Amount
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Reversed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((entry, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.payee}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.date}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.referenceNumber}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            {entry.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.reversed}
                          </td>
                        </tr>
                      ))}
                      {reportData.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="border border-gray-300 px-3 py-2 text-center text-gray-500 text-xs"
                          >
                            No disbursements found for this account
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {reportData.length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td
                            colSpan="3"
                            className="border border-gray-300 px-3 py-2 text-right text-xs"
                          >
                            Total:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            {reportData
                              .reduce(
                                (sum, entry) => sum + (entry.amount || 0),
                                0
                              )
                              .toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsDisbursements;
