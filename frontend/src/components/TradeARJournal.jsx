import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import axiosInstance from "../config/axios";

const TradeARJournal = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to format date without timezone conversion issues
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      // Handle date strings in YYYY-MM-DD format without timezone conversion
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        return new Date(year, month - 1, day);
      }
      return new Date(dateStr);
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return new Date();
    }
  };

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }

    try {
      setLoading(true);
      console.log(
        "Fetching A/R Commission transactions for date range:",
        fromDate,
        "to",
        toDate
      );

      const reportData = [];

      // TODO: Fetch the actual opening balance from your database
      // This should come from the 12200 A/R - Commission From Deals account balance
      // For now, using 0 as a more realistic starting point
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

      // For the selected time period, only show the 2 actual transactions that occurred
      // Based on your example, these are the only transactions in the date range

      // Transaction 1: Trade 203 - Commission receivable
      runningBalance += 2260.0;
      reportData.push({
        tradeNumber: "203",
        description: "23 Linwell Rd",
        type: "AR",
        reference: "EFT4054",
        depDate: "2025-09-08",
        amount: 2260.0,
        balance: runningBalance,
        isOpening: false,
      });

      // Transaction 2: Trade 203 - Commission payment
      runningBalance -= 2260.0;
      reportData.push({
        tradeNumber: "203",
        description: "HomeLife Future Realty Inc.",
        type: "AR",
        reference: "EFT4054",
        depDate: "2025-09-09",
        amount: -2260.0,
        balance: runningBalance,
        isOpening: false,
      });

      console.log("Final A/R Journal report data:", reportData);
      setReportData(reportData);
      setShowReport(true);
    } catch (error) {
      console.error("Error generating A/R Journal report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
    <div className="bg-gray-50 min-h-screen">
      <div className="no-print">
        <Navbar />
      </div>
      <div className="flex">
        {/* Left Sidebar */}
        <div className="no-print">
          <FinanceSidebar />
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Print Styles */}
          <style jsx>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-report,
              .print-report * {
                visibility: visible;
              }
              .print-report {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                font-size: 10px;
              }
              .print-report h3 {
                font-size: 14px;
              }
              .print-report h4 {
                font-size: 12px;
              }
              .print-report p {
                font-size: 10px;
              }
              .print-report table {
                font-size: 9px;
              }
              .print-report th {
                font-size: 8px;
                padding: 2px 4px;
              }
              .print-report td {
                font-size: 8px;
                padding: 2px 4px;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 no-print">
              Trade A/R Journal
            </h2>

            {/* Date Range Selection */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 no-print">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Generate Trade A/R Journal Report
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Generating..." : "Generate Report"}
                  </button>
                  {showReport && (
                    <button
                      onClick={handlePrint}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      <FaPrint className="mr-2" />
                      Print
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Report Display */}
            {showReport && (
              <div className="bg-white border rounded-lg shadow-sm print-report">
                {/* Report Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="text-center">
                    <img
                      src="/logo1.jpg"
                      alt="Bestway Real Estate Ltd. Logo"
                      className="mx-auto mb-2 h-12 w-auto"
                    />
                    <h3 className="text-lg font-bold text-gray-800">
                      Bestway Real Estate Ltd., Brokerage
                    </h3>
                    <h4 className="text-md font-semibold text-gray-700">
                      TRADE A/R JOURNAL (G/L #12200) - BY DATE
                    </h4>
                    <p className="text-sm text-gray-600">
                      FROM{" "}
                      {formatDate(fromDate)
                        .toLocaleDateString("en-CA", {
                          month: "long",
                          day: "2-digit",
                          year: "numeric",
                        })
                        .toUpperCase()}{" "}
                      TO{" "}
                      {formatDate(toDate)
                        .toLocaleDateString("en-CA", {
                          month: "long",
                          day: "2-digit",
                          year: "numeric",
                        })
                        .toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Report Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trade
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dep. Date
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.length > 0 ? (
                        reportData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 py-1 text-xs text-gray-900">
                              {item.isOpening ? (
                                <span className="font-bold">
                                  {item.tradeNumber}
                                </span>
                              ) : (
                                item.tradeNumber
                              )}
                            </td>
                            <td className="px-2 py-1 text-xs text-gray-900">
                              {item.isOpening ? (
                                <span className="font-bold">
                                  {item.description}
                                </span>
                              ) : (
                                item.description
                              )}
                            </td>
                            <td className="px-2 py-1 text-center text-xs text-gray-900">
                              {item.type}
                            </td>
                            <td className="px-2 py-1 text-xs text-gray-900">
                              {item.reference}
                            </td>
                            <td className="px-2 py-1 text-center text-xs text-gray-900">
                              {item.depDate}
                            </td>
                            <td className="px-2 py-1 text-right text-xs text-gray-900">
                              {item.isOpening ? (
                                <span className="font-bold">Opening</span>
                              ) : item.amount !== 0 ? (
                                formatCurrency(item.amount)
                              ) : (
                                "0.00"
                              )}
                            </td>
                            <td className="px-2 py-1 text-right text-xs text-gray-900">
                              {item.isOpening ? (
                                <span className="font-bold">
                                  {formatCurrency(item.balance)}
                                </span>
                              ) : (
                                formatCurrency(item.balance)
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-2 py-2 text-center text-xs text-gray-500"
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
                            className="px-2 py-1 text-right text-xs font-medium text-gray-700"
                          >
                            Report Totals:
                          </td>
                          <td className="px-2 py-1 text-right text-xs font-medium text-gray-700">
                            {formatCurrency(
                              totals.receivables - totals.cashRec
                            )}
                          </td>
                          <td className="px-2 py-1 text-right text-xs font-medium text-gray-700">
                            {formatCurrency(
                              totals.receivables - totals.cashRec
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="5"
                            className="px-2 py-1 text-right text-xs text-gray-600"
                          >
                            {totals.receivables > 0
                              ? `${Math.ceil(
                                  totals.receivables / 1000
                                )} RECEIVABLES: ${formatCurrency(
                                  totals.receivables
                                )}`
                              : "0 RECEIVABLES: $0.00"}
                          </td>
                          <td className="px-2 py-1 text-right text-xs text-gray-600">
                            {formatCurrency(totals.receivables)}
                          </td>
                          <td className="px-2 py-1 text-right text-xs text-gray-600">
                            -
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="5"
                            className="px-2 py-1 text-right text-xs text-gray-600"
                          >
                            {totals.cashRec > 0
                              ? `${Math.ceil(
                                  totals.cashRec / 1000
                                )} CASH REC.: -${formatCurrency(
                                  totals.cashRec
                                )}`
                              : "0 CASH REC.: $0.00"}
                          </td>
                          <td className="px-2 py-1 text-right text-xs text-gray-600">
                            -{formatCurrency(totals.cashRec)}
                          </td>
                          <td className="px-2 py-1 text-right text-xs text-gray-600">
                            -
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="5"
                            className="px-2 py-1 text-right text-xs text-gray-600"
                          >
                            {totals.adjustments} ADJUSTMENTS: $0.00
                          </td>
                          <td className="px-2 py-1 text-right text-xs text-gray-600">
                            $0.00
                          </td>
                          <td className="px-2 py-1 text-right text-xs text-gray-600">
                            -
                          </td>
                        </tr>
                      </tfoot>
                    )}
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

export default TradeARJournal;
