import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const JournalEntryPrintModal = ({ isOpen, onClose }) => {
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setPresetDateRange = (preset) => {
    const today = new Date();
    let fromDate, toDate;

    switch (preset) {
      case "today":
        fromDate = toDate = today.toISOString().split("T")[0];
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = toDate = yesterday.toISOString().split("T")[0];
        break;
      case "thisWeek":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fromDate = startOfWeek.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "thisMonth":
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        fromDate = lastMonth.toISOString().split("T")[0];
        toDate = new Date(today.getFullYear(), today.getMonth(), 0)
          .toISOString()
          .split("T")[0];
        break;
      default:
        return;
    }

    setDateRange({ fromDate, toDate });
  };

  const handlePrint = async () => {
    if (!dateRange.fromDate || !dateRange.toDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(dateRange.fromDate) > new Date(dateRange.toDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setLoading(true);
    try {
      // Fetch journal entries for the selected date range
      const response = await axiosInstance.get(
        `/ledger?from=${dateRange.fromDate}&to=${dateRange.toDate}`
      );

      const journalEntries = response.data.filter(
        (entry) => entry.type === "Journal Entry"
      );

      if (journalEntries.length === 0) {
        toast.info("No journal entries found for the selected period");
        setLoading(false);
        return;
      }

      // Group entries by reference number
      const groupedEntries = {};
      journalEntries.forEach((entry) => {
        if (!groupedEntries[entry.reference]) {
          groupedEntries[entry.reference] = [];
        }
        groupedEntries[entry.reference].push(entry);
      });

      // Calculate period totals
      const periodTotals = {
        totalDebits: 0,
        totalCredits: 0,
        entryCount: Object.keys(groupedEntries).length,
      };

      Object.values(groupedEntries).forEach((entries) => {
        entries.forEach((entry) => {
          periodTotals.totalDebits += entry.debit || 0;
          periodTotals.totalCredits += entry.credit || 0;
        });
      });

      // Generate print content
      generatePrintReport(groupedEntries, dateRange, periodTotals);

      onClose();
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const generatePrintReport = (groupedEntries, dateRange, periodTotals) => {
    const printWindow = window.open("", "_blank");

    const reportContent = `
       <!DOCTYPE html>
       <html>
         <head>
           <title>Journal Entries Report - Bestway Real Estate Ltd., Brokerage</title>
           <style>
             body {
               font-family: Arial, sans-serif;
               margin: 20px;
               line-height: 1.6;
               color: #000000;
             }
             .header {
               text-align: center;
               margin-bottom: 30px;
               border-bottom: 2px solid #000000;
               padding-bottom: 10px;
             }
                           .company-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
              }
                             .company-logo {
                 width: 120px;
                 height: 120px;
                 margin-bottom: 15px;
                 object-fit: contain;
               }
             .company-name {
               font-size: 24px;
               font-weight: bold;
               color: #000000;
             }
             .report-title {
               font-size: 28px;
               font-weight: bold;
               color: #000000;
               margin-top: 10px;
             }
             .date-range {
               text-align: center;
               margin-bottom: 20px;
               font-size: 14px;
               color: #000000;
             }
             .journal-entry {
               margin-bottom: 30px;
               border: 1px solid #000000;
               border-radius: 5px;
               overflow: hidden;
             }
             .entry-header {
               background-color: #f5f5f5;
               padding: 10px;
               border-bottom: 1px solid #000000;
             }
             .entry-details {
               display: flex;
               justify-content: space-between;
               margin-bottom: 5px;
               color: #000000;
             }
             .entry-table {
               width: 100%;
               border-collapse: collapse;
             }
             .entry-table th,
             .entry-table td {
               border: 1px solid #000000;
               padding: 8px;
               text-align: left;
               color: #000000;
             }
             .entry-table th {
               background-color: #f0f0f0;
               font-weight: bold;
               color: #000000;
             }
             .totals {
               background-color: #f5f5f5;
               padding: 10px;
               border-top: 1px solid #000000;
               font-weight: bold;
               color: #000000;
             }
             .debit {
               color: #000000;
             }
             .credit {
               color: #000000;
             }
             .period-summary {
               background-color: #f8f9fa;
               padding: 15px;
               margin-bottom: 20px;
               border-radius: 5px;
               border: 1px solid #000000;
             }
             .period-summary h3 {
               margin: 0 0 10px 0;
               color: #000000;
             }
             .period-summary div {
               display: flex;
               justify-content: space-between;
               font-size: 14px;
               color: #000000;
             }
             .footer {
               margin-top: 30px;
               text-align: center;
               font-size: 12px;
               color: #000000;
             }
             @media print {
               body { margin: 0; }
               .no-print { display: none; }
             }
           </style>
         </head>
         <body>
           <div class="header">
             <div class="company-info">
               <img src="/logo1.jpg" alt="Bestway Real Estate Ltd. Logo" class="company-logo" onerror="this.style.display='none'">
               <div class="company-name">Bestway Real Estate Ltd., Brokerage</div>
             </div>
             <div class="report-title">Journal Entries Report</div>
           </div>
          
          <div class="date-range">
            <strong>Period:</strong> ${new Date(
              dateRange.fromDate
            ).toLocaleDateString()} to ${new Date(
      dateRange.toDate
    ).toLocaleDateString()}
          </div>

          <div class="period-summary">
            <h3>Period Summary</h3>
            <div>
              <span><strong>Total Journal Entries:</strong> ${
                periodTotals.entryCount
              }</span>
              <span><strong>Total Debits:</strong> $${periodTotals.totalDebits.toFixed(
                2
              )}</span>
              <span><strong>Total Credits:</strong> $${periodTotals.totalCredits.toFixed(
                2
              )}</span>
            </div>
          </div>

          ${Object.entries(groupedEntries)
            .map(([reference, entries]) => {
              const totalDebits = entries.reduce(
                (sum, entry) => sum + (entry.debit || 0),
                0
              );
              const totalCredits = entries.reduce(
                (sum, entry) => sum + (entry.credit || 0),
                0
              );

              return `
                <div class="journal-entry">
                  <div class="entry-header">
                    <div class="entry-details">
                      <strong>Reference:</strong> ${reference}
                    </div>
                    <div class="entry-details">
                      <strong>Date:</strong> ${(() => {
                        const entry = entries[0];
                        // Use chequeDate if available, then date field, then createdAt as fallback
                        const dateToUse =
                          entry.chequeDate || entry.date || entry.createdAt;
                        return new Date(dateToUse).toLocaleDateString();
                      })()}
                    </div>
                    <div class="entry-details">
                      <strong>Description:</strong> ${
                        entries[0].description || "N/A"
                      }
                    </div>
                  </div>
                  
                  <table class="entry-table">
                    <thead>
                      <tr>
                        <th>Account Number</th>
                        <th>Account Name</th>
                        <th>Debit</th>
                        <th>Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${entries
                        .map(
                          (entry) => `
                        <tr>
                          <td>${entry.accountNumber}</td>
                          <td>${entry.accountName}</td>
                          <td class="debit">${
                            entry.debit > 0 ? "$" + entry.debit.toFixed(2) : ""
                          }</td>
                          <td class="credit">${
                            entry.credit > 0
                              ? "$" + entry.credit.toFixed(2)
                              : ""
                          }</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                  
                  <div class="totals">
                    <span>Total Debits: $${totalDebits.toFixed(2)}</span>
                    <span style="margin-left: 20px;">Total Credits: $${totalCredits.toFixed(
                      2
                    )}</span>
                  </div>
                </div>
              `;
            })
            .join("")}

          <div class="footer">
            <p>Report generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Print Journal Entries Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Preset Date Ranges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPresetDateRange("today")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setPresetDateRange("yesterday")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setPresetDateRange("thisWeek")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setPresetDateRange("thisMonth")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                This Month
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={dateRange.fromDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={dateRange.toDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryPrintModal;
