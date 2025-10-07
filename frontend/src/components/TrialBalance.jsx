import React, { useEffect, useState, useRef } from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";

import FinanceSidebar from "./FinanceSidebar";

import { scannedAccounts } from "./ChartOfAccountsMenu.jsx";

import logo from "../Assets/logo1.jpg";

import { toast } from "react-toastify";

import axiosInstance from "../config/axios";

const TrialBalance = () => {
  const [ledgerEntries, setLedgerEntries] = useState([]);

  const [accountSums, setAccountSums] = useState({});

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const printRef = useRef();

  const navigate = useNavigate();

  // Helper function to format dates in local timezone to avoid UTC conversion issues
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    // Handle both Date objects and date strings
    let date;
    if (dateString instanceof Date) {
      date = dateString;
    } else {
      // Parse the date string and create a date in local timezone
      const [year, month, day] = dateString.split("-");
      if (year && month && day) {
        // Create date in local timezone to avoid UTC conversion issues
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Fallback to original method for other date formats
        date = new Date(dateString);
      }
    }

    return date.toLocaleDateString();
  };

  // Check if user is finance admin

  useEffect(() => {
    const isFinanceAdmin = sessionStorage.getItem("isFinanceAdmin") === "true";

    if (!isFinanceAdmin) {
      navigate("/");
    }
  }, [navigate]);

  const fetchLedger = async (from, to) => {
    setLoading(true);

    setError("");

    try {
      const res = await axiosInstance.get("/ledger", {
        params: from && to ? { from, to } : {},
      });

      console.log("=== Trial Balance Debug ===");
      console.log("Backend response:", res.data);
      console.log("Sample ledger entry:", res.data[0]);
      console.log("Sample entry date field:", res.data[0]?.date);
      console.log("Sample entry createdAt field:", res.data[0]?.createdAt);

      // Get cash receipt transactions from localStorage

      const cashReceiptTransactions = JSON.parse(
        localStorage.getItem("trialBalanceTransactions") || "[]"
      );

      // Filter localStorage transactions by date range if dates are provided

      let filteredCashReceiptTransactions = cashReceiptTransactions;

      if (from && to) {
        const startDate = new Date(from);

        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(to);

        endDate.setUTCHours(23, 59, 59, 999);

        filteredCashReceiptTransactions = cashReceiptTransactions.filter(
          (entry) => {
            const entryDate = entry.date
              ? new Date(entry.date)
              : new Date(entry.createdAt || 0);

            return entryDate >= startDate && entryDate <= endDate;
          }
        );
      }

      // Combine backend data with filtered cash receipt transactions

      const allEntries = [...filteredCashReceiptTransactions, ...res.data];

      // Sort all entries by date (newest first)

      allEntries.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(a.createdAt || 0);

        const dateB = b.date ? new Date(b.date) : new Date(b.createdAt || 0);

        return dateB - dateA; // Descending order (newest first)
      });

      setLedgerEntries(allEntries);

      // Calculate sums

      const sums = {};

      allEntries.forEach((entry) => {
        if (!sums[entry.accountNumber]) {
          sums[entry.accountNumber] = {
            debit: 0,

            credit: 0,

            transactions: [],
          };
        }

        sums[entry.accountNumber].debit += entry.debit || 0;

        sums[entry.accountNumber].credit += entry.credit || 0;

        sums[entry.accountNumber].transactions.push(entry);
      });

      // Sort transactions within each account by date (newest first)

      Object.keys(sums).forEach((accountNumber) => {
        sums[accountNumber].transactions.sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt)
            : new Date(a.date || 0);

          const dateB = b.createdAt
            ? new Date(b.createdAt)
            : new Date(b.date || 0);

          return dateB - dateA; // Descending order (newest first)
        });
      });

      setAccountSums(sums);

      if (from && to) {
        toast.success(`Trial balance loaded for ${allEntries.length} entries`);
      }
    } catch (err) {
      setLedgerEntries([]);

      setAccountSums({});

      const errorMessage =
        err.response?.data?.message || "Failed to fetch ledger data";

      setError(errorMessage);

      toast.error(errorMessage);

      console.error("Error fetching ledger:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // Listen for refreshTrialBalance events
  useEffect(() => {
    const handleRefreshTrialBalance = () => {
      console.log(
        "Received refreshTrialBalance event, refreshing trial balance..."
      );
      fetchLedger();
    };

    window.addEventListener("refreshTrialBalance", handleRefreshTrialBalance);

    return () => {
      window.removeEventListener(
        "refreshTrialBalance",
        handleRefreshTrialBalance
      );
    };
  }, []);

  const handleCheckReport = () => {
    if (fromDate && toDate) {
      fetchLedger(fromDate, toDate);
    } else {
      toast.error("Please select both from and to dates");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="flex">
        {/* Left Sidebar */}

        <div className="print:hidden">
          <FinanceSidebar />
        </div>

        {/* Main Content */}

        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Print Header - Only visible when printing */}

            <div className="hidden print:block print:mb-6">
              <img
                src={logo}
                alt="Company Logo"
                className="mx-auto mb-2"
                style={{ maxWidth: 80, maxHeight: 80 }}
              />

              <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">
                Bestway Real Estate Ltd., Brokerage
              </h2>

              <div className="text-base font-semibold mb-1">
                Trial Balance - Detail Balance
              </div>

              {fromDate && toDate && (
                <div className="text-gray-700 mb-2 text-sm">
                  From{" "}
                  <span className="font-semibold">
                    {new Date(fromDate).toLocaleDateString()}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {new Date(toDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Date Range Picker and Print Button */}

            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6 print:hidden">
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
                {loading ? "Loading..." : "Check Trial Balance"}
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded mt-4 md:mt-0"
                onClick={handlePrint}
                style={{ marginLeft: 8 }}
              >
                Print Report
              </button>
            </div>

            {error && (
              <div className="text-red-600 mb-4 print:hidden">{error}</div>
            )}

            {/* Detailed Trial Balance Table */}

            <div className="overflow-x-auto" ref={printRef}>
              <table className="min-w-full border border-gray-300 ledger-table">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-700">
                      Account Number
                    </th>

                    <th
                      className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-700"
                      style={{ minWidth: "200px", width: "200px" }}
                    >
                      Account Name
                    </th>

                    <th
                      className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-700"
                      style={{ minWidth: "80px", width: "80px" }}
                    >
                      Date
                    </th>

                    <th
                      className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-700"
                      style={{ minWidth: "80px", width: "80px" }}
                    >
                      Reference #
                    </th>

                    <th
                      className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-700"
                      style={{ minWidth: "300px", width: "300px" }}
                    >
                      Description
                    </th>

                    <th className="border border-gray-300 px-4 py-2 text-right text-xs font-medium text-gray-700">
                      Debit
                    </th>

                    <th className="border border-gray-300 px-4 py-2 text-right text-xs font-medium text-gray-700">
                      Credit
                    </th>

                    <th className="border border-gray-300 px-4 py-2 text-right text-xs font-medium text-gray-700">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {scannedAccounts.map((acct, index) => {
                    const sums = accountSums[acct.acct] || {
                      debit: 0,

                      credit: 0,

                      transactions: [],
                    };

                    // Assume opening balance is 0 for now

                    const openingBalance = 0;

                    const balance = openingBalance + sums.debit - sums.credit;

                    const hasTransactions = sums.transactions.length > 0;

                    return (
                      <React.Fragment key={acct.acct}>
                        {/* Main account row */}

                        <tr
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border border-gray-300 px-4 py-2 text-xs">
                            {acct.acct}
                          </td>

                          <td
                            className="border border-gray-300 px-4 py-2 text-xs"
                            style={{ minWidth: "200px", width: "200px" }}
                          >
                            {acct.description}
                          </td>

                          <td
                            className="border border-gray-300 px-4 py-2 text-xs"
                            style={{ minWidth: "80px", width: "80px" }}
                          ></td>

                          <td
                            className="border border-gray-300 px-4 py-2 text-xs"
                            style={{ minWidth: "80px", width: "80px" }}
                          ></td>

                          <td
                            className="border border-gray-300 px-4 py-2 text-xs"
                            style={{ minWidth: "300px", width: "300px" }}
                          ></td>

                          <td className="border border-gray-300 px-4 py-2 text-right text-xs font-medium">
                            {sums.debit !== 0 ? sums.debit.toFixed(2) : "-"}
                          </td>

                          <td className="border border-gray-300 px-4 py-2 text-right text-xs font-medium">
                            {sums.credit !== 0 ? sums.credit.toFixed(2) : "-"}
                          </td>

                          <td className="border border-gray-300 px-4 py-2 text-right text-xs font-medium">
                            {balance !== 0 ? balance.toFixed(2) : "-"}
                          </td>
                        </tr>

                        {/* Only show opening/closing balance if there are transactions */}

                        {hasTransactions && (
                          <>
                            {/* Opening Balance row (before transactions) */}

                            <tr className="bg-gray-100">
                              <td className="px-4 py-1 text-xs"></td>

                              <td className="px-4 py-1 text-xs"></td>

                              <td
                                className="px-4 py-1 text-xs"
                                style={{ minWidth: "80px", width: "80px" }}
                              ></td>

                              <td
                                className="px-4 py-1 text-xs"
                                style={{ minWidth: "80px", width: "80px" }}
                              ></td>

                              <td
                                className="px-4 py-1 text-xs"
                                style={{ minWidth: "200px", width: "200px" }}
                              ></td>

                              <td className="px-4 py-1 text-xs font-semibold">
                                Opening Balance
                              </td>

                              <td className="px-4 py-1 text-right text-xs font-semibold">
                                -
                              </td>

                              <td className="px-4 py-1 text-right text-xs font-semibold">
                                {openingBalance !== 0
                                  ? openingBalance.toFixed(2)
                                  : "-"}
                              </td>
                            </tr>

                            {/* Transaction rows */}

                            {sums.transactions.map((tx) => (
                              <tr key={tx._id} className="bg-gray-100">
                                <td className="px-4 py-1 text-xs"></td>

                                <td className="px-4 py-1 text-xs"></td>

                                <td
                                  className="px-4 py-1 text-xs"
                                  style={{ minWidth: "80px", width: "80px" }}
                                >
                                  {(() => {
                                    // Debug logging
                                    console.log(
                                      "Transaction for date display:",
                                      tx
                                    );
                                    console.log(
                                      "Transaction date field:",
                                      tx.date
                                    );
                                    console.log(
                                      "Transaction createdAt field:",
                                      tx.createdAt
                                    );
                                    console.log("Transaction type:", tx.type);

                                    // For cash receipts, use the date from the form
                                    if (tx.type === "Cash Receipt") {
                                      return tx.date
                                        ? formatDate(tx.date)
                                        : "-";
                                    }

                                    // For AP transactions, prioritize the date field if available
                                    if (tx.apNumber && tx.date) {
                                      console.log(
                                        "Using tx.date for AP transaction:",
                                        tx.date
                                      );
                                      return formatDate(tx.date);
                                    }

                                    // For ledger transactions, prioritize chequeDate if available, then date field
                                    if (tx.chequeDate) {
                                      console.log(
                                        "Using tx.chequeDate for display:",
                                        tx.chequeDate
                                      );
                                      return formatDate(tx.chequeDate);
                                    }

                                    if (tx.date) {
                                      console.log(
                                        "Using tx.date for display:",
                                        tx.date
                                      );
                                      return formatDate(tx.date);
                                    }

                                    // For other transactions, use createdAt as fallback
                                    console.log(
                                      "Using tx.createdAt as fallback:",
                                      tx.createdAt
                                    );
                                    return tx.createdAt
                                      ? formatDate(tx.createdAt)
                                      : "-";
                                  })()}
                                </td>

                                <td
                                  className="px-4 py-1 text-xs"
                                  style={{ minWidth: "80px", width: "80px" }}
                                >
                                  {(() => {
                                    // For cash receipts, show AR number in Reference # column

                                    if (tx.type === "Cash Receipt") {
                                      return tx.reference &&
                                        tx.reference !== "null"
                                        ? tx.reference
                                        : "-";
                                    }

                                    // For AP transactions, show AP number

                                    if (tx.apNumber) {
                                      return tx.apNumber;
                                    }

                                    // For journal entries, show the reference number

                                    if (tx.type === "Journal Entry") {
                                      console.log("Journal Entry found:", tx);

                                      return tx.reference || "-";
                                    }

                                    // For other transactions with reference numbers

                                    if (
                                      tx.reference &&
                                      tx.reference !== "Manual Journal Entry"
                                    ) {
                                      return tx.reference;
                                    }

                                    // For other transactions, show EFT number as 'EFT89'

                                    return tx.eftNumber
                                      ? `EFT${tx.eftNumber}`
                                      : "-";
                                  })()}
                                </td>

                                <td
                                  className="px-4 py-1 text-xs"
                                  style={{ minWidth: "300px", width: "300px" }}
                                >
                                  {tx.description}
                                </td>

                                <td className="px-4 py-1 text-right text-xs">
                                  {tx.debit ? tx.debit.toFixed(2) : "-"}
                                </td>

                                <td className="px-4 py-1 text-right text-xs">
                                  {tx.credit ? tx.credit.toFixed(2) : "-"}
                                </td>

                                <td className="px-4 py-1 text-xs"></td>
                              </tr>
                            ))}

                            {/* Closing Balance row (after transactions) */}

                            <tr className="bg-gray-100">
                              <td className="px-4 py-1 text-xs"></td>

                              <td className="px-4 py-1 text-xs"></td>

                              <td
                                className="px-4 py-1 text-xs"
                                style={{ minWidth: "80px", width: "80px" }}
                              ></td>

                              <td
                                className="px-4 py-1 text-xs"
                                style={{ minWidth: "80px", width: "80px" }}
                              ></td>

                              <td
                                className="px-4 py-1 text-xs"
                                style={{ minWidth: "300px", width: "300px" }}
                              ></td>

                              <td className="px-4 py-1 text-xs font-semibold">
                                Closing Balance
                              </td>

                              <td className="px-4 py-1 text-right text-xs font-semibold">
                                -
                              </td>

                              <td className="px-4 py-1 text-right text-xs font-semibold">
                                {balance !== 0 ? balance.toFixed(2) : "-"}
                              </td>
                            </tr>
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
