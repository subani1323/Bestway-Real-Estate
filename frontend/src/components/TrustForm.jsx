import React, { useState } from "react";
import logo1 from "../Assets/logo1.jpg";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const initialDeposit = {
  weHold: "Yes",
  heldBy: "Bestway Real Estate Ltd., Brokerage",
  received: "Yes",
  depositDate: "",
  receivedFrom: "",
  amount: "0.00",
  reference: "",
  paymentType: "EFT",
  currency: "CAD",
  earnInterest: "No",
};

const TrustForm = ({ trustRecords, setTrustRecords, tradeNumber }) => {
  if (typeof setTrustRecords !== "function") {
    throw new Error("setTrustRecords prop is required and must be a function.");
  }
  const [deposit, setDeposit] = useState(initialDeposit);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special logic for 'weHold' to set 'heldBy' automatically
    if (name === "weHold") {
      if (value === "Yes") {
        setDeposit((prev) => ({
          ...prev,
          weHold: value,
          heldBy: "Bestway Real Estate Ltd., Brokerage",
        }));
      } else {
        setDeposit((prev) => ({ ...prev, weHold: value, heldBy: "" }));
      }
    } else {
      setDeposit((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    let eftNumber = null;

    // Generate EFT number for trust deposits
    if (deposit.weHold === "Yes" && parseFloat(deposit.amount) > 0) {
      try {
        const eftResponse = await axiosInstance.post(
          "/real-estate-trust-eft/trust-deposit",
          {
            tradeId: tradeNumber, // This should be the actual trade ID, not tradeNumber
            amount: parseFloat(deposit.amount),
            receivedFrom: deposit.receivedFrom,
            reference: deposit.reference,
            description: `Trust deposit from ${deposit.receivedFrom}`,
          }
        );
        eftNumber = eftResponse.data.eftNumber;
      } catch (err) {
        console.error("Error generating EFT number:", err);
        // Continue without EFT number if generation fails
      }
    }

    const trustEntry = {
      weHold: deposit.weHold,
      heldBy: deposit.heldBy,
      received: deposit.received,
      depositDate: deposit.depositDate,
      receivedFrom: deposit.receivedFrom,
      amount: deposit.amount,
      reference: deposit.reference,
      eftNumber: eftNumber,
      paymentType: deposit.paymentType,
      currency: deposit.currency,
      earnInterest: deposit.earnInterest,
    };
    const payeeEntry = {
      payee: deposit.receivedFrom,
      reference: deposit.reference,
      eftNumber: eftNumber,
      paymentType: deposit.paymentType,
      depositDate: deposit.depositDate,
      amount: deposit.amount,
    };
    // Post to ledger based on 'We Hold' status
    const description = `Trade #: ${tradeNumber || "N/A"}, Received from: ${
      deposit.receivedFrom
    }${deposit.reference ? `, Ref: ${deposit.reference}` : ""}`;
    const amount = parseFloat(deposit.amount);

    if (!isNaN(amount) && amount > 0) {
      try {
        if (deposit.weHold === "Yes") {
          // Debit 10002 (Cash - Trust)
          await axiosInstance.post("/ledger", {
            accountNumber: "10002",
            accountName: "CASH - TRUST",
            debit: amount,
            credit: 0,
            description,
            eftNumber: eftNumber,
            date: deposit.depositDate,
          });
          // Credit 21300 (Liability For Trust Funds)
          await axiosInstance.post("/ledger", {
            accountNumber: "21300",
            accountName: "LIABILITY FOR TRUST FUNDS",
            debit: 0,
            credit: amount,
            description,
            eftNumber: eftNumber,
            date: deposit.depositDate,
          });
        }
        // When we don't hold the deposit, no ledger transactions are created
      } catch (err) {
        // Optionally show error/toast
        console.error("Error posting to ledger:", err);
      }
    }
    if (editingIndex !== null) {
      const updatedTrustRecords = [...trustRecords];
      updatedTrustRecords[editingIndex] = { ...trustEntry, payeeEntry };
      setTrustRecords(updatedTrustRecords);
      setEditingIndex(null);
    } else {
      setTrustRecords([...trustRecords, { ...trustEntry, payeeEntry }]);
    }
    setDeposit(initialDeposit);
  };

  const handleEdit = (index) => {
    const entry = trustRecords[index];
    setDeposit({
      weHold: entry.weHold || "Yes",
      heldBy: entry.heldBy || "",
      received: entry.received || "Yes",
      depositDate: entry.depositDate || "",
      receivedFrom: entry.receivedFrom || "",
      amount: entry.amount || "0.00",
      reference: entry.reference || "",
      paymentType: entry.paymentType || "EFT",
      currency: entry.currency || "CAD",
      earnInterest: entry.earnInterest || "No",
    });
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setEntryToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete !== null) {
      const entry = trustRecords[entryToDelete];
      // Post reversal to ledger if amount is valid
      if (entry) {
        const amount = parseFloat(entry.amount);
        if (!isNaN(amount) && amount > 0) {
          const description = `Trade #: ${
            tradeNumber || "N/A"
          }, Trust entry deleted, Received from: ${entry.receivedFrom}${
            entry.reference ? `, Ref: ${entry.reference}` : ""
          }`;
          try {
            if (entry.weHold === "Yes") {
              // Reverse the trust fund entries
              // Debit 21300 (LIABILITY FOR TRUST FUNDS)
              await axiosInstance.post("/ledger", {
                accountNumber: "21300",
                accountName: "LIABILITY FOR TRUST FUNDS",
                debit: amount,
                credit: 0,
                description,
                date: entry.depositDate,
              });
              // Credit 10002 (CASH - TRUST)
              await axiosInstance.post("/ledger", {
                accountNumber: "10002",
                accountName: "CASH - TRUST",
                debit: 0,
                credit: amount,
                description,
                date: entry.depositDate,
              });
            }
            // When we don't hold the deposit, no ledger transactions were created, so no reversal needed
            toast.success("Ledger updated for trust entry deletion.");
          } catch (err) {
            toast.error("Failed to update ledger for trust entry deletion.");
          }
        }
      }
      setTrustRecords(trustRecords.filter((_, i) => i !== entryToDelete));
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
  };

  // Helper to normalize data for printing
  const normalizeDepositData = (data) => {
    // If the data is from the table, it may have different keys
    if (data.payeeEntry) {
      return {
        receivedFrom: data.payeeEntry.payee || data.receivedFrom || "",
        heldBy: data.heldBy || "",
        amount: data.amount || "0.00",
        currency: data.currency || "CAD",
        paymentType:
          data.paymentType ||
          (data.payeeEntry && data.payeeEntry.paymentType) ||
          "",
        depositDate:
          data.depositDate ||
          (data.payeeEntry && data.payeeEntry.depositDate) ||
          "",
        reference:
          data.reference ||
          (data.payeeEntry && data.payeeEntry.reference) ||
          "",
        eftNumber:
          data.eftNumber ||
          (data.payeeEntry && data.payeeEntry.eftNumber) ||
          null,
      };
    }
    // Otherwise, assume it's the form deposit state
    return {
      receivedFrom: data.receivedFrom || "",
      heldBy: data.heldBy || "",
      amount: data.amount || "0.00",
      currency: data.currency || "CAD",
      paymentType: data.paymentType || "",
      depositDate: data.depositDate || "",
      reference: data.reference || "",
      eftNumber: data.eftNumber || null,
    };
  };

  const handlePrintReceipt = (data = deposit) => {
    const d = normalizeDepositData(data);
    if (!d.receivedFrom || !d.amount || !d.depositDate) {
      alert(
        "Please fill in the required fields (Received From, Amount, Deposit Date) before printing receipt."
      );
      return;
    }
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const currentDate = new Date().toLocaleDateString();
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trust Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
          .receipt-container { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 30px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .company-info { flex: 1; }
          .company-info h2 { margin: 0 0 5px 0; font-size: 18px; font-weight: bold; }
          .company-info p { margin: 2px 0; font-size: 12px; }
          .logo { width: 120px; height: auto; }
          .receipt-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
          .receipt-date { text-align: center; font-size: 14px; margin-bottom: 30px; }
          .receipt-content { margin-left: 50px; }
          .receipt-row { margin-bottom: 15px; display: flex; align-items: center; }
          .receipt-label { font-weight: bold; min-width: 200px; margin-right: 20px; }
          .receipt-value { flex: 1; min-height: 20px; text-align: right; }
          .signature-line { display: flex; align-items: center; margin-top: 40px; }
          .signature-line .receipt-label { margin-right: 20px; }
          .signature-line .receipt-value { border-bottom: 1px solid #000; min-width: 200px; height: 30px; text-align: center; }
          @media print { body { margin: 0; } .receipt-container { border: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="company-info">
                      <h2>Bestway Real Estate Ltd., Brokerage</h2>
        <p>500 St.George Street</p>
        <p>Moncton, NB E1C 1Y3</p>
        <p>Phone: 506-268-2900</p>
            </div>
            <div class="logo">
              <img src="${logo1}" alt="Logo" style="width: 100%; height: auto;" />
            </div>
          </div>
          <div class="receipt-title">RECEIPT</div>
          <div class="receipt-date">Date: ${currentDate}</div>
          <div class="receipt-content">
            <div class="receipt-row">
              <div class="receipt-label">RECEIVED FROM:</div>
              <div class="receipt-value">${d.receivedFrom}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">TRUST DEPOSIT ON (Held By):</div>
              <div class="receipt-value">${d.heldBy}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">FUNDS RECEIVED:</div>
              <div class="receipt-value">$${d.amount} ${d.currency}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">DEPOSIT RECEIVED IN:</div>
              <div class="receipt-value">CAD</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">DATE RECEIVED:</div>
              <div class="receipt-value">${d.depositDate}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">PAYMENT TYPE:</div>
              <div class="receipt-value">${d.paymentType}</div>
            </div>
            <div class="receipt-row">
              <div class="receipt-label">REFERENCE #:</div>
              <div class="receipt-value">${
                d.eftNumber ? `EFT#${d.eftNumber}` : d.reference || "N/A"
              }</div>
            </div>
            <div class="signature-line">
              <div class="receipt-label">RECEIVED BY:</div>
              <div class="receipt-value">Administrator</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="max-w-[1300px] w-full mx-auto px-6">
      <h2 className="text-xl font-bold mb-6">Trust Information</h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="font-semibold text-lg mb-4">Adding a Deposit Entry</h3>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleApply}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              We Hold
            </label>
            <select
              name="weHold"
              value={deposit.weHold}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Held By
            </label>
            {deposit.weHold === "Yes" ? (
              <input
                name="heldBy"
                value={deposit.heldBy}
                readOnly
                className="w-full rounded border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <input
                name="heldBy"
                value={deposit.heldBy}
                onChange={handleInputChange}
                className="w-full rounded border-gray-300"
                placeholder="Enter who holds the deposit"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received
            </label>
            <select
              name="received"
              value={deposit.received}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit Date
            </label>
            <input
              type="date"
              name="depositDate"
              value={deposit.depositDate}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received From
            </label>
            <input
              name="receivedFrom"
              value={deposit.receivedFrom}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
              placeholder="Name of person/entity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={deposit.amount}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (Optional)
            </label>
            <input
              name="reference"
              value={deposit.reference}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
              placeholder="Reference number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select
              name="paymentType"
              value={deposit.paymentType}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
            >
              <option value="EFT">EFT</option>
              <option value="Cheque">Cheque</option>
              <option value="Wire">Wire</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <input
              name="currency"
              value={deposit.currency}
              readOnly
              className="w-full rounded border-gray-300 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Earn Interest
            </label>
            <select
              name="earnInterest"
              value={deposit.earnInterest}
              onChange={handleInputChange}
              className="w-full rounded border-gray-300"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="col-span-2 flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded font-semibold"
            >
              Apply
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold ml-2"
              onClick={() => handlePrintReceipt()}
            >
              Print Receipt
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold ml-2"
              onClick={() => setDeposit(initialDeposit)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="font-semibold text-lg mb-4">Trust Account Entries</h3>
        {/* Edit/Delete buttons above the table */}
        <div className="flex gap-2 mb-4">
          {/* Removed Edit button as per requirements */}
          <button
            type="button"
            onClick={() => handleDelete(0)}
            disabled={trustRecords.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700"
          >
            Delete
          </button>
        </div>
        <div className="w-full px-6">
          <table className="w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border-b border-r text-left">
                  We Hold
                </th>
                <th
                  className="px-4 py-2 border-b border-r text-left whitespace-nowrap"
                  style={{ minWidth: "250px" }}
                >
                  Held By
                </th>
                <th className="px-4 py-2 border-b border-r text-left">Date</th>
                <th className="px-4 py-2 border-b border-r text-left">
                  Amount
                </th>
                <th className="px-4 py-2 border-b border-r text-left">
                  Received
                </th>
                <th className="px-4 py-2 border-b border-r text-left">
                  Interest
                </th>
              </tr>
            </thead>
            <tbody>
              {trustRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No trust entries found. Add a deposit entry above.
                  </td>
                </tr>
              ) : (
                trustRecords.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.weHold}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.heldBy}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.depositDate}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.amount}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.received}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.earnInterest}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="w-full px-6">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border-b border-r text-left">Payee</th>
                <th className="px-4 py-2 border-b border-r text-left">
                  Reference
                </th>
                <th className="px-4 py-2 border-b border-r text-left">Type</th>
                <th className="px-4 py-2 border-b border-r text-left">Date</th>
                <th className="px-4 py-2 border-b text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {trustRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No trust entries found. Add a deposit entry above.
                  </td>
                </tr>
              ) : (
                trustRecords.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.receivedFrom}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.reference}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.paymentType}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {entry.depositDate}
                    </td>
                    <td className="px-4 py-2 border-b">{entry.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="mb-4">
              Are you sure you want to delete this trust entry?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustForm;
