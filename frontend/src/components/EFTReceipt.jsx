import React from "react";
import logo from "../Assets/logo1.jpg";
import { toWords } from "number-to-words";

const EFTReceipt = ({ data, onClose, hideTradeSellerBuyer }) => {
  const companyInfo = {
    name: "Bestway Real Estate Ltd., Brokerage",
    addressLine1: "500 St.George Street",
    addressLine2: "Moncton, NB  E1C 1Y3",
    phone: "506-268-2900",
  };

  if (!data) {
    return (
      <div className="fixed inset-0 bg-white flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">No receipt data available.</p>
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const {
    eftNumber,
    paidTo,
    trade,
    notes,
    amount,
    seller,
    buyer,
    firstPartyLabel = "Seller",
    secondPartyLabel = "Buyer",
    payTo,
    orderOf,
    note,
    chequeDate,
  } = data;

  const amountNumber = Number(amount) || 0;

  // Custom function to convert amount to words with cents as fraction
  const convertAmountToWords = (amount) => {
    const dollars = Math.floor(amount);
    const cents = Math.round((amount - dollars) * 100);

    let result = "";

    if (dollars > 0) {
      result =
        toWords(dollars)
          .replace(/,/g, "")
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ") + " Dollars";
    }

    if (cents > 0) {
      if (result) {
        result += " and ";
      }
      result += `${cents}/100`;
    }

    if (!result) {
      result = "Zero Dollars";
    }

    return result + " Only";
  };

  const amountInWords = convertAmountToWords(amountNumber);
  const currentDate = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use chequeDate if provided, otherwise use current date
  const displayDate = chequeDate
    ? (() => {
        // Handle both MM/DD/YYYY and YYYY-MM-DD formats
        let dateToUse;
        if (chequeDate.includes("/")) {
          // MM/DD/YYYY format - convert to YYYY-MM-DD
          const [month, day, year] = chequeDate.split("/");
          dateToUse = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}T00:00:00`;
        } else {
          // YYYY-MM-DD format
          dateToUse = chequeDate + "T00:00:00";
        }
        return new Date(dateToUse).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      })()
    : currentDate;

  // Handle paidTo which can be either a string or an object
  const getPaidToDisplay = () => {
    if (typeof paidTo === "string") {
      return paidTo;
    } else if (paidTo && typeof paidTo === "object") {
      return paidTo.name || "N/A";
    }
    return "N/A";
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    const printContent = document.getElementById("receipt-content").innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EFT Receipt - ${eftNumber}</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: letter;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.2;
                background: white;
              }
              .receipt-container {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                page-break-after: avoid;
                page-break-before: avoid;
                page-break-inside: avoid;
                background: white;
              }
              .receipt-border {
                border: 2px solid #808080;
                padding: 0.4in;
                margin: 0;
                box-sizing: border-box;
                background: white;
                border-radius: 0;
              }
              .header-section {
                margin-bottom: 0.3in;
              }
              .logo {
                height: 0.8in;
                margin-right: 0.25in;
                display: inline-block;
              }
              .company-info {
                display: inline-block;
                vertical-align: top;
              }
              .company-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 0.05in;
                color: black;
              }
              .company-address {
                font-size: 10px;
                margin-bottom: 0.02in;
                color: black;
              }
              .eft-header {
                text-align: right;
                font-size: 12px;
                color: black;
              }
              .eft-number {
                font-weight: bold;
                margin-bottom: 0.05in;
                color: black;
              }
              .content-section {
                margin-bottom: 0.2in;
                font-size: 11px;
                color: black;
              }
              .label {
                font-weight: bold;
                display: inline-block;
                width: 0.8in;
                margin-right: 0.1in;
                color: black;
              }
              .main-section {
                border-top: 1px solid #808080;
                border-bottom: 1px solid #808080;
                padding: 0.25in 0;
                margin: 0.25in 0;
              }
              .amount-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.2in;
              }
              .amount-words {
                flex: 1;
                color: black;
              }
              .amount-right {
                text-align: right;
                min-width: 1.5in;
                color: black;
              }
              .order-section {
                display: flex;
                margin-top: 0.2in;
              }
              .order-labels {
                font-weight: bold;
                width: 0.8in;
                margin-right: 0.1in;
                color: black;
              }
              .order-content {
                flex: 1;
                color: black;
              }
              .no-print {
                display: none;
              }
              .pay-label {
                font-weight: bold;
                display: inline-block;
                width: 0.5in;
                margin-right: 0.08in;
              }
              .amount-asterisk {
                font-weight: bold;
              }
            }
            @media screen {
              .receipt-container {
                width: 8.5in;
                margin: 0 auto;
                padding: 0.5in;
              }
              .receipt-border {
                border: 2px solid #808080;
                padding: 0.4in;
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-border">
              <div class="header-section">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; align-items: flex-start;">
                    <img src="${logo}" alt="SaveMax Realty Logo" class="logo" />
                    <div class="company-info">
                      <div class="company-name">${companyInfo.name}</div>
                      <div class="company-address">${
                        companyInfo.addressLine1
                      }</div>
                      <div class="company-address">${
                        companyInfo.addressLine2
                      }</div>
                      <div class="company-address">Phone: ${
                        companyInfo.phone
                      }</div>
                    </div>
                  </div>
                  <div class="eft-header">
                    <div class="eft-number">EFT # ${eftNumber}</div>
                    <div>Date: ${displayDate}</div>
                  </div>
                </div>
              </div>

              <div class="content-section">
                <div style="margin-bottom: 0.08in;"><span class="label">Paid To:</span>${getPaidToDisplay()}</div>
                ${
                  !hideTradeSellerBuyer
                    ? `
                  <div style="margin-bottom: 0.04in;"><span class="label">Trade:</span>${
                    trade || "N/A"
                  }</div>
                  <div style="margin-bottom: 0.04in;"><span class="label">${firstPartyLabel}:</span>${
                        seller || "N/A"
                      }</div>
                  <div style="margin-bottom: 0.1in;"><span class="label">${secondPartyLabel}:</span>${
                        buyer || "N/A"
                      }</div>
                `
                    : ""
                }
                <div style="margin-bottom: 0.04in;"><span class="label">Notes:</span>${
                  notes || "N/A"
                }</div>
                <div style="margin-bottom: 0.1in;"><span class="label">Amount:</span>$${amountNumber.toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}</div>
              </div>

              <div class="main-section">
                <div class="amount-section">
                  <div class="amount-words">
                    <span class="pay-label">PAY</span>${amountInWords}
                  </div>
                  <div class="amount-right">
                    <div>Date: ${displayDate}</div>
                    <div style="font-weight: bold; margin-top: 0.03in;">AMOUNT</div>
                    <div class="amount-asterisk">*$${amountNumber.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}*</div>
                  </div>
                </div>
                <div class="order-section">
                  <div class="order-labels">
                    <div style="margin-bottom: 0.04in;">TO THE</div>
                    <div style="margin-bottom: 0.04in;">ORDER</div>
                    <div style="margin-bottom: 0.04in;">OF</div>
                    <div style="margin-bottom: 0.04in;">NOTE</div>
                  </div>
                  <div class="order-content">
                    <div style="margin-bottom: 0.04in;">${payTo || "N/A"}</div>
                    <div style="margin-bottom: 0.04in;">${
                      orderOf?.address || "N/A"
                    }</div>
                    <div style="margin-bottom: 0.04in;">${
                      orderOf?.cityProvincePostal || "N/A"
                    }</div>
                    <div style="margin-bottom: 0.04in;">${note || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50 p-4">
      <div
        className="bg-white p-6 rounded-lg max-w-4xl w-full relative mx-auto"
        id="receipt-content"
      >
        <div className="border-2 border-gray-500 p-8 bg-white">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start">
              <img src={logo} alt="SaveMax Realty Logo" className="h-20 mr-6" />
              <div>
                <h1 className="font-bold text-lg mb-1">{companyInfo.name}</h1>
                <p className="text-sm mb-1">{companyInfo.addressLine1}</p>
                <p className="text-sm mb-1">{companyInfo.addressLine2}</p>
                <p className="text-sm">Phone: {companyInfo.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-base mb-1">EFT # {eftNumber}</p>
              <p className="text-sm">Date: {displayDate}</p>
            </div>
          </div>

          <div className="mb-4 flex items-start">
            <span className="font-bold pr-2 w-24 flex-shrink-0">Paid To:</span>
            <div>
              <p className="my-0 font-semibold">{getPaidToDisplay()}</p>
            </div>
          </div>

          {/* Only render Trade, First Party, Second Party if NOT hideTradeSellerBuyer */}
          {!hideTradeSellerBuyer && (
            <>
              <div className="mb-1">
                <span className="font-bold w-24 inline-block">Trade:</span>{" "}
                {trade}
              </div>
              <div className="mb-1">
                <span className="font-bold w-24 inline-block">
                  {firstPartyLabel}:
                </span>{" "}
                {seller}
              </div>
              <div className="mb-4">
                <span className="font-bold w-24 inline-block">
                  {secondPartyLabel}:
                </span>{" "}
                {buyer}
              </div>
            </>
          )}

          <div className="mb-1">
            <span className="font-bold w-24 inline-block">Notes:</span> {notes}
          </div>
          <div className="mb-4">
            <span className="font-bold w-24 inline-block">Amount:</span> $
            {amountNumber.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="border-t border-b border-gray-400 py-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold inline-block w-20">PAY</span>
                <span>{amountInWords}</span>
              </div>
              <div className="text-right">
                <p>Date: {displayDate}</p>
                <p className="font-bold mt-1">AMOUNT</p>
                <p className="font-bold">
                  *$
                  {amountNumber.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  *
                </p>
              </div>
            </div>
            <div className="mt-4 flex">
              <div className="font-bold w-20 flex-shrink-0">
                <p className="mb-1">TO THE</p>
                <p className="mb-1">ORDER</p>
                <p className="mb-1">OF</p>
                <p className="mb-1">NOTE</p>
              </div>
              <div className="flex-1">
                <p className="mb-1">{payTo}</p>
                <p className="mb-1">{orderOf?.address}</p>
                <p className="mb-1">{orderOf?.cityProvincePostal}</p>
                <p className="mb-1">{note}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6 no-print">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EFTReceipt;
