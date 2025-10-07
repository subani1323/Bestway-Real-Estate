import React, { useState } from "react";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import axiosInstance from "../config/axios";

const ReconcileRealEstateTrust = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementAmount, setStatementAmount] = useState(() => {
    // Load statement amount from localStorage on component mount
    const saved = localStorage.getItem(
      "reconcileRealEstateTrust_statementAmount"
    );
    return saved || "";
  });
  const [clearedTransactions, setClearedTransactions] = useState(new Set());
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleRetrieveData = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);
    try {
      // Fetch ledger entries for account 10002 (Cash - Trust) within the date range
      const response = await axiosInstance.get(`/ledger/account/10002`, {
        params: {
          fromDate: fromDate,
          toDate: toDate,
        },
      });

      setTransactions(response.data);
      setShowTable(true);

      // Load cleared transaction status from database
      await loadClearedTransactions(response.data);
    } catch (error) {
      console.error("Error fetching ledger entries:", error);
      alert("Error retrieving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadClearedTransactions = async (transactionsData) => {
    try {
      const response = await axiosInstance.get(
        `/reconciliation-settings/10002`,
        {
          params: {
            fromDate: fromDate,
            toDate: toDate,
          },
        }
      );

      if (response.data.clearedTransactions) {
        const clearedIds = new Set(
          response.data.clearedTransactions.map((ct) => ct.ledgerId)
        );

        // Map ledger IDs to transaction indices
        const newClearedTransactions = new Set();
        transactionsData.forEach((transaction, index) => {
          if (clearedIds.has(transaction._id)) {
            newClearedTransactions.add(index);
          }
        });

        setClearedTransactions(newClearedTransactions);
      }

      // Load statement amount if available (prioritize localStorage over database)
      const localStatementAmount = localStorage.getItem(
        "reconcileRealEstateTrust_statementAmount"
      );
      if (localStatementAmount) {
        setStatementAmount(localStatementAmount);
      } else if (
        response.data.statementAmount !== null &&
        response.data.statementAmount !== undefined
      ) {
        setStatementAmount(response.data.statementAmount.toString());
      }
    } catch (error) {
      console.error("Error loading cleared transactions:", error);
      // Don't show error to user as this is not critical
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  // Calculate reconciliation values
  const calculateReconciliationValues = () => {
    if (transactions.length === 0) return { book: 0, open: 0, misc: 0 };

    // Filter out cleared transactions for Open calculation
    const unclearedTransactions = transactions.filter(
      (t, index) => !clearedTransactions.has(index)
    );

    const chequesCleared = transactions
      .filter((t) => t.type === "Credit")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const depositsCleared = transactions
      .filter((t) => t.type === "Debit")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    // Calculate Open based on uncleared transactions only
    const unclearedCheques = unclearedTransactions
      .filter((t) => t.type === "Credit")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const unclearedDeposits = unclearedTransactions
      .filter((t) => t.type === "Debit")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    // Calculate Book value as closing balance from trial balance
    // Book = Total Debits - Total Credits (this represents the net position)
    const totalDebits = transactions
      .filter((t) => t.type === "Debit")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const totalCredits = transactions
      .filter((t) => t.type === "Credit")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const book = totalDebits - totalCredits; // This gives us the closing balance
    const open = unclearedCheques + unclearedDeposits; // Total Credits + Total Debits (uncleared only)
    const misc = 0.0;

    return { book, open, misc, chequesCleared, depositsCleared };
  };

  const handleStatementInput = () => {
    setShowStatementModal(true);
  };

  const handleStatementSubmit = async () => {
    try {
      // Save statement amount to database
      await axiosInstance.put(
        `/reconciliation-settings/10002/statement-amount`,
        {
          fromDate: fromDate,
          toDate: toDate,
          statementAmount: parseFloat(statementAmount) || null,
        }
      );

      // Save to localStorage for persistence across browser refresh
      localStorage.setItem(
        "reconcileRealEstateTrust_statementAmount",
        statementAmount
      );

      setShowStatementModal(false);
    } catch (error) {
      console.error("Error saving statement amount:", error);
      alert("Error saving statement amount. Please try again.");
    }
  };

  const handleRowClick = (transaction, index) => {
    setSelectedTransaction({ ...transaction, index });
    setShowClearModal(true);
  };

  const handleClearTransaction = async (shouldClear) => {
    if (selectedTransaction) {
      const newClearedTransactions = new Set(clearedTransactions);

      if (shouldClear) {
        // Clear the transaction (remove from Open calculation)
        newClearedTransactions.add(selectedTransaction.index);
      } else {
        // Unclear the transaction (add back to Open calculation)
        newClearedTransactions.delete(selectedTransaction.index);
      }

      setClearedTransactions(newClearedTransactions);

      // Save to database
      try {
        await axiosInstance.put(
          `/reconciliation-settings/10002/cleared-transactions`,
          {
            fromDate: fromDate,
            toDate: toDate,
            ledgerId: selectedTransaction._id,
            shouldClear: shouldClear,
          }
        );
      } catch (error) {
        console.error("Error saving cleared transaction status:", error);
        // Revert the local state if database save fails
        if (shouldClear) {
          newClearedTransactions.delete(selectedTransaction.index);
        } else {
          newClearedTransactions.add(selectedTransaction.index);
        }
        setClearedTransactions(newClearedTransactions);
        alert("Error saving transaction status. Please try again.");
      }
    }
    setShowClearModal(false);
    setSelectedTransaction(null);
  };

  const reconciliationValues = calculateReconciliationValues();

  const handlePrint = () => {
    if (!showTable || transactions.length === 0) {
      alert("Please retrieve data first before printing.");
      return;
    }

    // Get uncleared transactions
    const unclearedTransactions = transactions.filter(
      (t, index) => !clearedTransactions.has(index)
    );
    const totalOutstanding = unclearedTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const reconciledBalance =
      (parseFloat(statementAmount) || 0) - totalOutstanding;

    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bestway Real Estate Ltd., Brokerage Real Estate Trust Account Reconciliation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; font-size: 11px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { max-width: 200px; margin-bottom: 10px; }
            .company-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
            .report-title { font-size: 14px; color: #666; margin-bottom: 5px; }
            .date-info { font-size: 12px; color: #666; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .balance-amount { font-size: 16px; font-weight: bold; color: #333; }
            .transactions-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .transactions-table th, .transactions-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            .transactions-table th { background: #f5f5f5; font-weight: bold; }
            .transactions-table th:nth-child(4), .transactions-table td:nth-child(4) { width: 120px; min-width: 120px; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .ledger-summary { background: #f9f9f5; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .ledger-summary h4 { margin-top: 0; color: #333; font-size: 12px; }
            .ledger-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px; }
            .ledger-item { display: flex; justify-content: space-between; font-size: 10px; }
            .note { font-style: italic; color: #666; margin-top: 15px; font-size: 10px; }
            .approval-section { margin-top: 40px; }
            .approval-line { margin: 20px 0; font-size: 10px; }
            .approval-label { display: inline-block; width: 120px; font-weight: bold; }
            .approval-underline { display: inline-block; width: 200px; border-bottom: 1px solid #333; margin-left: 10px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo1.jpg" alt="Bestway Real Estate Ltd. Logo" class="logo">
            <div class="company-name">Bestway Real Estate Ltd., Brokerage</div>
            <div class="report-title">Real Estate Trust XXXX6067 GL#10002 Account Reconciliation</div>
            <div class="date-info">As of ${(() => {
              // Parse the date string to avoid timezone issues
              const [year, month, day] = toDate.split("-");
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
            })()}</div>
          </div>

          <div class="section">
            <div class="section-title">Balance Per Bank Statement</div>
            <div class="balance-amount">${
              statementAmount
                ? formatAmount(parseFloat(statementAmount))
                : "Not entered"
            }</div>
          </div>

          <div class="section">
            <div class="section-title">Outstanding Transactions</div>
            ${
              unclearedTransactions.length > 0
                ? `
              <table class="transactions-table">
                <thead>
                  <tr>
                    <th>Trade #</th>
                    <th>Address</th>
                    <th>Payee</th>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${unclearedTransactions
                    .map((transaction) => {
                      // Extract address from description
                      const addressMatch = (
                        transaction.description ||
                        transaction.narration ||
                        ""
                      ).match(/- ([^-]+)$/);
                      const address = addressMatch ? addressMatch[1] : "-";

                      // Use actual payee from EFT record if available, otherwise extract from description
                      let payee = transaction.payee || "-";
                      if (payee === "-") {
                        // First try to extract "Received from" for deposits
                        const receivedFromMatch = (
                          transaction.description ||
                          transaction.narration ||
                          ""
                        ).match(/Received from: ([^-]+)/);
                        if (receivedFromMatch) {
                          payee = receivedFromMatch[1].trim();
                        } else {
                          // Fallback to "Paid to" for payments
                          const payeeMatch = (
                            transaction.description ||
                            transaction.narration ||
                            ""
                          ).match(/Paid to: ([^-]+)/);
                          payee = payeeMatch ? payeeMatch[1].trim() : "-";
                        }
                      }

                      // Format payee based on transaction type
                      if (payee !== "-") {
                        // Check transaction type to determine prefix
                        const isCredit = transaction.type === "Credit";

                        if (isCredit) {
                          // For Credit transactions, show "Paid to:"
                          if (!payee.toLowerCase().includes("paid to:")) {
                            payee = `Paid to: ${payee}`;
                          }
                        } else {
                          // For Debit transactions, show "Received from:"
                          if (!payee.toLowerCase().includes("received from:")) {
                            payee = `Received from: ${payee}`;
                          }
                        }
                      }

                      // Determine what to show in the Trade # column
                      let tradeDisplay = transaction.tradeNumber || "-";

                      return `
                      <tr>
                        <td>${tradeDisplay}</td>
                        <td>${address}</td>
                        <td>${payee}</td>
                        <td>${formatDate(
                          transaction.date || transaction.transactionDate
                        )}</td>
                        <td>${
                          transaction.reference &&
                          transaction.reference !== "null" &&
                          transaction.reference !== null &&
                          transaction.reference.trim() !== ""
                            ? transaction.reference
                            : "-"
                        }</td>
                        <td>${formatAmount(transaction.amount || 0)}</td>
                      </tr>
                    `;
                    })
                    .join("")}
                  <tr class="total-row">
                    <td colspan="5">Total Outstanding</td>
                    <td>${formatAmount(totalOutstanding)}</td>
                  </tr>
                </tbody>
              </table>
              <div style="margin-top: 15px; font-weight: bold;">
                Reconciled Balance: ${formatAmount(reconciledBalance)}
              </div>
            `
                : "<p>No outstanding transactions</p>"
            }
          </div>

          <div class="section">
            <div class="section-title">Balance Per Real Estate Trust Ledger</div>
            <div class="ledger-summary">
              <div class="ledger-grid">
                <div class="ledger-item">
                  <span>Cheques Cleared:</span>
                  <span>${formatAmount(
                    reconciliationValues.chequesCleared
                  )}</span>
                </div>
                <div class="ledger-item">
                  <span>Deposits Cleared:</span>
                  <span>${formatAmount(
                    reconciliationValues.depositsCleared
                  )}</span>
                </div>
                <div class="ledger-item">
                  <span>Total Credits Cleared:</span>
                  <span>${formatAmount(
                    reconciliationValues.chequesCleared
                  )}</span>
                </div>
                <div class="ledger-item">
                  <span>Total Debits Cleared:</span>
                  <span>${formatAmount(
                    reconciliationValues.depositsCleared
                  )}</span>
                </div>
              </div>
              <div class="note">*Remember, your debits are credits to the bank and vice versa.</div>
            </div>
          </div>

          <div class="approval-section">
            <div class="approval-line">
              <span class="approval-label">Reviewed By:</span>
              <span class="approval-underline"></span>
              <span style="margin-left: 20px;">Date:</span>
              <span class="approval-underline"></span>
            </div>
            <div class="approval-line">
              <span class="approval-label">Approved By:</span>
              <span class="approval-underline"></span>
              <span style="margin-left: 20px;">Date:</span>
              <span class="approval-underline"></span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
              Reconciling Real Estate Trust
            </h2>

            {/* Date Picker Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleRetrieveData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  {loading ? "Loading..." : "Retrieve Data"}
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!showTable || transactions.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Report
                </button>
              </div>
            </div>

            {/* Reconciliation Formula Section */}
            {showTable && (
              <div className="bg-white rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold p-6 border-b border-gray-200">
                  Reconciliation Formula
                </h3>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Book
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatAmount(reconciliationValues.book)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Open
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatAmount(reconciliationValues.open)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Misc
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatAmount(reconciliationValues.misc)}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Statement
                      </h4>
                      <button
                        onClick={handleStatementInput}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-left text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statementAmount
                          ? formatAmount(parseFloat(statementAmount))
                          : "Click to enter"}
                      </button>
                    </div>
                  </div>

                  {/* Formula Display */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-4 text-lg font-medium">
                      <span>
                        Book: {formatAmount(reconciliationValues.book)}
                      </span>
                      <span>+</span>
                      <span>
                        Open: {formatAmount(reconciliationValues.open)}
                      </span>
                      <span>-</span>
                      <span>
                        Misc: {formatAmount(reconciliationValues.misc)}
                      </span>
                      <span>=</span>
                      <span>
                        Bank:{" "}
                        {formatAmount(
                          reconciliationValues.book +
                            reconciliationValues.open -
                            reconciliationValues.misc
                        )}
                      </span>
                    </div>
                    {statementAmount && (
                      <div className="mt-4 text-center">
                        <span className="text-sm text-gray-600">
                          Difference:{" "}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            Math.abs(
                              reconciliationValues.book +
                                reconciliationValues.open -
                                reconciliationValues.misc -
                                parseFloat(statementAmount)
                            ) < 0.01
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatAmount(
                            reconciliationValues.book +
                              reconciliationValues.open -
                              reconciliationValues.misc -
                              parseFloat(statementAmount)
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            {showTable && (
              <div className="bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold p-6 border-b border-gray-200">
                  Cash - Trust Account Transactions (10002)
                </h3>

                {/* Summary Section */}
                {transactions.length > 0 && (
                  <div className="bg-gray-50 p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          Cheques Cleared
                        </h4>
                        <p className="text-lg font-semibold text-red-600">
                          {formatAmount(reconciliationValues.chequesCleared)}
                        </p>
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          Deposits Cleared
                        </h4>
                        <p className="text-lg font-semibold text-green-600">
                          {formatAmount(reconciliationValues.depositsCleared)}
                        </p>
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          # Of Entries
                        </h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {transactions.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowClick(transaction, index)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.tradeNumber || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.description ||
                                transaction.narration ||
                                "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(
                                transaction.date || transaction.transactionDate
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.reference ||
                                transaction.referenceNumber ||
                                "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  transaction.type === "Credit" ||
                                  transaction.amount > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transaction.type ||
                                  (transaction.amount > 0 ? "Credit" : "Debit")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatAmount(Math.abs(transaction.amount || 0))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {clearedTransactions.has(index) ? (
                                <span className="text-green-600 text-xl">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-red-600 text-xl">✗</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No transactions found for the selected date range
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statement Input Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Enter Statement Amount
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statement Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={statementAmount}
                onChange={(e) => setStatementAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatementModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatementSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Transaction Modal */}
      {showClearModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {clearedTransactions.has(selectedTransaction.index)
                ? "Unclear Transaction"
                : "Clear Transaction"}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                {clearedTransactions.has(selectedTransaction.index)
                  ? "Do you want to add this transaction back to the Open calculation?"
                  : "Do you want to clear this transaction from the Open calculation?"}
              </p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-900">
                  Amount:{" "}
                  {formatAmount(Math.abs(selectedTransaction.amount || 0))}
                </p>
                <p className="text-sm text-gray-600">
                  Description:{" "}
                  {selectedTransaction.description ||
                    selectedTransaction.narration ||
                    "-"}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleClearTransaction(
                    !clearedTransactions.has(selectedTransaction.index)
                  )
                }
                className={`px-4 py-2 text-white rounded-md ${
                  clearedTransactions.has(selectedTransaction.index)
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {clearedTransactions.has(selectedTransaction.index)
                  ? "Yes, Unclear"
                  : "Yes, Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconcileRealEstateTrust;
