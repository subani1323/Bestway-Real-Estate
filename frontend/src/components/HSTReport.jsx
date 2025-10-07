import React, { useState, useRef } from "react";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import logo from "../Assets/logo1.jpg";
import axiosInstance from "../config/axios";

const COMPANY_NAME = "Bestway Real Estate Ltd., Brokerage";
const ACCOUNTS_TABLE1 = ["23000", "23001"];
const ACCOUNTS_TABLE2 = ["45100", "43100", "44100"];
const ACCOUNT_LABELS = {
  23000: "HST Collected",
  23001: "HST Input Tax Credit",
  43100: "Other Income",
  45100: "Desk Fee Income",
};

const HSTReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef();

  const handleCheckReport = async () => {
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

      // Debug logging
      console.log("HST Report Debug:");
      console.log("Backend data count:", res.data.length);
      console.log(
        "LocalStorage transactions count:",
        cashReceiptTransactions.length
      );
      console.log(
        "Filtered localStorage transactions count:",
        filteredLocalStorageTransactions.length
      );
      console.log("Total allEntries count:", allEntries.length);
      console.log("Sample backend entry:", res.data[0]);
      console.log(
        "Sample localStorage entry:",
        filteredLocalStorageTransactions[0]
      );
      console.log("Date range:", { fromDate, toDate });
      console.log(
        "Sample entries with dates:",
        allEntries.slice(0, 5).map((entry) => ({
          accountNumber: entry.accountNumber,
          description: entry.description,
          date: entry.date,
          createdAt: entry.createdAt,
          formattedDate: formatDate(getEntryDate(entry)),
        }))
      );

      // Sort all entries by date (newest first)
      allEntries.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(a.createdAt || 0);
        const dateB = b.date ? new Date(b.date) : new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      setLedgerData(allEntries);
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
    console.log(`HST Report - Filtering for accounts ${accounts.join(", ")}:`, {
      totalEntries: ledgerData.length,
      filteredCount: filtered.length,
      sampleEntries: filtered.slice(0, 3),
    });
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
    // Try date field first (which now contains chequeDate), then createdAt as fallback
    const date = entry.date || entry.createdAt || entry.updatedAt || null;
    console.log("getEntryDate for entry:", {
      accountNumber: entry.accountNumber,
      description: entry.description,
      date: entry.date,
      createdAt: entry.createdAt,
      selectedDate: date,
    });
    return date;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        <FinanceSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Date Range Picker and Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mt-4 md:mt-0"
                onClick={handleCheckReport}
                disabled={loading || !fromDate || !toDate}
              >
                {loading ? "Loading..." : "Check HST Report"}
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded mt-4 md:mt-0"
                onClick={handlePrint}
                style={{ marginLeft: 8 }}
              >
                Print Report
              </button>
            </div>

            {error && <div className="text-red-600 mb-4">{error}</div>}

            {/* Printable Content */}
            <div ref={printRef} className="printable-hst-report">
              {/* Print-only Header */}
              <div className="print-header mb-6 text-center">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="mx-auto mb-2"
                  style={{ maxWidth: 120, maxHeight: 120 }}
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {COMPANY_NAME}
                </h2>
                <div className="text-lg font-semibold mb-1">HST Report</div>
                {fromDate && toDate && (
                  <div className="text-gray-700 mb-2">
                    From{" "}
                    <span className="font-semibold">
                      {formatDate(fromDate)}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">{formatDate(toDate)}</span>
                  </div>
                )}
              </div>

              {/* Table 1: 23000, 23001 */}
              <div className="mb-8">
                <div className="font-semibold mb-2">
                  HST Collected & Input Tax Credit
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 mb-2">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1">Description</th>
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1 text-right">Debit</th>
                        <th className="border px-2 py-1 text-right">Credit</th>
                        <th className="border px-2 py-1 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTableData(ACCOUNTS_TABLE1).map((row, idx) => (
                        <tr key={row._id || idx} className="text-sm">
                          <td className="border px-2 py-1">
                            {row.description}
                          </td>
                          <td className="border px-2 py-1">
                            {formatDate(getEntryDate(row))}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {row.debit?.toFixed(2) || "-"}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {row.credit?.toFixed(2) || "-"}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {((row.debit || 0) - (row.credit || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="font-semibold bg-gray-100">
                        <td className="border px-2 py-1" colSpan={2}>
                          Totals
                        </td>
                        {(() => {
                          const totals = getTotals(
                            getTableData(ACCOUNTS_TABLE1)
                          );
                          return [
                            <td
                              className="border px-2 py-1 text-right"
                              key="debit"
                            >
                              {totals.debit.toFixed(2)}
                            </td>,
                            <td
                              className="border px-2 py-1 text-right"
                              key="credit"
                            >
                              {totals.credit.toFixed(2)}
                            </td>,
                            <td
                              className="border px-2 py-1 text-right"
                              key="net"
                            >
                              {totals.net.toFixed(2)}
                            </td>,
                          ];
                        })()}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: 45100, 43100 */}
              <div className="mb-8">
                <div className="font-semibold mb-2">
                  Desk Fee & Other Income
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 mb-2">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1">Description</th>
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1 text-right">Debit</th>
                        <th className="border px-2 py-1 text-right">Credit</th>
                        <th className="border px-2 py-1 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTableData(ACCOUNTS_TABLE2).map((row, idx) => (
                        <tr key={row._id || idx} className="text-sm">
                          <td className="border px-2 py-1">
                            {row.description}
                          </td>
                          <td className="border px-2 py-1">
                            {formatDate(getEntryDate(row))}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {row.debit?.toFixed(2) || "-"}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {row.credit?.toFixed(2) || "-"}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {((row.debit || 0) - (row.credit || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="font-semibold bg-gray-100">
                        <td className="border px-2 py-1" colSpan={2}>
                          Totals
                        </td>
                        {(() => {
                          const totals = getTotals(
                            getTableData(ACCOUNTS_TABLE2)
                          );
                          return [
                            <td
                              className="border px-2 py-1 text-right"
                              key="debit"
                            >
                              {totals.debit.toFixed(2)}
                            </td>,
                            <td
                              className="border px-2 py-1 text-right"
                              key="credit"
                            >
                              {totals.credit.toFixed(2)}
                            </td>,
                            <td
                              className="border px-2 py-1 text-right"
                              key="net"
                            >
                              {totals.net.toFixed(2)}
                            </td>,
                          ];
                        })()}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Print styles */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .printable-hst-report, .printable-hst-report * {
                  visibility: visible;
                }
                .printable-hst-report {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100vw;
                  background: white;
                  padding: 0;
                  margin: 0;
                }
                nav, .FinanceSidebar, .bg-white.p-6.rounded-lg.shadow-md > div:not(.printable-hst-report) {
                  display: none !important;
                }
                .bg-white.p-6.rounded-lg.shadow-md {
                  box-shadow: none !important;
                  padding: 0 !important;
                }
                .print-header { display: block !important; }
              }
              .print-header { display: none; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSTReport;
