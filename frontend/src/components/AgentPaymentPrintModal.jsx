import React, { useState, useEffect } from "react";
import axiosInstance from "../config/axios";

const AgentPaymentPrintModal = ({ isOpen, onClose, onPrint }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      const response = await axiosInstance.get("/agents");
      const sortedAgents = response.data.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        )
      );
      setAgents(sortedAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleProceed = async () => {
    if (!selectedAgent || !fromDate || !toDate) {
      alert("Please select an agent and both date fields");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch filtered EFT data
      const eftResponse = await axiosInstance.get("/commission-trust-eft");
      const efts = eftResponse.data.filter(
        (eft) => eft.type === "AgentCommissionTransfer"
      );

      // Get selected agent details
      const selectedAgentData = agents.find((a) => a._id === selectedAgent);
      const selectedAgentName = selectedAgentData
        ? `${selectedAgentData.firstName} ${selectedAgentData.lastName}`
        : "";
      const selectedAgentEmployeeNo = selectedAgentData?.employeeNo?.toString();

      // Filter by selected agent and date range
      const filteredEfts = efts.filter((eft) => {
        const eftDate = new Date(eft.date);
        const from = new Date(fromDate);
        const to = new Date(toDate);

        // Check if agent matches (try multiple matching strategies)
        const agentMatches =
          eft.agentId === selectedAgentEmployeeNo ||
          eft.agentId === selectedAgent ||
          eft.agentName === selectedAgentName ||
          eft.agentName ===
            selectedAgentData?.firstName + " " + selectedAgentData?.lastName;

        // Check if date is within range
        const dateMatches = eftDate >= from && eftDate <= to;

        return agentMatches && dateMatches;
      });

      // Fetch agent details
      const agentsResponse = await axiosInstance.get("/agents");
      const allAgents = agentsResponse.data;

      // Combine the data
      const combinedData = filteredEfts.map((eft) => {
        const agent = allAgents.find(
          (a) =>
            a.employeeNo?.toString() === eft.agentId || a._id === eft.agentId
        );

        const trade = eft.tradeId;

        let agentCommission = null;
        if (
          trade?.agentCommissionList &&
          trade.agentCommissionList.length > 0
        ) {
          agentCommission = trade.agentCommissionList.find(
            (ac) => ac.agentId === eft.agentId
          );

          if (!agentCommission) {
            agentCommission = trade.agentCommissionList.find(
              (ac) => ac.agentName === eft.agentName
            );
          }

          if (!agentCommission && agent?.employeeNo) {
            agentCommission = trade.agentCommissionList.find(
              (ac) => ac.agentId === agent.employeeNo.toString()
            );
          }

          if (!agentCommission && trade.agentCommissionList.length === 1) {
            agentCommission = trade.agentCommissionList[0];
          }
        }

        let calculatedFees = "0.00";
        if (!agentCommission?.totalFees && agent?.feeInfo) {
          const feePlan = agent.feeInfo;
          let baseFee = 0;

          switch (feePlan) {
            case "plan250":
              baseFee = 250;
              break;
            case "plan500":
              baseFee = 500;
              break;
            case "plan9010":
              baseFee = parseFloat(eft.amount) * 0.1;
              break;
            case "plan955":
              baseFee = parseFloat(eft.amount) * 0.05;
              break;
            case "plan8515":
              baseFee = parseFloat(eft.amount) * 0.15;
              break;
            default:
              baseFee = 0;
          }

          const taxOnFees = baseFee * 0.15;
          calculatedFees = (baseFee + taxOnFees).toFixed(2);
        }

        return {
          agentId: agent?.employeeNo || eft.agentId,
          agentName: eft.agentName || agent?.firstName + " " + agent?.lastName,
          eftNumber: eft.eftNumber,
          tradeNumber: trade?.tradeNumber,
          planInfo: getPlanDisplayName(
            agent?.feeInfo || agentCommission?.feeInfo
          ),
          netCommission: eft.amount,
          feesDeducted: agentCommission?.totalFees || calculatedFees,
          date: eft.date,
          tradeAddress: trade?.keyInfo
            ? `${trade.keyInfo.streetNumber || ""} ${
                trade.keyInfo.streetName || ""
              }`.trim()
            : "",
        };
      });

      // Sort by date (newest first)
      combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      const agentName = selectedAgentName || "Unknown Agent";

      onPrint(combinedData, agentName, fromDate, toDate);
      onClose();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanDisplayName = (feeInfo) => {
    if (!feeInfo) return "N/A";

    const planMap = {
      plan250: "Plan 250",
      plan500: "Plan 500",
      plan9010: "Plan 90/10",
      plan955: "Plan 95/5",
      plan8515: "Plan 85/15",
      plan5050: "Plan 50/50",
      plan8020: "Plan 80/20",
      plan150: "Plan 150",
      flatFee: "Flat Fee",
      garnishment: "Garnishment",
      buyerRebate: "Buyer Rebate",
      noFee: "No Fee",
    };

    return planMap[feeInfo] || feeInfo;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Print Agent Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.employeeNo} - {agent.firstName} {agent.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentPaymentPrintModal;
