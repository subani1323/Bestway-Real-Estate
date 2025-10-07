import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import { toast } from "react-hot-toast";
import { scannedAccounts } from "./ChartOfAccountsMenu.jsx";

// AR Number generation utility
const getNextARNumber = () => {
  // Get the last used AR number from localStorage
  const lastARNumber = localStorage.getItem("lastARNumber");
  let nextNumber = 1000;

  if (lastARNumber) {
    // Extract the number from the last AR number (e.g., "AR1001" -> 1001)
    const match = lastARNumber.match(/AR(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const newARNumber = `AR${nextNumber}`;

  // Store the new AR number as the last used one
  localStorage.setItem("lastARNumber", newARNumber);

  return newARNumber;
};

const AccountsReceivable = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [showCashReceiptModal, setShowCashReceiptModal] = useState(false);
  const [arTransactions, setArTransactions] = useState([]);
  const [cashReceiptForm, setCashReceiptForm] = useState({
    arNumber: "", // Will be set when modal opens
    chequeReceivedFrom: "",
    chequeNumber: "",
    paymentType: "Cheque",
    amount: "",
    taxIncluded: "",
    dateOfReceipt: new Date().toISOString().split("T")[0],
    bankAccount: "General",
    glNote: "",
    accountAllocations: [
      {
        accountNumber: "10001",
        accountName: "Cash - Current Account",
        amount: "",
      },
      { accountNumber: "23000", accountName: "HST Collected", amount: "" },
    ],
  });
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccountIndex, setEditingAccountIndex] = useState(null);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
  const [newAccountAllocation, setNewAccountAllocation] = useState({
    accountNumber: "",
    accountName: "",
    amount: "",
    description: "",
    note: "",
  });

  // Function to load AR transactions from localStorage
  const loadArTransactions = () => {
    const transactions = JSON.parse(
      localStorage.getItem("trialBalanceTransactions") || "[]"
    );

    // Filter for AR transactions (Cash Receipt type)
    const arTransactions = transactions.filter(
      (transaction) => transaction.type === "Cash Receipt"
    );

    // Sort by date (newest first)
    arTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    setArTransactions(arTransactions);
  };

  // Load AR transactions on component mount
  useEffect(() => {
    loadArTransactions();
  }, []);

  // Function to open cash receipt modal with new AR number
  const openCashReceiptModal = () => {
    setCashReceiptForm({
      arNumber: getNextARNumber(), // Generate new AR number each time
      chequeReceivedFrom: "",
      chequeNumber: "",
      paymentType: "Cheque",
      amount: "",
      taxIncluded: "",
      dateOfReceipt: new Date().toISOString().split("T")[0],
      bankAccount: "General",
      glNote: "",
      accountAllocations: [
        {
          accountNumber: "10001",
          accountName: "Cash - Current Account",
          amount: "",
        },
        { accountNumber: "23000", accountName: "HST Collected", amount: "" },
      ],
    });
    setShowCashReceiptModal(true);
  };

  // Use the actual chart of accounts from ChartOfAccountsMenu, filtered to only show expected accounts
  const expectedAccountNumbers = [
    "40100",
    "43100",
    "44100",
    "50100",
    "51100",
    "52100",
    "62101",
    "62102",
    "62103",
    "62104",
    "62105",
    "63102",
    "63103",
    "63199",
    "69101",
    "70101",
    "70103",
    "70104",
    "70105",
    "70199",
    "71102",
    "71104",
    "71199",
    "72101",
    "72102",
    "72103",
    "72199",
    "75102",
    "75103",
    "75104",
    "75105",
    "75117",
    "75199",
    "76103",
    "79101",
    "90101",
  ];

  const chartOfAccounts = scannedAccounts
    .filter((account) => expectedAccountNumbers.includes(account.acct))
    .map((account) => ({
      accountNumber: account.acct,
      accountName: account.description,
    }));

  const handleAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    const taxAmount = parseFloat(cashReceiptForm.taxIncluded) || 0;
    const totalAmount = amount + taxAmount;

    setCashReceiptForm((prev) => ({
      ...prev,
      amount: value,
      accountAllocations: [
        {
          ...prev.accountAllocations[0],
          amount: totalAmount.toFixed(2),
        },
        { ...prev.accountAllocations[1], amount: prev.taxIncluded },
      ],
    }));
  };

  const handleTaxChange = (value) => {
    const taxAmount = parseFloat(value) || 0;
    const amount = parseFloat(cashReceiptForm.amount) || 0;
    const totalAmount = amount + taxAmount;

    setCashReceiptForm((prev) => ({
      ...prev,
      taxIncluded: value,
      accountAllocations: [
        {
          ...prev.accountAllocations[0],
          amount: totalAmount.toFixed(2),
        },
        { ...prev.accountAllocations[1], amount: taxAmount.toFixed(2) },
      ],
    }));
  };

  const handleFormSubmit = () => {
    try {
      // Validate required fields
      if (!cashReceiptForm.chequeReceivedFrom || !cashReceiptForm.amount) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate that total of user-added amounts equals the main amount
      const mainAmount = parseFloat(cashReceiptForm.amount) || 0;
      let totalUserAmounts = 0;

      // Sum up all user-added amounts (excluding Cash and HST accounts)
      cashReceiptForm.accountAllocations.forEach((allocation, index) => {
        if (
          index > 1 &&
          allocation.amount &&
          parseFloat(allocation.amount) > 0
        ) {
          totalUserAmounts += parseFloat(allocation.amount);
        }
      });

      if (Math.abs(totalUserAmounts - mainAmount) > 0.01) {
        // Allow for small rounding differences
        toast.error(
          "Invalid amount: Total of user-added amounts must equal the main amount"
        );
        return;
      }

      // Create transactions array
      const transactions = [];
      const amount = parseFloat(cashReceiptForm.amount) || 0;
      const hstAmount = parseFloat(cashReceiptForm.taxIncluded) || 0;
      const totalAmount = amount + hstAmount; // Total amount including tax

      // Debit transactions
      transactions.push({
        accountNumber: "10001",
        accountName: "Cash - Current Account",
        debit: totalAmount,
        credit: 0,
        description: `Cash receipt from ${cashReceiptForm.chequeReceivedFrom}`,
        date: cashReceiptForm.dateOfReceipt,
        reference: cashReceiptForm.arNumber, // Use AR number as reference
        type: "Cash Receipt",
      });

      transactions.push({
        accountNumber: "23000",
        accountName: "HST Collected",
        debit: 0,
        credit: hstAmount,
        description: `HST collected on cash receipt from ${cashReceiptForm.chequeReceivedFrom}`,
        date: cashReceiptForm.dateOfReceipt,
        reference: cashReceiptForm.arNumber, // Use AR number as reference
        type: "Cash Receipt",
      });

      // Credit transactions for additional accounts (excluding Cash and HST)
      cashReceiptForm.accountAllocations.forEach((allocation, index) => {
        if (
          index > 1 &&
          allocation.amount &&
          parseFloat(allocation.amount) > 0
        ) {
          transactions.push({
            accountNumber: allocation.accountNumber,
            accountName: allocation.accountName,
            debit: 0,
            credit: parseFloat(allocation.amount),
            description:
              allocation.description || `Allocation from cash receipt`,
            date: cashReceiptForm.dateOfReceipt,
            reference: cashReceiptForm.arNumber, // Use AR number as reference
            type: "Cash Receipt",
          });
        }
      });

      // Save transactions to localStorage (simulating database save)
      const existingTransactions = JSON.parse(
        localStorage.getItem("trialBalanceTransactions") || "[]"
      );
      const updatedTransactions = [...transactions, ...existingTransactions];
      localStorage.setItem(
        "trialBalanceTransactions",
        JSON.stringify(updatedTransactions)
      );

      // Log transactions for debugging
      console.log("Cash Receipt Transactions:", transactions);

      // Show success message
      toast.success(
        `Cash receipt of $${totalAmount.toFixed(2)} successfully processed!`
      );

      // Reload AR transactions to show the new one
      loadArTransactions();

      // Close modal and reset form
      setShowCashReceiptModal(false);
      setCashReceiptForm({
        arNumber: "", // Reset to empty, will be set when modal opens again
        chequeReceivedFrom: "",
        chequeNumber: "",
        paymentType: "Cheque",
        amount: "",
        taxIncluded: "",
        dateOfReceipt: new Date().toISOString().split("T")[0],
        bankAccount: "General",
        glNote: "",
        accountAllocations: [
          {
            accountNumber: "10001",
            accountName: "Cash - Current Account",
            amount: "",
          },
          { accountNumber: "23000", accountName: "HST Collected", amount: "" },
        ],
      });
    } catch (error) {
      console.error("Error processing cash receipt:", error);
      toast.error("Error processing cash receipt. Please try again.");
    }
  };

  const handleEditAccount = (index) => {
    if (index < 0 || index >= cashReceiptForm.accountAllocations.length) {
      console.error("Invalid account index:", index);
      return;
    }

    setEditingAccountIndex(index);
    const account = cashReceiptForm.accountAllocations[index];
    setNewAccountAllocation({
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      amount: account.amount,
      description: account.description || "",
      note: account.note || "",
    });
    setShowAddAccountModal(true);
  };

  const handleAddAccount = () => {
    setEditingAccountIndex(null);
    setNewAccountAllocation({
      accountNumber: "",
      accountName: "",
      amount: "",
      description: "",
      note: "",
    });
    setShowAddAccountModal(true);
  };

  const handleAccountSelection = (accountNumber) => {
    const selectedAccount = chartOfAccounts.find(
      (acc) => acc.accountNumber === accountNumber
    );
    setNewAccountAllocation((prev) => ({
      ...prev,
      accountNumber: accountNumber,
      accountName: selectedAccount ? selectedAccount.accountName : "",
    }));
  };

  const handleAddAccountSubmit = () => {
    if (editingAccountIndex !== null) {
      // Edit existing account
      const updatedAllocations = [...cashReceiptForm.accountAllocations];
      updatedAllocations[editingAccountIndex] = {
        ...newAccountAllocation,
        description: newAccountAllocation.description,
        note: newAccountAllocation.note,
      };

      // If editing the Cash account (index 0), update the main amount and recalculate HST
      if (editingAccountIndex === 0) {
        const newAmount = parseFloat(newAccountAllocation.amount) || 0;
        const newTaxAmount = (newAmount * 0.15).toFixed(2);

        setCashReceiptForm((prev) => ({
          ...prev,
          amount: newAmount.toFixed(2),
          taxIncluded: newTaxAmount,
          accountAllocations: [
            {
              ...updatedAllocations[0],
              amount: newAmount.toFixed(2),
            },
            {
              ...updatedAllocations[1],
              amount: newTaxAmount,
            },
          ],
        }));
      } else {
        // For other accounts, just update the specific allocation
        setCashReceiptForm((prev) => ({
          ...prev,
          accountAllocations: updatedAllocations,
        }));
      }
    } else {
      // Add new account
      setCashReceiptForm((prev) => ({
        ...prev,
        accountAllocations: [
          ...prev.accountAllocations,
          {
            ...newAccountAllocation,
            description: newAccountAllocation.description,
            note: newAccountAllocation.note,
          },
        ],
      }));
    }
    setShowAddAccountModal(false);
    setEditingAccountIndex(null);
    setSelectedAccountIndex(null);
  };

  const handleRowClick = (index) => {
    setSelectedAccountIndex(index);
  };

  const handleEditSelectedAccount = () => {
    if (selectedAccountIndex !== null) {
      handleEditAccount(selectedAccountIndex);
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Accounts Receivable Overview
            </h2>
            <div className="mb-6">
              <button
                onClick={openCashReceiptModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md"
              >
                Cash Receipt
              </button>
            </div>

            {/* AR Transactions Table */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                AR Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        AR Number
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Account
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Debit
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Credit
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {arTransactions.length > 0 ? (
                      arTransactions.map((transaction, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {(() => {
                              // Helper function to format dates in local timezone to avoid UTC conversion issues
                              const formatDate = (dateString) => {
                                if (!dateString) return "-";

                                // Parse the date string and create a date in local timezone
                                const [year, month, day] =
                                  dateString.split("-");
                                if (year && month && day) {
                                  // Create date in local timezone to avoid UTC conversion issues
                                  const date = new Date(
                                    parseInt(year),
                                    parseInt(month) - 1,
                                    parseInt(day)
                                  );
                                  return date.toLocaleDateString();
                                } else {
                                  // Fallback to original method for other date formats
                                  return new Date(
                                    dateString
                                  ).toLocaleDateString();
                                }
                              };

                              return formatDate(transaction.date);
                            })()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {transaction.reference || "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="text-sm">
                              <div className="font-medium">
                                {transaction.accountNumber}
                              </div>
                              <div className="text-gray-600">
                                {transaction.accountName}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {transaction.description}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {transaction.debit > 0
                              ? `$${transaction.debit.toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {transaction.credit > 0
                              ? `$${transaction.credit.toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {transaction.type}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                        >
                          No AR transactions found. Create a cash receipt to get
                          started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "invoices":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Manage Invoices
            </h2>
            <div className="mb-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create New Invoice
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Invoice #
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Client
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Issue Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Due Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Amount
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Status
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      INV-001
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      ABC Properties Ltd.
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Dec 15, 2024
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Jan 15, 2025
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $5,250.00
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-800 mr-2">
                        Send
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "payments":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Payment Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Bank Transfer</span>
                    <span className="font-semibold">$35,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Credit Card</span>
                    <span className="font-semibold">$8,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Check</span>
                    <span className="font-semibold">$1,500</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Payment Schedule
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-semibold text-green-600">
                      $12,000
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Week</span>
                    <span className="font-semibold text-blue-600">$8,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-semibold text-purple-600">
                      $45,000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Accounts Receivable Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your accounts receivable, track invoices, and monitor
              payments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
                onClick={() => setActiveSection("overview")}
              >
                <div className="text-4xl text-blue-900 mb-2">📊</div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Overview
                </h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  View summary and recent activity
                </p>
              </div>
              <div
                className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
                onClick={() => setActiveSection("invoices")}
              >
                <div className="text-4xl text-green-900 mb-2">📄</div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Manage Invoices
                </h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Create and manage invoices
                </p>
              </div>
              <div
                className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
                onClick={() => setActiveSection("payments")}
              >
                <div className="text-4xl text-purple-900 mb-2">💰</div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Payment Tracking
                </h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Track payments and methods
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        <FinanceSidebar />
        <div className="flex-1 p-6">{renderMainContent()}</div>
      </div>

      {/* Cash Receipt Modal */}
      {showCashReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                A/R Account Cheque Posting
              </h2>
              <div className="text-sm text-gray-600">
                Today's Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Miscellaneous Cash Receipt Form */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
                  Miscellaneous Cash Receipt
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AR Number:
                    </label>
                    <input
                      type="text"
                      value={cashReceiptForm.arNumber}
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Received From:
                    </label>
                    <input
                      type="text"
                      value={cashReceiptForm.chequeReceivedFrom}
                      onChange={(e) =>
                        setCashReceiptForm((prev) => ({
                          ...prev,
                          chequeReceivedFrom: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter who the cheque was from"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque #:
                    </label>
                    <input
                      type="text"
                      value={cashReceiptForm.chequeNumber}
                      onChange={(e) =>
                        setCashReceiptForm((prev) => ({
                          ...prev,
                          chequeNumber: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type:
                    </label>
                    <select
                      value={cashReceiptForm.paymentType}
                      onChange={(e) =>
                        setCashReceiptForm((prev) => ({
                          ...prev,
                          paymentType: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cheque">Cheque</option>
                      <option value="EFT">EFT</option>
                      <option value="Wire Transfer">Wire Transfer</option>
                      <option value="Bank Draft">Bank Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceiptForm.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Included:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceiptForm.taxIncluded}
                      onChange={(e) => handleTaxChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Receipt:
                    </label>
                    <input
                      type="date"
                      value={cashReceiptForm.dateOfReceipt}
                      onChange={(e) =>
                        setCashReceiptForm((prev) => ({
                          ...prev,
                          dateOfReceipt: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Account:
                    </label>
                    <input
                      type="text"
                      value="General"
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      G/L Note:
                    </label>
                    <input
                      type="text"
                      value={cashReceiptForm.glNote}
                      onChange={(e) =>
                        setCashReceiptForm((prev) => ({
                          ...prev,
                          glNote: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-red-700 text-sm font-medium">
                    *** Funds Must Be Deposited In The General Bank Account ***
                  </p>
                </div>
              </div>

              {/* General Ledger Account Table */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3 text-gray-800">
                  General Ledger Account Allocations
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Acct #
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          General Ledger Account Name
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashReceiptForm.accountAllocations.map(
                        (account, index) => (
                          <tr
                            key={index}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              index === 0 ? "bg-blue-50" : ""
                            } ${
                              selectedAccountIndex === index
                                ? "bg-yellow-100"
                                : ""
                            }`}
                            onClick={() => handleRowClick(index)}
                          >
                            <td className="border border-gray-300 px-4 py-2">
                              {account.accountNumber}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {account.accountName}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={account.amount}
                                readOnly
                                className="w-full text-right bg-transparent border-none focus:outline-none"
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleEditSelectedAccount}
                    disabled={selectedAccountIndex === null}
                    className={`px-4 py-2 rounded-md font-medium ${
                      selectedAccountIndex !== null
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleAddAccount}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
              <div className="flex space-x-3">
                <button
                  onClick={handleFormSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                >
                  Store
                </button>
                <button
                  onClick={() => setShowCashReceiptModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg shadow-xl w-96">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">
                Adding a Misc. Cash Receipt
              </h2>
            </div>

            {/* Modal Body */}
            <div className="bg-white p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account:
                  </label>
                  <div className="relative">
                    <select
                      value={newAccountAllocation.accountNumber}
                      onChange={(e) => handleAccountSelection(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Account</option>
                      {chartOfAccounts.map((account) => (
                        <option
                          key={account.accountNumber}
                          value={account.accountNumber}
                        >
                          {account.accountNumber} {account.accountName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-2.5">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description:
                  </label>
                  <textarea
                    value={newAccountAllocation.description}
                    onChange={(e) =>
                      setNewAccountAllocation((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={newAccountAllocation.amount}
                      onChange={(e) =>
                        setNewAccountAllocation((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <button className="absolute right-2 top-2 text-gray-500 hover:text-gray-700">
                      +/-
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note:
                  </label>
                  <div className="relative">
                    <textarea
                      value={newAccountAllocation.note}
                      onChange={(e) =>
                        setNewAccountAllocation((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter note"
                    />
                    <div className="absolute bottom-2 right-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleAddAccountSubmit}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium underline"
              >
                Apply
              </button>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsReceivable;
