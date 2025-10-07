import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import axiosInstance from "../config/axios";

const AccountSection = ({
  title,
  accountName,
  transactions,
  openingBalance,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  let currentBalance = openingBalance;
  const processedTransactions = transactions.map((tx) => {
    let change = 0;
    if (tx.debitAccount === accountName) {
      change = tx.amount;
    } else if (tx.creditAccount === accountName) {
      change = -tx.amount;
    }
    currentBalance += change;
    return { ...tx, final: currentBalance };
  });

  const totalDebits = transactions
    .filter((tx) => tx.debitAccount === accountName)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalCredits = transactions
    .filter((tx) => tx.creditAccount === accountName)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const closingBalance = openingBalance + totalDebits - totalCredits;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Debits
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td
                colSpan="6"
                className="px-6 py-4 whitespace-nowrap text-right font-bold"
              >
                Opening Balance
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                {openingBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
            {processedTransactions.map((tx) => (
              <tr key={tx._id}>
                <td className="px-6 py-4 whitespace-nowrap">{/* SR data */}</td>
                <td className="px-6 py-4 whitespace-nowrap">{tx.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tx.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {tx.debitAccount === accountName
                    ? tx.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {tx.creditAccount === accountName
                    ? tx.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {tx.final.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan="6"
                className="px-6 py-4 whitespace-nowrap text-right font-bold"
              >
                Closing Balance
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                {closingBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr className="mt-4 border-t-2 border-gray-400" />
    </div>
  );
};

const ChartOfAccounts = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  // Check if user is finance admin
  useEffect(() => {
    const isFinanceAdmin = sessionStorage.getItem("isFinanceAdmin") === "true";
    if (!isFinanceAdmin) {
      navigate("/");
    }
  }, [navigate]);

  const handleFetchDetails = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both 'From' and 'To' dates.");
      return;
    }
    try {
      const response = await axiosInstance.get("/transactions", {
        params: { from: fromDate, to: toDate },
      });
      setAllTransactions(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching chart of accounts:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTransactionsForAccount = (accountName) => {
    return allTransactions.filter(
      (tx) =>
        tx.debitAccount === accountName || tx.creditAccount === accountName
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        <FinanceSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {!showDetails ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Chart of Accounts
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <label
                      htmlFor="from-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      From
                    </label>
                    <input
                      type="date"
                      id="from-date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="to-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      To
                    </label>
                    <input
                      type="date"
                      id="to-date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleFetchDetails}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
                >
                  Check Details
                </button>
              </>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">
                    Bestway Real Estate Ltd., Brokerage
                  </h2>
                  <p>Detail Format Trial Balance</p>
                  <p>
                    From {formatDate(fromDate)} To {formatDate(toDate)}
                  </p>
                </div>

                <AccountSection
                  title="10001 Cash - Current Account"
                  accountName="CASH - CURRENT ACCOUNT"
                  transactions={getTransactionsForAccount(
                    "CASH - CURRENT ACCOUNT"
                  )}
                  openingBalance={0}
                />
                <AccountSection
                  title="10002 Cash - Trust"
                  accountName="CASH - TRUST"
                  transactions={getTransactionsForAccount("CASH - TRUST")}
                  openingBalance={0}
                />
                <AccountSection
                  title="10003 Cash - Commission Trust Account"
                  accountName="CASH - COMMISSION TRUST ACCOUNT"
                  transactions={getTransactionsForAccount(
                    "CASH - COMMISSION TRUST ACCOUNT"
                  )}
                  openingBalance={0}
                />
                <AccountSection
                  title="21300 Liability for Trust Funds Held"
                  accountName="LIABILITY FOR TRUST FUNDS HELD"
                  transactions={getTransactionsForAccount(
                    "LIABILITY FOR TRUST FUNDS HELD"
                  )}
                  openingBalance={0}
                />

                <button
                  onClick={() => setShowDetails(false)}
                  className="mt-4 bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
