import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  FaChartBar,
  FaBalanceScale,
  FaReceipt,
  FaMoneyBillWave,
  FaHandshake,
  FaFileInvoiceDollar,
  FaArrowLeft,
  FaCheckDouble,
  FaUserTie,
  FaUserCog,
  FaBook,
  FaFileAlt,
} from "react-icons/fa";

const Finance = () => {
  const [activeSection, setActiveSection] = useState("main");
  const navigate = useNavigate();

  // Check if user is finance admin
  useEffect(() => {
    const isFinanceAdmin = sessionStorage.getItem("isFinanceAdmin") === "true";
    if (!isFinanceAdmin) {
      navigate("/");
    }
  }, [navigate]);

  const sidebarMenuItems = [
    {
      id: "journal-entry",
      title: "JOURNAL ENTRY",
      icon: FaBook,
    },
    {
      id: "disbursements-journals",
      title: "DISBURSEMENTS JOURNALS",
      icon: FaFileAlt,
    },
    {
      id: "trust-journal",
      title: "TRUST JOURNAL",
      icon: FaBook,
    },
    {
      id: "trade-ar-journal",
      title: "TRADE A/R JOURNAL",
      icon: FaBook,
    },
    {
      id: "trust-payments",
      title: "REAL ESTATE TRUST PAYMENTS",
      icon: FaMoneyBillWave,
    },
    {
      id: "real-estate-trust-ledger",
      title: "REAL ESTATE TRUST LEDGER",
      icon: FaBook,
    },
    {
      id: "commission-trust",
      title: "COMMISSION TRUST PAYMENTS",
      icon: FaHandshake,
    },
    {
      id: "commission-trust-ledger",
      title: "COMMISSION TRUST LEDGER",
      icon: FaBook,
    },
    {
      id: "general-account",
      title: "GENERAL ACCOUNT PAYMENTS (A/P) EXPENSES",
      icon: FaFileInvoiceDollar,
    },
    {
      id: "reconcile-real-estate-trust",
      title: "RECONCILING REAL ESTATE TRUST",
      icon: FaCheckDouble,
    },
    {
      id: "reconcile-commission-trust",
      title: "RECONCILING COMMISSION TRUST",
      icon: FaCheckDouble,
    },
    {
      id: "reconcile-general-account",
      title: "RECONCILING GENERAL ACCOUNT",
      icon: FaCheckDouble,
    },
    {
      id: "accounts-receivable",
      title: "ACCOUNTS RECEIVABLE",
      icon: FaUserTie,
    },
    {
      id: "agent-payment-info",
      title: "AGENT PAYMENT INFO",
      icon: FaUserCog,
    },
    {
      id: "agent-payment-summary",
      title: "AGENT PAYMENT SUMMARY",
      icon: FaUserCog,
    },
  ];

  const mainCards = [
    {
      id: "chart-accounts",
      title: "Chart of Accounts Menu",
      icon: FaChartBar,
      description: "Manage and view your chart of accounts",
      color: "bg-blue-500",
    },
    {
      id: "trial-balance",
      title: "Trial Balance - Detail Balance",
      icon: FaBalanceScale,
      description: "View detailed trial balance reports",
      color: "bg-green-500",
    },
    {
      id: "finance-statements",
      title: "Finance Statements",
      icon: FaReceipt,
      description: "Generate income and balance statements",
      color: "bg-purple-500",
    },
    {
      id: "hst-report",
      title: "HST Report",
      icon: FaReceipt,
      description: "Generate and view HST reports",
      color: "bg-orange-500",
    },
  ];

  const handleCardClick = (cardId) => {
    if (cardId === "chart-accounts") {
      navigate("/chart-of-accounts");
    } else if (cardId === "trial-balance") {
      navigate("/trial-balance");
    } else if (cardId === "finance-statements") {
      navigate("/finance-statements");
    } else if (cardId === "hst-report") {
      navigate("/hst-report");
    } else {
      setActiveSection(cardId);
    }
  };

  const handleSidebarItemClick = (itemId) => {
    if (itemId === "chart-accounts") {
      navigate("/chart-of-accounts");
    } else if (itemId === "trial-balance") {
      navigate("/trial-balance");
    } else if (itemId === "finance-statements") {
      navigate("/finance-statements");
    } else if (itemId === "hst-report") {
      navigate("/hst-report");
    } else if (itemId === "journal-entry") {
      navigate("/journal-entry");
    } else if (itemId === "disbursements-journals") {
      navigate("/disbursements-journals");
    } else if (itemId === "trust-journal") {
      navigate("/trust-journal");
    } else if (itemId === "trade-ar-journal") {
      navigate("/trade-ar-journal");
    } else if (itemId === "trust-payments") {
      navigate("/real-estate-trust-payments");
    } else if (itemId === "real-estate-trust-ledger") {
      navigate("/real-estate-trust-ledger");
    } else if (itemId === "commission-trust") {
      navigate("/commission-trust-payments");
    } else if (itemId === "commission-trust-ledger") {
      navigate("/commission-trust-ledger");
    } else if (itemId === "general-account") {
      navigate("/general-account-payments");
    } else if (itemId === "reconcile-real-estate-trust") {
      navigate("/reconcile-real-estate-trust");
    } else if (itemId === "reconcile-commission-trust") {
      navigate("/reconcile-commission-trust");
    } else if (itemId === "reconcile-general-account") {
      navigate("/reconcile-general-account");
    } else if (itemId === "accounts-receivable") {
      navigate("/accounts-receivable");
    } else if (itemId === "agent-payment-info") {
      navigate("/agent-payment-info");
    } else if (itemId === "agent-payment-summary") {
      navigate("/agent-payment-summary");
    } else {
      setActiveSection(itemId);
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "chart-accounts":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Chart of Accounts Menu
            </h2>
            <p className="text-gray-600 mb-4">
              Manage your chart of accounts, add new accounts, and organize your
              financial structure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Asset Accounts</h3>
                <ul className="text-sm text-gray-600">
                  <li>• Cash and Cash Equivalents</li>
                  <li>• Accounts Receivable</li>
                  <li>• Prepaid Expenses</li>
                  <li>• Fixed Assets</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Liability Accounts</h3>
                <ul className="text-sm text-gray-600">
                  <li>• Accounts Payable</li>
                  <li>• Accrued Expenses</li>
                  <li>• Bank Loans</li>
                  <li>• HST Payable</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "trial-balance":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Trial Balance - Detail Balance
            </h2>
            <p className="text-gray-600 mb-4">
              View detailed trial balance reports with account balances and
              adjustments.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Account
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Debit
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Credit
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Cash</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $50,000
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $50,000
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Accounts Receivable
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $25,000
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $25,000
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Accounts Payable
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $15,000
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ($15,000)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "hst-report":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              HST Report
            </h2>
            <p className="text-gray-600 mb-4">
              Generate and view HST (Harmonized Sales Tax) reports for tax
              filing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-600">
                  HST Collected
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sales (HST Included):</span>
                    <span className="font-semibold">$100,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HST Collected (15%):</span>
                    <span className="font-semibold text-green-600">
                      $13,000
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-3 text-red-600">HST Paid</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Purchases (HST Included):</span>
                    <span className="font-semibold">$50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HST Paid (15%):</span>
                    <span className="font-semibold text-red-600">$6,500</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Net HST Owing</h3>
              <div className="text-2xl font-bold text-blue-600">
                $6,500 (HST Collected - HST Paid)
              </div>
            </div>
          </div>
        );
      case "trust-payments":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Real Estate Trust Payments
            </h2>
            <p className="text-gray-600 mb-4">
              Manage real estate trust account payments and transactions.
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Trust Account Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-semibold ml-2">$150,000</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pending Payments:</span>
                    <span className="font-semibold ml-2">$25,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "commission-trust":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Commission Trust Payments
            </h2>
            <p className="text-gray-600 mb-4">
              Manage commission trust account payments and distributions.
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Commission Trust Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Commissions:</span>
                    <span className="font-semibold ml-2">$75,000</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paid to Agents:</span>
                    <span className="font-semibold ml-2">$60,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "commission-trust-ledger":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Commission Trust Ledger
            </h2>
            <p className="text-gray-600 mb-4">
              View detailed ledger entries for the commission trust account.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
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
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      2023-10-20
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Commission Payment to Agent A
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $10,000
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $10,000
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      2023-10-25
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Commission Payment to Agent B
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $15,000
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $25,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "general-account":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              General Account Payments (A/P) Expenses
            </h2>
            <p className="text-gray-600 mb-4">
              Manage accounts payable and general expense payments.
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Accounts Payable Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Outstanding:</span>
                    <span className="font-semibold ml-2">$45,000</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Overdue Amount:</span>
                    <span className="font-semibold ml-2 text-red-600">
                      $12,000
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
              Finance Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mainCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
                  onClick={() => handleCardClick(card.id)}
                >
                  <card.icon className="text-4xl text-blue-900 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    {card.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  // Check if current section is one of the main cards
  const isMainCard = [
    "chart-accounts",
    "trial-balance",
    "hst-report",
    "trust-payments",
    "commission-trust",
    "commission-trust-ledger",
    "general-account",
  ].includes(activeSection);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          {isMainCard && (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setActiveSection("main")}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="mr-2" />
                Back to Finance
              </button>
            </div>
          )}
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarMenuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSidebarItemClick(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6">{renderMainContent()}</div>
      </div>
    </div>
  );
};

export default Finance;
