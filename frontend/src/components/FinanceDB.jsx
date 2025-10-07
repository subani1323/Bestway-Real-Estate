import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getEFTTypeDisplayName } from "../utils/eftUtils";
import axiosInstance from "../config/axios";

const FinanceDB = () => {
  const [activeSection, setActiveSection] = useState(
    "real-estate-trust-payments"
  );
  const [commissionTransfers, setCommissionTransfers] = useState([]);
  const [balanceDeposits, setBalanceDeposits] = useState([]);
  const [commissionTrustEFTs, setCommissionTrustEFTs] = useState([]);
  const [generalAccountEFTs, setGeneralAccountEFTs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosInstance.get("/finance-transactions");
        const allTransactions = response.data;
        setCommissionTransfers(
          allTransactions.filter((t) => t.type === "CommissionTransfer")
        );
        setBalanceDeposits(
          allTransactions.filter((t) => t.type === "BalanceOfDeposit")
        );
      } catch (error) {
        console.error("Error fetching finance transactions:", error);
      }
    };
    const fetchCommissionTrustEFTs = async () => {
      try {
        const response = await axiosInstance.get("/commission-trust-eft");
        setCommissionTrustEFTs(response.data);
      } catch (error) {
        console.error("Error fetching commission trust EFTs:", error);
      }
    };
    const fetchGeneralAccountEFTs = async () => {
      try {
        const response = await axiosInstance.get("/general-account-eft");
        setGeneralAccountEFTs(response.data);
      } catch (error) {
        console.error("Error fetching general account EFTs:", error);
      }
    };
    fetchTransactions();
    fetchCommissionTrustEFTs();
    fetchGeneralAccountEFTs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "real-estate-trust-payments":
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Real Estate Trust Payments
            </h3>
            {/* Commission Transfer Table */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-2">
                Transfer to General/Commission Trust
              </h4>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Cheque Date</th>
                    <th className="py-2 px-4 border-b">Amount of Cheque</th>
                    <th className="py-2 px-4 border-b">Cheque Written To</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionTransfers.map((tx) => (
                    <tr key={tx._id}>
                      <td className="py-2 px-4 border-b">
                        {formatDate(tx.chequeDate)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {tx.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {tx.chequeWrittenTo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Balance of Deposit Table */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Balance of Deposit</h4>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Cheque Date</th>
                    <th className="py-2 px-4 border-b">Amount of Cheque</th>
                    <th className="py-2 px-4 border-b">Cheque Written To</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceDeposits.map((tx) => (
                    <tr key={tx._id}>
                      <td className="py-2 px-4 border-b">
                        {formatDate(tx.chequeDate)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {tx.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {tx.chequeWrittenTo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "commission-trust-payments":
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Commission Trust Payments
            </h3>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">EFT #</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Recipient</th>
                  <th className="py-2 px-4 border-b">Trade #</th>
                  <th className="py-2 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {commissionTrustEFTs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No Commission Trust Payments found.
                    </td>
                  </tr>
                ) : (
                  commissionTrustEFTs.map((eft) => (
                    <tr key={eft._id}>
                      <td className="py-2 px-4 border-b">{eft.eftNumber}</td>
                      <td className="py-2 px-4 border-b">
                        {formatDate(eft.date)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {getEFTTypeDisplayName(eft.type)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.amount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.recipient || eft.agentName || "-"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.tradeId?.tradeNumber || "-"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.description || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      case "commission-trust-ledger":
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Commission Trust Ledger
            </h3>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">EFT #</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Recipient</th>
                  <th className="py-2 px-4 border-b">Trade #</th>
                  <th className="py-2 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {commissionTrustEFTs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No Commission Trust Ledger found.
                    </td>
                  </tr>
                ) : (
                  commissionTrustEFTs.map((eft) => (
                    <tr key={eft._id}>
                      <td className="py-2 px-4 border-b">{eft.eftNumber}</td>
                      <td className="py-2 px-4 border-b">
                        {formatDate(eft.date)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {getEFTTypeDisplayName(eft.type)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.amount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.recipient || eft.agentName || "-"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.tradeId?.tradeNumber || "-"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.description || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      case "general-account-payments":
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              General Account Payments (A/P) Expenses
            </h3>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">EFT #</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Recipient</th>
                  <th className="py-2 px-4 border-b">Expense Category</th>
                  <th className="py-2 px-4 border-b">Invoice #</th>
                </tr>
              </thead>
              <tbody>
                {generalAccountEFTs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No General Account Payments found.
                    </td>
                  </tr>
                ) : (
                  generalAccountEFTs.map((eft) => (
                    <tr key={eft._id}>
                      <td className="py-2 px-4 border-b">{eft.eftNumber}</td>
                      <td className="py-2 px-4 border-b">
                        {formatDate(eft.date)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {getEFTTypeDisplayName(eft.type)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.amount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">{eft.recipient}</td>
                      <td className="py-2 px-4 border-b">
                        {eft.expenseCategory || "-"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {eft.invoiceNumber || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/database")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Database
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Finance Database
          </h2>

          {/* Secondary Navbar */}
          <div className="bg-white py-4 border-b mb-6">
            <nav className="flex space-x-8">
              <button
                className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                  activeSection === "real-estate-trust-payments"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveSection("real-estate-trust-payments")}
              >
                Real Estate Trust Payments
              </button>
              <button
                className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                  activeSection === "commission-trust-payments"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveSection("commission-trust-payments")}
              >
                Commission Trust Payments
              </button>
              <button
                className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                  activeSection === "commission-trust-ledger"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveSection("commission-trust-ledger")}
              >
                Commission Trust Ledger
              </button>
              <button
                className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                  activeSection === "general-account-payments"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveSection("general-account-payments")}
              >
                General Account Payments (A/P) Expenses
              </button>
            </nav>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FinanceDB;
