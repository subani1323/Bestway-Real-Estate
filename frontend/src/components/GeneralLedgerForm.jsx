import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const GeneralLedgerForm = ({ setSelectedForm }) => {
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

  const [isLoading, setIsLoading] = useState(false);

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

    console.log("Submitting form data:", formData);

    // Validate all fields except agentDisbursement are not empty
    const emptyFields = Object.entries(formData)
      .filter(([key, value]) => key !== "agentDisbursement" && !value)
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      toast.error("All fields are mandatory");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/general-ledger-setup",
        formData
      );
      console.log("Form submission response:", response.data);
      toast.success("Form submitted successfully");
      setFormData({
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
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          General Ledger Account Setup
        </h2>
        <button
          onClick={() => setSelectedForm(null)}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text Input Fields */}
        {[
          { label: "A/R - Commission Earned", name: "ARCommissionEarned" },
          {
            label: "A/P - General & Commission Expense",
            name: "APGeneralCommissionExpense",
          },
          { label: "A/P - Other Brokers", name: "AROtherDebit" },
          {
            label: "Liability For Trust Funds Held",
            name: "unpaidFileTrustReceivable",
          },
          {
            label: "Commission Payable",
            name: "commissionReceivablePayable",
          },
          {
            label: "HST with held From Agents",
            name: "heldFundsReceivableAgent",
          },
          {
            label: "Held Funds Payable (Agent)",
            name: "heldFundsPayableAgent",
          },
          { label: "Suspense", name: "suspense" },
          {
            label: "Labour Expenses - Management",
            name: "unpaidExpensesManagement",
          },
          {
            label: "Labour Expenses - Hourly",
            name: "unpaidExpensesNonMgmt",
          },
          { label: "Agent Bonus", name: "payrollAgent" },
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              required
            />
          </div>
        ))}

        {/* Checkbox Field */}
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
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralLedgerForm;
