import React, { useState, useEffect } from "react";
import logo1 from "../Assets/logo1.jpg";
import TradeEditModal from "./TradeEditModal";
import {
  formatCurrency,
  getEFTTypeDisplayName,
  getPaymentPlanDisplayName,
} from "../utils/eftUtils";
import axiosInstance from "../config/axios";

const TradeDetailsModal = ({ trade, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!trade) return null;

  // Helper: get nested safely
  const get = (obj, path, fallback = "-") =>
    path
      .split(".")
      .reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);

  // Helper to render a table from an array of objects
  const renderTable = (rows) => {
    if (!rows || !rows.length)
      return <div className="text-gray-500">No data.</div>;
    const headers = Object.keys(rows[0]);
    const capitalizedHeaders = headers.map(
      (h) => h.charAt(0).toUpperCase() + h.slice(1)
    );
    return (
      <table className="min-w-full border border-gray-300 mb-2 text-sm">
        <thead>
          <tr>
            {headers.map((h, index) => (
              <th key={h} className="px-2 py-1 text-left bg-gray-100 border">
                {capitalizedHeaders[index]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h) => (
                <td key={h} className="border px-2 py-1">
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Add a helper function inside the component, before renderFinancialSection
  const displayAmount = (val) =>
    val !== undefined && val !== null && val !== "" ? val : "0.00";

  // Print function
  const handlePrint = async () => {
    if (isPrinting) return; // Prevent multiple clicks

    setIsPrinting(true);
    try {
      // Try to open a new window first
      let printWindow = window.open("", "_blank");
      let useCurrentWindow = false;

      if (!printWindow) {
        // If popup is blocked, use current window
        useCurrentWindow = true;
        printWindow = window;
      }

      const currentDate = new Date().toLocaleDateString();

      // Fetch EFTs for print preview
      let realEstateTrustEFTs = [];
      let commissionTrustEFTs = [];
      if (trade && trade._id) {
        try {
          const [realEstateRes, commissionRes] = await Promise.all([
            axiosInstance.get(`/real-estate-trust-eft/trade/${trade._id}`),
            axiosInstance.get(`/commission-trust-eft/trade/${trade._id}`),
          ]);
          realEstateTrustEFTs = realEstateRes.data || [];
          commissionTrustEFTs = commissionRes.data || [];
        } catch (err) {
          // fallback to empty arrays
        }
      }

      const commissionIncome =
        trade.commission?.commissionIncomeRows?.[0] || {};
      const agent = trade.agentCommissionList?.[0] || {};
      const baseOfficeCommission = "";
      const isListing = agent.classification?.toLowerCase().includes("listing");
      const isSelling = agent.classification?.toLowerCase().includes("selling");

      // Get the trade classification
      const tradeClassification = trade.keyInfo?.classification || "";
      const isCoOperatingSide = tradeClassification === "CO-OPERATING SIDE";

      // Calculate Sub-Total and HST for Commission row
      const listingAmount =
        commissionIncome.listingAmount && commissionIncome.listingAmount !== ""
          ? parseFloat(commissionIncome.listingAmount)
          : 0;
      const sellingAmount =
        commissionIncome.sellingAmount && commissionIncome.sellingAmount !== ""
          ? parseFloat(commissionIncome.sellingAmount)
          : 0;
      const subTotal = (listingAmount + sellingAmount).toFixed(2);

      // Calculate HST based on the amounts (15% of each amount)
      const listingTax = (listingAmount * 0.15).toFixed(2);
      const sellingTax = (sellingAmount * 0.15).toFixed(2);
      const hst = (parseFloat(listingTax) + parseFloat(sellingTax)).toFixed(2);
      const total = (parseFloat(subTotal) + parseFloat(hst)).toFixed(2);

      // Get first outside broker row (from commission or outsideBrokers)
      let outsideBrokerInfo = null;
      if (trade.commission?.outsideBrokersRows?.length > 0) {
        outsideBrokerInfo = trade.commission.outsideBrokersRows[0];
      } else if (trade.outsideBrokers?.length > 0) {
        outsideBrokerInfo = trade.outsideBrokers[0];
      }
      // Determine side and amounts
      let obListing = "0.00",
        obSelling = "0.00",
        obSubTotal = "0.00",
        obTax = "0.00",
        obTotal = "0.00",
        obName = "";
      if (outsideBrokerInfo) {
        // Get the broker name
        const brokerName = `${
          outsideBrokerInfo.agentName || outsideBrokerInfo.firstName || ""
        } ${outsideBrokerInfo.lastName || ""}`.trim();

        // Get the company name
        const companyName =
          outsideBrokerInfo.company || outsideBrokerInfo.brokerage || "";

        // Combine name and company
        obName =
          brokerName && companyName
            ? `${brokerName} - ${companyName}`
            : brokerName || companyName || "Outside Broker";

        // Get the selling amount from either source
        const brokerSellingAmount = outsideBrokerInfo.sellingAmount || "0.00";

        // First check the broker's end from outsideBrokers array
        const matchingBrokerInOB = trade.outsideBrokers?.find((ob) => {
          const outsideBrokerName = `${ob.firstName} ${ob.lastName}`.trim();
          return (
            outsideBrokerName ===
              (outsideBrokerInfo.agentName || outsideBrokerInfo.firstName) ||
            ob.company === outsideBrokerInfo.company
          );
        });

        // Determine the end type from either the matching broker or current broker info
        let endType = "";
        if (matchingBrokerInOB) {
          if (
            matchingBrokerInOB.end?.toLowerCase().includes("listing") ||
            matchingBrokerInOB.type?.toLowerCase().includes("listing")
          ) {
            endType = "listing";
          } else {
            endType = "selling";
          }
        } else {
          const end = (
            outsideBrokerInfo.end ||
            outsideBrokerInfo.type ||
            ""
          ).toLowerCase();
          endType = end.includes("listing") ? "listing" : "selling";
        }

        // Place amount in appropriate column based on end type
        if (endType === "listing") {
          obListing = brokerSellingAmount;
          obSelling = "0.00";
        } else {
          obListing = "0.00";
          obSelling = brokerSellingAmount;
        }

        obSubTotal = brokerSellingAmount;
        obTax = outsideBrokerInfo.tax || "0.00";
        obTotal = outsideBrokerInfo.total || "0.00";
      }

      // Calculate Base Office Commission
      let baseOfficeCommissionListing,
        baseOfficeCommissionSelling,
        baseOfficeCommissionSubTotal,
        baseOfficeCommissionHST,
        baseOfficeCommissionTotal;

      if (isCoOperatingSide) {
        // For Co-operating Side, base office commission should be similar to commission values
        // Base Office Commission = Commission (same values)
        baseOfficeCommissionListing = listingAmount;
        baseOfficeCommissionSelling = sellingAmount;
        baseOfficeCommissionSubTotal = subTotal;
        baseOfficeCommissionHST = hst;
        baseOfficeCommissionTotal = total;
      } else {
        // For other classifications, base office commission is the net amount after outside broker deductions
        baseOfficeCommissionListing = (
          parseFloat(listingAmount) - parseFloat(obListing)
        ).toFixed(2);
        baseOfficeCommissionSelling = (
          parseFloat(sellingAmount) - parseFloat(obSelling)
        ).toFixed(2);
        baseOfficeCommissionSubTotal = (
          parseFloat(subTotal) - parseFloat(obSubTotal)
        ).toFixed(2);
        baseOfficeCommissionHST = (parseFloat(hst) - parseFloat(obTax)).toFixed(
          2
        );
        baseOfficeCommissionTotal = (
          parseFloat(total) - parseFloat(obTotal)
        ).toFixed(2);
      }

      // Calculate Agent Commission using Amount - Fees Deducted
      const agentAmount =
        agent.amount && agent.amount !== "" ? parseFloat(agent.amount) : 0;
      const agentFeesDeducted =
        agent.feesDeducted && agent.feesDeducted !== ""
          ? parseFloat(agent.feesDeducted)
          : 0;
      const agentClassification = agent.classification?.toLowerCase() || "";

      // Calculate agent commission as Amount - Fees Deducted
      const agentCommission = agentAmount - agentFeesDeducted;

      // Determine agent amounts based on trade classification (not agent classification)
      let agentListing = "0.00";
      let agentSelling = "0.00";

      // Use trade classification to determine which column the agent amount goes in
      if (isCoOperatingSide) {
        // For CO-OPERATING SIDE: put agent amount in selling column
        agentListing = "0.00";
        agentSelling = agentCommission.toFixed(2);
      } else {
        // For LISTING SIDE: put agent amount in listing column
        agentListing = agentCommission.toFixed(2);
        agentSelling = "0.00";
      }

      // Calculate agent sub-total, HST, and total
      let agentSubTotal = (
        parseFloat(agentListing) + parseFloat(agentSelling)
      ).toFixed(2);
      const agentHST = (parseFloat(agentSubTotal) * 0.15).toFixed(2);
      const agentTotal = (
        parseFloat(agentSubTotal) + parseFloat(agentHST)
      ).toFixed(2);

      // Calculate total buyer rebate amounts from all agents
      const totalBuyerRebate = (trade.agentCommissionList || []).reduce(
        (total, agent) => {
          if (agent.buyerRebateIncluded === "yes" && agent.buyerRebateAmount) {
            return total + parseFloat(agent.buyerRebateAmount || 0);
          }
          return total;
        },
        0
      );

      // Determine which column to show buyer rebate based on trade classification
      let buyerRebateListing = "0.00";
      let buyerRebateSelling = "0.00";

      if (isCoOperatingSide) {
        // For CO-OPERATING SIDE: put buyer rebate in selling column
        buyerRebateSelling = totalBuyerRebate.toFixed(2);
      } else {
        // For LISTING SIDE: put buyer rebate in listing column
        buyerRebateListing = totalBuyerRebate.toFixed(2);
      }

      // Calculate Net to Office = (Expenses - Agents) - Liabilities
      let netToOfficeListing,
        netToOfficeSelling,
        netToOfficeSubTotal,
        netToOfficeHST,
        netToOfficeTotal;

      // Net to Office = (Expenses - Agents) - Liabilities
      // Expenses = Base Office Commission
      // Agents = Agent Commission
      // Liabilities = Buyer Rebate
      netToOfficeListing = (
        parseFloat(baseOfficeCommissionListing) -
        parseFloat(agentListing) -
        parseFloat(buyerRebateListing)
      ).toFixed(2);
      netToOfficeSelling = (
        parseFloat(baseOfficeCommissionSelling) -
        parseFloat(agentSelling) -
        parseFloat(buyerRebateSelling)
      ).toFixed(2);
      netToOfficeSubTotal = (
        parseFloat(baseOfficeCommissionSubTotal) -
        parseFloat(agentSubTotal) -
        (parseFloat(buyerRebateListing) + parseFloat(buyerRebateSelling))
      ).toFixed(2);
      netToOfficeHST = (
        parseFloat(baseOfficeCommissionHST) - parseFloat(agentHST)
      ).toFixed(2);
      netToOfficeTotal = (
        parseFloat(baseOfficeCommissionTotal) -
        parseFloat(agentTotal) -
        (parseFloat(buyerRebateListing) + parseFloat(buyerRebateSelling))
      ).toFixed(2);

      // Format the outside brokers data
      const formattedOutsideBrokers =
        trade.commission?.outsideBrokersRows?.map((broker) => {
          const getEndValueForPrint = (b) => {
            // First check the broker's end from outsideBrokers array
            const matchingBroker1 = trade.outsideBrokers?.find((ob) => {
              const outsideBrokerName = `${ob.firstName} ${ob.lastName}`.trim();
              return (
                outsideBrokerName === b.agentName || ob.company === b.brokerage
              );
            });

            // If we found a matching broker in outsideBrokers array, use their end type
            if (matchingBroker1) {
              if (
                matchingBroker1.end?.toLowerCase().includes("listing") ||
                matchingBroker1.type?.toLowerCase().includes("listing")
              ) {
                return "Listing";
              }
            }

            // If no match found or not listing, check the commission broker's end/type
            if (
              b.end?.toLowerCase().includes("listing") ||
              b.type?.toLowerCase().includes("listing")
            ) {
              return "Listing";
            }

            return "Selling";
          };

          return {
            agentName: broker.agentName || "-",
            brokerage: broker.brokerage || "-",
            end: getEndValueForPrint(broker),
            sellingAmount: broker.sellingAmount || "0.00",
            tax: broker.tax || "0.00",
            total: broker.total || "0.00",
          };
        }) || [];

      // Get address information from keyInfo
      const streetNumber = get(trade, "keyInfo.streetNumber") || "";
      const streetName = get(trade, "keyInfo.streetName") || "";
      const unit = get(trade, "keyInfo.unit") || "";
      const city = get(trade, "keyInfo.city") || "";
      const province = get(trade, "keyInfo.province") || "";
      const postalCode = get(trade, "keyInfo.postalCode") || "";

      // Format address for display
      const addressLine1 =
        streetNumber && streetName ? `${streetNumber} ${streetName}` : "";
      const addressLine2 = unit || "";
      const addressLine3 = city && province ? `${city}, ${province}` : "";
      const addressLine4 = postalCode || "";

      const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trade Record Sheet - ${trade.tradeNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 15px; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .logo { width: 80px; height: auto; }
          .title { font-size: 18px; font-weight: bold; text-align: center; flex-grow: 1; }
          .date-address { text-align: right; font-size: 10px; }
          .date { font-weight: bold; margin-bottom: 5px; }
          .address { line-height: 1.2; }
          .section { margin-bottom: 15px; }
          .section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 3px; }
          .property-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
          .property-item { display: flex; justify-content: space-between; font-size: 10px; }
          .property-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; }
          th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .financial-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .financial-item { text-align: center; }
          .financial-label { font-weight: bold; margin-bottom: 3px; font-size: 10px; }
          .financial-value { font-size: 14px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            button { display: none !important; }
            .no-print button { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <img src="${
              window.location.origin
            }/logo1.jpg" alt="Logo" class="logo">
            <div style="font-size: 9px; line-height: 1.2; margin-top: 5px;">
                      Bestway Real Estate Ltd., Brokerage<br>
      500 St.George Street, Moncton, NB E1C 1Y3<br>
        Phone: 506-268-2900
            </div>
          </div>
          <div class="title">Trade Record Sheet</div>
          <div class="date-address">
            <div class="date">${currentDate}</div>
            <div class="address">
              ${addressLine1}<br>
              ${addressLine2}<br>
              ${addressLine3}<br>
              ${addressLine4}
            </div>
            <div style="font-size: 10px; font-weight: bold; margin-top: 5px;">
              Trade Number - ${
                get(trade, "keyInfo.tradeNumber") || trade.tradeNumber || "-"
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Property</div>
          <div class="property-grid">
            <div class="property-item">
              <span class="property-label">Type:</span>
              <span>${get(trade, "keyInfo.propertyType")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Classification:</span>
              <span>${get(trade, "keyInfo.classification")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Status:</span>
              <span>${get(trade, "keyInfo.status")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">MLS Number:</span>
              <span>${get(trade, "keyInfo.mlsNumber")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Offer Date:</span>
              <span>${get(trade, "keyInfo.offerDate")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Entry Date:</span>
              <span>${get(trade, "keyInfo.entryDate")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Firm Date:</span>
              <span>${get(trade, "keyInfo.firmDate")}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Close Date:</span>
              <span>${get(trade, "keyInfo.closeDate")}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Conditions</div>
          ${
            trade.conditions && trade.conditions.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Condition</th>
                <th>Due Date</th>
                <th>Condition Met Date</th>
              </tr>
            </thead>
            <tbody>
              ${trade.conditions
                .map(
                  (condition) => `
                <tr>
                  <td>${condition.conditionText || "-"}</td>
                  <td>${condition.dueDate || "-"}</td>
                  <td>${condition.conditionMetDate || "Not met"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>No conditions available.</p>"
          }
        </div>

        <div class="section">
          <div class="section-title">Contacts</div>
          ${
            trade.people && trade.people.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Primary Phone</th>
                <th>Secondary Phone</th>
                <th>Email</th>
                <th>Company Name</th>
              </tr>
            </thead>
            <tbody>
              ${trade.people
                .map(
                  (person) => `
                <tr>
                  <td>${person.type || "-"}</td>
                  <td>${person.firstName || "-"}</td>
                  <td>${person.lastName || "-"}</td>
                  <td>${person.primaryPhone || "-"}</td>
                  <td>${person.secondaryPhone || "-"}</td>
                  <td>${person.email || "-"}</td>
                  <td>${person.companyName || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>No contacts available.</p>"
          }
        </div>

        <div class="section">
          <div class="section-title">Outside Brokers</div>
          ${
            trade.outsideBrokers && trade.outsideBrokers.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>End</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Company</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              ${trade.outsideBrokers
                .map(
                  (broker) => `
                <tr>
                  <td>${broker.type || "-"}</td>
                  <td>${broker.end || "-"}</td>
                  <td>${broker.firstName || "-"}</td>
                  <td>${broker.lastName || "-"}</td>
                  <td>${broker.company || "-"}</td>
                  <td>${broker.primaryPhone || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>No outside brokers available.</p>"
          }
        </div>

        <div class="section">
          <div class="section-title">Outside Brokers Commission Details</div>
          ${
            formattedOutsideBrokers.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Brokerage</th>
                <th>End</th>
                <th>Selling Amount</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${formattedOutsideBrokers
                .map(
                  (broker) => `
                <tr>
                  <td>${broker.agentName}</td>
                  <td>${broker.brokerage}</td>
                  <td>${broker.end}</td>
                  <td>${formatCurrency(broker.sellingAmount)}</td>
                  <td>${formatCurrency(broker.tax)}</td>
                  <td>${formatCurrency(broker.total)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>No outside brokers commission details available.</p>"
          }
        </div>

        <div class="section">
          <div class="section-title">Deposit</div>
          ${
            trade.trustRecords && trade.trustRecords.length > 0
              ? `
          <table>
            <thead>
              <tr>
                <th>We Hold</th>
                <th>Received</th>
                <th>Received From</th>
                <th>Held By</th>
                <th>Deposit Date</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Payment Type</th>
              </tr>
            </thead>
            <tbody>
              ${trade.trustRecords
                .map(
                  (record) => `
                <tr>
                  <td>${record.weHold || "-"}</td>
                  <td>${record.received || "-"}</td>
                  <td>${record.receivedFrom || "-"}</td>
                  <td>${record.heldBy || "-"}</td>
                  <td>${record.depositDate || record.date || "-"}</td>
                  <td>${record.reference || "-"}</td>
                  <td>${formatCurrency(record.amount || 0)}</td>
                  <td>${record.paymentType || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>No deposit records available.</p>"
          }
        </div>

        <div class="section">
          <div class="section-title">Financial</div>
          <div style="font-weight:bold; font-size:12px; margin-bottom:4px;">Financial:</div>
          <div style="margin-bottom:4px; font-size:10px;">
            <div>Selling Price: <span style="font-weight:bold;">${formatCurrency(
              commissionIncome.sellPrice || trade.keyInfo?.sellPrice || 0
            )}</span></div>
          </div>
          <div style="margin-bottom:4px; font-size:10px;">
            <div>Listing Commission: <span style="font-weight:bold;">${parseFloat(
              trade.keyInfo?.listCommission || 0
            )}%</span></div>
          </div>
          <div style="margin-bottom:4px; font-size:10px;">
            <div>Selling Commission: <span style="font-weight:bold;">${parseFloat(
              trade.keyInfo?.sellCommission || 0
            )}%</span></div>
          </div>
          <div style="display:flex; font-weight:bold; border-bottom:1px solid #ccc; padding:3px 0; border-top:1px solid #ccc; font-size:9px;">
            <div style="width:25%"></div>
            <div style="width:12%; text-align:center;">Listing</div>
            <div style="width:12%; text-align:center;">Selling</div>
            <div style="width:12%; text-align:center;">Sub-Total</div>
            <div style="width:12%; text-align:center;">HST</div>
            <div style="width:12%; text-align:center;">Total</div>
          </div>
          <div style="font-weight:bold; margin-top:6px; margin-bottom:0; font-size:10px;">Income</div>
          <div style="display:flex; border-bottom:1px solid #ccc; padding:3px 0; font-size:9px;">
            <div style="width:25%">Commission</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              listingAmount
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              sellingAmount
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              subTotal
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              hst
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              total
            )}</div>
          </div>
          ${
            isCoOperatingSide
              ? `
          <div style="display:flex; padding:3px 0; font-size:9px;">
            <div style="width:25%">Base Office Commission</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionListing
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionSelling
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionSubTotal
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionHST
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionTotal
            )}</div>
          </div>
          `
              : `
          <div style="font-weight:bold; margin-top:6px; font-size:10px;">Expenses</div>
          <div style="display:flex; border-bottom:1px solid #ccc; padding:3px 0; font-size:9px;">
            <div style="width:25%">${obName}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              obListing
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              obSelling
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              obSubTotal
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              obTax
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              obTotal
            )}</div>
          </div>
          <div style="display:flex; border-bottom:1px solid #ccc; padding:3px 0; font-size:9px;">
            <div style="width:25%">Base Office Commission</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionListing
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionSelling
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionSubTotal
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionHST
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              baseOfficeCommissionTotal
            )}</div>
          </div>
          `
          }
          <div style="font-weight:bold; margin-top:6px; font-size:10px;">Agents</div>
          <div style="display:flex; border-bottom:1px solid #ccc; padding:3px 0; font-size:9px;">
            <div style="width:25%">(${agent.agentId}) ${agent.agentName}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              agentListing
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              agentSelling
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              agentSubTotal
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              agentHST
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              agentTotal
            )}</div>
          </div>
          
          <!-- Liabilities Section -->
          ${
            totalBuyerRebate > 0
              ? `
          <div style="font-weight:bold; margin-top:6px; font-size:10px;">Liabilities</div>
          <div style="display:flex; border-bottom:1px solid #ccc; padding:3px 0; font-size:9px;">
            <div style="width:25%">Buyer Rebate</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              buyerRebateListing
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              buyerRebateSelling
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              (
                parseFloat(buyerRebateListing) + parseFloat(buyerRebateSelling)
              ).toFixed(2)
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              "0.00"
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              (
                parseFloat(buyerRebateListing) + parseFloat(buyerRebateSelling)
              ).toFixed(2)
            )}</div>
          </div>
          `
              : ""
          }
          <div style="font-weight:bold; margin-top:6px; font-size:10px;">Net to Office</div>
          <div style="display:flex; border-bottom:3px double #000; padding:3px 0; font-size:9px;">
            <div style="width:25%"></div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              netToOfficeListing
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              netToOfficeSelling
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              netToOfficeSubTotal
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              netToOfficeHST
            )}</div>
            <div style="width:12%; text-align:center;">${formatCurrency(
              netToOfficeTotal
            )}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Agent Details</div>
          ${
            trade.agentCommissionList && trade.agentCommissionList.length > 0
              ? `
          <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
            <thead>
              <tr style="background-color:#f2f2f2;">
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Agent Name</th>
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Agent Number</th>
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Payment Plan</th>
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Agent Base</th>
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Plan Amount</th>
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Buyer Rebate</th>
                <th style="border:1px solid #ddd; padding:4px; text-align:left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${trade.agentCommissionList
                .map(
                  (agent) => `
                <tr>
                  <td style="border:1px solid #ddd; padding:4px;">${
                    agent.agentName || "-"
                  }</td>
                  <td style="border:1px solid #ddd; padding:4px;">${
                    agent.agentId || "-"
                  }</td>
                  <td style="border:1px solid #ddd; padding:4px;">${
                    getPaymentPlanDisplayName(agent.feeInfo) || "-"
                  }</td>
                  <td style="border:1px solid #ddd; padding:4px;">${formatCurrency(
                    agent.amount || 0
                  )}</td>
                  <td style="border:1px solid #ddd; padding:4px;">${formatCurrency(
                    agent.feesDeducted || 0
                  )}</td>
                  <td style="border:1px solid #ddd; padding:4px;">${
                    agent.buyerRebateIncluded === "yes" &&
                    agent.buyerRebateAmount
                      ? formatCurrency(agent.buyerRebateAmount)
                      : "-"
                  }</td>
                  <td style="border:1px solid #ddd; padding:4px;">${formatCurrency(
                    parseFloat(agent.amount || 0) -
                      parseFloat(agent.feesDeducted || 0) -
                      (agent.buyerRebateIncluded === "yes" &&
                      agent.buyerRebateAmount
                        ? parseFloat(agent.buyerRebateAmount || 0)
                        : 0)
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>No agent payment details available.</p>"
          }
        </div>

        <div class="section">
          <div class="section-title">Trust Activity</div>
          ${
            trade.trustRecords && trade.trustRecords.length > 0
              ? `<table><thead><tr>
                  <th>Received From</th><th>Deposit Date</th><th>Reference</th><th>Amount</th>
                </tr></thead><tbody>
                ${trade.trustRecords
                  .map(
                    (record) => `<tr>
                      <td>${record.receivedFrom || "-"}</td>
                      <td>${record.depositDate || record.date || "-"}</td>
                      <td>${record.reference || "-"}</td>
                      <td>${formatCurrency(record.amount || 0)}</td>
                    </tr>`
                  )
                  .join("")}
                </tbody></table>`
              : `<div class="text-gray-500">No trust records available.</div>`
          }
        </div>

        <div class="section">
          <div class="section-title">Real Estate Trust Payments</div>
          ${
            realEstateTrustEFTs.length > 0
              ? `<table><thead><tr>
                  <th>EFT #</th><th>Date</th><th>Amount</th><th>Recipient</th><th>Type</th><th>Description</th>
                </tr></thead><tbody>
                ${realEstateTrustEFTs
                  .map(
                    (eft) => `<tr>
                      <td>${eft.eftNumber || ""}</td>
                      <td>${
                        eft.chequeDate || eft.date
                          ? new Date(
                              eft.chequeDate || eft.date
                            ).toLocaleDateString()
                          : "-"
                      }</td>
                      <td>${formatCurrency(eft.amount || "")}</td>
                      <td>${eft.recipient || ""}</td>
                      <td>${getEFTTypeDisplayName(eft.type) || ""}</td>
                      <td>${eft.description || ""}</td>
                    </tr>`
                  )
                  .join("")}
                </tbody></table>`
              : `<div class="text-gray-500">No Real Estate Trust Payments found for this trade.</div>`
          }
        </div>

        <div class="section">
          <div class="section-title">Commission Trust Payments</div>
          ${
            commissionTrustEFTs.length > 0
              ? `<table><thead><tr>
                  <th>EFT #</th><th>Date</th><th>Amount</th><th>Recipient</th><th>Type</th><th>Description</th>
                </tr></thead><tbody>
                ${commissionTrustEFTs
                  .map(
                    (eft) => `<tr>
                      <td>${eft.eftNumber || ""}</td>
                      <td>${
                        eft.chequeDate || eft.date
                          ? new Date(
                              eft.chequeDate || eft.date
                            ).toLocaleDateString()
                          : "-"
                      }</td>
                      <td>${formatCurrency(eft.amount || "")}</td>
                      <td>${eft.recipient || ""}</td>
                      <td>${getEFTTypeDisplayName(eft.type) || ""}</td>
                      <td>${eft.description || ""}</td>
                    </tr>`
                  )
                  .join("")}
                </tbody></table>`
              : `<div class="text-gray-500">No Commission Trust Payments found for this trade.</div>`
          }
        </div>

        <div class="section">
          <div class="section-title">Commission Trust Agreement</div>
          <div style="margin-bottom: 15px; font-size: 10px; line-height: 1.4;">
            It is understood between all parties that this agreement shall constitute a Commission Trust Agreement as set out in the contract.
          </div>
          <div style="margin-bottom: 15px; font-size: 10px; line-height: 1.4;">
            To the best of my knowledge the above information is correct. Dated at Moncton on ${currentDate}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 10px;">
              ${agent.agentName || "Agent Name"}, ${
        agent.agentId || "Agent Number"
      }
            </div>
            <div style="border-bottom: 1px solid #000; width: 200px; height: 20px;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 10px;">
              Broker of Record: Bestway Real Estate Ltd., Brokerage
            </div>
            <div style="border-bottom: 1px solid #000; width: 200px; height: 20px;"></div>
          </div>
        </div>

        <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          ${
            useCurrentWindow
              ? ""
              : '<button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>'
          }
        </div>
      </body>
      </html>
    `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then automatically print
      setTimeout(() => {
        try {
          printWindow.print();
          // Close the window after a delay to allow printing to complete
          if (!useCurrentWindow) {
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }
          // Show success message
          if (!useCurrentWindow) {
            setTimeout(() => {
              alert("Print dialog opened successfully!");
            }, 100);
          }
        } catch (printError) {
          console.error("Print error:", printError);
          // If automatic print fails, keep the window open for manual printing
          if (!useCurrentWindow) {
            printWindow.focus();
          }
          alert(
            "Print dialog failed to open. The report is ready for manual printing."
          );
        }
      }, 500);
    } catch (error) {
      console.error("Error generating print report:", error);
      alert("Error generating print report. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  // Helper to generate transaction details for this trade
  const getTransactionDetails = () => {
    // You may want to adjust these values to match your backend logic
    const commissionIncome = trade.commission?.commissionIncomeRows?.[0] || {};
    const agent = trade.agentCommissionList?.[0] || {};
    const address = `${get(trade, "keyInfo.streetNumber") || ""} ${
      get(trade, "keyInfo.streetName") || ""
    }`.trim();
    const commissionDescription = `Trade #${trade.tradeNumber} - ${address}`;
    const commissionDate = get(trade, "keyInfo.closeDate") || "-";
    const totalFees = parseFloat(agent.feesDeducted || 0);
    const hstInputTaxCredit =
      parseFloat(commissionIncome.sellingAmount || 0) * 0.15;
    const agentAmount = parseFloat(agent.amount || 0);
    const agentNetCommission = parseFloat(agent.netCommission || 0);
    const feesDeducted = parseFloat(agent.feesDeducted || 0);
    const totalFeesWithTax = feesDeducted + feesDeducted * 0.15;
    // Main 8 transactions
    const mainTxns = [
      {
        date: commissionDate,
        accountNumber: "40100",
        accountName: "Commission Income",
        debit: "",
        credit: commissionIncome.listingAmount,
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "23001",
        accountName: "HST Input Tax Credit",
        debit: commissionIncome.sellingAmount * 0.15,
        credit: "",
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "23000",
        accountName: "HST Collected",
        debit: "",
        credit: commissionIncome.sellingAmount * 0.15,
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "50100",
        accountName: "Agent's Commission",
        debit: agentAmount,
        credit: "",
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "21500",
        accountName: "Commission Payable",
        debit: "",
        credit: agent.netCommission,
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "44100",
        accountName: "Fee Deducted Income",
        debit: "",
        credit: feesDeducted,
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "23001",
        accountName: "HST Input Tax Credit",
        debit: "",
        credit: (totalFeesWithTax - feesDeducted).toFixed(2),
        description: commissionDescription,
      },
      {
        date: commissionDate,
        accountNumber: "12200",
        accountName: "A/R - Commission From Deals",
        debit: commissionIncome.listingAmount
          ? (
              parseFloat(commissionIncome.listingAmount) + hstInputTaxCredit
            ).toFixed(2)
          : "",
        credit: "",
        description: commissionDescription,
      },
    ];
    // Next 2 transactions (Payment Received)
    const paymentTxns = [
      {
        date: commissionDate,
        accountNumber: "10004",
        accountName: "CASH - COMMISSION TRUST ACCOUNT",
        debit: agent.netCommission,
        credit: "",
        description: `Trade #${trade.tradeNumber}, Paid to: Agent`,
      },
      {
        date: commissionDate,
        accountNumber: "21500",
        accountName: "Commission Payable",
        debit: agent.netCommission,
        credit: "",
        description: `Trade #${trade.tradeNumber}, Paid to: Agent`,
      },
      {
        date: commissionDate,
        accountNumber: "10004",
        accountName: "CASH - COMMISSION TRUST ACCOUNT",
        debit: feesDeducted,
        credit: "",
        description: `Trade #${trade.tradeNumber}, Paid to: Bestway Real Estate Ltd., Brokerage`,
      },
      {
        date: commissionDate,
        accountNumber: "10001",
        accountName: "CASH - CURRENT ACCOUNT",
        debit: "",
        credit: feesDeducted,
        description: `Trade #${trade.tradeNumber}, Paid to: Bestway Real Estate Ltd., Brokerage`,
      },
    ];
    return { mainTxns, paymentTxns };
  };

  // EFTPaymentTables component for displaying EFT tables
  const EFTPaymentTables = ({ trade }) => {
    const [realEstateTrustEFTs, setRealEstateTrustEFTs] = useState([]);
    const [commissionTrustEFTs, setCommissionTrustEFTs] = useState([]);
    const [generalAccountEFTs, setGeneralAccountEFTs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
      if (!trade || !trade._id) return;
      setLoading(true);
      setError("");
      // Fetch Real Estate Trust EFTs
      axiosInstance
        .get(`/real-estate-trust-eft/trade/${trade._id}`)
        .then((res) => setRealEstateTrustEFTs(res.data))
        .catch(() => setRealEstateTrustEFTs([]));
      // Fetch Commission Trust EFTs
      axiosInstance
        .get(`/commission-trust-eft/trade/${trade._id}`)
        .then((res) => setCommissionTrustEFTs(res.data))
        .catch(() => setCommissionTrustEFTs([]));
      // For General Account EFTs, we need a vendorId (not directly available from trade)
      // If you have a way to relate trade to vendor, add logic here. For now, leave empty.
      setLoading(false);
    }, [trade]);

    return (
      <div className="mb-8">
        {/* Real Estate Trust Payments Table */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">
            Real Estate Trust Payments
          </h3>
          {realEstateTrustEFTs.length > 0 ? (
            <table className="min-w-full border border-gray-300 mb-2 text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    EFT #
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Date
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Amount
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Recipient
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Type
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {realEstateTrustEFTs.map((eft) => (
                  <tr key={eft._id}>
                    <td className="border px-2 py-1">{eft.eftNumber}</td>
                    <td className="border px-2 py-1">
                      {eft.chequeDate || eft.date
                        ? new Date(
                            eft.chequeDate || eft.date
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(eft.amount)}
                    </td>
                    <td className="border px-2 py-1">{eft.recipient}</td>
                    <td className="border px-2 py-1">
                      {getEFTTypeDisplayName(eft.type)}
                    </td>
                    <td className="border px-2 py-1">{eft.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">
              No Real Estate Trust Payments found for this trade.
            </div>
          )}
        </div>

        {/* Commission Trust Payments Table */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">
            Commission Trust Payments
          </h3>
          {commissionTrustEFTs.length > 0 ? (
            <table className="min-w-full border border-gray-300 mb-2 text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    EFT #
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Date
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Amount
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Recipient
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Type
                  </th>
                  <th className="px-2 py-1 text-left bg-gray-100 border">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissionTrustEFTs.map((eft) => (
                  <tr key={eft._id}>
                    <td className="border px-2 py-1">{eft.eftNumber}</td>
                    <td className="border px-2 py-1">
                      {eft.chequeDate || eft.date
                        ? new Date(
                            eft.chequeDate || eft.date
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border px-2 py-1">
                      {formatCurrency(eft.amount)}
                    </td>
                    <td className="border px-2 py-1">{eft.recipient}</td>
                    <td className="border px-2 py-1">
                      {getEFTTypeDisplayName(eft.type)}
                    </td>
                    <td className="border px-2 py-1">{eft.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">
              No Commission Trust Payments found for this trade.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full relative overflow-y-auto max-h-[90vh]">
        {/* Top-right action buttons */}
        <div className="flex gap-3 absolute top-4 right-6 z-10">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPrinting ? "Generating..." : "Print"}
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Edit
          </button>
          <button
            className="text-2xl text-gray-500 hover:text-gray-700 px-2"
            onClick={onClose}
            style={{ lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        {showEditModal ? (
          <TradeEditModal
            trade={trade}
            onClose={() => setShowEditModal(false)}
            onUpdate={onUpdate}
          />
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-yellow-700 mt-8">
              Trade Details: #{trade.tradeNumber}
            </h2>

            {/* Address Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 font-normal">Street #</span>
                  <br />
                  {get(trade, "keyInfo.streetNumber")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Street Name</span>
                  <br />
                  {get(trade, "keyInfo.streetName")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Unit</span>
                  <br />
                  {get(trade, "keyInfo.unit")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">City</span>
                  <br />
                  {get(trade, "keyInfo.city")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Province</span>
                  <br />
                  {get(trade, "keyInfo.province")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Postal Code</span>
                  <br />
                  {get(trade, "keyInfo.postalCode")}
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Important Dates</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 font-normal">Offer Date</span>
                  <br />
                  {get(trade, "keyInfo.offerDate")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Firm Date</span>
                  <br />
                  {get(trade, "keyInfo.firmDate")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Close Date</span>
                  <br />
                  {get(trade, "keyInfo.closeDate")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Entry Date</span>
                  <br />
                  {get(trade, "keyInfo.entryDate")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">
                    Finalized Date
                  </span>
                  <br />
                  {get(trade, "keyInfo.finalizedDate")}
                </div>
              </div>
            </div>

            {/* Key Information Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Key Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 font-normal">
                    Listing Number
                  </span>
                  <br />
                  {get(trade, "keyInfo.listingNumber")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Sell Price</span>
                  <br />
                  {get(trade, "keyInfo.sellPrice")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">
                    Classification
                  </span>
                  <br />
                  {get(trade, "keyInfo.classification")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Firm</span>
                  <br />
                  {get(trade, "keyInfo.firm")}
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Commission</h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 font-normal">List %</span>
                  <br />
                  {get(trade, "keyInfo.listCommission")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Sell %</span>
                  <br />
                  {get(trade, "keyInfo.sellCommission")}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 font-normal">
                    Property Type
                  </span>
                  <br />
                  {get(trade, "keyInfo.propertyType")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">Status</span>
                  <br />
                  {get(trade, "keyInfo.status")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">MLS #</span>
                  <br />
                  {get(trade, "keyInfo.mlsNumber")}
                </div>
                <div>
                  <span className="text-gray-500 font-normal">We Manage</span>
                  <br />
                  {get(trade, "keyInfo.weManage")}
                </div>
              </div>
            </div>

            {/* People Information Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">People Information</h3>
              {trade.people && trade.people.length > 0 ? (
                <table className="min-w-full border border-gray-300 mb-2 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Type
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        First Name
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Last Name
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Primary Phone
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Secondary Phone
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Email
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Company Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.people.map((person, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{person.type}</td>
                        <td className="border px-2 py-1">
                          {person.firstName || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {person.lastName || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {person.primaryPhone || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {person.secondaryPhone || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {person.email || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {person.companyName || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">
                  No people information available.
                </div>
              )}
            </div>

            {/* Outside Brokers Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Outside Brokers</h3>
              {trade.outsideBrokers && trade.outsideBrokers.length > 0 ? (
                <table className="min-w-full border border-gray-300 mb-2 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Type
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        End
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        First Name
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Last Name
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Company
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Phone Number
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.outsideBrokers.map((broker, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">
                          {broker.type || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {broker.end || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {broker.firstName || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {broker.lastName || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {broker.company || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {broker.primaryPhone || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">
                  No outside brokers information available.
                </div>
              )}
            </div>

            {/* Outside Brokers Commission Details Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">
                Outside Brokers Commission Details
              </h3>
              {trade.commission &&
              trade.commission.outsideBrokersRows &&
              trade.commission.outsideBrokersRows.length > 0 ? (
                <table className="min-w-full border border-gray-300 mb-2 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Agent Name
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Brokerage
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        End
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Selling Amount
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Tax
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.commission.outsideBrokersRows.map((broker, idx) => {
                      const getEndValueForPrint = (b) => {
                        // First check the broker's end from outsideBrokers array
                        const matchingBroker1 = trade.outsideBrokers?.find(
                          (ob) => {
                            const outsideBrokerName =
                              `${ob.firstName} ${ob.lastName}`.trim();
                            return (
                              outsideBrokerName === b.agentName ||
                              ob.company === b.brokerage
                            );
                          }
                        );

                        // If we found a matching broker in outsideBrokers array, use their end type
                        if (matchingBroker1) {
                          if (
                            matchingBroker1.end
                              ?.toLowerCase()
                              .includes("listing") ||
                            matchingBroker1.type
                              ?.toLowerCase()
                              .includes("listing")
                          ) {
                            return "Listing";
                          }
                        }

                        // If no match found or not listing, check the commission broker's end/type
                        if (
                          b.end?.toLowerCase().includes("listing") ||
                          b.type?.toLowerCase().includes("listing")
                        ) {
                          return "Listing";
                        }

                        return "Selling";
                      };

                      return (
                        <tr key={idx}>
                          <td className="border px-2 py-1">
                            {broker.agentName || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {broker.brokerage || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {getEndValueForPrint(broker)}
                          </td>
                          <td className="border px-2 py-1">
                            {formatCurrency(broker.sellingAmount)}
                          </td>
                          <td className="border px-2 py-1">
                            {formatCurrency(broker.tax)}
                          </td>
                          <td className="border px-2 py-1">
                            {formatCurrency(broker.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">
                  No outside brokers commission details available.
                </div>
              )}
            </div>

            {/* Trust Records Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Trust Records</h3>
              {trade.trustRecords && trade.trustRecords.length > 0 ? (
                <table className="min-w-full border border-gray-300 mb-2 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        We Hold
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Received
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Received From
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Held By
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Deposit Date
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Reference
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Amount
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Payment Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.trustRecords.map((t, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{t.weHold || "-"}</td>
                        <td className="border px-2 py-1">
                          {t.received || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {t.receivedFrom || "-"}
                        </td>
                        <td className="border px-2 py-1">{t.heldBy || "-"}</td>
                        <td className="border px-2 py-1">
                          {t.depositDate || t.date || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {t.reference || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {formatCurrency(t.amount || "-")}
                        </td>
                        <td className="border px-2 py-1">
                          {t.paymentType || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">No trust records.</div>
              )}
            </div>

            {/* Conditions Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Conditions</h3>
              {trade.conditions && trade.conditions.length > 0 ? (
                <table className="min-w-full border border-gray-300 mb-2 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Condition
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Due Date
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Condition Met Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.conditions.map((condition, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">
                          {condition.conditionText || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {condition.dueDate || "-"}
                        </td>
                        <td className="border px-2 py-1">
                          {condition.conditionMetDate || "Not met"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">No conditions available.</div>
              )}
            </div>

            {/* Commission Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Commission Details</h3>
              {trade.commission && (
                <>
                  <div className="mb-4">
                    <h4 className="text-gray-700 mb-1">Sale Closing Rows</h4>
                    {renderTable(trade.commission.saleClosingRows)}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-gray-700 mb-1">
                      Commission Income Rows
                    </h4>
                    {renderTable(trade.commission.commissionIncomeRows)}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-gray-700 mb-1">Outside Brokers Rows</h4>
                    {renderTable(trade.commission.outsideBrokersRows)}
                  </div>
                </>
              )}
            </div>

            {/* Agent Commission Info Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">
                Agent Commission Info
              </h3>
              {trade.agentCommissionList &&
              trade.agentCommissionList.length > 0 ? (
                <table className="min-w-full border border-gray-300 mb-2 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Agent Name
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Classification
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Amount
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Net Commission
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Lead
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Fee Info
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Total Fees
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Tax
                      </th>
                      <th className="px-2 py-1 text-left bg-gray-100 border">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.agentCommissionList.map((a, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{a.agentName}</td>
                        <td className="border px-2 py-1">{a.classification}</td>
                        <td className="border px-2 py-1">
                          {formatCurrency(a.amount)}
                        </td>
                        <td className="border px-2 py-1">
                          {formatCurrency(a.netCommission)}
                        </td>
                        <td className="border px-2 py-1">{a.lead}</td>
                        <td className="border px-2 py-1">
                          {getPaymentPlanDisplayName(a.feeInfo)}
                        </td>
                        <td className="border px-2 py-1">
                          {formatCurrency(a.totalFees)}
                        </td>
                        <td className="border px-2 py-1">
                          {formatCurrency(a.tax)}
                        </td>
                        <td className="border px-2 py-1">
                          {formatCurrency(a.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">No agent commission data.</div>
              )}
            </div>

            {/* EFT Payment Tables Section */}
            <EFTPaymentTables trade={trade} />

            {/* Transaction Details Section */}
            {/* Removed Trade Finalize and Payment Received tables as requested */}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeDetailsModal;
