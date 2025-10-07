import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import axiosInstance from "../config/axios";
import logo from "../Assets/logo1.jpg";

const FinancialReportsTradeAR = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState([]);
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
      // Fetch ledger data for A/R Commission account (12200)
      const response = await axiosInstance.get("/ledger");
      const ledgerData = response.data || [];

      // Filter for A/R Commission account (12200) and date range
      const startDate = new Date(fromDate);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(toDate);
      endDate.setUTCHours(23, 59, 59, 999);

      const filteredTransactions = ledgerData.filter((entry) => {
        const entryDate = new Date(
          entry.date || entry.transactionDate || entry.createdAt
        );
        return (
          entry.accountNumber === "12200" && // A/R - Commission From Deals
          entryDate >= startDate &&
          entryDate <= endDate
        );
      });

      const reportData = [];
      let runningBalance = 0;

      // Add opening balance entry
      reportData.push({
        tradeNumber: "",
        description: "Opening Balance",
        type: "",
        reference: "",
        depDate: "",
        amount: "Opening",
        balance: runningBalance,
        isOpening: true,
      });

      // Process each transaction
      for (const transaction of filteredTransactions) {
        const amount = parseFloat(transaction.amount || 0);
        const debit = parseFloat(transaction.debit || 0);
        const credit = parseFloat(transaction.credit || 0);

        // Extract trade number from description or other fields
        let tradeNumber = "";
        let cleanDescription = transaction.description || "";

        // Try to extract trade number from description (e.g., "Trade #: 203 - ...")
        const tradeMatch = cleanDescription.match(/Trade #: (\d+)/i);
        if (tradeMatch) {
          tradeNumber = tradeMatch[1];
          // Remove the trade number prefix from description
          cleanDescription = cleanDescription.replace(
            /^Trade #: \d+\s*-\s*/i,
            ""
          );
        } else {
          // Fallback to other fields
          tradeNumber =
            transaction.tradeNumber ||
            transaction.reference ||
            transaction.tradeId ||
            "";
        }

        // If still no trade number, try to extract from reference
        if (!tradeNumber && transaction.reference) {
          const refMatch = transaction.reference.match(/(\d+)/);
          if (refMatch) {
            tradeNumber = refMatch[1];
          }
        }

        // Determine if this is a receivable (debit) or payment (credit)
        if (debit > 0) {
          // This is a receivable (commission earned)
          runningBalance += debit;

          reportData.push({
            tradeNumber: tradeNumber,
            description: cleanDescription || "Commission Receivable",
            type: "AR",
            reference:
              transaction.eftNumber ||
              transaction.reference ||
              `EFT${tradeNumber}`,
            depDate: new Date(transaction.date || transaction.transactionDate)
              .toISOString()
              .split("T")[0],
            amount: debit,
            balance: runningBalance,
            isOpening: false,
          });
        } else if (credit > 0) {
          // This is a payment (commission paid out)
          runningBalance -= credit;

          reportData.push({
            tradeNumber: tradeNumber,
            description: cleanDescription || "Commission Payment",
            type: "AR",
            reference:
              transaction.eftNumber ||
              transaction.reference ||
              `EFT${tradeNumber}`,
            depDate: new Date(transaction.date || transaction.transactionDate)
              .toISOString()
              .split("T")[0],
            amount: -credit,
            balance: runningBalance,
            isOpening: false,
          });
        }
      }

      // Sort by date
      reportData.sort((a, b) => new Date(a.depDate) - new Date(b.depDate));

      setReportData(reportData);
      setShowReport(true);
    } catch (err) {
      setError("Failed to fetch trade A/R journal data");
      setReportData([]);
      console.error("Error fetching trade A/R journal data:", err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toISOString().split("T")[0]; // YYYY-MM-DD format
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr || "-";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const calculateTotals = () => {
    const receivables = reportData.filter(
      (item) => !item.isOpening && item.amount > 0
    );
    const cashRec = reportData.filter(
      (item) => !item.isOpening && item.amount < 0
    );
    const adjustments = reportData.filter(
      (item) => !item.isOpening && item.amount === 0
    );

    return {
      receivables: receivables.reduce((sum, item) => sum + item.amount, 0),
      cashRec: Math.abs(cashRec.reduce((sum, item) => sum + item.amount, 0)),
      adjustments: adjustments.length,
    };
  };

  const totals = calculateTotals();

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
              Trade A/R Journal
            </h1>
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
                  {loading ? "Generating..." : "Generate Trade A/R Journal"}
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
                      TRADE A/R JOURNAL (G/L #12200) - BY DATE
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

              {/* Trade A/R Journal Table */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-4">
                  Trade A/R Journal Entries
                </h3>
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
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold">
                          TYPE
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">
                          REFERENCE
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold">
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
                      {reportData.map((entry, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.isOpening ? (
                              <span className="font-bold">
                                {entry.tradeNumber}
                              </span>
                            ) : (
                              entry.tradeNumber
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.isOpening ? (
                              <span className="font-bold">
                                {entry.description}
                              </span>
                            ) : (
                              entry.description
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                            {entry.type}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {entry.reference}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                            {entry.depDate}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            {entry.isOpening ? (
                              <span className="font-bold">Opening</span>
                            ) : entry.amount !== 0 ? (
                              formatCurrency(entry.amount)
                            ) : (
                              "0.00"
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            {entry.isOpening ? (
                              <span className="font-bold">
                                {formatCurrency(entry.balance)}
                              </span>
                            ) : (
                              formatCurrency(entry.balance)
                            )}
                          </td>
                        </tr>
                      ))}
                      {reportData.length === 0 && (
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
                    {reportData.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan="5"
                            className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700"
                          >
                            Report Totals:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700">
                            {formatCurrency(
                              totals.receivables - totals.cashRec
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700">
                            {formatCurrency(
                              totals.receivables - totals.cashRec
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="5"
                            className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600"
                          >
                            {totals.receivables > 0
                              ? `${Math.ceil(
                                  totals.receivables / 1000
                                )} RECEIVABLES: ${formatCurrency(
                                  totals.receivables
                                )}`
                              : "0 RECEIVABLES: $0.00"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600">
                            {formatCurrency(totals.receivables)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600">
                            -
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="5"
                            className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600"
                          >
                            {totals.cashRec > 0
                              ? `${Math.ceil(
                                  totals.cashRec / 1000
                                )} CASH REC.: -${formatCurrency(
                                  totals.cashRec
                                )}`
                              : "0 CASH REC.: $0.00"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600">
                            -{formatCurrency(totals.cashRec)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600">
                            -
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="5"
                            className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600"
                          >
                            {totals.adjustments} ADJUSTMENTS: $0.00
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600">
                            $0.00
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-600">
                            -
                          </td>
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

export default FinancialReportsTradeAR;
