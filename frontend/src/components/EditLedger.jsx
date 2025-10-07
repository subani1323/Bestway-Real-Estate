import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import axiosInstance from "../config/axios";

const EditLedger = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    ARCommissionEarned: "",
    APGeneralCommissionExpense: "",
    AROtherDebit: "",
    unpaidFileTrustReceivable: "",
    commissionReceivablePayable: "",
    heldFundsReceivableAgent: "",
    heldFundsPayableAgent: "",
    suspense: "",
    unpaidExpensesManagement: "",
    unpaidExpensesNonMgmt: "",
    payrollAgent: "",
    agentDisbursement: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLedgerEntry();
  }, [id]);

  const fetchLedgerEntry = async () => {
    try {
      const response = await axiosInstance.get(
        `/ledger/${id}`
      );
      if (response.data) {
        const { _id, __v, createdAt, updatedAt, ...ledgerData } = response.data;
        setFormData(ledgerData);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch ledger entry");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting form data:", formData);

      const response = await axiosInstance.put(
        `/ledger/${id}`,
        formData
      );

      console.log("Server response:", response.data);

      toast.success("Ledger entry updated successfully!");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/ledger-db");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to update ledger entry");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-4">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Edit General Ledger Account
          </h2>
          <button
            onClick={() => navigate("/ledger-db")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Default Fields */}
          {[
            { label: "A/R - Commission Earned", name: "ARCommissionEarned" },
            {
              label: "A/P - General & Commission Expense",
              name: "APGeneralCommissionExpense",
            },
            { label: "A/R - Other Debit", name: "AROtherDebit" },
            {
              label: "Unpaid File Trust Receivable",
              name: "unpaidFileTrustReceivable",
            },
            {
              label: "Commission Receivable Payable",
              name: "commissionReceivablePayable",
            },
            {
              label: "Held Funds Receivable (Agent)",
              name: "heldFundsReceivableAgent",
            },
            {
              label: "Held Funds Payable (Agent)",
              name: "heldFundsPayableAgent",
            },
            { label: "Suspense", name: "suspense" },
            {
              label: "Unpaid Expenses - Management",
              name: "unpaidExpensesManagement",
            },
            {
              label: "Unpaid Expenses - Non Mgmt",
              name: "unpaidExpensesNonMgmt",
            },
            { label: "Payroll - Agent", name: "payrollAgent" },
          ].map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
          ))}

          {/* Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agentDisbursement"
              name="agentDisbursement"
              checked={formData.agentDisbursement}
              onChange={handleChange}
              className="h-4 w-4 text-blue-900 focus:ring-blue-700 border-gray-300 rounded"
            />
            <label
              htmlFor="agentDisbursement"
              className="ml-2 block text-sm text-gray-700"
            >
              Agent Disbursement
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
              }`}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditLedger;
