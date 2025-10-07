import React, { useState } from "react";
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
  FaPrint,
  FaBook,
} from "react-icons/fa";

export const scannedAccounts = [
  {
    acct: "10001",
    description: "Cash - Current Account",
    type: "A",
    line: "CASH",
  },
  {
    acct: "10002",
    description: "Cash - Trust",
    type: "A",
    line: "NET TRUST FUNDS",
  },
  {
    acct: "10004",
    description: "Cash - Commission Trust Account",
    type: "A",
    line: "CASH",
  },
  {
    acct: "10005",
    description: "Term Deposits - Buyers",
    type: "A",
    line: "NET TRUST FUNDS",
  },
  {
    acct: "10006",
    description: "Cash - General Term Deposits",
    type: "A",
    line: "CASH",
  },
  {
    acct: "10009",
    description: "Cash - Petty Cash",
    type: "A",
    line: "CASH",
  },
  {
    acct: "11000",
    description: "Notes Receivables",
    type: "A",
    line: "NOTES RECEIVABLE",
  },
  {
    acct: "12100",
    description: "A/R - Agt's Recoverable- Gen Exp",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "12101",
    description: "A/R - Agt's Recoverable - Advert",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "12200",
    description: "A/R - Commission From Deals",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "12500",
    description: "A/R - Other",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "12600",
    description: "Loan - Homelife Top Star",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "12700",
    description: "Loan- Executive Mortgage",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "12999",
    description: "A/R - Allowance",
    type: "A",
    line: "ACCOUNTS RECEIVABLE",
  },
  {
    acct: "15000",
    description: "Prepaid Expenses",
    type: "A",
    line: "PREPAID EXPENSES",
  },
  {
    acct: "16010",
    description: "Land & Buildings",
    type: "A",
    line: "LAND & BUILDING",
  },
  { acct: "16020", description: "Vehicles", type: "A", line: "AUTOMOBILE" },
  {
    acct: "16030",
    description: "Office Furniture",
    type: "A",
    line: "OFFICE EQUIPMENT",
  },
  {
    acct: "16040",
    description: "Office Equipment",
    type: "A",
    line: "OFFICE EQUIPMENT",
  },
  {
    acct: "16050",
    description: "Computer Hardware",
    type: "A",
    line: "COMPUTER EQUIPMENT",
  },
  {
    acct: "16060",
    description: "Computer Software",
    type: "A",
    line: "COMPUTER EQUIPMENT",
  },
  {
    acct: "16070",
    description: "Leasehold Improvements",
    type: "A",
    line: "LEASEHOLD IMPROVEMENTS",
  },
  {
    acct: "16080",
    description: "Signs",
    type: "A",
    line: "LEASEHOLD IMPROVEMENTS",
  },
  {
    acct: "16090",
    description: "Franchise Cost",
    type: "A",
    line: "FRANCHISE COSTS",
  },
  {
    acct: "17000",
    description: "Incorporation Cost",
    type: "A",
    line: "FRANCHISE COSTS",
  },
  {
    acct: "17010",
    description: "Acc. Depr. - Building",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17020",
    description: "Acc. Depr. - Vehicles",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17030",
    description: "Acc. Depr. - Office Furniture",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17040",
    description: "Acc. Depr. - Office Equipment",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17050",
    description: "Acc. Depr. - Comp. Hardware",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17060",
    description: "Acc. Depr. - Comp. Software",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17070",
    description: "Acc. Amor. - Leaseholds",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17080",
    description: "Acc. Depr. - Signs",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "17090",
    description: "Acc. Amor. - Franchise Costs",
    type: "D",
    line: "ACCUMULATED DEPRECIATION",
  },
  {
    acct: "20000",
    description: "Bank Operating Line",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "21000",
    description: "A/P - Suppliers",
    type: "L",
    line: "ACCOUNTS PAYABLE",
  },
  {
    acct: "21100",
    description: "A/P - Other Brokers & Referrals",
    type: "L",
    line: "ACCOUNTS PAYABLE",
  },
  { acct: "21200", description: "Garnishment", type: "L", line: "LIABILITY" },
  {
    acct: "21300",
    description: "Liability For Trust Funds",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "21400",
    description: "Loan - Clientel",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "21450",
    description: "Loan Payable - 2199435 Ont Inc",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "21500",
    description: "Commission Payable",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "21600",
    description: "Brokers Commission",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "22000",
    description: "Accrued Expenses",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "23000",
    description: "HST Collected",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "23001",
    description: "HST Input Tax Credit",
    type: "A",
    line: "ASSET",
  },
  {
    acct: "23002",
    description: "Agent's HST Contra",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "23004",
    description: "HST Net Payable",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "24000",
    description: "F.I.T. Withheld",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "24001",
    description: "E.I. Withheld",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "24002",
    description: "C.P.P. Withheld",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "24500",
    description: "Payroll Clearing",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "24700",
    description: "Vacation Pay Payable",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "26000",
    description: "Income Tax Payable",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "27000",
    description: "Bank Loan #1",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "27010",
    description: "Long Term Loan - Computers",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "28000",
    description: "Shareholder Loan - Sri",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "28010",
    description: "Shareholder Loan - #2",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "28020",
    description: "Shareholder Loan - #3",
    type: "L",
    line: "LIABILITY",
  },
  {
    acct: "28050",
    description: "Loan Payable - Executive Mortgage",
    type: "L",
    line: "LIABILITY",
  },
  { acct: "29000", description: "Suspense", type: "L", line: "LIABILITY" },
  {
    acct: "30000",
    description: "Preferred Stock",
    type: "E",
    line: "EQUITY",
  },
  { acct: "30010", description: "Common Stock", type: "E", line: "EQUITY" },
  { acct: "30050", description: "Dividend", type: "E", line: "EQUITY" },
  {
    acct: "39998",
    description: "Retained Earnings - Open Bal.",
    type: "E",
    line: "EQUITY",
  },
  {
    acct: "39999",
    description: "Retained Earnings - Y.T.D.",
    type: "E",
    line: "EQUITY",
  },
  {
    acct: "40100",
    description: "Commission Income",
    type: "R",
    line: "REVENUE",
  },
  {
    acct: "42100",
    description: "Interest Income",
    type: "R",
    line: "REVENUE",
  },
  {
    acct: "43100",
    description: "Other Income",
    type: "R",
    line: "REVENUE",
  },
  {
    acct: "44100",
    description: "Fee Deducted Income",
    type: "R",
    line: "REVENUE",
  },
  {
    acct: "45100",
    description: "Desk Fee Income",
    type: "R",
    line: "REVENUE",
  },
  {
    acct: "46100",
    description: "Brokers Commission Split",
    type: "R",
    line: "REVENUE",
  },
  {
    acct: "50100",
    description: "Agent's Commission",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "51100",
    description: "Commission To Other Brokers",
    type: "E",
    line: "EXPENSE",
  },
  { acct: "52100", description: "Referral Fees", type: "E", line: "EXPENSE" },
  {
    acct: "60101",
    description: "Equip. Rental - Computer",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "60102",
    description: "Equip. Rental - Furniture",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "60199",
    description: "Equip. Rental - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "62101",
    description: "Rent & Occ. - Rent Expense",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "62102",
    description: "Rent & Occ. - Common Area",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "62103",
    description: "Rent & Occ. - Utilities",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "62104",
    description: "Rent & Occ. - Repairs & Maint",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "62105",
    description: "Rent & Occ. - Prop./Bus. Taxes",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "63101",
    description: "Lic. & Ins. - Errors & Ommiss.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "63102",
    description: "Lic. & Ins. - Office Contents",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "63103",
    description: "Lic. & Ins. - Licenses",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "63199",
    description: "Lic. & Ins. - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "64101",
    description: "Selling - Mls Fees",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "64102",
    description: "Selling - Signs",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "64103",
    description: "Selling - Supplies",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "64104",
    description: "Selling - Meetings",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "64199",
    description: "Selling - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "65101",
    description: "Advertising - Newspapers",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "65102",
    description: "Advertising - Other Medium",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "65103",
    description: "Advertising - Web Solutions",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "65104",
    description: "Advertising - Recovered",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "65105",
    description: "Advertising - Promotional",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "65199",
    description: "Advertising - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "66101",
    description: "Recruiting Lunches",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "66102",
    description: "Recruiting Gifts",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "66103",
    description: "Recruiting Agency",
    type: "E",
    line: "EXPENSE",
  },
  { acct: "66111", description: "Staff Lunches", type: "E", line: "EXPENSE" },
  { acct: "66112", description: "Staff Gifts", type: "E", line: "EXPENSE" },
  {
    acct: "66199",
    description: "Misc. Recruiting",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "69101",
    description: "Franchise Costs - Realty Executives",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "69103",
    description: "Franchise Costs - Advertising",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "69199",
    description: "Franchise Costs - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70101",
    description: "Payroll Exp. - Mgmt. Salaries",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70102",
    description: "Payroll Exp. - Salaries",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70103",
    description: "Payroll Exp. - Part-Time",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70104",
    description: "Payroll Exp. - Payroll",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70105",
    description: "Payroll Exp. - Group Insurance",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70106",
    description: "Payroll Exp. - E.H.T.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70107",
    description: "Payroll Exp. - Recovered",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "70199",
    description: "Payroll Exp. - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "71101",
    description: "Bank Charges - Interest",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "71102",
    description: "Bank Charges - Loan Interest",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "71104",
    description: "Bank Charges - Service Charges",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "71199",
    description: "Bank Charges - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "72101",
    description: "Commun. Exp. - Telephone Lines",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "72102",
    description: "Commun. Exp. - Internet Service",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "72103",
    description: "Commun. Exp. - Pagers",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "72104",
    description: "Commun. Exp. - Cellular",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "72199",
    description: "Commun. Exp. - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75101",
    description: "Office Exp. - Computer Supplies",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75102",
    description: "Office Exp. - Office Supplies",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75103",
    description: "Office Exp. - Printing",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75104",
    description: "Office Exp. - Postage",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75105",
    description: "Office Exp. - Courier Service",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75107",
    description: "Office Exp. - Business Taxes",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75108",
    description: "Office Exp. - Security Services",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75109",
    description: "Office Exp. - Automobile",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75110",
    description: "Office Exp. - Charitable",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75111",
    description: "Office Exp. - Bad Debts",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75112",
    description: "Office Exp. - Photocopies",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75114",
    description: "Office Exp. -Tel.Answer Servi Ces",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75115",
    description: "Office Exp. - Recruiting",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75116",
    description: "Office Exp. - Conventions/Seminars",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75117",
    description: "Office Exp. - Entertainment",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "75199",
    description: "Office Exp. - Misc.",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "76101",
    description: "Prof. Fees - Legal",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "76102",
    description: "Prof. Fees - Accounting",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "76103",
    description: "Prof. Fees - Consulting",
    type: "E",
    line: "EXPENSE",
  },
  { acct: "79101", description: "Depreciation", type: "E", line: "EXPENSE" },
  {
    acct: "79102",
    description: "Amortization - Franchise Fees",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "80101",
    description: "Gain Or Loss On Fixed Assets",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "90101",
    description: "Federal Income Taxes",
    type: "E",
    line: "EXPENSE",
  },
  {
    acct: "90102",
    description: "Provincial Income Taxes",
    type: "E",
    line: "EXPENSE",
  },
];

const ChartOfAccountsMenu = () => {
  const [activeSection, setActiveSection] = useState("main");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const sidebarMenuItems = [
    {
      id: "chart-accounts",
      title: "Chart of Accounts Menu",
      icon: FaChartBar,
    },
    {
      id: "trial-balance",
      title: "Trial Balance - Detail Balance",
      icon: FaBalanceScale,
    },
    {
      id: "hst-report",
      title: "HST Report",
      icon: FaReceipt,
    },
    {
      id: "trust-payments",
      title: "REAL ESTATE TRUST PAYMENTS",
      icon: FaMoneyBillWave,
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
  ];

  const handleSidebarItemClick = (itemId) => {
    if (itemId === "trial-balance") {
      navigate("/trial-balance");
    } else if (itemId === "hst-report") {
      navigate("/hst-report");
    } else if (itemId === "trust-payments") {
      navigate("/real-estate-trust-payments");
    } else if (itemId === "commission-trust") {
      navigate("/commission-trust-payments");
    } else if (itemId === "commission-trust-ledger") {
      navigate("/commission-trust-ledger");
    } else if (itemId === "general-account") {
      navigate("/general-account-payments");
    } else {
      setActiveSection(itemId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "chart-accounts":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Chart of Accounts
              </h2>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 print:hidden"
              >
                <FaPrint />
                Print
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Acct #
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Line Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scannedAccounts.map((account, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        {account.acct}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {account.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {account.type}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {account.line}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Recent Transactions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Deposit - Property Sale #1234</span>
                    <span className="text-green-600">+$75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment - Vendor Invoice #567</span>
                    <span className="text-red-600">-$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit - Earnest Money</span>
                    <span className="text-green-600">+$5,000</span>
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
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">
                  Recent Commission Payments
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Agent Smith - Property #1234</span>
                    <span className="text-red-600">-$12,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agent Johnson - Property #5678</span>
                    <span className="text-red-600">-$8,750</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agent Brown - Property #9012</span>
                    <span className="text-red-600">-$9,250</span>
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
              View detailed transactions and balances for the commission trust
              account.
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
                      2023-12-31
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Initial Balance
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $150,000
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $150,000
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      2024-01-15
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Payment to Agent Smith
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $12,500
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $137,500
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      2024-01-20
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Payment to Agent Johnson
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $8,750
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $128,750
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      2024-01-25
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Payment to Agent Brown
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $9,250
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      $119,500
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
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Recent Expense Payments</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Office Rent - January 2024</span>
                    <span className="text-red-600">-$3,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities - December 2023</span>
                    <span className="text-red-600">-$850</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing Services</span>
                    <span className="text-red-600">-$2,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Chart of Accounts
              </h2>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 print:hidden"
              >
                <FaPrint />
                Print
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Acct #
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Line Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scannedAccounts.map((account, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        {account.acct}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {account.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {account.type}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {account.line}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen print:hidden">
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
        <div className="flex-1 p-6 print:p-0">{renderMainContent()}</div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
};

export default ChartOfAccountsMenu;
