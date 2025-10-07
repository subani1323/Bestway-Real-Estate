import React, { useState } from "react";
import Navbar from "../components/Navbar";
import FinanceSidebar from "../components/FinanceSidebar";
import logo1 from "../Assets/logo1.jpg";
import axiosInstance from "../config/axios";

// Add print styles
const printStyles = `
  @media print {
    .no-print { display: none !important; }
    .print-logo { display: block !important; margin: 0 auto 12px auto; max-width: 120px; }
    body { margin: 0; padding: 20px; }
    .print-break { page-break-before: always; }
    table, th, td { font-size: 10px !important; }
    .print-header, .print-logo + div, .print-logo + div .text-2xl, .print-logo + div .text-lg { font-size: 13px !important; }
  }
  .print-logo { display: none; }
`;

const secondaryLinks = [
  { id: "income", label: "Income Statement" },
  { id: "balance", label: "Balance Sheet" },
];

const FinanceStatements = () => {
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div className="bg-gray-50 min-h-screen">
      <style>{printStyles}</style>
      <div className="no-print">
        <Navbar />
      </div>
      <div className="flex">
        <div className="no-print">
          <FinanceSidebar />
        </div>
        <div className="flex-1 p-6">
          {/* Secondary Navbar */}
          <div className="flex space-x-4 mb-6 border-b pb-2 no-print">
            {secondaryLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-4 py-2 rounded-t font-medium transition-colors focus:outline-none ${
                  activeTab === link.id
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          {/* Main Content Area */}
          <div className="bg-white p-6 rounded-lg shadow-md min-h-[300px]">
            {activeTab === "income" && (
              <div>
                {/* Date Range Form for Income Statement */}
                <IncomeStatementWithDate />
              </div>
            )}
            {activeTab === "balance" && (
              <div>
                {/* Date Range Form for Balance Sheet */}
                <BalanceStatementWithDate />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function IncomeStatementWithDate() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [incomeStatementData, setIncomeStatementData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProceed = async (e) => {
    e.preventDefault();
    if (from && to) {
      setLoading(true);
      try {
        // Get localStorage transactions (like Trial Balance does)
        const localStorageTransactions = JSON.parse(
          localStorage.getItem("trialBalanceTransactions") || "[]"
        );

        // Filter localStorage transactions by date range
        const startDate = new Date(from);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(to);
        endDate.setUTCHours(23, 59, 59, 999);

        const filteredLocalStorageTransactions =
          localStorageTransactions.filter((entry) => {
            const entryDate = entry.date
              ? new Date(entry.date)
              : new Date(entry.createdAt || 0);
            return entryDate >= startDate && entryDate <= endDate;
          });

        // Debug logging
        console.log("Income Statement Frontend Debug:");
        console.log(
          "Total localStorage transactions:",
          localStorageTransactions.length
        );
        console.log(
          "Filtered localStorage transactions:",
          filteredLocalStorageTransactions.length
        );
        console.log("Date range:", from, "to", to);
        console.log(
          "Sample localStorage transaction:",
          localStorageTransactions[0]
        );

        // Fetch income statement data for the specified date range
        const response = await axiosInstance.post(
          "/transactions/income-statement",
          {
            localStorageTransactions: filteredLocalStorageTransactions,
          },
          {
            params: { from, to },
          }
        );

        console.log("Fetched income statement:", response.data);
        console.log("Statement items:", response.data.statement);
        console.log(
          "Subtotal items:",
          response.data.statement.filter((item) => item.type === "subtotal")
        );
        setIncomeStatementData(response.data);
        setShowTable(true);
      } catch (error) {
        console.error("Error fetching income statement:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handlePrint = () => {
    // Create a new window for printing with only the table content
    const printWindow = window.open("", "_blank");

    const filteredItems = incomeStatementData.statement.filter((item) => {
      // Keep headers always
      if (item.type === "header") {
        return true;
      }
      // Keep subtotals always (even if zero) - especially the main totals
      if (item.type === "subtotal") {
        return true;
      }
      if (item.type === "line") {
        // Only show line items with non-zero values
        return (
          item.value !== 0 && item.value !== null && item.value !== undefined
        );
      }
      return true;
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Income Statement - Savemax 365 Realty, Brokerage</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
              color: #000000;
              font-size: 9px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000000;
              padding-bottom: 15px;
            }
            .company-logo {
              width: 50px;
              height: 50px;
              margin-bottom: 8px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 4px;
            }
            .report-title {
              font-size: 14px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 8px;
            }
            .period-info {
              font-size: 11px;
              color: #000000;
              margin-bottom: 4px;
            }
            .table-container {
              width: 100%;
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000000;
              font-size: 9px;
            }
            th, td {
              border: 1px solid #000000;
              padding: 6px 8px;
              text-align: left;
              line-height: 1.4;
              word-spacing: 0.1em;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 9px;
            }
            .amount-column {
              text-align: right;
            }
            .header-row {
              font-weight: bold;
              background-color: #f0f0f0;
              font-size: 10px;
              padding: 8px;
            }
            .subtotal-row {
              font-weight: bold;
              border-top: 1px solid #000000;
              font-size: 10px;
              padding: 6px 8px;
            }
            .subtotal-row td {
              border-top: 1px solid #000000;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
                font-size: 9px;
              }
              .header {
                margin-bottom: 20px;
              }
              table {
                font-size: 9px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo1.jpg" alt="Company Logo" class="company-logo" />
            <div class="company-name">SAVEMAX 365 REALTY, BROKERAGE</div>
            <div class="report-title">Income Statement</div>
            <div class="period-info">Period: ${from} to ${to}</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Acct. #</th>
                  <th>Description</th>
                  <th class="amount-column">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${filteredItems
                  .map((item, idx) => {
                    if (item.type === "header") {
                      return `
                        <tr class="header-row">
                          <td colspan="3" style="padding-left: ${
                            (item.indent || 0) * 16 + 8
                          }px;">
                            ${item.label}
                          </td>
                        </tr>
                      `;
                    }
                    if (item.type === "line") {
                      return `
                        <tr>
                          <td style="padding-left: ${
                            (item.indent || 0) * 16 + 8
                          }px;">
                            ${item.acct}
                          </td>
                          <td style="padding-left: 8px;">${item.label}</td>
                          <td class="amount-column">${formatCurrency(
                            item.value
                          )}</td>
                        </tr>
                      `;
                    }
                    if (item.type === "subtotal") {
                      return `
                        <tr class="subtotal-row">
                          <td colspan="2" style="padding-left: ${
                            (item.indent || 0) * 16 + 8
                          }px;">
                            ${item.label}
                          </td>
                          <td class="amount-column">${formatCurrency(
                            item.value
                          )}</td>
                        </tr>
                      `;
                    }
                    return "";
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div>
      {!showTable && (
        <form
          className="flex items-end space-x-4 mb-6"
          onSubmit={handleProceed}
        >
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Proceed"}
          </button>
        </form>
      )}
      {showTable && incomeStatementData && (
        <div>
          <div className="flex justify-between items-center mb-4 no-print">
            <button
              onClick={() => setShowTable(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Print Statement
            </button>
          </div>
          {/* Print logo above company name, only visible when printing */}
          <img src={logo1} alt="Company Logo" className="print-logo" />
          <div className="text-center mb-2">
            <div className="text-2xl font-bold">
              Savemax 365 Realty, Brokerage
            </div>
            <div className="text-lg font-semibold mt-1">Income Statement</div>
            <div className="text-sm text-gray-500 mt-1">
              {from} to {to}
            </div>
          </div>
          <table className="w-full text-left border-t border-b border-gray-300 mt-6">
            <thead>
              <tr>
                <th className="py-2 px-2 w-32">Acct. #</th>
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2 w-32 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(() => {
                const filteredItems = incomeStatementData.statement.filter(
                  (item) => {
                    // Keep headers always
                    if (item.type === "header") {
                      return true;
                    }
                    // Keep subtotals always (even if zero) - especially the main totals
                    if (item.type === "subtotal") {
                      return true;
                    }
                    if (item.type === "line") {
                      // Only show line items with non-zero values
                      return (
                        item.value !== 0 &&
                        item.value !== null &&
                        item.value !== undefined
                      );
                    }
                    return true;
                  }
                );
                console.log(
                  "Filtered items for rendering:",
                  filteredItems.length
                );
                console.log(
                  "Filtered subtotals:",
                  filteredItems.filter((item) => item.type === "subtotal")
                );
                return filteredItems.map((item, idx) => {
                  if (item.type === "header") {
                    return (
                      <tr key={idx}>
                        <td
                          colSpan={3}
                          style={{
                            paddingLeft: `${(item.indent || 0) * 16}px`,
                            fontWeight: "bold",
                          }}
                        >
                          {item.label}
                        </td>
                      </tr>
                    );
                  }
                  if (item.type === "line") {
                    return (
                      <tr key={idx}>
                        <td
                          style={{
                            paddingLeft: `${(item.indent || 0) * 16}px`,
                          }}
                        >
                          {item.acct}
                        </td>
                        <td>{item.label}</td>
                        <td className="text-right">
                          {formatCurrency(item.value)}
                        </td>
                      </tr>
                    );
                  }
                  if (item.type === "subtotal") {
                    return (
                      <tr key={idx} style={{ fontWeight: "bold" }}>
                        <td
                          colSpan={2}
                          style={{
                            paddingLeft: `${(item.indent || 0) * 16}px`,
                          }}
                        >
                          {item.label}
                        </td>
                        <td className="text-right">
                          {formatCurrency(item.value)}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                });
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BalanceStatementWithDate() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [balanceData, setBalanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProceed = async (e) => {
    e.preventDefault();
    if (from && to) {
      setLoading(true);
      setError("");
      try {
        // Fetch ledger data for the specified date range
        const response = await axiosInstance.get("/ledger", {
          params: { from, to },
        });

        // Get localStorage transactions (same as Trial Balance)
        const localStorageTransactions = JSON.parse(
          localStorage.getItem("trialBalanceTransactions") || "[]"
        );

        // Filter localStorage transactions by date range
        const startDate = new Date(from);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(to);
        endDate.setUTCHours(23, 59, 59, 999);

        const filteredLocalStorageTransactions =
          localStorageTransactions.filter((entry) => {
            const entryDate = entry.date
              ? new Date(entry.date)
              : new Date(entry.createdAt || 0);
            return entryDate >= startDate && entryDate <= endDate;
          });

        // Combine backend data with localStorage transactions
        const allEntries = [
          ...filteredLocalStorageTransactions,
          ...response.data,
        ];

        console.log("Balance Sheet Debug:");
        console.log("Backend entries:", response.data.length);
        console.log(
          "LocalStorage entries:",
          filteredLocalStorageTransactions.length
        );
        console.log("Total entries:", allEntries.length);
        console.log("Sample entries:", allEntries.slice(0, 5));

        // Calculate closing balances for each account
        const accountBalances = {};
        allEntries.forEach((entry) => {
          const accountNumber = entry.accountNumber;
          if (!accountBalances[accountNumber]) {
            accountBalances[accountNumber] = {
              debit: 0,
              credit: 0,
              balance: 0,
            };
          }
          accountBalances[accountNumber].debit += entry.debit || 0;
          accountBalances[accountNumber].credit += entry.credit || 0;
        });

        // Calculate final balance for each account (debit - credit)
        Object.keys(accountBalances).forEach((accountNumber) => {
          accountBalances[accountNumber].balance =
            accountBalances[accountNumber].debit -
            accountBalances[accountNumber].credit;
        });

        console.log("Calculated account balances:", accountBalances);

        setBalanceData(accountBalances);
        setShowTable(true);
      } catch (err) {
        setError("Failed to fetch balance data");
        console.error("Error fetching balance data:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getAccountBalance = (accountNumber) => {
    const account = balanceData[accountNumber];
    if (!account) {
      return "-";
    }
    // Show the balance even if it's zero (as long as there were transactions)
    return formatCurrency(account.balance);
  };

  const handleBalanceSheetPrint = () => {
    // Create a new window for printing with only the table content
    const printWindow = window.open("", "_blank");

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Balance Sheet - Savemax 365 Realty, Brokerage</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
              color: #000000;
              font-size: 9px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000000;
              padding-bottom: 15px;
            }
            .company-logo {
              width: 50px;
              height: 50px;
              margin-bottom: 8px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 4px;
            }
            .report-title {
              font-size: 14px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 8px;
            }
            .period-info {
              font-size: 11px;
              color: #000000;
              margin-bottom: 4px;
            }
            .table-container {
              width: 100%;
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000000;
              font-size: 9px;
            }
            th, td {
              border: 1px solid #000000;
              padding: 6px 8px;
              text-align: left;
              line-height: 1.4;
              word-spacing: 0.1em;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 9px;
            }
            .amount-column {
              text-align: right;
            }
            .header-row {
              font-weight: bold;
              background-color: #f0f0f0;
              font-size: 10px;
              padding: 8px;
            }
            .subtotal-row {
              font-weight: bold;
              border-top: 1px solid #000000;
              font-size: 10px;
              padding: 6px 8px;
            }
            .subtotal-row td {
              border-top: 1px solid #000000;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
                font-size: 9px;
              }
              .header {
                margin-bottom: 20px;
              }
              table {
                font-size: 9px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo1.jpg" alt="Company Logo" class="company-logo" />
            <div class="company-name">SAVEMAX 365 REALTY, BROKERAGE</div>
            <div class="report-title">Balance Sheet</div>
            <div class="period-info">Period: ${from} to ${to}</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Acct. #</th>
                  <th>Description</th>
                  <th class="amount-column">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const getAccountBalance = (accountNumber) => {
                    const account = balanceData[accountNumber];
                    if (!account) {
                      return "-";
                    }
                    return formatCurrency(account.balance);
                  };

                  const calculateTotal = (accountNumbers) => {
                    return accountNumbers.reduce((total, accountNumber) => {
                      const account = balanceData[accountNumber];
                      if (account) {
                        return total + account.balance;
                      }
                      return total;
                    }, 0);
                  };

                  return `
                    <!-- ASSETS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">ASSETS</td>
                    </tr>
                    <!-- CURRENT ASSETS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 24px;">CURRENT ASSETS</td>
                    </tr>
                    <!-- CASH -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">CASH</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">10001</td>
                      <td style="padding-left: 8px;">CASH - CURRENT ACCOUNT</td>
                      <td class="amount-column">${getAccountBalance(
                        "10001"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">10004</td>
                      <td style="padding-left: 8px;">CASH - COMMISSION TRUST ACCOUNT</td>
                      <td class="amount-column">${getAccountBalance(
                        "10004"
                      )}</td>
                    </tr>
                    <!-- NOTES RECEIVABLE -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">NOTES RECEIVABLE</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">11000</td>
                      <td style="padding-left: 8px;">NOTES RECEIVABLES</td>
                      <td class="amount-column">${getAccountBalance(
                        "11000"
                      )}</td>
                    </tr>
                    <!-- ACCOUNTS RECEIVABLE -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">ACCOUNTS RECEIVABLE</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">12100</td>
                      <td style="padding-left: 8px;">A/R - AGT'S RECOVERABLE- GEN EXP</td>
                      <td class="amount-column">${getAccountBalance(
                        "12100"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">12500</td>
                      <td style="padding-left: 8px;">A/R - OTHER</td>
                      <td class="amount-column">${getAccountBalance(
                        "12500"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">12600</td>
                      <td style="padding-left: 8px;">LOAN - HOMELIFE TOP STAR</td>
                      <td class="amount-column">${getAccountBalance(
                        "12600"
                      )}</td>
                    </tr>
                    <!-- PREPAID EXPENSES -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">PREPAID EXPENSES</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">15000</td>
                      <td style="padding-left: 8px;">PREPAID EXPENSES</td>
                      <td class="amount-column">${getAccountBalance(
                        "15000"
                      )}</td>
                    </tr>
                    <!-- TOTAL CURRENT ASSETS -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 24px;">TOTAL CURRENT ASSETS</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal([
                          "10001",
                          "10004",
                          "11000",
                          "12100",
                          "12500",
                          "12600",
                          "12300",
                          "15000",
                        ])
                      )}</td>
                    </tr>
                    <!-- FIXED ASSETS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">FIXED ASSETS</td>
                    </tr>
                    <!-- OFFICE EQUIPMENT -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">OFFICE EQUIPMENT</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">16030</td>
                      <td style="padding-left: 8px;">OFFICE FURNITURE</td>
                      <td class="amount-column">${getAccountBalance(
                        "16030"
                      )}</td>
                    </tr>
                    <!-- COMPUTER EQUIPMENT -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">COMPUTER EQUIPMENT</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">16060</td>
                      <td style="padding-left: 8px;">COMPUTER SOFTWARE</td>
                      <td class="amount-column">${getAccountBalance(
                        "16060"
                      )}</td>
                    </tr>
                    <!-- LEASEHOLD IMPROVEMENTS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">LEASEHOLD IMPROVEMENTS</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">16080</td>
                      <td style="padding-left: 8px;">SIGNS</td>
                      <td class="amount-column">${getAccountBalance(
                        "16080"
                      )}</td>
                    </tr>
                    <!-- FRANCHISE COSTS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">FRANCHISE COSTS</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">16090</td>
                      <td style="padding-left: 8px;">FRANCHISE COST</td>
                      <td class="amount-column">${getAccountBalance(
                        "16090"
                      )}</td>
                    </tr>
                    <!-- TOTAL FIXED ASSETS -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 24px;">TOTAL FIXED ASSETS</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal(["16060", "16080", "16090", "16030"])
                      )}</td>
                    </tr>
                    <!-- ACCUMULATED DEPRECIATION -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">ACCUMULATED DEPRECIATION</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">17060</td>
                      <td style="padding-left: 8px;">ACC. DEPR. - COMP. SOFTWARE</td>
                      <td class="amount-column">${getAccountBalance(
                        "17060"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">17080</td>
                      <td style="padding-left: 8px;">ACC. DEPR. - SIGNS</td>
                      <td class="amount-column">${getAccountBalance(
                        "17080"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">17090</td>
                      <td style="padding-left: 8px;">ACC. AMOR. - FRANCHISE COSTS</td>
                      <td class="amount-column">${getAccountBalance(
                        "17090"
                      )}</td>
                    </tr>
                    <!-- NET FIXED ASSETS -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 24px;">NET FIXED ASSETS</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal(["16060", "16080", "16090", "16030"]) -
                          calculateTotal(["17060", "17080", "17090"])
                      )}</td>
                    </tr>
                    <!-- NET TRUST FUNDS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">NET TRUST FUNDS</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">10002</td>
                      <td style="padding-left: 8px;">CASH - TRUST</td>
                      <td class="amount-column">${getAccountBalance(
                        "10002"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">21300</td>
                      <td style="padding-left: 8px;">LIABILITY FOR TRUST FUNDS HELD</td>
                      <td class="amount-column">${getAccountBalance(
                        "21300"
                      )}</td>
                    </tr>
                    <!-- TOTAL ASSETS -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 8px;">TOTAL ASSETS</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal([
                          "10001",
                          "10004",
                          "11000",
                          "12100",
                          "12500",
                          "12600",
                          "12300",
                          "15000",
                        ]) +
                          calculateTotal(["16060", "16080", "16090"]) -
                          calculateTotal(["17060", "17080", "17090"]) +
                          calculateTotal(["10002", "21300"])
                      )}</td>
                    </tr>
                    <!-- Page break for liabilities/equity -->
                    <tr class="page-break">
                      <td colspan="3"></td>
                    </tr>
                    <!-- LIABILITIES -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">LIABILITIES</td>
                    </tr>
                    <!-- CURRENT LIABILITIES -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 24px;">CURRENT LIABILITIES</td>
                    </tr>
                    <!-- BANK OVERDRAFT -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">BANK OVERDRAFT</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">20000</td>
                      <td style="padding-left: 8px;">BANK OPERATING LINE</td>
                      <td class="amount-column">${getAccountBalance(
                        "20000"
                      )}</td>
                    </tr>
                    <!-- ACCOUNTS PAYABLE & ACCRUALS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">ACCOUNTS PAYABLE & ACCRUALS</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">21000</td>
                      <td style="padding-left: 8px;">ACCOUNTS PAYABLE</td>
                      <td class="amount-column">${getAccountBalance(
                        "21000"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">22000</td>
                      <td style="padding-left: 8px;">ACCRUED EXPENSES</td>
                      <td class="amount-column">${getAccountBalance(
                        "22000"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">23000</td>
                      <td style="padding-left: 8px;">HST COLLECTED</td>
                      <td class="amount-column">${getAccountBalance(
                        "23000"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">23001</td>
                      <td style="padding-left: 8px;">HST INPUT TAX CREDIT</td>
                      <td class="amount-column">${getAccountBalance(
                        "23001"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">23004</td>
                      <td style="padding-left: 8px;">HST NET PAYABLE</td>
                      <td class="amount-column">${getAccountBalance(
                        "23004"
                      )}</td>
                    </tr>
                    <!-- COMMISSIONS PAYABLE -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">COMMISSIONS PAYABLE</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">21500</td>
                      <td style="padding-left: 8px;">COMMISSION PAYABLE</td>
                      <td class="amount-column">${getAccountBalance(
                        "21500"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">21600</td>
                      <td style="padding-left: 8px;">BROKERS COMMISSION</td>
                      <td class="amount-column">${getAccountBalance(
                        "21600"
                      )}</td>
                    </tr>
                    <!-- TOTAL CURRENT LIABILITIES -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 24px;">TOTAL CURRENT LIABILITIES</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal([
                          "20000",
                          "21000",
                          "22000",
                          "23000",
                          "23001",
                          "23004",
                          "21500",
                          "21600",
                        ])
                      )}</td>
                    </tr>
                    <!-- LONG-TERM LIABILITIES -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">LONG-TERM LIABILITIES</td>
                    </tr>
                    <!-- SHAREHOLDER LOANS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">SHAREHOLDER LOANS</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">28000</td>
                      <td style="padding-left: 8px;">SHAREHOLDER LOAN - SRI</td>
                      <td class="amount-column">${getAccountBalance(
                        "28000"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">28010</td>
                      <td style="padding-left: 8px;">SHAREHOLDER LOAN - #2</td>
                      <td class="amount-column">${getAccountBalance(
                        "28010"
                      )}</td>
                    </tr>
                    <!-- LOAN PAYABLE -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 40px;">LOAN PAYABLE</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">21450</td>
                      <td style="padding-left: 8px;">LOAN PAYABLE - 2199435 ONT INC</td>
                      <td class="amount-column">${getAccountBalance(
                        "21450"
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">28050</td>
                      <td style="padding-left: 8px;">LOAN PAYABLE - Executive Mortgage</td>
                      <td class="amount-column">${getAccountBalance(
                        "28050"
                      )}</td>
                    </tr>
                    <!-- TOTAL LONG-TERM LIABILITIES -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 24px;">TOTAL LONG-TERM LIABILITIES</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal(["28000", "28010", "21450", "28050"])
                      )}</td>
                    </tr>
                    <!-- TOTAL LIABILITIES -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 8px;">TOTAL LIABILITIES</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal([
                          "20000",
                          "21000",
                          "22000",
                          "23000",
                          "23001",
                          "23004",
                          "21500",
                          "21600",
                        ]) +
                          calculateTotal(["28000", "28010", "21450", "28050"])
                      )}</td>
                    </tr>
                    <!-- SHAREHOLDER'S EQUITY -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 8px;">SHAREHOLDER'S EQUITY</td>
                    </tr>
                    <!-- COMMON STOCK -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 24px;">COMMON STOCK</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">30010</td>
                      <td style="padding-left: 8px;">COMMON STOCK</td>
                      <td class="amount-column">${getAccountBalance(
                        "30010"
                      )}</td>
                    </tr>
                    <!-- RETAINED EARNINGS -->
                    <tr class="header-row">
                      <td colspan="3" style="padding-left: 24px;">RETAINED EARNINGS</td>
                    </tr>
                    <tr>
                      <td style="padding-left: 40px;">39999</td>
                      <td style="padding-left: 8px;">RETAINED EARNINGS - Y.T.D.</td>
                      <td class="amount-column">${getAccountBalance(
                        "39999"
                      )}</td>
                    </tr>
                    <!-- TOTAL EQUITY -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 24px;">TOTAL EQUITY</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal(["30010", "39999"])
                      )}</td>
                    </tr>
                    <!-- TOTAL LIABILITIES & EQUITY -->
                    <tr class="subtotal-row">
                      <td colspan="2" style="padding-left: 8px;">TOTAL LIABILITIES & EQUITY</td>
                      <td class="amount-column">${formatCurrency(
                        calculateTotal([
                          "20000",
                          "21000",
                          "22000",
                          "23000",
                          "23001",
                          "23004",
                          "21500",
                          "21600",
                        ]) +
                          calculateTotal(["28000", "28010", "21450", "28050"]) +
                          calculateTotal(["30010", "39999"])
                      )}</td>
                    </tr>
                  `;
                })()}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const calculateTotal = (accountNumbers) => {
    return accountNumbers.reduce((total, accountNumber) => {
      const account = balanceData[accountNumber];
      if (account) {
        return total + account.balance;
      }
      return total;
    }, 0);
  };

  return (
    <div>
      {!showTable && (
        <form
          className="flex items-end space-x-4 mb-6"
          onSubmit={handleProceed}
        >
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Proceed"}
          </button>
        </form>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {showTable && (
        <div>
          <div className="flex justify-between items-center mb-4 no-print">
            <button
              onClick={() => setShowTable(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleBalanceSheetPrint}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Print Statement
            </button>
          </div>
          {/* Print logo above company name, only visible when printing */}
          <img src={logo1} alt="Company Logo" className="print-logo" />
          <div className="text-center mb-2">
            <div className="text-2xl font-bold">
              Savemax 365 Realty, Brokerage
            </div>
            <div className="text-lg font-semibold mt-1">Balance Sheet</div>
            <div className="text-sm text-gray-500 mt-1">
              {from} to {to}
            </div>
          </div>
          <table className="w-full text-left border-t border-b border-gray-300 mt-6">
            <thead>
              <tr>
                <th className="py-2 px-2 w-32">Acct. #</th>
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2 w-32 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* ASSETS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1">
                  ASSETS
                </td>
              </tr>
              {/* CURRENT ASSETS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-4">
                  CURRENT ASSETS
                </td>
              </tr>
              {/* CASH */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  CASH
                </td>
              </tr>
              <tr>
                <td>10001</td>
                <td>CASH - CURRENT ACCOUNT</td>
                <td className="text-right">{getAccountBalance("10001")}</td>
              </tr>
              <tr>
                <td>10004</td>
                <td>CASH - COMMISSION TRUST ACCOUNT</td>
                <td className="text-right">{getAccountBalance("10004")}</td>
              </tr>
              {/* NOTES RECEIVABLE */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  NOTES RECEIVABLE
                </td>
              </tr>
              <tr>
                <td>11000</td>
                <td>NOTES RECEIVABLES</td>
                <td className="text-right">{getAccountBalance("11000")}</td>
              </tr>
              {/* ACCOUNTS RECEIVABLE */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  ACCOUNTS RECEIVABLE
                </td>
              </tr>
              <tr>
                <td>12100</td>
                <td>A/R - AGT'S RECOVERABLE- GEN EXP</td>
                <td className="text-right">{getAccountBalance("12100")}</td>
              </tr>
              <tr>
                <td>12500</td>
                <td>A/R - OTHER</td>
                <td className="text-right">{getAccountBalance("12500")}</td>
              </tr>
              <tr>
                <td>12600</td>
                <td>LOAN - HOMELIFE TOP STAR</td>
                <td className="text-right">{getAccountBalance("12600")}</td>
              </tr>

              {/* PREPAID EXPENSES */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  PREPAID EXPENSES
                </td>
              </tr>
              <tr>
                <td>15000</td>
                <td>PREPAID EXPENSES</td>
                <td className="text-right">{getAccountBalance("15000")}</td>
              </tr>
              {/* TOTAL CURRENT ASSETS */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL CURRENT ASSETS
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal([
                      "10001",
                      "10004",
                      "11000",
                      "12100",
                      "12500",
                      "12600",
                      "12300",
                      "15000",
                    ])
                  )}
                </td>
              </tr>
              {/* FIXED ASSETS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1">
                  FIXED ASSETS
                </td>
              </tr>
              {/* OFFICE EQUIPMENT */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  OFFICE EQUIPMENT
                </td>
              </tr>
              <tr>
                <td>16030</td>
                <td>OFFICE FURNITURE</td>
                <td className="text-right">{getAccountBalance("16030")}</td>
              </tr>
              {/* COMPUTER EQUIPMENT */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  COMPUTER EQUIPMENT
                </td>
              </tr>
              <tr>
                <td>16060</td>
                <td>COMPUTER SOFTWARE</td>
                <td className="text-right">{getAccountBalance("16060")}</td>
              </tr>
              {/* LEASEHOLD IMPROVEMENTS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  LEASEHOLD IMPROVEMENTS
                </td>
              </tr>
              <tr>
                <td>16080</td>
                <td>SIGNS</td>
                <td className="text-right">{getAccountBalance("16080")}</td>
              </tr>
              {/* FRANCHISE COSTS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  FRANCHISE COSTS
                </td>
              </tr>
              <tr>
                <td>16090</td>
                <td>FRANCHISE COST</td>
                <td className="text-right">{getAccountBalance("16090")}</td>
              </tr>
              {/* TOTAL FIXED ASSETS */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL FIXED ASSETS
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal(["16060", "16080", "16090", "16030"])
                  )}
                </td>
              </tr>
              {/* ACCUMULATED DEPRECIATION */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1">
                  ACCUMULATED DEPRECIATION
                </td>
              </tr>
              <tr>
                <td>17060</td>
                <td>ACC. DEPR. - COMP. SOFTWARE</td>
                <td className="text-right">{getAccountBalance("17060")}</td>
              </tr>
              <tr>
                <td>17080</td>
                <td>ACC. DEPR. - SIGNS</td>
                <td className="text-right">{getAccountBalance("17080")}</td>
              </tr>
              <tr>
                <td>17090</td>
                <td>ACC. AMOR. - FRANCHISE COSTS</td>
                <td className="text-right">{getAccountBalance("17090")}</td>
              </tr>
              {/* NET FIXED ASSETS */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  NET FIXED ASSETS
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal(["16060", "16080", "16090", "16030"]) -
                      calculateTotal(["17060", "17080", "17090"])
                  )}
                </td>
              </tr>
              {/* NET TRUST FUNDS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1">
                  NET TRUST FUNDS
                </td>
              </tr>
              <tr>
                <td>10002</td>
                <td>CASH - TRUST</td>
                <td className="text-right">{getAccountBalance("10002")}</td>
              </tr>
              <tr>
                <td>21300</td>
                <td>LIABILITY FOR TRUST FUNDS HELD</td>
                <td className="text-right">{getAccountBalance("21300")}</td>
              </tr>
              {/* TOTAL ASSETS */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL ASSETS
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal([
                      "10001",
                      "10004",
                      "11000",
                      "12100",
                      "12500",
                      "12600",
                      "12300",
                      "15000",
                    ]) +
                      calculateTotal(["16060", "16080", "16090"]) -
                      calculateTotal(["17060", "17080", "17090"]) +
                      calculateTotal(["10002", "21300"])
                  )}
                </td>
              </tr>
              {/* Print page break for liabilities/equity */}
              <tr className="print-break">
                <td colSpan={3}></td>
              </tr>

              {/* LIABILITIES */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-8 pb-1">
                  LIABILITIES
                </td>
              </tr>
              {/* CURRENT LIABILITIES */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-4">
                  CURRENT LIABILITIES
                </td>
              </tr>
              {/* BANK OVERDRAFT */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  BANK OVERDRAFT
                </td>
              </tr>
              <tr>
                <td>20000</td>
                <td>BANK OPERATING LINE</td>
                <td className="text-right">{getAccountBalance("20000")}</td>
              </tr>
              {/* ACCOUNTS PAYABLE & ACCRUALS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  ACCOUNTS PAYABLE & ACCRUALS
                </td>
              </tr>
              <tr>
                <td>21000</td>
                <td>ACCOUNTS PAYABLE</td>
                <td className="text-right">{getAccountBalance("21000")}</td>
              </tr>
              <tr>
                <td>22000</td>
                <td>ACCRUED EXPENSES</td>
                <td className="text-right">{getAccountBalance("22000")}</td>
              </tr>
              <tr>
                <td>23000</td>
                <td>HST COLLECTED</td>
                <td className="text-right">{getAccountBalance("23000")}</td>
              </tr>
              <tr>
                <td>23001</td>
                <td>HST INPUT TAX CREDIT</td>
                <td className="text-right">{getAccountBalance("23001")}</td>
              </tr>
              <tr>
                <td>23004</td>
                <td>HST NET PAYABLE</td>
                <td className="text-right">{getAccountBalance("23004")}</td>
              </tr>
              {/* COMMISSIONS PAYABLE */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  COMMISSIONS PAYABLE
                </td>
              </tr>
              <tr>
                <td>21500</td>
                <td>COMMISSION PAYABLE</td>
                <td className="text-right">{getAccountBalance("21500")}</td>
              </tr>
              <tr>
                <td>21600</td>
                <td>BROKERS COMMISSION</td>
                <td className="text-right">{getAccountBalance("21600")}</td>
              </tr>
              {/* TOTAL CURRENT LIABILITIES */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL CURRENT LIABILITIES
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal([
                      "20000",
                      "21000",
                      "22000",
                      "23000",
                      "23001",
                      "23004",
                      "21500",
                      "21600",
                    ])
                  )}
                </td>
              </tr>

              {/* LONG-TERM LIABILITIES */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1">
                  LONG-TERM LIABILITIES
                </td>
              </tr>
              {/* SHAREHOLDER LOANS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  SHAREHOLDER LOANS
                </td>
              </tr>
              <tr>
                <td>28000</td>
                <td>SHAREHOLDER LOAN - SRI</td>
                <td className="text-right">{getAccountBalance("28000")}</td>
              </tr>
              <tr>
                <td>28010</td>
                <td>SHAREHOLDER LOAN - #2</td>
                <td className="text-right">{getAccountBalance("28010")}</td>
              </tr>
              {/* LOAN PAYABLE */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-8">
                  LOAN PAYABLE
                </td>
              </tr>
              <tr>
                <td>21450</td>
                <td>LOAN PAYABLE - 2199435 ONT INC</td>
                <td className="text-right">{getAccountBalance("21450")}</td>
              </tr>
              <tr>
                <td>28050</td>
                <td>LOAN PAYABLE - Executive Mortgage</td>
                <td className="text-right">{getAccountBalance("28050")}</td>
              </tr>
              {/* TOTAL LONG-TERM LIABILITIES */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL LONG-TERM LIABILITIES
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal(["28000", "28010", "21450", "28050"])
                  )}
                </td>
              </tr>
              {/* TOTAL LIABILITIES */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL LIABILITIES
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal([
                      "20000",
                      "21000",
                      "22000",
                      "23000",
                      "23001",
                      "23004",
                      "21500",
                      "21600",
                    ]) + calculateTotal(["28000", "28010", "21450", "28050"])
                  )}
                </td>
              </tr>

              {/* SHAREHOLDER'S EQUITY */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-8 pb-1">
                  SHAREHOLDER'S EQUITY
                </td>
              </tr>
              {/* COMMON STOCK */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-4">
                  COMMON STOCK
                </td>
              </tr>
              <tr>
                <td>30010</td>
                <td>COMMON STOCK</td>
                <td className="text-right">{getAccountBalance("30010")}</td>
              </tr>
              {/* RETAINED EARNINGS */}
              <tr className="font-bold">
                <td colSpan={3} className="pt-4 pb-1 pl-4">
                  RETAINED EARNINGS
                </td>
              </tr>
              <tr>
                <td>39999</td>
                <td>RETAINED EARNINGS - Y.T.D.</td>
                <td className="text-right">{getAccountBalance("39999")}</td>
              </tr>
              {/* TOTAL EQUITY */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL EQUITY
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(calculateTotal(["30010", "39999"]))}
                </td>
              </tr>
              {/* TOTAL LIABILITIES & EQUITY */}
              <tr className="font-bold">
                <td colSpan={2} className="pt-4 pb-1">
                  TOTAL LIABILITIES & EQUITY
                </td>
                <td className="text-right font-bold">
                  {formatCurrency(
                    calculateTotal([
                      "20000",
                      "21000",
                      "22000",
                      "23000",
                      "23001",
                      "23004",
                      "21500",
                      "21600",
                    ]) +
                      calculateTotal(["28000", "28010", "21450", "28050"]) +
                      calculateTotal(["30010", "39999"])
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default FinanceStatements;
