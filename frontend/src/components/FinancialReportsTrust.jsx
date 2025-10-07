import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import axiosInstance from "../config/axios";
import logo from "../Assets/logo1.jpg";

const FinancialReportsTrust = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState({ entries: [], totals: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef();

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Fetch all trades data
      const tradesResponse = await axiosInstance.get("/trades");
      const allTrades = tradesResponse.data || [];

      const reportData = [];

      // Process each trade
      for (const trade of allTrades) {
        try {
          const tradeNumber = trade.tradeNumber || trade.id;
          const keyInfo = trade.keyInfo || {};
          const address =
            `${keyInfo.streetNumber || ""} ${keyInfo.streetName || ""} ${
              keyInfo.unit || ""
            }`.trim() || "N/A";

          let openingBalance = 0;
          let runningBalance = 0;

          // Get opening balance from Trust Records
          const trustRecords = trade.trustRecords || trade.trust_records || [];

          if (trustRecords.length > 0) {
            // Look for any record with an amount (not just the first one with amount)
            const depositRecord = trustRecords.find((record) => {
              const amount =
                record.amount ||
                record.depositAmount ||
                record.deposit_amount ||
                record.value ||
                record.total;
              return amount && parseFloat(amount) > 0;
            });

            if (depositRecord) {
              const amountStr =
                depositRecord.amount ||
                depositRecord.depositAmount ||
                depositRecord.deposit_amount ||
                depositRecord.value ||
                depositRecord.total;
              openingBalance = parseFloat(amountStr) || 0;
              runningBalance = openingBalance;
            }
          }

          // Fetch Real Estate Trust EFTs for this trade
          let realEstateTrustPayments = [];
          try {
            const eftResponse = await axiosInstance.get(
              `/real-estate-trust-eft/trade/${trade._id}`
            );
            realEstateTrustPayments = eftResponse.data || [];
          } catch (eftError) {
            console.log(
              `Trade ${tradeNumber} - No EFTs found:`,
              eftError.message
            );
          }

          // Filter EFT payments by date range
          const filteredPayments = realEstateTrustPayments.filter((payment) => {
            if (!payment.chequeDate) return false;
            const paymentDate = new Date(payment.chequeDate);
            const fromDateObj = new Date(fromDate);
            const toDateObj = new Date(toDate);
            fromDateObj.setHours(0, 0, 0, 0);
            toDateObj.setHours(23, 59, 59, 999);
            return paymentDate >= fromDateObj && paymentDate <= toDateObj;
          });

          // Only process this trade if it has transactions in the date range
          if (filteredPayments.length > 0) {
            // Add opening balance entry if there's a deposit
            if (openingBalance > 0) {
              reportData.push({
                tradeNumber: tradeNumber,
                description: address,
                type: "",
                reference: "",
                date: "",
                amount: "Opening",
                balance: openingBalance,
                isOpening: true,
              });
            } else {
              // Add trade header even without opening balance to show address
              reportData.push({
                tradeNumber: tradeNumber,
                description: address,
                type: "",
                reference: "",
                date: "",
                amount: "Opening",
                balance: 0,
                isOpening: true,
              });
            }

            // Process each payment
            for (const payment of filteredPayments) {
              const amount = parseFloat(payment.amount || 0);
              // For credits, subtract from balance; for debits, add to balance
              // Since we're treating all as credits, subtract the amount
              runningBalance -= amount;

              // Determine transaction type based on payment type
              let transactionType = "C"; // Default to Credit

              // Check payment type to determine if it's debit or credit
              if (
                payment.type === "CommissionTransfer" ||
                payment.type === "BalanceOfDeposit"
              ) {
                // These are credited in trial balance, so show as "C"
                transactionType = "C";
              } else if (
                payment.type === "RefundOfDeposit" ||
                payment.type === "TrustDeposit"
              ) {
                // These are credited in trial balance, so show as "C"
                transactionType = "C";
              } else {
                // Fallback: use amount sign
                transactionType = amount > 0 ? "C" : "D";
              }

              // For credits, display as negative amount
              const displayAmount =
                transactionType === "C" ? -Math.abs(amount) : amount;

              // Use recipient name instead of generic description
              let recipientName =
                payment.recipient || payment.description || "";

              // Remove "Commission Trust" from recipient names
              recipientName = recipientName
                .replace(/ - Commission Trust$/i, "")
                .replace(/, Commission Trust$/i, "");

              reportData.push({
                tradeNumber: tradeNumber,
                description: recipientName,
                type: transactionType,
                reference: payment.eftNumber || "",
                date: payment.chequeDate
                  ? new Date(payment.chequeDate).toISOString().split("T")[0]
                  : "",
                amount: displayAmount,
                balance: runningBalance,
                isOpening: false,
              });
            }
          }
        } catch (tradeError) {
          console.error(
            `Error processing trade ${trade.tradeNumber}:`,
            tradeError
          );
        }
      }

      // Sort by date
      reportData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate totals
      const totals = {
        totalAmount: 0,
        totalBalance: 0,
        deposits: 0,
        cheques: 0,
        adjustments: 0,
        depositCount: 0,
        chequeCount: 0,
        adjustmentCount: 0,
      };

      // Calculate totals from all transactions (excluding opening entries)
      reportData.forEach((entry) => {
        if (entry.amount !== "Opening" && typeof entry.amount === "number") {
          totals.totalAmount += entry.amount;
          if (entry.amount > 0) {
            totals.deposits += entry.amount;
            totals.depositCount++;
          } else {
            totals.cheques += Math.abs(entry.amount);
            totals.chequeCount++;
          }
        }
      });

      // Get the final balance from the last entry
      if (reportData.length > 0) {
        const lastEntry = reportData[reportData.length - 1];
        totals.totalBalance =
          typeof lastEntry.balance === "number" ? lastEntry.balance : 0;
      }

      // Store totals for the report summary
      setReportData({ entries: reportData, totals });
      setShowReport(true);
    } catch (err) {
      setError("Failed to fetch trust journal data");
      setReportData({ entries: [], totals: {} });
      console.error("Error fetching trust journal data:", err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0]; // YYYY-MM-DD format
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr || "-";
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Trust Journal</h1>
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
                  {loading ? "Generating..." : "Generate Trust Journal"}
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
                      TRUST JOURNAL (G/L #10002) - BY TRADE
                    </h2>
                    <p className="text-sm text-gray-600">
                      FROM {formatDate(fromDate).toUpperCase()} TO{" "}
                      {formatDate(toDate).toUpperCase()}
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

              {/* Trust Journal Table */}
              <div className="mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">
                          TRADE
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">
                          DESCRIPTION
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">
                          TYPE
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">
                          REFERENCE
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">
                          DEP. DATE
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold">
                          AMOUNT
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold">
                          BALANCE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.entries.map((entry, index) => (
                        <tr
                          key={index}
                          className={
                            entry.isTotal
                              ? "bg-gray-100 font-bold"
                              : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td
                            className={`border border-gray-300 px-3 py-2 text-xs ${
                              entry.isOpening ? "font-bold" : ""
                            }`}
                          >
                            {entry.tradeNumber}
                          </td>
                          <td
                            className={`border border-gray-300 px-3 py-2 text-xs ${
                              entry.isOpening || entry.isTotal
                                ? "font-bold"
                                : ""
                            }`}
                          >
                            {entry.description}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.type}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.reference}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.date ? formatDate(entry.date) : ""}
                          </td>
                          <td
                            className={`border border-gray-300 px-3 py-2 text-xs ${
                              entry.amount === "Opening"
                                ? "text-left"
                                : "text-right"
                            }`}
                          >
                            {entry.amount === "Opening"
                              ? "Opening"
                              : entry.amount === ""
                              ? ""
                              : typeof entry.amount === "number"
                              ? `$${entry.amount.toFixed(2)}`
                              : ""}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            ${entry.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {reportData.entries.length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="border border-gray-300 px-3 py-2 text-center text-gray-500 text-xs"
                          >
                            No data found for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Totals Section */}
              {reportData.totals &&
                Object.keys(reportData.totals).length > 0 && (
                  <div className="mt-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        Report Totals
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Report Totals:</span>
                          <span className="font-bold">
                            $
                            {reportData.totals.totalAmount?.toFixed(2) ||
                              "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {reportData.totals.depositCount || 0} DEPOSITS:
                          </span>
                          <span className="font-bold">
                            ${reportData.totals.deposits?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {reportData.totals.chequeCount || 0} CHEQUES:
                          </span>
                          <span className="font-bold">
                            -${reportData.totals.cheques?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {reportData.totals.adjustmentCount || 0}{" "}
                            ADJUSTMENTS:
                          </span>
                          <span className="font-bold">
                            $
                            {reportData.totals.adjustments?.toFixed(2) ||
                              "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsTrust;
