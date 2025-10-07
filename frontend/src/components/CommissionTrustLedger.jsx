import React, { useState } from "react";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import { toast } from "react-toastify";
import { FaPrint } from "react-icons/fa";
import logo1 from "../Assets/logo1.jpg";
import axiosInstance from "../config/axios";

const CommissionTrustLedger = () => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: "",
  });

  // Fetch ledger entries for Commission Trust Account (10004)
  const fetchLedgerEntries = async () => {
    try {
      setLoading(true);
      console.log("Searching for ledger entries with params:", {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        accountNumber: "10004",
      });

      const response = await axiosInstance.get(`/ledger/account/10004`, {
        params: {
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate,
        },
      });

      console.log("Response received:", response.data);
      console.log("Number of entries found:", response.data.length);

      setLedgerEntries(response.data);
    } catch (error) {
      console.error("Error fetching ledger entries:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to fetch ledger entries");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    if (!dateRange.fromDate || !dateRange.toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (new Date(dateRange.fromDate) > new Date(dateRange.toDate)) {
      toast.error("From date cannot be after to date");
      return;
    }
    fetchLedgerEntries();
  };

  const handlePrint = () => {
    if (ledgerEntries.length === 0) {
      toast.error("No data to print. Please search for ledger entries first.");
      return;
    }
    window.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="flex">
        <div className="print:hidden">
          <FinanceSidebar />
        </div>
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 print:hidden">
                Commission Trust Ledger
              </h2>
              {ledgerEntries.length > 0 && (
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 print:hidden"
                >
                  <FaPrint />
                  Print Report
                </button>
              )}
            </div>

            {/* Date Range Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg print:hidden">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Select Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.fromDate}
                    onChange={(e) =>
                      handleDateRangeChange("fromDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.toDate}
                    onChange={(e) =>
                      handleDateRangeChange("toDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Search"}
                  </button>
                </div>
              </div>
            </div>

            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block print:mb-6">
              <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
                <div className="flex items-center">
                  <img
                    src={logo1}
                    alt="Bestway Real Estate Ltd. Logo"
                    className="w-16 h-16 mr-4"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-gray-800">
                      Bestway Real Estate Ltd., Brokerage
                    </h1>
                    <p className="text-sm text-gray-600">
                      Commission Trust Ledger Report
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    Report Date: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    Period: {dateRange.fromDate} to {dateRange.toDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Ledger Entries Table */}
            {ledgerEntries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 print:hidden">
                  Ledger Entries
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 ledger-table table-fixed">
                    {/* Column widths tuned to match the screenshot */}
                    <colgroup>
                      <col style={{ width: "8%" }} /> {/* Date */}
                      <col style={{ width: "10%" }} /> {/* Reference */}
                      <col style={{ width: "38%" }} />{" "}
                      {/* Description (wide) */}
                      <col style={{ width: "8%" }} /> {/* Type (narrow) */}
                      <col style={{ width: "12%" }} /> {/* Amount (medium) */}
                      <col style={{ width: "8%" }} />{" "}
                      {/* Trade Number (narrow) */}
                      <col style={{ width: "16%" }} /> {/* Payee (wide) */}
                    </colgroup>

                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r">
                          Date
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r">
                          Reference
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r">
                          Description
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r">
                          Type
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r">
                          Amount
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r">
                          Trade Number
                        </th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b">
                          Payee
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((entry, index) => (
                        <tr
                          key={index}
                          className="border-b hover:bg-gray-50 align-top"
                        >
                          <td className="px-3 py-2 text-sm text-left border-r">
                            {(() => {
                              const dateToUse =
                                entry.chequeDate ||
                                entry.date ||
                                entry.createdAt;
                              return dateToUse
                                ? new Date(dateToUse).toLocaleDateString()
                                : "-";
                            })()}
                          </td>
                          <td className="px-3 py-2 text-sm text-left border-r">
                            {entry.reference || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-sm text-left border-r whitespace-pre-line break-words">
                            {entry.description}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-black type-badge">
                              {entry.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-center border-r tabular-nums">
                            ${parseFloat(entry.amount).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-sm text-center border-r">
                            {entry.tradeNumber || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-sm text-left break-words">
                            {(() => {
                              // If payee is already set, use it
                              if (entry.payee) {
                                return entry.payee;
                              }

                              // For Debit transactions (money received), extract name from description
                              if (entry.type === "Debit" && entry.description) {
                                const receivedFromMatch =
                                  entry.description.match(
                                    /Received from:\s*([^-]+)/
                                  );
                                if (receivedFromMatch) {
                                  return `Received from: ${receivedFromMatch[1].trim()}`;
                                } else {
                                  // Fallback: try to extract name from other patterns
                                  const nameMatch = entry.description.match(
                                    /Trade #:?\s*\d+\s*-\s*([^-]+?)\s*-\s*[^-]+$/
                                  );
                                  if (nameMatch) {
                                    return `Received from: ${nameMatch[1].trim()}`;
                                  }
                                }
                              }

                              // For Credit transactions (money paid), extract name from description
                              if (
                                entry.type === "Credit" &&
                                entry.description
                              ) {
                                const paidToMatch =
                                  entry.description.match(/Paid to:\s*([^-]+)/);
                                if (paidToMatch) {
                                  return `Paid to: ${paidToMatch[1].trim()}`;
                                } else {
                                  // Fallback: try to extract name from other patterns
                                  const nameMatch = entry.description.match(
                                    /Trade #:?\s*\d+\s*-\s*([^-]+?)\s*-\s*[^-]+$/
                                  );
                                  if (nameMatch) {
                                    return `Paid to: ${nameMatch[1].trim()}`;
                                  }
                                }
                              }

                              return "N/A";
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Total Debits: </span>
                      <span className="text-black font-medium">
                        $
                        {ledgerEntries
                          .filter((entry) => entry.type === "Debit")
                          .reduce(
                            (sum, entry) => sum + parseFloat(entry.amount),
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Total Credits: </span>
                      <span className="text-black font-medium">
                        $
                        {ledgerEntries
                          .filter((entry) => entry.type === "Credit")
                          .reduce(
                            (sum, entry) => sum + parseFloat(entry.amount),
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ledgerEntries.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  No ledger entries found. Please select a date range and
                  search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionTrustLedger;
