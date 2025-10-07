import React, { useEffect, useState } from "react";

import { scannedAccounts } from "./ChartOfAccountsMenu.jsx";

import { toast } from "react-toastify";

import axiosInstance from "../config/axios";

const TrialBalanceCard = () => {
  const [ledgerEntries, setLedgerEntries] = useState([]);

  const [accountSums, setAccountSums] = useState({});

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [clearing, setClearing] = useState(false);

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

  const fetchLedger = async () => {
    setLoading(true);

    setError("");

    try {
      const res = await axiosInstance.get("/ledger");

      // Get cash receipt transactions from localStorage

      const cashReceiptTransactions = JSON.parse(
        localStorage.getItem("trialBalanceTransactions") || "[]"
      );

      // Combine backend data with cash receipt transactions

      const allEntries = [...cashReceiptTransactions, ...res.data];

      // Sort all entries by date (newest first)

      allEntries.sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt)
          : new Date(a.date || 0);

        const dateB = b.createdAt
          ? new Date(b.createdAt)
          : new Date(b.date || 0);

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
    } catch (err) {
      setLedgerEntries([]);

      setAccountSums({});

      const errorMessage =
        err.response?.data?.message || "Failed to fetch ledger data";

      setError(errorMessage);

      console.error("Error fetching ledger:", err);
    }

    setLoading(false);
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL trial balance data? This action cannot be undone."
      )
    ) {
      setClearing(true);

      setError("");

      try {
        await axiosInstance.get("/ledger"); // check server

        const res = await axiosInstance.delete("/ledger");

        // Clear localStorage AR transactions and reset AR number counter

        // This ensures AR transactions are removed from Trial Balance and Accounts Receivable

        localStorage.removeItem("trialBalanceTransactions");

        localStorage.removeItem("lastARNumber");

        setLedgerEntries([]);

        setAccountSums({});

        toast.success(
          "All trial balance data and AR transactions cleared successfully."
        );
      } catch (err) {
        const errorMessage =
          err.message ||
          err.response?.data?.message ||
          "Failed to clear trial balance data";

        setError(errorMessage);

        toast.error(errorMessage);

        console.error("Error clearing data:", err);
      }

      setClearing(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Trial Balance</h2>

        <div className="flex gap-2">
          <button
            onClick={fetchLedger}
            disabled={loading || clearing}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={handleClearAllData}
            disabled={clearing || loading}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Clear All Data"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}

      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left text-xs">
                Account Number
              </th>

              <th className="border border-gray-300 px-2 py-1 text-left text-xs">
                Account Name
              </th>

              <th
                className="border border-gray-300 px-2 py-1 text-left text-xs"
                style={{ minWidth: "80px", width: "80px" }}
              >
                Date
              </th>

              <th className="border border-gray-300 px-2 py-1 text-left text-xs">
                Reference #
              </th>

              <th className="border border-gray-300 px-2 py-1 text-left text-xs">
                Description
              </th>

              <th className="border border-gray-300 px-2 py-1 text-right text-xs">
                Debit
              </th>

              <th className="border border-gray-300 px-2 py-1 text-right text-xs">
                Credit
              </th>

              <th className="border border-gray-300 px-2 py-1 text-right text-xs">
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

              const openingBalance = 0;

              const balance = openingBalance + sums.debit - sums.credit;

              const hasTransactions = sums.transactions.length > 0;

              return (
                <React.Fragment key={acct.acct}>
                  {/* Main account row */}

                  <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2 py-1 text-xs">
                      {acct.acct}
                    </td>

                    <td className="border border-gray-300 px-2 py-1 text-xs">
                      {acct.description}
                    </td>

                    <td
                      className="border border-gray-300 px-2 py-1 text-xs"
                      style={{ minWidth: "80px", width: "80px" }}
                    ></td>

                    <td className="border border-gray-300 px-2 py-1 text-xs"></td>

                    <td className="border border-gray-300 px-2 py-1 text-xs"></td>

                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                      {sums.debit !== 0 ? sums.debit.toFixed(2) : "-"}
                    </td>

                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                      {sums.credit !== 0 ? sums.credit.toFixed(2) : "-"}
                    </td>

                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                      {balance !== 0 ? balance.toFixed(2) : "-"}
                    </td>
                  </tr>

                  {/* Only show opening/closing balance if there are transactions */}

                  {hasTransactions && (
                    <>
                      {/* Opening Balance row (before transactions) */}

                      <tr className="bg-gray-100">
                        <td className="px-2 py-1"></td>

                        <td className="px-2 py-1"></td>

                        <td
                          className="px-2 py-1"
                          style={{ minWidth: "80px", width: "80px" }}
                        ></td>

                        <td className="px-2 py-1"></td>

                        <td className="px-2 py-1 font-semibold text-xs">
                          Opening Balance
                        </td>

                        <td className="px-2 py-1 text-right font-semibold text-xs">
                          -
                        </td>

                        <td className="px-2 py-1 text-right font-semibold text-xs">
                          -
                        </td>
                      </tr>

                      {/* Transaction rows */}

                      {sums.transactions.map((tx, txIndex) => (
                        <tr
                          key={`${acct.acct}-${txIndex}`}
                          className="bg-gray-100 text-xs"
                        >
                          <td className="px-2 py-1"></td>

                          <td className="px-2 py-1"></td>

                          <td
                            className="px-2 py-1"
                            style={{ minWidth: "80px", width: "80px" }}
                          >
                            {(() => {
                              // For cash receipts, use the date from the form
                              if (tx.type === "Cash Receipt") {
                                return tx.date ? formatDate(tx.date) : "-";
                              }

                              // For AP transactions, prioritize the date field if available
                              if (tx.apNumber && tx.date) {
                                return formatDate(tx.date);
                              }

                              // For ledger transactions, prioritize chequeDate if available, then date field
                              if (tx.chequeDate) {
                                return formatDate(tx.chequeDate);
                              }

                              if (tx.date) {
                                return formatDate(tx.date);
                              }

                              // For other transactions, use createdAt as fallback
                              return tx.createdAt
                                ? formatDate(tx.createdAt)
                                : "-";
                            })()}
                          </td>

                          <td className="px-2 py-1">
                            {(() => {
                              // For cash receipts, show AR number in Reference # column

                              if (tx.type === "Cash Receipt") {
                                return tx.reference && tx.reference !== "null"
                                  ? tx.reference
                                  : "-";
                              }

                              // For AP transactions, show AP number

                              if (tx.apNumber) {
                                return tx.apNumber;
                              }

                              // For journal entries, show the reference number

                              if (tx.type === "Journal Entry") {
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

                              return tx.eftNumber ? `EFT${tx.eftNumber}` : "-";
                            })()}
                          </td>

                          <td className="px-2 py-1">{tx.description}</td>

                          <td className="px-2 py-1 text-right">
                            {tx.debit ? tx.debit.toFixed(2) : "-"}
                          </td>

                          <td className="px-2 py-1 text-right">
                            {tx.credit ? tx.credit.toFixed(2) : "-"}
                          </td>

                          <td className="px-2 py-1"></td>
                        </tr>
                      ))}

                      {/* Closing Balance row (after transactions) */}

                      <tr className="bg-gray-100">
                        <td className="px-2 py-1"></td>

                        <td className="px-2 py-1"></td>

                        <td
                          className="px-2 py-1"
                          style={{ minWidth: "80px", width: "80px" }}
                        ></td>

                        <td className="px-2 py-1"></td>

                        <td className="px-2 py-1 font-semibold text-xs">
                          Closing Balance
                        </td>

                        <td className="px-2 py-1 text-right font-semibold text-xs">
                          -
                        </td>

                        <td className="px-2 py-1 text-right font-semibold text-xs">
                          -
                        </td>

                        <td className="px-2 py-1 text-right font-semibold text-xs">
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

      <div className="mt-4 text-xs text-gray-600">
        Total Entries: {ledgerEntries.length} | Last Updated:{" "}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TrialBalanceCard;
