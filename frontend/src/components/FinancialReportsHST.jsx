import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import axiosInstance from "../config/axios";
import logo from "../Assets/logo1.jpg";

const COMPANY_NAME = "Bestway Real Estate Ltd., Brokerage";
const ACCOUNTS_TABLE1 = ["23000", "23001"];
const ACCOUNTS_TABLE2 = ["45100", "43100", "44100"];
const ACCOUNT_LABELS = {
  23000: "HST Collected",
  23001: "HST Input Tax Credit",
  43100: "Other Income",
  45100: "Desk Fee Income",
};

const FinancialReportsHST = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
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
      const res = await axiosInstance.get("/ledger", {
        params: { from: fromDate, to: toDate },
      });

      // Get cash receipt transactions from localStorage (like Trial Balance does)
      const cashReceiptTransactions = JSON.parse(
        localStorage.getItem("trialBalanceTransactions") || "[]"
      );

      // Filter localStorage transactions by date range if dates are specified
      let filteredLocalStorageTransactions = cashReceiptTransactions;
      if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(toDate);
        endDate.setUTCHours(23, 59, 59, 999);

        filteredLocalStorageTransactions = cashReceiptTransactions.filter(
          (entry) => {
            const entryDate = entry.date
              ? new Date(entry.date)
              : new Date(entry.createdAt || 0);
            return entryDate >= startDate && entryDate <= endDate;
          }
        );
      }

      // Combine backend data with localStorage transactions
      const allEntries = [...filteredLocalStorageTransactions, ...res.data];

      // Sort all entries by date (newest first)
      allEntries.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(a.createdAt || 0);
        const dateB = b.date ? new Date(b.date) : new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      setLedgerData(allEntries);
      setShowReport(true);
    } catch (err) {
      setError("Failed to fetch ledger data");
      setLedgerData([]);
      console.error("Error fetching ledger data:", err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to filter and format data for a table
  const getTableData = (accounts) => {
    const filtered = ledgerData.filter((entry) =>
      accounts.includes(entry.accountNumber)
    );
    return filtered;
  };

  // Helper to sum debit, credit, and net
  const getTotals = (rows) => {
    let debit = 0,
      credit = 0,
      net = 0;
    rows.forEach((row) => {
      debit += row.debit || 0;
      credit += row.credit || 0;
      net += (row.debit || 0) - (row.credit || 0);
    });
    return { debit, credit, net };
  };

  // Helper to format date
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

  // Helper to get the best available date for an entry
  const getEntryDate = (entry) => {
    const date = entry.date || entry.createdAt || entry.updatedAt || null;
    return date;
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
            <h1 className="text-2xl font-bold text-gray-900">HST Report</h1>
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
                  {loading ? "Generating..." : "Generate HST Report"}
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
                      HST Report
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

              {/* Table 1: HST Collected and HST Input Tax Credit */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-4">
                  HST Collected and HST Input Tax Credit
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Date
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Description
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Account
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Debit
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Credit
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Net
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTableData(ACCOUNTS_TABLE1).map((entry, index) => {
                        const totals = getTotals([entry]);
                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {formatDate(getEntryDate(entry))}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {entry.description || "-"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {ACCOUNT_LABELS[entry.accountNumber] ||
                                entry.accountNumber}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                              {entry.debit ? `$${entry.debit.toFixed(2)}` : "-"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                              {entry.credit
                                ? `$${entry.credit.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                              ${totals.net.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      {getTableData(ACCOUNTS_TABLE1).length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="border border-gray-300 px-3 py-2 text-center text-gray-500 text-xs"
                          >
                            No data found for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {getTableData(ACCOUNTS_TABLE1).length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td
                            colSpan="3"
                            className="border border-gray-300 px-3 py-2 text-right text-xs"
                          >
                            Total:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            $
                            {getTotals(
                              getTableData(ACCOUNTS_TABLE1)
                            ).debit.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            $
                            {getTotals(
                              getTableData(ACCOUNTS_TABLE1)
                            ).credit.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            $
                            {getTotals(
                              getTableData(ACCOUNTS_TABLE1)
                            ).net.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Table 2: Other Income and Desk Fee Income */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-4">
                  Other Income and Desk Fee Income
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Date
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Description
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs">
                          Account
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Debit
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Credit
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs">
                          Net
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTableData(ACCOUNTS_TABLE2).map((entry, index) => {
                        const totals = getTotals([entry]);
                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {formatDate(getEntryDate(entry))}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {entry.description || "-"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {ACCOUNT_LABELS[entry.accountNumber] ||
                                entry.accountNumber}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                              {entry.debit ? `$${entry.debit.toFixed(2)}` : "-"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                              {entry.credit
                                ? `$${entry.credit.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                              ${totals.net.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      {getTableData(ACCOUNTS_TABLE2).length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="border border-gray-300 px-3 py-2 text-center text-gray-500 text-xs"
                          >
                            No data found for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {getTableData(ACCOUNTS_TABLE2).length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td
                            colSpan="3"
                            className="border border-gray-300 px-3 py-2 text-right text-xs"
                          >
                            Total:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            $
                            {getTotals(
                              getTableData(ACCOUNTS_TABLE2)
                            ).debit.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            $
                            {getTotals(
                              getTableData(ACCOUNTS_TABLE2)
                            ).credit.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs">
                            $
                            {getTotals(
                              getTableData(ACCOUNTS_TABLE2)
                            ).net.toFixed(2)}
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

export default FinancialReportsHST;
