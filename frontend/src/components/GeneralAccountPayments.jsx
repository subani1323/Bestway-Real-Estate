import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import EFTReceipt from "./EFTReceipt";
import toast from "react-hot-toast";
import { checkGeneralAccountInvoice } from "../utils/eftUtils";
import axiosInstance from "../config/axios";

// AP Number generation utility
const getNextAPNumber = () => {
  // Get the last used AP number from localStorage
  const lastAPNumber = localStorage.getItem("lastAPNumber");
  let nextNumber = 2000;

  if (lastAPNumber) {
    // Extract the number from the last AP number (e.g., "AP2001" -> 2001)
    const match = lastAPNumber.match(/AP(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const newAPNumber = `AP${nextNumber}`;

  // Store the new AP number as the last used one
  localStorage.setItem("lastAPNumber", newAPNumber);

  return newAPNumber;
};

const GeneralAccountPayments = () => {
  const [activeTab, setActiveTab] = useState("ap-expense");
  const [vendors, setVendors] = useState([]);
  const [showEFTReceipt, setShowEFTReceipt] = useState(false);
  const [eftReceiptData, setEftReceiptData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [useCustomChequeDate, setUseCustomChequeDate] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    apNumber: "", // Will be set when form opens
    date: new Date().toISOString().slice(0, 10),
    eftNumber: "",
    postDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    amount: "",
    hst: 0,
    glAccount: "", // Add G/L account field
    chequeDate: new Date().toISOString().slice(0, 10), // Add cheque date field
  });

  // A/P Expense form state
  const [apExpenseForm, setApExpenseForm] = useState({
    vendorId: "",
    selectedVendor: null,
    amount: "",
    expenseCategory: "",
    description: "",
    invoiceNumber: "",
    companyName: "",
  });

  // General Expense form state
  const [generalExpenseForm, setGeneralExpenseForm] = useState({
    recipient: "",
    amount: "",
    expenseCategory: "",
    description: "",
  });

  // Add G/L Account options at the top of the file - filtered to only show expected accounts
  const glAccountOptions = [
    { value: "40100", label: "40100 Commission Income" },
    { value: "43100", label: "43100 Other Income" },
    { value: "44100", label: "44100 Fee Deducted Income" },
    { value: "50100", label: "50100 Agent's Commission" },
    { value: "51100", label: "51100 Outside Broker Commission" },
    { value: "52100", label: "52100 Referral Fees" },
    { value: "62101", label: "62101 Rent & Occ. - Rent Expense" },
    { value: "62102", label: "62102 Rent & Occ. - Common Area" },
    { value: "62103", label: "62103 Rent & Occ. - Utilities" },
    { value: "62104", label: "62104 Rent & Occ. - Repairs & Maint" },
    { value: "62105", label: "62105 Rent & Occ. - Prop./Bus. Taxes" },
    { value: "63102", label: "63102 Lic. & Ins. - Office Contents" },
    { value: "63103", label: "63103 Lic. & Ins. - Licenses" },
    { value: "63199", label: "63199 Lic. & Ins. - Misc." },
    { value: "69101", label: "69101 Franchise Costs - Realty Executives" },
    { value: "70101", label: "70101 Payroll Exp. - Mgmt. Salaries" },
    { value: "70103", label: "70103 Payroll Exp. - Part-Time" },
    { value: "70104", label: "70104 Payroll Exp. - Payroll" },
    { value: "70105", label: "70105 Payroll Exp. - Group Insurance" },
    { value: "70199", label: "70199 Payroll Exp. - Misc." },
    { value: "71102", label: "71102 Bank Charges - Loan Interest" },
    { value: "71104", label: "71104 Bank Charges - Service Charges" },
    { value: "71199", label: "71199 Bank Charges - Misc." },
    { value: "72101", label: "72101 Commun. Exp. - Telephone Lines" },
    { value: "72102", label: "72102 Commun. Exp. - Internet Service" },
    { value: "72103", label: "72103 Commun. Exp. - Pagers" },
    { value: "72199", label: "72199 Commun. Exp. - Misc." },
    { value: "75102", label: "75102 Office Exp. - Office Supplies" },
    { value: "75103", label: "75103 Office Exp. - Printing" },
    { value: "75104", label: "75104 Office Exp. - Postage" },
    { value: "75105", label: "75105 Office Exp. - Misc." },
    { value: "75117", label: "75117 Office Exp. - Computer Supplies" },
    { value: "75199", label: "75199 Office Exp. - Misc." },
    { value: "76103", label: "76103 Professional Fees - Legal" },
    { value: "79101", label: "79101 Travel & Entertainment - Meals" },
    { value: "90101", label: "90101 Miscellaneous - Other" },
  ];

  // Add state to store all AP transactions
  const [apTransactions, setApTransactions] = useState([]);
  const [selectedAPTransaction, setSelectedAPTransaction] = useState(null);

  // Add new state for EFT button logic
  const [eftButtonDisabled, setEftButtonDisabled] = useState(false);
  const [localEftButtonDisabled, setLocalEftButtonDisabled] = useState(false);

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axiosInstance.get("/vendors");
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  // Handle vendor selection for A/P expense
  const handleVendorSelect = (vendorId) => {
    const selectedVendor = vendors.find((vendor) => vendor._id === vendorId);
    if (selectedVendor) {
      setApExpenseForm((prev) => ({
        ...prev,
        vendorId: selectedVendor._id,
        selectedVendor: selectedVendor,
        companyName: selectedVendor.companyName || "",
      }));
    }
  };

  // Fetch next EFT# when payment form is shown
  useEffect(() => {
    if (showForm) {
      axiosInstance.get("/general-account-eft").then((res) => {
        // Find the max EFT number and increment for next
        const maxEFT = res.data.reduce((max, eft) => {
          return eft.eftNumber > max ? eft.eftNumber : max;
        }, 0);
        setPaymentForm((prev) => ({ ...prev, eftNumber: maxEFT + 1 }));
      });
    }
  }, [showForm]);

  // Update HST when amount changes (always calculate 15% of amount)
  useEffect(() => {
    setPaymentForm((prev) => ({
      ...prev,
      hst: prev.amount ? (parseFloat(prev.amount) * 0.15).toFixed(2) : 0,
    }));
  }, [paymentForm.amount]);

  // Function to open payment form with new AP number
  const handleProceed = () => {
    setPaymentForm((prev) => ({
      ...prev,
      apNumber: getNextAPNumber(), // Generate new AP number each time
    }));
    setShowForm(true);
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Fetch all A/P Expense entries on mount and after new entry
  useEffect(() => {
    fetchAPTransactions();
  }, []);

  const fetchAPTransactions = async () => {
    try {
      const res = await axiosInstance.get("/general-account-eft/");
      // Only include APExpense type and sort by date in descending order (latest first)
      const filteredTransactions = res.data.filter(
        (eft) => eft.type === "APExpense"
      );
      const sortedTransactions = filteredTransactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Descending order (latest first)
      });
      setApTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching AP transactions:", error);
    }
  };

  const getVendorOrCompanyName = () => {
    if (
      apExpenseForm.selectedVendor?.companyName &&
      apExpenseForm.selectedVendor.companyName.trim() !== ""
    ) {
      return apExpenseForm.selectedVendor.companyName;
    }
    if (apExpenseForm.selectedVendor) {
      return `${apExpenseForm.selectedVendor.firstName} ${apExpenseForm.selectedVendor.lastName}`;
    }
    return "";
  };

  const handlePaymentFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const total =
        paymentForm.amount && paymentForm.hst
          ? (
              parseFloat(paymentForm.amount) + parseFloat(paymentForm.hst)
            ).toFixed(2)
          : paymentForm.amount;
      const vendorName = getVendorOrCompanyName();
      const eftResponse = await axiosInstance.post(
        "/general-account-eft/ap-expense",
        {
          vendorId: apExpenseForm.vendorId,
          amount: parseFloat(paymentForm.amount),
          recipient: apExpenseForm.selectedVendor
            ? `${apExpenseForm.selectedVendor.firstName} ${apExpenseForm.selectedVendor.lastName}`
            : "",
          expenseCategory: paymentForm.glAccount || "",
          description: "",
          invoiceNumber: paymentForm.eftNumber,
          apNumber: paymentForm.apNumber, // Include AP number in the EFT record
          date: paymentForm.date,
          postDate: paymentForm.postDate,
          dueDate: paymentForm.dueDate,
          hst: paymentForm.hst,
          total,
          chequeDate: useCustomChequeDate
            ? paymentForm.chequeDate
            : paymentForm.date,
        }
      );
      // Re-fetch AP transactions
      fetchAPTransactions();
      // Post ledger entries for Chart of Accounts
      // Debit the selected G/L account
      await axiosInstance.post("/ledger", {
        accountNumber: paymentForm.glAccount || "70102", // Use selected G/L account or default
        accountName: apExpenseForm.expenseCategory || "Payroll Exp. - Salaries",
        debit: parseFloat(paymentForm.amount),
        credit: 0,
        description: `${vendorName} - G/A Expense`,
        date: paymentForm.postDate, // Use post date instead of current date
        apNumber: paymentForm.apNumber, // Include AP number for Reference # column
      });
      await axiosInstance.post("/ledger", {
        accountNumber: "23001",
        accountName: "HST Input Tax Credit",
        debit: parseFloat(paymentForm.hst),
        credit: 0,
        description: `${vendorName} - G/A Expense`,
        date: paymentForm.postDate, // Use post date instead of current date
        apNumber: paymentForm.apNumber, // Include AP number for Reference # column
      });
      await axiosInstance.post("/ledger", {
        accountNumber: "21000",
        accountName: "A/P - Suppliers",
        debit: 0,
        credit: parseFloat(total),
        description: `${vendorName} - G/A Expense`,
        date: paymentForm.postDate, // Use post date instead of current date
        apNumber: paymentForm.apNumber, // Include AP number for Reference # column
      });
      // Show summary form and table
      setSummaryData({
        vendor: apExpenseForm.selectedVendor,
        companyName: apExpenseForm.companyName,
        eftNumber: paymentForm.eftNumber,
        chequeDate: paymentForm.postDate, // Use post date instead of current date
        dueDate: paymentForm.dueDate,
        amount: paymentForm.amount,
        payment: "Completed",
      });
      setShowForm(false);
      setShowSummaryForm(true);
      // Reset form with empty AP number
      setPaymentForm((prev) => ({
        ...prev,
        apNumber: "", // Reset to empty, will be set when form opens again
      }));
      toast.success(
        "Transaction posted to Chart of Accounts and Ledger successfully!"
      );
    } catch (error) {
      toast.error("Error creating EFT record.");
    }
  };

  // Handle general expense form submission
  const handleGeneralExpenseSubmit = (e) => {
    e.preventDefault();
    if (generalExpenseForm.recipient && generalExpenseForm.amount) {
      console.log("General Expense Form Data:", generalExpenseForm);
      // Proceed to EFT creation
      handleGeneralExpenseEFTClick();
    } else {
      alert("Please enter recipient and amount to proceed.");
    }
  };

  const handleGeneralExpenseEFTClick = async () => {
    if (!generalExpenseForm.recipient || !generalExpenseForm.amount) {
      alert("Recipient or amount missing.");
      return;
    }

    try {
      const eftResponse = await axiosInstance.post(
        "/general-account-eft/general-expense",
        {
          amount: parseFloat(generalExpenseForm.amount),
          recipient: generalExpenseForm.recipient,
          expenseCategory: generalExpenseForm.expenseCategory,
          description: generalExpenseForm.description,
          chequeDate: useCustomChequeDate
            ? paymentForm.chequeDate
            : new Date().toISOString().slice(0, 10),
        }
      );

      if (eftResponse.data.eftNumber) {
        // Create transaction record
        try {
          const transactionPayload = {
            date: new Date(eftResponse.data.date),
            reference: `EFT#${eftResponse.data.eftNumber}`,
            description:
              generalExpenseForm.description || "General Expense Payment",
            debitAccount: "LIABILITY FOR TRUST FUNDS HELD",
            creditAccount: "CASH - TRUST",
            amount: parseFloat(generalExpenseForm.amount),
            tradeId: "",
          };

          await axiosInstance.post("/transactions", transactionPayload);

          await axiosInstance.post("/finance-transactions", {
            type: "GeneralExpense",
            chequeDate: new Date(),
            amount: parseFloat(generalExpenseForm.amount),
            chequeWrittenTo: generalExpenseForm.recipient,
          });

          toast.success(
            "Transaction posted to Chart of Accounts successfully!"
          );
        } catch (transactionError) {
          console.error("Error creating transaction:", transactionError);
          alert(
            "EFT number generated, but failed to create the transaction record."
          );
        }

        const dataForReceipt = {
          eftNumber: eftResponse.data.eftNumber,
          paidTo: {
            name: generalExpenseForm.recipient,
            address: "",
          },
          trade: "General Expense Payment",
          notes: generalExpenseForm.description || "General Expense Payment",
          amount: parseFloat(generalExpenseForm.amount),
          seller: "",
          buyer: "",
          payTo: generalExpenseForm.recipient,
          orderOf: {
            address: "",
            cityProvincePostal: "",
          },
          note: `Category: ${generalExpenseForm.expenseCategory || "General"}`,
        };

        setEftReceiptData(dataForReceipt);
        setShowEFTReceipt(true);
      } else {
        alert("Failed to get EFT number.");
      }
    } catch (error) {
      console.error("Error creating EFT record:", error);
      alert("Error creating EFT record. Please check the console for details.");
    }
  };

  // Add a modal component for the summary popup
  const PaymentSummaryModal = ({ transaction, onClose }) => {
    const [editFields, setEditFields] = React.useState({
      vendorNumber: transaction.vendorId?.vendorNumber || "",
      vendorName: transaction.vendorId
        ? `${transaction.vendorId.firstName} ${transaction.vendorId.lastName}`
        : transaction.recipient || "",
      chequeDate: transaction.date
        ? new Date(transaction.date).toISOString().slice(0, 10)
        : "",
      address:
        transaction.vendorId?.streetNumber && transaction.vendorId?.streetName
          ? `${transaction.vendorId.streetNumber}, ${transaction.vendorId.streetName}`
          : transaction.vendorId?.address || "",
      city: transaction.vendorId?.city || "",
      province: transaction.vendorId?.province || "",
      postalCode: transaction.vendorId?.postalCode || "",
      invoiceNumber: transaction.invoiceNumber || transaction.eftNumber,
      bankAccount: "General",
      hst: transaction.hst || "",
    });

    const [localEftButtonDisabled, setLocalEftButtonDisabled] =
      React.useState(false);

    // Recalculate total when HST changes
    const [calculatedTotal, setCalculatedTotal] = React.useState(
      transaction.amount && transaction.hst
        ? (parseFloat(transaction.amount) + parseFloat(editFields.hst)).toFixed(
            2
          )
        : transaction.amount
    );

    React.useEffect(() => {
      if (transaction.amount && editFields.hst) {
        setCalculatedTotal(
          (parseFloat(transaction.amount) + parseFloat(editFields.hst)).toFixed(
            2
          )
        );
      } else {
        setCalculatedTotal(transaction.amount);
      }
    }, [editFields.hst, transaction.amount]);

    // Helper to get company or vendor name
    const getVendorOrCompanyName = () => {
      if (
        transaction.vendorId?.companyName &&
        transaction.vendorId.companyName.trim() !== ""
      ) {
        return transaction.vendorId.companyName;
      }
      if (transaction.vendorId) {
        return `${transaction.vendorId.firstName} ${transaction.vendorId.lastName}`;
      }
      return transaction.recipient || "";
    };

    // Helper to get address/city/province/postal
    const getAddress = () => {
      if (
        transaction.vendorId?.streetNumber &&
        transaction.vendorId?.streetName
      ) {
        return `${transaction.vendorId.streetNumber}, ${transaction.vendorId.streetName}`;
      }
      return transaction.vendorId?.address || editFields.address || "";
    };
    const getCity = () => transaction.vendorId?.city || editFields.city || "";
    const getProvince = () =>
      transaction.vendorId?.province || editFields.province || "";
    const getPostalCode = () =>
      transaction.vendorId?.postalCode || editFields.postalCode || "";
    const getVendorNumber = () =>
      transaction.vendorId?.vendorNumber || editFields.vendorNumber || "";

    // Helper to get total
    const getTotal = () => {
      return calculatedTotal;
    };

    // EFT button handler
    const handleEFT = async () => {
      // Check if EFT has already been created for this transaction
      if (transaction.eftCreated) {
        toast.error("EFT has already been created for this invoice number!");
        return;
      }

      setLocalEftButtonDisabled(true);
      try {
        // 1. Get next EFT number
        const eftsRes = await axiosInstance.get("/general-account-eft");
        let maxEFT = 299;
        for (const eft of eftsRes.data) {
          if (eft.eftNumber > maxEFT) maxEFT = eft.eftNumber;
        }
        const nextEFTNumber = maxEFT + 1;

        // 2. Update the transaction to mark EFT as created
        await axiosInstance.put(`/general-account-eft/${transaction._id}`, {
          eftCreated: true,
          eftNumber: nextEFTNumber,
          chequeDate: editFields.chequeDate,
        });

        // 3. Post ledger entries
        // Use company name if available, otherwise vendor name
        const vendorOrCompany = getVendorOrCompanyName();
        const description = `EFT#${nextEFTNumber} - ${vendorOrCompany}`;
        const total = parseFloat(getTotal());
        await axiosInstance.post("/ledger", {
          accountNumber: "21000",
          accountName: "A/P - Suppliers",
          debit: total,
          credit: 0,
          description,
          eftNumber: nextEFTNumber,
          chequeDate: new Date(editFields.chequeDate + "T00:00:00"),
        });
        await axiosInstance.post("/ledger", {
          accountNumber: "10001",
          accountName: "Cash - Current Account",
          debit: 0,
          credit: total,
          description,
          eftNumber: nextEFTNumber,
          chequeDate: new Date(editFields.chequeDate + "T00:00:00"),
        });

        // 4. Show receipt modal
        const receiptData = {
          eftNumber: nextEFTNumber,
          paidTo: { name: getVendorOrCompanyName(), address: getAddress() },
          notes: "Vendor Payment Transaction",
          amount: total,
          payTo: getVendorOrCompanyName(),
          orderOf: {
            address: getAddress(),
            cityProvincePostal: `${getCity()}, ${getProvince()}, ${getPostalCode()}`,
          },
          note: `${getVendorOrCompanyName()}, Vendor #${getVendorNumber()}`,
          chequeDate: editFields.chequeDate,
          // The following fields are not needed for this receipt
          trade: undefined,
          seller: undefined,
          buyer: undefined,
        };
        setEftReceiptData(receiptData);
        setShowEFTReceipt(true);
        toast.success("EFT transaction and receipt generated!");

        // 5. Refresh the transaction data to update the UI
        const updatedTransaction = await axiosInstance.get(
          `/general-account-eft/${transaction._id}`
        );
        Object.assign(transaction, updatedTransaction.data);

        // 6. Refresh the AP transactions list to update the status in the table
        fetchAPTransactions();
      } catch (err) {
        toast.error(
          "Failed to process EFT: " +
            (err?.response?.data?.message || err.message)
        );
      } finally {
        setLocalEftButtonDisabled(false);
      }
    };

    const handleFieldChange = (e) => {
      const { name, value } = e.target;
      setEditFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      try {
        // Update HST value in the transaction object
        transaction.hst = editFields.hst;

        // Update backend if HST has changed
        if (transaction._id && editFields.hst !== transaction.hst) {
          await axiosInstance.put(`/general-account-eft/${transaction._id}`, {
            hst: editFields.hst,
          });
        }

        // Update vendor information if available
        if (transaction.vendorId) {
          transaction.vendorId.city = editFields.city;
          transaction.vendorId.province = editFields.province;
          transaction.vendorId.postalCode = editFields.postalCode;
          transaction.vendorId.address = editFields.address;
        }

        toast.success("Changes saved successfully!");
        onClose();
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error("Failed to save changes. Please try again.");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay first, closes modal on click */}
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={onClose}
        ></div>
        {/* Modal content, stop propagation so clicks inside don't close */}
        <div
          className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 relative z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-2xl font-semibold mb-4">Payment Summary</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor #
              </label>
              <input
                type="text"
                name="vendorNumber"
                value={editFields.vendorNumber}
                className="block w-full rounded-md border-gray-300 shadow-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                name="vendorName"
                value={editFields.vendorName}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice #
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={editFields.invoiceNumber}
                className="block w-full rounded-md border-gray-300 shadow-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Date
              </label>
              <input
                type="date"
                name="chequeDate"
                value={editFields.chequeDate}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account
              </label>
              <input
                type="text"
                name="bankAccount"
                value={editFields.bankAccount}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={getAddress()}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={editFields.city}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <input
                type="text"
                name="province"
                value={editFields.province}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={editFields.postalCode}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HST
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="hst"
                value={editFields.hst}
                onChange={handleFieldChange}
                className="block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <input
                type="text"
                name="total"
                value={calculatedTotal}
                className="block w-full rounded-md border-gray-300 shadow-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={
                  transaction.vendorId?.companyName ||
                  transaction.companyName ||
                  ""
                }
                className="block w-full rounded-md border-gray-300 shadow-sm"
                readOnly
              />
            </div>
          </form>
          {/* Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full table-fixed bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-center">Invoice</th>
                  <th className="px-4 py-2 border-b text-center">
                    Cheque Date
                  </th>
                  <th className="px-4 py-2 border-b text-center">Due Date</th>
                  <th className="px-4 py-2 border-b text-center">HST</th>
                  <th className="px-4 py-2 border-b text-center">Total</th>
                  <th className="px-4 py-2 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-center">
                    {transaction.invoiceNumber || transaction.eftNumber}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {editFields.chequeDate
                      ? new Date(
                          editFields.chequeDate + "T00:00:00"
                        ).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {transaction.dueDate
                      ? new Date(transaction.dueDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {editFields.hst || ""}
                  </td>
                  <td className="px-4 py-2 text-center">{calculatedTotal}</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.eftCreated
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.eftCreated ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className={`bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400${
                localEftButtonDisabled || transaction.eftCreated
                  ? " opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleEFT}
              disabled={localEftButtonDisabled || transaction.eftCreated}
            >
              {transaction.eftCreated ? "EFT Created" : "EFT"}
            </button>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              onClick={onClose}
            >
              Exit
            </button>
          </div>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>
    );
  };

  // Add this handler inside the component
  const handleInvoiceBlur = async (e) => {
    const invoiceNumber = e.target.value.trim();
    if (!invoiceNumber) return;
    const result = await checkGeneralAccountInvoice(invoiceNumber);
    if (result.exists) {
      toast.error(
        `Payment already done for Invoice #${invoiceNumber} on ${
          result.paymentDate
            ? new Date(result.paymentDate).toLocaleDateString()
            : ""
        }. Amount: $${result.amount}`
      );
      // Optionally clear the field or set a flag to prevent submission
      setPaymentForm((prev) => ({ ...prev, eftNumber: "" }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Left Sidebar */}
        <FinanceSidebar />
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              General Account Payments (A/P) Expenses
            </h2>
            {/* Secondary Navbar */}
            <div className="flex space-x-4 mb-6 border-b pb-2">
              <button
                className={`px-4 py-2 font-medium rounded-t focus:outline-none ${
                  activeTab === "ap-expense"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("ap-expense");
                  setShowForm(false);
                  setShowSummaryForm(false);
                }}
              >
                A/P Expense
              </button>
              <button
                className={`px-4 py-2 font-medium rounded-t focus:outline-none ${
                  activeTab === "accounts-payable"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("accounts-payable");
                  setShowForm(false);
                  setShowSummaryForm(false);
                }}
              >
                Accounts Payable
              </button>
            </div>
            {/* A/P Expense Section */}
            {activeTab === "ap-expense" && (
              <>
                {/* Vendor Selection Only */}
                {!showForm && !showSummaryForm && (
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">
                      Select Vendor
                    </h3>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor
                      </label>
                      <select
                        value={apExpenseForm.vendorId || ""}
                        onChange={(e) => handleVendorSelect(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a vendor...</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>
                            {vendor.firstName} {vendor.lastName} (#
                            {vendor.vendorNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Proceed Button */}
                    <div className="pt-4">
                      <button
                        type="button"
                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                        onClick={handleProceed}
                        disabled={!apExpenseForm.selectedVendor}
                      >
                        Proceed
                      </button>
                    </div>
                    {apExpenseForm.selectedVendor && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={apExpenseForm.companyName}
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                )}
                {/* Payment Form */}
                {showForm && (
                  <form
                    onSubmit={handlePaymentFormSubmit}
                    className="p-6 border border-gray-200 rounded-lg space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={paymentForm.date}
                        onChange={handlePaymentFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cheque Date Override
                      </label>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id="useCustomChequeDate"
                          checked={useCustomChequeDate}
                          onChange={(e) =>
                            setUseCustomChequeDate(e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="useCustomChequeDate"
                          className="text-sm text-gray-600"
                        >
                          Override Cheque Date
                        </label>
                      </div>
                      {useCustomChequeDate && (
                        <input
                          type="date"
                          name="chequeDate"
                          value={paymentForm.chequeDate}
                          onChange={handlePaymentFormChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AP Number
                      </label>
                      <input
                        type="text"
                        name="apNumber"
                        value={paymentForm.apNumber}
                        readOnly
                        className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice #
                      </label>
                      <input
                        type="text"
                        name="eftNumber"
                        value={paymentForm.eftNumber}
                        onChange={handlePaymentFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm"
                        required
                        onBlur={handleInvoiceBlur}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        G/L Account
                      </label>
                      <select
                        name="glAccount"
                        value={paymentForm.glAccount || ""}
                        onChange={handlePaymentFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      >
                        <option value="">Select G/L Account</option>
                        {glAccountOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post Date
                      </label>
                      <input
                        type="date"
                        name="postDate"
                        value={paymentForm.postDate}
                        onChange={handlePaymentFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={paymentForm.dueDate}
                        onChange={handlePaymentFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={paymentForm.amount}
                        onChange={handlePaymentFormChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        HST
                      </label>
                      <input
                        type="text"
                        name="hst"
                        value={paymentForm.hst}
                        onChange={handlePaymentFormChange}
                        className={`block w-full rounded-md border-gray-300 shadow-sm ${
                          paymentForm.amount &&
                          paymentForm.hst &&
                          Math.abs(
                            parseFloat(paymentForm.hst) -
                              parseFloat(paymentForm.amount) * 0.15
                          ) > 0.01
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total
                      </label>
                      <input
                        type="text"
                        name="total"
                        value={
                          paymentForm.amount && paymentForm.hst
                            ? (
                                parseFloat(paymentForm.amount) +
                                parseFloat(paymentForm.hst)
                              ).toFixed(2)
                            : paymentForm.amount
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm"
                        readOnly
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Submit Payment
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
            {/* Accounts Payable Section */}
            {activeTab === "accounts-payable" && (
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-4 text-lg">Accounts Payable</h3>
                <table className="min-w-full table-fixed bg-white border border-gray-200 mb-6">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b text-center">
                        Invoice #
                      </th>
                      <th className="px-4 py-2 border-b text-center">
                        Vendor Name
                      </th>
                      <th className="px-4 py-2 border-b text-center">Date</th>
                      <th className="px-4 py-2 border-b text-center">
                        Due Date
                      </th>
                      <th className="px-4 py-2 border-b text-center">Amount</th>
                      <th className="px-4 py-2 border-b text-center">HST</th>
                      <th className="px-4 py-2 border-b text-center">Total</th>
                      <th className="px-4 py-2 border-b text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-2 text-center text-gray-500"
                        >
                          No accounts payable entries.
                        </td>
                      </tr>
                    ) : (
                      apTransactions.map((tx, idx) => (
                        <tr
                          key={tx._id || idx}
                          className="hover:bg-gray-100 cursor-pointer"
                          onClick={() => setSelectedAPTransaction(tx)}
                        >
                          <td className="px-4 py-2 border-b text-center">
                            {tx.invoiceNumber || tx.eftNumber}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {tx.vendorId
                              ? tx.vendorId.companyName &&
                                tx.vendorId.companyName.trim() !== ""
                                ? tx.vendorId.companyName
                                : `${tx.vendorId.firstName} ${tx.vendorId.lastName}`
                              : tx.recipient}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {tx.dueDate
                              ? new Date(tx.dueDate).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {tx.amount ? parseFloat(tx.amount).toFixed(2) : ""}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {tx.hst ? parseFloat(tx.hst).toFixed(2) : ""}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {tx.total
                              ? parseFloat(tx.total).toFixed(2)
                              : tx.amount &&
                                tx.hst !== undefined &&
                                tx.hst !== null
                              ? (
                                  parseFloat(tx.amount) + parseFloat(tx.hst)
                                ).toFixed(2)
                              : tx.amount
                              ? parseFloat(tx.amount).toFixed(2)
                              : ""}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.eftCreated
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {tx.eftCreated ? "Paid" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Show summary modal for selected AP transaction */}
                {selectedAPTransaction && (
                  <PaymentSummaryModal
                    transaction={selectedAPTransaction}
                    onClose={() => setSelectedAPTransaction(null)}
                  />
                )}
              </div>
            )}
            {/* EFT Receipt Modal */}
            {showEFTReceipt && eftReceiptData && (
              <EFTReceipt
                data={eftReceiptData}
                hideTradeSellerBuyer={true}
                onClose={() => {
                  setShowEFTReceipt(false);
                  setEftReceiptData(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralAccountPayments;
