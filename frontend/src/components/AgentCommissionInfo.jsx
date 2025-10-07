import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getPaymentPlanDisplayName } from "../utils/eftUtils";
import axiosInstance from "../config/axios";

const feePlans = [
  { label: "Plan 250", value: "plan250" },
  { label: "Plan 500", value: "plan500" },
  { label: "Plan 90/10", value: "plan9010" },
  { label: "Plan 95/5", value: "plan955" },
  { label: "Plan 85/15", value: "plan8515" },
  { label: "Plan 50/50", value: "plan5050" },
  { label: "Plan 80/20", value: "plan8020" },
  { label: "Plan 150", value: "plan150" },
  { label: "Flexible Plan", value: "flexible" },
];

const initialAgent = {
  agentId: "",
  agentName: "",
  classification: "",
  ytdCommission: "Yes",
  awardAmount: "",
  percentage: 100,
  amount: "",
  feeInfo: "plan500",
  feesDeducted: "",
  tax: "",
  taxOnFees: "",
  total: "",
  totalFees: "",
  netCommission: "",
  lead: "No",
};

const initialSaleClosing = {
  sellPrice: "",
  closingDate: "",
  tradeNumber: "",
  status: "Active",
  ar: "",
};

const AgentCommissionInfo = ({
  goToPreviousSection,
  agent,
  setAgent,
  agents,
  setAgents,
  editingIndex,
  setEditingIndex,
  showDeleteModal,
  setShowDeleteModal,
  deletingIndex,
  setDeletingIndex,
  showBuyerRebateModal,
  setShowBuyerRebateModal,
  buyerRebateIncluded,
  setBuyerRebateIncluded,
  buyerRebateAmount,
  setBuyerRebateAmount,
  pendingAgent,
  setPendingAgent,
  validationErrors,
  setValidationErrors,
  onSaveTrade,
  classification,
  commissionData,
  selectedListing,
  isEditingExistingTrade = false, // Add this prop
  isEditMode = false, // Add this prop to control save button visibility
}) => {
  const [agentList, setAgentList] = useState([]);
  const [saleClosingRows, setSaleClosingRows] = useState([]);
  const [saleClosing, setSaleClosing] = useState(initialSaleClosing);
  const [isSaving, setIsSaving] = useState(false);
  const [isTradeSaved, setIsTradeSaved] = useState(false);

  // Fetch agent list for dropdown
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get("/agents");
        setAgentList(response.data);
      } catch (error) {
        setAgentList([]);
      }
    };
    fetchAgents();
  }, []);

  // Auto-calculate amount when awardAmount or percentage changes
  useEffect(() => {
    const award = parseFloat(agent.awardAmount) || 0;
    const perc = parseFloat(agent.percentage) || 0;
    const amount = ((award * perc) / 100).toFixed(2);
    setAgent((prev) => calculateFees({ ...prev, amount }));
    // eslint-disable-next-line
  }, [agent.awardAmount, agent.percentage, agent.feeInfo, agent.feesDeducted]);

  // Calculate award amount based on classification and commission data
  useEffect(() => {
    if (classification && commissionData) {
      let calculatedAwardAmount = "0.00";

      if (classification === "LISTING SIDE") {
        const listingAmount = parseFloat(commissionData.listingAmount) || 0;
        calculatedAwardAmount = listingAmount.toFixed(2);
      } else if (classification === "SELLING SIDE") {
        const sellingAmount = parseFloat(commissionData.sellingAmount) || 0;
        calculatedAwardAmount = sellingAmount.toFixed(2);
      } else if (classification === "CO-OPERATING SIDE") {
        const sellingAmount = parseFloat(commissionData.sellingAmount) || 0;
        calculatedAwardAmount = sellingAmount.toFixed(2);
      } else {
        calculatedAwardAmount = "0.00";
      }

      const updatedAgent = {
        ...agent,
        awardAmount: calculatedAwardAmount,
      };
      setAgent(calculateFees(updatedAgent));
    }
  }, [classification, commissionData]);

  // Set classification from KeyInfoForm when available
  useEffect(() => {
    if (classification) {
      setAgent((prev) => ({
        ...prev,
        classification: classification,
      }));

      // Clear agent information when switching to CO-OPERATING SIDE
      if (classification === "CO-OPERATING SIDE") {
        setAgent((prev) => ({
          ...prev,
          agentId: "",
          agentName: "",
        }));
        // Clear validation errors when switching classification
        setValidationErrors((prev) => ({
          ...prev,
          agentId: "",
          agentName: "",
        }));
      }
    }
  }, [classification]);

  // Auto-populate agent information from selected listing (only for new trades and LISTING SIDE)
  useEffect(() => {
    console.log("selectedListing in AgentCommissionInfo:", selectedListing);
    console.log("selectedListing type:", typeof selectedListing);
    console.log(
      "selectedListing keys:",
      selectedListing ? Object.keys(selectedListing) : "null"
    );
    console.log("isEditingExistingTrade:", isEditingExistingTrade);
    console.log("classification:", classification);

    // Only auto-populate from selectedListing if we're not editing an existing trade
    if (isEditingExistingTrade) {
      console.log(
        "Editing existing trade - not auto-populating from selectedListing"
      );
      return;
    }

    // Only auto-populate if classification is LISTING SIDE
    if (classification !== "LISTING SIDE") {
      console.log(
        "Classification is not LISTING SIDE - not auto-populating agent information"
      );
      return;
    }

    if (selectedListing) {
      console.log("selectedListing.agent:", selectedListing.agent);
      console.log("selectedListing.agents:", selectedListing.agents);

      let listingAgent = null;

      // Check if agent is in the agents array first (this is the primary location)
      if (selectedListing.agents && selectedListing.agents.length > 0) {
        console.log(
          "Found agent in selectedListing.agents[0]:",
          selectedListing.agents[0]
        );
        listingAgent = selectedListing.agents[0];
      }
      // Check if agent is in the agent property (fallback)
      else if (selectedListing.agent) {
        console.log(
          "Found agent in selectedListing.agent:",
          selectedListing.agent
        );
        listingAgent = selectedListing.agent;
      }

      if (listingAgent) {
        console.log("listingAgent to use:", listingAgent);
        console.log("listingAgent keys:", Object.keys(listingAgent));

        // Handle both data structures
        let agentId = "";
        let agentName = "";

        if (selectedListing.agents && selectedListing.agents.length > 0) {
          // Using agents array structure
          agentId = listingAgent.agentNo?.toString() || "";
          agentName = `${listingAgent.firstName || ""} ${
            listingAgent.lastName || ""
          }`.trim();
        } else if (selectedListing.agent) {
          // Using singular agent structure
          agentId = listingAgent.employeeNo?.toString() || "";
          // For singular agent, we need to get the name from the agents array if available
          if (selectedListing.agents && selectedListing.agents.length > 0) {
            const agentFromArray = selectedListing.agents[0];
            agentName = `${agentFromArray.firstName || ""} ${
              agentFromArray.lastName || ""
            }`.trim();
          } else {
            agentName = ""; // No name available in singular agent structure
          }
        }

        console.log("Calculated agentId:", agentId);
        console.log("Calculated agentName:", agentName);

        if (agentId && agentName) {
          setAgent((prev) => ({
            ...prev,
            agentId: agentId,
            agentName: agentName,
          }));
          // Clear validation errors when agent is auto-populated
          setValidationErrors((prev) => ({
            ...prev,
            agentId: "",
            agentName: "",
          }));
        } else {
          console.log("Agent ID or name is missing, not setting agent data");
        }
      } else {
        console.log("No agent found in selectedListing");
      }
    }
  }, [selectedListing, isEditingExistingTrade, classification]);

  const validateForm = () => {
    const errors = {};
    if (!String(agent.agentId || "").trim()) {
      errors.agentId = "Agent ID is required";
    }
    if (!String(agent.agentName || "").trim()) {
      errors.agentName = "Agent Name is required";
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the validation errors.");
    }
    return Object.keys(errors).length === 0;
  };

  const handleAgentInputChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...agent, [name]: value };
    if (name === "percentage") {
      const award = parseFloat(agent.awardAmount) || 0;
      const perc = parseFloat(value) || 0;
      const amount = ((award * perc) / 100).toFixed(2);
      updated.amount = amount;
    }
    setAgent(calculateFees(updated));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAgentSelect = (e) => {
    const selectedId = e.target.value;
    const selected = agentList.find((a) => a._id === selectedId);
    if (selected) {
      setAgent((prev) => ({
        ...prev,
        agentId: selected.employeeNo,
        agentName: `${selected.firstName} ${selected.lastName}`,
      }));
      // Clear validation errors
      setValidationErrors((prev) => ({
        ...prev,
        agentId: "",
        agentName: "",
      }));
    } else {
      setAgent((prev) => ({ ...prev, agentId: "", agentName: "" }));
    }
  };

  const calculateFees = (agentObj) => {
    const amount = parseFloat(agentObj.amount) || 0;
    let feesDeducted = 0;

    // Calculate amount based on award amount and percentage
    const awardAmount = parseFloat(agentObj.awardAmount) || 0;
    const percentage = parseFloat(agentObj.percentage) || 0;
    const calculatedAmount = (awardAmount * percentage) / 100;

    // Calculate tax (15% of amount)
    const tax = calculatedAmount * 0.15;
    const total = calculatedAmount + tax;

    // Calculate fees deducted based on fee plan
    switch (agentObj.feeInfo) {
      case "plan250":
        feesDeducted = 250;
        break;
      case "plan500":
        feesDeducted = 500;
        break;
      case "plan9010":
        feesDeducted = calculatedAmount * 0.1; // 10% of amount
        break;
      case "plan8515":
        feesDeducted = calculatedAmount * 0.15; // 15% of amount
        break;
      case "plan955":
        feesDeducted = calculatedAmount * 0.05; // 5% of amount
        break;
      case "plan5050":
        feesDeducted = calculatedAmount * 0.5; // 50% of amount
        break;
      case "plan8020":
        feesDeducted = calculatedAmount * 0.2; // 20% of amount
        break;
      case "plan150":
        feesDeducted = 150;
        break;
      case "flexible":
        feesDeducted = parseFloat(agentObj.feesDeducted) || 0; // Use user input
        break;
      default:
        feesDeducted = 0;
    }

    // Calculate tax on fees (15%)
    const taxOnFees = feesDeducted * 0.15;
    const totalFees = feesDeducted + taxOnFees;

    // Calculate net commission
    const netCommission = total - totalFees;

    return {
      ...agentObj,
      amount: calculatedAmount.toFixed(2),
      feesDeducted:
        agentObj.feeInfo === "flexible"
          ? agentObj.feesDeducted
          : feesDeducted.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      taxOnFees: taxOnFees.toFixed(2),
      totalFees: totalFees.toFixed(2),
      netCommission: netCommission.toFixed(2),
    };
  };

  const handleAddAgent = (e) => {
    e.preventDefault();

    // Validate mandatory fields
    if (!validateForm()) {
      return;
    }

    // Store the agent data and show buyer rebate popup
    setPendingAgent(agent);
    setShowBuyerRebateModal(true);
  };

  const handleCancelBuyerRebate = () => {
    setShowBuyerRebateModal(false);
    setBuyerRebateIncluded("no");
    setBuyerRebateAmount("");
    setPendingAgent(null);
  };

  const handleEdit = () => {
    if (agents.length === 0) return;

    // Start editing the first agent (you can modify this to select specific agent)
    const agentToEdit = agents[0];
    setAgent(agentToEdit);
    setEditingIndex(0);

    // Set buyer rebate state if it exists
    if (agentToEdit.buyerRebateIncluded) {
      setBuyerRebateIncluded(agentToEdit.buyerRebateIncluded);
      setBuyerRebateAmount(agentToEdit.buyerRebateAmount || "");
    }
  };

  const handleUpdateAgent = (e) => {
    e.preventDefault();

    // Validate mandatory fields
    if (!validateForm()) {
      return;
    }

    // Store the agent data and show buyer rebate popup for update
    setPendingAgent(agent);
    setShowBuyerRebateModal(true);
  };

  const handleBuyerRebateSubmit = () => {
    if (!pendingAgent) return;

    let finalNetCommission = parseFloat(pendingAgent.netCommission) || 0;

    if (buyerRebateIncluded === "yes" && buyerRebateAmount) {
      const rebateAmount = parseFloat(buyerRebateAmount) || 0;
      finalNetCommission = finalNetCommission - rebateAmount;
    }

    const agentWithRebate = {
      ...pendingAgent,
      netCommission: finalNetCommission.toFixed(2),
      buyerRebateIncluded: buyerRebateIncluded,
      buyerRebateAmount: buyerRebateIncluded === "yes" ? buyerRebateAmount : "",
    };

    if (editingIndex !== null) {
      // Update existing agent
      const updatedAgents = [...agents];
      updatedAgents[editingIndex] = agentWithRebate;
      setAgents(updatedAgents);
      setEditingIndex(null);
    } else {
      // Add new agent
      setAgents([...agents, agentWithRebate]);
    }

    setAgent(initialAgent);

    // Reset popup state
    setShowBuyerRebateModal(false);
    setBuyerRebateIncluded("no");
    setBuyerRebateAmount("");
    setPendingAgent(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setAgent(initialAgent);
    setBuyerRebateIncluded("no");
    setBuyerRebateAmount("");
    setValidationErrors({});
  };

  const handleDelete = () => {
    if (agents.length === 0) return;

    // Show delete confirmation for the first agent (you can modify this to select specific agent)
    setDeletingIndex(0);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingIndex !== null) {
      const updatedAgents = agents.filter(
        (_, index) => index !== deletingIndex
      );
      setAgents(updatedAgents);
    }
    setShowDeleteModal(false);
    setDeletingIndex(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingIndex(null);
  };

  // Sale Closing Info Handlers (for table only)
  const handleSaleClosingChange = (e) => {
    const { name, value } = e.target;
    setSaleClosing((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddSaleClosing = (e) => {
    e.preventDefault();
    setSaleClosingRows([...saleClosingRows, saleClosing]);
    setSaleClosing(initialSaleClosing);
  };

  const handleSaveTradeClick = async () => {
    // Prevent multiple clicks if already saving or trade is already saved
    if (isSaving || isTradeSaved) {
      return;
    }

    console.log(
      "Attempting to save trade. Current list of added agents:",
      agents
    );

    // Check if the form has data for a new agent that hasn't been added yet.
    const isDirty =
      agent.agentName !== "" && agent.agentId !== "" && editingIndex === null;

    if (isDirty) {
      console.log("Unsaved agent form data detected:", agent);
      alert(
        "You have unsaved agent information in the form. Please click 'Add Agent' to add it to the list before saving the entire trade."
      );
      return;
    }

    try {
      setIsSaving(true);
      await onSaveTrade();
      setIsTradeSaved(true);
      toast.success("Trade saved successfully!");
    } catch (error) {
      console.error("Error saving trade:", error);
      toast.error("Failed to save trade. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Agent Commission Information</h2>
      <form
        className="mb-6"
        onSubmit={editingIndex !== null ? handleUpdateAgent : handleAddAgent}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent <span className="text-red-500">*</span>
            </label>
            {agent.classification === "CO-OPERATING SIDE" ? (
              // Dropdown for CO-OPERATING SIDE
              <select
                name="agentSelect"
                value={
                  agentList.find((a) => a.employeeNo === agent.agentId)?._id ||
                  ""
                }
                onChange={handleAgentSelect}
                className={`block w-full rounded-md shadow-sm focus:border-blue-700 focus:ring-blue-700 mb-1 ${
                  validationErrors.agentId
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select an agent</option>
                {agentList.map((agentItem) => (
                  <option key={agentItem._id} value={agentItem._id}>
                    {agentItem.employeeNo} - {agentItem.firstName}{" "}
                    {agentItem.lastName}
                  </option>
                ))}
              </select>
            ) : (
              // Text inputs for other classifications
              <>
                <input
                  name="agentId"
                  value={agent.agentId}
                  onChange={handleAgentInputChange}
                  placeholder="ID"
                  className={`block w-full rounded-md shadow-sm focus:border-blue-700 focus:ring-blue-700 mb-1 ${
                    validationErrors.agentId
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  readOnly={agent.classification === "LISTING SIDE"}
                />
                <input
                  name="agentName"
                  value={agent.agentName}
                  onChange={handleAgentInputChange}
                  placeholder="Agent Name"
                  className={`block w-full rounded-md shadow-sm focus:border-blue-700 focus:ring-blue-700 ${
                    validationErrors.agentName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  readOnly={agent.classification === "LISTING SIDE"}
                />
              </>
            )}
            {agent.classification === "LISTING SIDE" && (
              <p className="text-xs text-gray-500 mt-1">
                Auto-populated from listing agent information
              </p>
            )}
            {agent.classification === "CO-OPERATING SIDE" && (
              <p className="text-xs text-gray-500 mt-1">
                Please select the co-operating agent from the dropdown
              </p>
            )}
            {validationErrors.agentId && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.agentId}
              </p>
            )}
            {validationErrors.agentName && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.agentName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classification
            </label>
            <input
              name="classification"
              value={agent.classification}
              readOnly
              className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Automatically populated from Key Info Form
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead
            </label>
            <select
              name="lead"
              value={agent.lead}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YTD Commission
            </label>
            <select
              name="ytdCommission"
              value={agent.ytdCommission}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Info
            </label>
            <select
              name="feeInfo"
              value={agent.feeInfo}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            >
              {feePlans.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award Amount
            </label>
            <input
              name="awardAmount"
              value={agent.awardAmount}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 bg-gray-100"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated from Commission Income selling amount
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage
            </label>
            <input
              name="percentage"
              value={agent.percentage}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              name="amount"
              value={agent.amount}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax
            </label>
            <input
              name="tax"
              value={agent.tax}
              readOnly
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total
            </label>
            <input
              name="total"
              value={agent.total}
              readOnly
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fees Deducted
            </label>
            <input
              name="feesDeducted"
              value={agent.feesDeducted}
              onChange={handleAgentInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
              readOnly={agent.feeInfo !== "flexible"}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Fees
            </label>
            <input
              name="totalFees"
              value={agent.totalFees}
              readOnly
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Net Commission
            </label>
            <input
              name="netCommission"
              value={agent.netCommission}
              readOnly
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 bg-gray-100"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-2 rounded font-semibold"
          >
            {editingIndex !== null ? "Update Agent" : "Add Agent"}
          </button>
        </div>
      </form>

      {/* Buyer Rebate Modal */}
      {showBuyerRebateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Buyer Rebate Confirmation
            </h3>
            <p className="mb-4">Is buyer rebate included in this commission?</p>

            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="buyerRebateIncluded"
                  value="yes"
                  checked={buyerRebateIncluded === "yes"}
                  onChange={(e) => setBuyerRebateIncluded(e.target.value)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="buyerRebateIncluded"
                  value="no"
                  checked={buyerRebateIncluded === "no"}
                  onChange={(e) => setBuyerRebateIncluded(e.target.value)}
                  className="mr-2"
                />
                No
              </label>
            </div>

            {buyerRebateIncluded === "yes" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer Rebate Amount
                </label>
                <input
                  type="number"
                  value={buyerRebateAmount}
                  onChange={(e) => setBuyerRebateAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            )}

            {buyerRebateIncluded === "yes" && buyerRebateAmount && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm">
                  <strong>Original Net Commission:</strong> $
                  {pendingAgent?.netCommission}
                  <br />
                  <strong>Buyer Rebate:</strong> ${buyerRebateAmount}
                  <br />
                  <strong>Final Net Commission:</strong> $
                  {(
                    parseFloat(pendingAgent?.netCommission || 0) -
                    parseFloat(buyerRebateAmount || 0)
                  ).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelBuyerRebate}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuyerRebateSubmit}
                className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Confirmation</h3>
            <p className="mb-4">
              Are you sure you want to delete this agent commission record?
            </p>
            <p className="mb-6 text-sm text-gray-600">
              Agent: {agents[deletingIndex]?.agentName}
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="font-semibold text-lg mb-2">Agents List</h3>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b border-r text-left">Agent</th>
              <th className="px-4 py-2 border-b border-r text-left">
                Classification
              </th>
              <th className="px-4 py-2 border-b border-r text-left">Lead</th>
              <th className="px-4 py-2 border-b border-r text-left">Amount</th>
              <th className="px-4 py-2 border-b border-r text-left">Tax</th>
              <th className="px-4 py-2 border-b border-r text-left">Total</th>
              <th className="px-4 py-2 border-b border-r text-left">Fees</th>
              <th className="px-4 py-2 border-b border-r text-left">Net</th>
              <th className="px-4 py-2 border-b text-left">Buyer Rebate</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No agents added yet.
                </td>
              </tr>
            ) : (
              agents.map((a, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 border-b border-r">{a.agentName}</td>
                  <td className="px-4 py-2 border-b border-r">
                    {a.classification}
                  </td>
                  <td className="px-4 py-2 border-b border-r">{a.lead}</td>
                  <td className="px-4 py-2 border-b border-r">{a.amount}</td>
                  <td className="px-4 py-2 border-b border-r">{a.tax}</td>
                  <td className="px-4 py-2 border-b border-r">{a.total}</td>
                  <td className="px-4 py-2 border-b border-r">
                    {a.feesDeducted}
                  </td>
                  <td className="px-4 py-2 border-b border-r">
                    {a.netCommission}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {a.buyerRebateIncluded === "yes"
                      ? `$${a.buyerRebateAmount}`
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {agents.length > 0 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => {
                setEditingIndex(0);
                setAgent(agents[0]);
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDeletingIndex(0);
                setShowDeleteModal(true);
              }}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Fees Deduction Table */}
      <h3 className="font-semibold text-lg mb-2">Fees Deduction</h3>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b border-r text-left">
                Fee Type
              </th>
              <th className="px-4 py-2 border-b border-r text-left">
                Deducted Fee
              </th>
              <th className="px-4 py-2 border-b text-left">Taxed</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No fees deduction entries yet.
                </td>
              </tr>
            ) : (
              agents.map((a, idx) => (
                <>
                  {/* Fee Info Row */}
                  <tr key={`${idx}-fee`}>
                    <td className="px-4 py-2 border-b border-r">
                      {getPaymentPlanDisplayName(a.feeInfo)}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      ${a.feesDeducted}
                    </td>
                    <td className="px-4 py-2 border-b">Yes</td>
                  </tr>
                  {/* Buyer Rebate Row (if exists) */}
                  {a.buyerRebateIncluded === "yes" && (
                    <tr key={`${idx}-rebate`}>
                      <td className="px-4 py-2 border-b border-r">
                        Buyer Rebate
                      </td>
                      <td className="px-4 py-2 border-b border-r">
                        ${a.buyerRebateAmount}
                      </td>
                      <td className="px-4 py-2 border-b">No</td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Save Button - Only show when not in edit mode */}
      {!isEditMode && (
        <div className="flex justify-end mt-8">
          <button
            type="button"
            className={`px-6 py-2 rounded font-semibold ${
              isSaving || isTradeSaved
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-900 text-white hover:bg-blue-800"
            }`}
            onClick={handleSaveTradeClick}
            disabled={isSaving || isTradeSaved}
          >
            {isSaving
              ? "Saving..."
              : isTradeSaved
              ? "Trade Saved"
              : "Save Trade"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentCommissionInfo;
