import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

// Check if Commission Trust EFT already exists for a trade and type
export const checkCommissionTrustEFT = async (tradeId, type) => {
  try {
    const response = await axiosInstance.get(
      `/commission-trust-eft/check-existing/${tradeId}/${type}`
    );
    return response.data;
  } catch (error) {
    toast.error("Error checking Commission Trust EFT");
    return { exists: false };
  }
};

// Check if Real Estate Trust EFT already exists for a trade and type
export const checkRealEstateTrustEFT = async (tradeId, type) => {
  try {
    const response = await axiosInstance.get(
      `/real-estate-trust-eft/check-existing/${tradeId}/${type}`
    );
    return response.data;
  } catch (error) {
    toast.error("Error checking Real Estate Trust EFT");
    return { exists: false };
  }
};

// Get EFT type display name
export const getEFTTypeDisplayName = (type) => {
  const typeMap = {
    AgentCommissionTransfer: "Agent Commission Transfer",
    RefundOfDeposit: "Refund of Deposit",
    OutsideBrokerCommission: "Outside Broker Commission",
    OurBrokerageCommission: "Our Brokerage Commission",
    CommissionTransfer: "Commission Transfer",
    BalanceOfDeposit: "Balance of Deposit",
  };
  return typeMap[type] || type;
};

// Get payment plan display name
export const getPaymentPlanDisplayName = (plan) => {
  const planMap = {
    plan250: "Plan 250",
    plan500: "Plan 500",
    plan9010: "Plan 90/10",
    plan955: "Plan 95/5",
    plan8515: "Plan 85/15",
    flexible: "Flexible Plan",
    flatFee: "Flat Fee",
    garnishment: "Garnishment",
    buyerRebate: "Buyer Rebate",
    noFee: "No Fee",
  };
  return planMap[plan] || plan;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  // Handle both Date objects and date strings
  let date;
  if (dateString instanceof Date) {
    date = dateString;
  } else {
    // Parse the date string and create a date in local timezone
    const [year, month, day] = dateString.split("-");
    if (year && month && day) {
      // Create date in local timezone to avoid UTC conversion issues
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Fallback to original method for other date formats
      date = new Date(dateString);
    }
  }

  return date.toLocaleDateString("en-CA");
};

// Check if General Account EFT invoice number already exists
export const checkGeneralAccountInvoice = async (invoiceNumber) => {
  try {
    const response = await axiosInstance.get(
      `/general-account-eft/check-invoice/${invoiceNumber}`
    );
    return response.data;
  } catch (error) {
    toast.error("Error checking invoice number");
    return { exists: false };
  }
};

// Format a number as currency with dollar sign and comma (e.g., $23,000.00)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "$0.00";
  const num =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  if (isNaN(num)) return "$0.00";
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

/**
 * Dynamically extracts party names from trade based on deal type
 * @param {Object} trade - The trade object
 * @returns {Object} Object containing firstParty and secondParty names
 */
export const getPartyNamesByDealType = (trade) => {
  if (!trade || !trade.people || !Array.isArray(trade.people)) {
    return { firstParty: "N/A", secondParty: "N/A" };
  }

  const dealType = trade.keyInfo?.dealType || "";

  if (dealType === "Lease") {
    // For Lease deals: Landlord and Tenant
    const landlords = trade.people
      .filter((p) => p.type === "Landlord")
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(", ");
    const tenants = trade.people
      .filter((p) => p.type === "Tenant")
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(", ");

    return {
      firstParty: landlords || "N/A",
      secondParty: tenants || "N/A",
      firstPartyLabel: "Landlord",
      secondPartyLabel: "Tenant",
    };
  } else {
    // For Sale deals: Seller and Buyer (default)
    const sellers = trade.people
      .filter((p) => p.type === "Seller")
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(", ");
    const buyers = trade.people
      .filter((p) => p.type === "Buyer")
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(", ");

    return {
      firstParty: sellers || "N/A",
      secondParty: buyers || "N/A",
      firstPartyLabel: "Seller",
      secondPartyLabel: "Buyer",
    };
  }
};
