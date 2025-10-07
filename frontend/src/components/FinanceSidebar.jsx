import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaBalanceScale,
  FaReceipt,
  FaMoneyBillWave,
  FaHandshake,
  FaFileInvoiceDollar,
  FaArrowLeft,
  FaCreditCard,
  FaCheckDouble,
  FaUserTie,
  FaUserCog,
  FaBook,
  FaFileAlt,
} from "react-icons/fa";

const FinanceSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarMenuItems = [
    {
      id: "chart-accounts",
      title: "CHART OF ACCOUNTS MENU",
      icon: FaChartBar,
      path: "/chart-of-accounts",
    },
    {
      id: "trial-balance",
      title: "TRIAL BALANCE - DETAIL BALANCE",
      icon: FaBalanceScale,
      path: "/trial-balance",
    },
    {
      id: "finance-statements",
      title: "FINANCE STATEMENTS",
      icon: FaCreditCard,
      path: "/finance-statements",
    },
    {
      id: "hst-report",
      title: "HST REPORT",
      icon: FaReceipt,
      path: "/hst-report",
    },
    {
      id: "journal-entry",
      title: "JOURNAL ENTRY",
      icon: FaBook,
      path: "/journal-entry",
    },
    {
      id: "disbursements-journals",
      title: "DISBURSEMENTS JOURNALS",
      icon: FaFileAlt,
      path: "/disbursements-journals",
    },
    {
      id: "trust-journal",
      title: "TRUST JOURNAL",
      icon: FaBook,
      path: "/trust-journal",
    },
    {
      id: "trade-ar-journal",
      title: "TRADE A/R JOURNAL",
      icon: FaBook,
      path: "/trade-ar-journal",
    },
    {
      id: "trust-payments",
      title: "REAL ESTATE TRUST PAYMENTS",
      icon: FaMoneyBillWave,
      path: "/real-estate-trust-payments",
    },
    {
      id: "real-estate-trust-ledger",
      title: "REAL ESTATE TRUST LEDGER",
      icon: FaBook,
      path: "/real-estate-trust-ledger",
    },
    {
      id: "commission-trust",
      title: "COMMISSION TRUST PAYMENTS",
      icon: FaHandshake,
      path: "/commission-trust-payments",
    },
    {
      id: "commission-trust-ledger",
      title: "COMMISSION TRUST LEDGER",
      icon: FaBook,
      path: "/commission-trust-ledger",
    },
    {
      id: "general-account",
      title: "GENERAL ACCOUNT PAYMENTS (A/P) EXPENSES",
      icon: FaFileInvoiceDollar,
      path: "/general-account-payments",
    },
    {
      id: "reconcile-real-estate-trust",
      title: "RECONCILING REAL ESTATE TRUST",
      icon: FaCheckDouble,
      path: "/reconcile-real-estate-trust",
    },
    {
      id: "reconcile-commission-trust",
      title: "RECONCILING COMMISSION TRUST",
      icon: FaCheckDouble,
      path: "/reconcile-commission-trust",
    },
    {
      id: "reconcile-general-account",
      title: "RECONCILING GENERAL ACCOUNT",
      icon: FaCheckDouble,
      path: "/reconcile-general-account",
    },
    {
      id: "accounts-receivable",
      title: "ACCOUNTS RECEIVABLE",
      icon: FaUserTie,
      path: "/accounts-receivable",
    },
    {
      id: "agent-payment-info",
      title: "AGENT PAYMENT INFO",
      icon: FaUserCog,
      path: "/agent-payment-info",
    },
    {
      id: "agent-payment-summary",
      title: "AGENT PAYMENT SUMMARY",
      icon: FaUserCog,
      path: "/agent-payment-summary",
    },
  ];

  const handleSidebarItemClick = (path) => {
    navigate(path);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => navigate("/finance")}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" />
          Back to Finance
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleSidebarItemClick(item.path)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isActivePage(item.path)
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
  );
};

export default FinanceSidebar;
