import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import { toast } from "react-toastify";
import { scannedAccounts } from "./ChartOfAccountsMenu.jsx";
import JournalEntryPrintModal from "./JournalEntryPrintModal";
import JournalEntryDateRangeModal from "./JournalEntryDateRangeModal";
import JournalEntryRetrievedData from "./JournalEntryRetrievedData";
import axiosInstance from "../config/axios";

const JournalEntry = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [formData, setFormData] = useState(() => {
    const today = new Date();

    return {
      date: today.toISOString().split("T")[0],
      reference: "JE1000", // Default placeholder, will be updated on component mount
      description: "",
      entries: [
        {
          accountNumber: "",
          accountName: "",
          debit: "",
          credit: "",
        },
        {
          accountNumber: "",
          accountName: "",
          debit: "",
          credit: "",
        },
      ],
    };
  });
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showRetrievedData, setShowRetrievedData] = useState(false);
  const [retrievedEntries, setRetrievedEntries] = useState([]);
  const [retrievedDateRange, setRetrievedDateRange] = useState({});

  // Handle retrieve data functionality
  const handleRetrieveData = async (dateRange) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/ledger", {
        params: {
          from: dateRange.fromDate,
          to: dateRange.toDate,
        },
      });

      // Filter only journal entries
      const journalEntries = response.data.filter(
        (entry) => entry.type === "Journal Entry"
      );
      setRetrievedEntries(journalEntries);
      setRetrievedDateRange(dateRange);
      setShowRetrievedData(true);
    } catch (error) {
      console.error("Error retrieving journal entries:", error);
      toast.error("Failed to retrieve journal entries");
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing journal entries
  const fetchJournalEntries = async () => {
    try {
      const response = await axiosInstance.get("/ledger");
      setJournalEntries(response.data);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to fetch journal entries");
    }
  };

  // Fetch next JE reference number
  const fetchNextReference = async () => {
    try {
      const response = await axiosInstance.get(
        `/ledger/next-reference/dummy` // Date parameter not needed anymore
      );
      return response.data.nextReference;
    } catch (error) {
      console.error("Error fetching next JE reference:", error);
      // Fallback to basic JE format if API fails
      return "JE1000";
    }
  };

  useEffect(() => {
    fetchJournalEntries();
    // Initialize with correct JE reference number
    const initializeReference = async () => {
      const nextReference = await fetchNextReference();
      setFormData((prev) => ({
        ...prev,
        reference: nextReference,
      }));
    };
    initializeReference();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEntryChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const addEntry = () => {
    setFormData((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          accountNumber: "",
          accountName: "",
          debit: "",
          credit: "",
        },
      ],
    }));
  };

  const removeEntry = (index) => {
    if (formData.entries.length > 2) {
      setFormData((prev) => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index),
      }));
    }
  };

  const getAccountName = (accountNumber) => {
    const account = scannedAccounts.find((acc) => acc.acct === accountNumber);
    return account ? account.description : "";
  };

  const handleAccountNumberChange = (index, accountNumber) => {
    const accountName = getAccountName(accountNumber);
    handleEntryChange(index, "accountNumber", accountNumber);
    handleEntryChange(index, "accountName", accountName);
  };

  const validateForm = () => {
    // Check if at least 2 entries exist
    if (formData.entries.length < 2) {
      toast.error("At least 2 entries are required");
      return false;
    }

    // Check if all entries have account numbers
    const hasEmptyAccounts = formData.entries.some(
      (entry) => !entry.accountNumber
    );
    if (hasEmptyAccounts) {
      toast.error("All entries must have account numbers");
      return false;
    }

    // Check if debits equal credits
    const totalDebits = formData.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.debit) || 0),
      0
    );
    const totalCredits = formData.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.credit) || 0),
      0
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast.error("Total debits must equal total credits");
      return false;
    }

    // Check if at least one debit and one credit exist
    const hasDebits = formData.entries.some(
      (entry) => parseFloat(entry.debit) > 0
    );
    const hasCredits = formData.entries.some(
      (entry) => parseFloat(entry.credit) > 0
    );

    if (!hasDebits || !hasCredits) {
      toast.error("At least one debit and one credit entry are required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create ledger entries for each journal entry
      const promises = formData.entries.map((entry) => {
        if (parseFloat(entry.debit) > 0 || parseFloat(entry.credit) > 0) {
          return axiosInstance.post("/ledger", {
            accountNumber: entry.accountNumber,
            accountName: entry.accountName,
            debit: parseFloat(entry.debit) || 0,
            credit: parseFloat(entry.credit) || 0,
            description: formData.description,
            date: formData.date,
            reference: formData.reference,
            type: "Journal Entry",
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      toast.success("Journal entry posted successfully!");

      // Reset form
      const today = new Date();
      const nextReference = await fetchNextReference();

      setFormData({
        date: today.toISOString().split("T")[0],
        reference: nextReference,
        description: "",
        entries: [
          {
            accountNumber: "",
            accountName: "",
            debit: "",
            credit: "",
          },
          {
            accountNumber: "",
            accountName: "",
            debit: "",
            credit: "",
          },
        ],
      });

      // Refresh journal entries
      fetchJournalEntries();
    } catch (error) {
      console.error("Error posting journal entry:", error);
      toast.error("Failed to post journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        <FinanceSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Journal Entry
              </h2>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDateRangeModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <span>Retrieve Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    readOnly
                    placeholder="Auto-generated JE Reference"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Journal Entry Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Journal Entries */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Journal Entries
                  </h3>
                  <button
                    type="button"
                    onClick={addEntry}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Add Entry
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          Account Number
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          Account Name
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          Debit
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          Credit
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.entries.map((entry, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">
                            <select
                              value={entry.accountNumber}
                              onChange={(e) =>
                                handleAccountNumberChange(index, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select Account</option>
                              {scannedAccounts.map((account) => (
                                <option key={account.acct} value={account.acct}>
                                  {entry.accountNumber === account.acct
                                    ? account.acct
                                    : `${account.acct} - ${account.description}`}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={entry.accountName}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={entry.debit}
                              onChange={(e) =>
                                handleEntryChange(
                                  index,
                                  "debit",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={entry.credit}
                              onChange={(e) =>
                                handleEntryChange(
                                  index,
                                  "credit",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            {formData.entries.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeEntry(index)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end space-x-4 text-lg font-semibold">
                  <span>
                    Total Debits: $
                    {formData.entries
                      .reduce(
                        (sum, entry) => sum + (parseFloat(entry.debit) || 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                  <span>
                    Total Credits: $
                    {formData.entries
                      .reduce(
                        (sum, entry) => sum + (parseFloat(entry.credit) || 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Post Journal Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      <JournalEntryPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />

      {/* Date Range Modal */}
      <JournalEntryDateRangeModal
        isOpen={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onRetrieve={handleRetrieveData}
      />

      {/* Retrieved Data Modal */}
      {showRetrievedData &&
        retrievedDateRange.fromDate &&
        retrievedDateRange.toDate && (
          <JournalEntryRetrievedData
            entries={retrievedEntries}
            dateRange={retrievedDateRange}
            onClose={() => setShowRetrievedData(false)}
          />
        )}
    </div>
  );
};

export default JournalEntry;
