import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import EFTReceipt from "./EFTReceipt";
import toast from "react-hot-toast";
import {
  checkCommissionTrustEFT,
  getEFTTypeDisplayName,
  formatDate,
  getPartyNamesByDealType,
} from "../utils/eftUtils";
import axiosInstance from "../config/axios";

const CommissionTrustPayments = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("outside-brokers");
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showEFTReceipt, setShowEFTReceipt] = useState(false);
  const [eftNumber, setEftNumber] = useState(null);
  const [eftReceiptData, setEftReceiptData] = useState(null);
  const [isOurBrokerageEFT, setIsOurBrokerageEFT] = useState(false);

  // Add state to track EFT creation status
  const [eftCreated, setEftCreated] = useState({
    agentCommission: false,
    outsideBrokersCommission: false,
    ourBrokerageCommission: false,
  });

  // Agent Commission form state
  const [agentCommissionForm, setAgentCommissionForm] = useState({
    name: "Agent Commission transfer form",
    chequeType: "lorem ipsum",
    tradeNumber: "",
    selectedTrade: null,
    selectedAgentId: "",
  });

  // Outside Brokers Commission form state
  const [outsideBrokersForm, setOutsideBrokersForm] = useState({
    name: "Outside Brokers Commission Transfer Form",
    type: "EFT",
    tradeNumber: "",
    selectedTrade: null,
    selectedOutsideBroker: null,
  });

  // Outside Brokers Commission details form state
  const [showOutsideBrokersDetailsForm, setShowOutsideBrokersDetailsForm] =
    useState(false);
  const [outsideBrokersDetailsForm, setOutsideBrokersDetailsForm] = useState({
    chequeDate: new Date().toISOString().split("T")[0],
    bankAccount: "Commission Trust",
    outsideBrokerName: "",
    outsideBrokerCompany: "",
    tradeNumber: "",
    address: "",
    netCommission: "",
    netCheque: "",
    noteOnStub: "Transfer commission to outside broker",
  });
  const [showOutsideBrokersReceipt, setShowOutsideBrokersReceipt] =
    useState(false);
  const [outsideBrokersReceiptData, setOutsideBrokersReceiptData] =
    useState(null);

  // Our Brokerage Commission form state
  const [ourBrokerageForm, setOurBrokerageForm] = useState({
    tradeNumber: "",
    selectedTrade: null,
  });
  const [showOurBrokerageDetailsForm, setShowOurBrokerageDetailsForm] =
    useState(false);

  // Fetch trades on component mount
  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await axiosInstance.get("/trades");
      setTrades(response.data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  };

  // Handle trade number search for outside brokers
  const handleOutsideBrokersTradeSearch = (searchTerm) => {
    setOutsideBrokersForm((prev) => ({
      ...prev,
      tradeNumber: searchTerm,
      selectedTrade: null,
      selectedOutsideBroker: null,
    }));

    if (searchTerm.trim() === "") {
      setFilteredTrades([]);
      setShowTradeDropdown(false);
      return;
    }

    const filtered = trades.filter(
      (trade) =>
        trade.tradeNumber.toString().includes(searchTerm) ||
        `${trade.keyInfo?.streetNumber || ""} ${
          trade.keyInfo?.streetName || ""
        }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    setFilteredTrades(filtered);
    setShowTradeDropdown(true);
  };

  // Select trade from dropdown for outside brokers
  const selectOutsideBrokersTrade = async (trade) => {
    const address = `${trade.keyInfo?.streetNumber || ""} ${
      trade.keyInfo?.streetName || ""
    }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();
    try {
      // Check if Outside Broker Commission EFT already exists for this trade
      const existingEFT = await checkCommissionTrustEFT(
        trade._id,
        "OutsideBrokerCommission"
      );

      if (existingEFT.exists) {
        toast.error(
          `Payment already completed for Trade #${trade.tradeNumber}! 
          EFT #${existingEFT.eftNumber} was created on ${formatDate(
            existingEFT.date
          )} 
          for ${getEFTTypeDisplayName(existingEFT.type)}.`,
          { duration: 6000 }
        );
        // Set EFT as created to disable the button
        setEftCreated((prev) => ({ ...prev, outsideBrokersCommission: true }));
        return;
      }

      const response = await axiosInstance.get(`/trades/${trade._id}`);
      const fullTrade = response.data;
      setOutsideBrokersForm((prev) => ({
        ...prev,
        tradeNumber: `${trade.tradeNumber} - ${address}`,
        selectedTrade: fullTrade,
        selectedOutsideBroker: null, // Reset outside broker selection
      }));
      setShowTradeDropdown(false);
    } catch (error) {
      console.error("Error fetching full trade details:", error);
      toast.error("Could not load trade details. Please try again.");
    }
  };

  // Handle outside brokers form submission
  const handleOutsideBrokersSubmit = (e) => {
    e.preventDefault();
    if (
      outsideBrokersForm.selectedTrade &&
      outsideBrokersForm.selectedOutsideBroker
    ) {
      setShowOutsideBrokersDetailsForm(true);
    } else if (!outsideBrokersForm.selectedTrade) {
      alert("Please select a trade to proceed.");
    } else {
      alert("Please select an outside broker to proceed.");
    }
  };

  // Handle trade number search for agent commission
  const handleAgentCommissionTradeSearch = (searchTerm) => {
    setAgentCommissionForm((prev) => ({
      ...prev,
      tradeNumber: searchTerm,
      selectedTrade: null,
      selectedAgentId: "",
    }));

    if (searchTerm.trim() === "") {
      setFilteredTrades([]);
      setShowTradeDropdown(false);
      return;
    }

    const filtered = trades.filter(
      (trade) =>
        trade.tradeNumber.toString().includes(searchTerm) ||
        `${trade.keyInfo?.streetNumber || ""} ${
          trade.keyInfo?.streetName || ""
        }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    setFilteredTrades(filtered);
    setShowTradeDropdown(true);
  };

  // Select trade from dropdown for agent commission
  const selectAgentCommissionTrade = async (trade) => {
    const address = `${trade.keyInfo?.streetNumber || ""} ${
      trade.keyInfo?.streetName || ""
    }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();
    try {
      // Check if Agent Commission Transfer EFT already exists for this trade
      const existingEFT = await checkCommissionTrustEFT(
        trade._id,
        "AgentCommissionTransfer"
      );

      if (existingEFT.exists) {
        toast.error(
          `Payment already completed for Trade #${trade.tradeNumber}! 
          EFT #${existingEFT.eftNumber} was created on ${formatDate(
            existingEFT.date
          )} 
          for ${getEFTTypeDisplayName(existingEFT.type)}.`,
          { duration: 6000 }
        );
        // Set EFT as created to disable the button
        setEftCreated((prev) => ({ ...prev, agentCommission: true }));
        return;
      }

      const response = await axiosInstance.get(`/trades/${trade._id}`);
      const fullTrade = response.data;
      setAgentCommissionForm((prev) => ({
        ...prev,
        tradeNumber: `${trade.tradeNumber} - ${address}`,
        selectedTrade: fullTrade,
        selectedAgentId: "", // Reset agent selection
      }));
      setShowTradeDropdown(false);
    } catch (error) {
      console.error("Error fetching full trade details:", error);
      toast.error("Could not load trade details. Please try again.");
    }
  };

  // Handle agent commission form submission
  const handleAgentCommissionSubmit = (e) => {
    e.preventDefault();
    if (
      agentCommissionForm.selectedTrade &&
      agentCommissionForm.selectedAgentId
    ) {
      setShowDetailsForm(true);
    } else if (!agentCommissionForm.selectedTrade) {
      alert("Please select a trade to proceed.");
    } else {
      alert("Please select an agent to proceed.");
    }
  };

  const handleAgentCommissionEFTClick = async (formState) => {
    if (
      !agentCommissionForm.selectedTrade ||
      !agentCommissionForm.selectedAgentId
    ) {
      alert("No trade or agent selected.");
      return;
    }
    const trade = agentCommissionForm.selectedTrade;

    const selectedAgent = trade.agentCommissionList?.find(
      (agent) => agent.agentId === agentCommissionForm.selectedAgentId
    );

    if (!selectedAgent) {
      alert("Selected agent not found.");
      return;
    }

    try {
      console.log("Selected agent:", selectedAgent);
      console.log("Agent ID:", selectedAgent.agentId);

      // 1. Fetch Company Profile (optional - use default if not available)
      console.log("Fetching company profile...");
      let companyInfo = null;
      try {
        const companyProfileRes = await axiosInstance.get("/company-profile");
        companyInfo = companyProfileRes.data;
        console.log("Company info:", companyInfo);
      } catch (companyError) {
        if (companyError.response?.status === 404) {
          console.log("Company profile not found, using default values");
          // Use default company info if profile doesn't exist
          companyInfo = {
            companyName: "Bestway Real Estate Ltd., Brokerage",
            address: "Company Address",
            city: "City",
            province: "Province",
            postalCode: "Postal Code",
            phone: "Phone",
            fax: "Fax",
            email: "email@company.com",
          };
        } else {
          throw companyError;
        }
      }

      // 2. Fetch Agent's full details for address
      console.log(
        "Fetching agent details for employee number:",
        selectedAgent.agentId
      );
      const agentDetailsRes = await axiosInstance.get(
        `/agents/employee/${selectedAgent.agentId}`
      );
      const agentDetails = agentDetailsRes.data;
      console.log("Agent details:", agentDetails);

      // 3. Create EFT record in the database
      const netCommission = parseFloat(selectedAgent.netCommission || 0);
      console.log("Creating EFT for amount:", netCommission);
      const eftResponse = await axiosInstance.post(
        "/commission-trust-eft/agent-commission",
        {
          tradeId: trade._id,
          amount: netCommission,
          recipient: selectedAgent.agentName,
          agentId: selectedAgent.agentId,
          agentName: selectedAgent.agentName,
          chequeDate: formState.chequeDate,
        }
      );
      const newEftNumber = eftResponse.data.eftNumber;
      console.log("EFT created with number:", newEftNumber);

      // 4. Post transaction - Credit to 10003 Cash - Commission Trust Account, debit commission expense
      console.log("Posting transaction...");
      await axiosInstance.post("/transactions", {
        date: (() => {
          const [month, day, year] = formState.chequeDate.split("/");
          return new Date(
            `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
          );
        })(),
        reference: `EFT#${newEftNumber}`,
        description: "Agent Commission Payment",
        debitAccount: "A/P - GENERAL & COMMISSION EXPENSE", // Debit commission expense account
        creditAccount: "CASH - COMMISSION TRUST ACCOUNT", // Credit to 10003
        amount: netCommission,
        tradeId: trade._id,
      });

      await axiosInstance.post("/finance-transactions", {
        type: "AgentCommissionPayment",
        chequeDate: (() => {
          const [month, day, year] = formState.chequeDate.split("/");
          return new Date(
            `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`
          );
        })(),
        amount: netCommission,
        chequeWrittenTo: selectedAgent.agentName,
        tradeId: trade._id,
      });

      // 5. Prepare data for the receipt
      const partyNames = getPartyNamesByDealType(trade);
      const sellers = partyNames.firstParty;
      const buyers = partyNames.secondParty;
      const tradeAddress = `${trade.keyInfo?.streetNumber || ""} ${
        trade.keyInfo?.streetName || ""
      }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();

      // Build the address string from agent details
      const agentAddress = `${agentDetails.streetNumber || ""} ${
        agentDetails.streetName || ""
      }`.trim();
      const agentUnit = agentDetails.unit ? ` Unit ${agentDetails.unit}` : "";
      const agentCityProvincePostal = `${agentDetails.city || ""}, ${
        agentDetails.province || ""
      }, ${agentDetails.postalCode || ""}`.trim();

      const dataForReceipt = {
        companyInfo: companyInfo,
        eftNumber: newEftNumber,
        paidTo: {
          name: selectedAgent.agentName,
          address: agentAddress,
        },
        trade: tradeAddress,
        notes: "Transfer commission to agent",
        amount: netCommission,
        seller: sellers,
        buyer: buyers,
        firstPartyLabel: partyNames.firstPartyLabel,
        secondPartyLabel: partyNames.secondPartyLabel,
        payTo: selectedAgent.agentName,
        orderOf: {
          address: `${agentAddress}${agentUnit}`,
          cityProvincePostal: agentCityProvincePostal,
        },
        note: `${trade.tradeNumber} ${tradeAddress}`,
        chequeDate: formState.chequeDate,
      };

      setEftReceiptData(dataForReceipt);
      setIsOurBrokerageEFT(false);
      setShowEFTReceipt(true);
      // Set EFT as created to disable the button
      setEftCreated((prev) => ({ ...prev, agentCommission: true }));
      toast.success(
        "Transaction posted to Chart of Accounts and Ledger successfully!"
      );
    } catch (error) {
      console.error("Error during EFT process:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Provide more specific error messages based on the error
      if (error.response?.status === 404) {
        toast.error(
          "Required data not found. Please ensure all required information is set up."
        );
      } else {
        toast.error("Failed to complete EFT process. Please try again.");
      }
    }
  };

  // Helper for mm/dd/yyyy format
  const getCurrentMDYDate = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(now.getMonth() + 1)}/${pad(
      now.getDate()
    )}/${now.getFullYear()}`;
  };

  // Agent Commission Details Form Component
  const AgentCommissionDetailsForm = ({ trade, selectedAgentId, onBack }) => {
    const [formState, setFormState] = useState({
      chequeDate: getCurrentMDYDate(),
      bankAccount: "Commission Trust",
      agentNumber: "",
      agentName: "",
      tradeNumber: "",
      address: "",
      netCommission: "",
      netCheque: "",
      noteOnStub: "Transfer commission to agent",
    });

    const [useCustomDate, setUseCustomDate] = useState(false);

    useEffect(() => {
      if (trade && selectedAgentId) {
        const selectedAgent =
          trade.agentCommissionList?.find(
            (agent) => agent.agentId === selectedAgentId
          ) || {};

        const netCommission = parseFloat(selectedAgent.netCommission || 0);

        const address = `${trade.keyInfo?.streetNumber || ""} ${
          trade.keyInfo?.streetName || ""
        }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();

        setFormState({
          chequeDate: getCurrentMDYDate(),
          bankAccount: "Commission Trust",
          agentNumber: selectedAgent.agentId || "",
          agentName: selectedAgent.agentName || "",
          tradeNumber: trade.tradeNumber,
          address: address,
          netCommission: netCommission.toFixed(2),
          netCheque: netCommission.toFixed(2),
          noteOnStub: "Transfer commission to agent",
        });
      }
    }, [trade, selectedAgentId]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg">
          Agent Commission Cheque Details
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cheque Date
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomDate"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="useCustomDate" className="text-sm text-gray-600">
                Override Date
              </label>
            </div>
            {useCustomDate ? (
              <input
                type="date"
                name="chequeDate"
                value={
                  formState.chequeDate.includes("/")
                    ? (() => {
                        const [month, day, year] =
                          formState.chequeDate.split("/");
                        return `${year}-${month.padStart(
                          2,
                          "0"
                        )}-${day.padStart(2, "0")}`;
                      })()
                    : formState.chequeDate
                }
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value + "T00:00:00");
                  const formattedDate = `${(selectedDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${selectedDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${selectedDate.getFullYear()}`;
                  setFormState((prev) => ({
                    ...prev,
                    chequeDate: formattedDate,
                  }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            ) : (
              <input
                type="text"
                name="chequeDate"
                value={formState.chequeDate}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Account
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formState.bankAccount}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Agent Number
            </label>
            <input
              type="text"
              name="agentNumber"
              value={formState.agentNumber}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Agent Name
            </label>
            <input
              type="text"
              name="agentName"
              value={formState.agentName}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trade #
            </label>
            <input
              type="text"
              name="tradeNumber"
              value={formState.tradeNumber}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formState.address}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Commission
            </label>
            <input
              type="text"
              name="netCommission"
              value={formState.netCommission}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Cheque
            </label>
            <input
              type="text"
              name="netCheque"
              value={formState.netCheque}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Note on Stub
          </label>
          <input
            type="text"
            name="noteOnStub"
            value={formState.noteOnStub}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
          />
        </div>

        <div className="flex justify-start space-x-4 mt-6">
          <button className="bg-gray-200 text-black py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
            Print
          </button>
          <button className="bg-gray-200 text-black py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
            Batch
          </button>
          <button
            onClick={() => handleAgentCommissionEFTClick(formState)}
            disabled={eftCreated.agentCommission}
            className={`py-2 px-6 rounded-md transition-colors ${
              eftCreated.agentCommission
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {eftCreated.agentCommission ? "EFT Created" : "E.F.T."}
          </button>
          <button
            onClick={onBack}
            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    );
  };

  const OutsideBrokersCommissionDetailsForm = ({
    trade,
    selectedOutsideBroker,
    onBack,
    eftCreated,
  }) => {
    const [formState, setFormState] = useState({
      chequeDate: getCurrentMDYDate(),
      bankAccount: "Commission Trust",
      outsideBrokerName: "",
      outsideBrokerCompany: "",
      outsideBrokerAddress: "",
      tradeNumber: "",
      address: "",
      netCommission: "",
      netCheque: "",
      noteOnStub: "Transfer commission to outside broker",
      seller: "",
      buyer: "",
    });

    const [useCustomDate, setUseCustomDate] = useState(false);

    useEffect(() => {
      if (trade && selectedOutsideBroker) {
        // Find the outside broker commission data
        const outsideBrokerCommission =
          trade.commission?.outsideBrokersRows?.find(
            (broker) =>
              broker.agentName === selectedOutsideBroker.agentName ||
              `${selectedOutsideBroker.firstName} ${selectedOutsideBroker.lastName}` ===
                broker.agentName
          ) || {};

        const netCommission = parseFloat(outsideBrokerCommission.total || 0);

        const address = `${trade.keyInfo?.streetNumber || ""} ${
          trade.keyInfo?.streetName || ""
        }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();

        // Get party names based on deal type
        const partyNames = getPartyNamesByDealType(trade);
        const sellers = partyNames.firstParty;
        const buyers = partyNames.secondParty;

        setFormState({
          chequeDate: getCurrentMDYDate(),
          bankAccount: "Commission Trust",
          outsideBrokerName:
            selectedOutsideBroker.agentName ||
            `${selectedOutsideBroker.firstName} ${selectedOutsideBroker.lastName}`,
          outsideBrokerCompany: selectedOutsideBroker.company || "",
          outsideBrokerAddress: selectedOutsideBroker.address || "",
          tradeNumber: trade.tradeNumber,
          address: address,
          netCommission: netCommission.toFixed(2),
          netCheque: netCommission.toFixed(2),
          noteOnStub: "Transfer commission to outside broker",
          seller: sellers,
          buyer: buyers,
        });
      }
    }, [trade, selectedOutsideBroker]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleEFTClick = async () => {
      const tradeAddress = `${trade.keyInfo?.streetNumber || ""} ${
        trade.keyInfo?.streetName || ""
      }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();

      // Get party names based on deal type
      const partyNames = getPartyNamesByDealType(trade);
      const sellers = partyNames.firstParty;
      const buyers = partyNames.secondParty;

      try {
        console.log("Creating EFT for outside broker commission...");
        console.log("Trade ID:", trade._id);
        console.log("Amount:", formState.netCommission);
        console.log("Recipient:", formState.outsideBrokerName);

        // 1. Fetch Company Profile (optional - use default if not available)
        let companyInfo = null;
        try {
          const companyProfileRes = await axiosInstance.get("/company-profile");
          companyInfo = companyProfileRes.data;
        } catch (companyError) {
          if (companyError.response?.status === 404) {
            console.log("Company profile not found, using default values");
            // Use default company info if profile doesn't exist
            companyInfo = {
              companyName: "Bestway Real Estate Ltd., Brokerage",
              address: "Company Address",
              city: "City",
              province: "Province",
              postalCode: "Postal Code",
              phone: "Phone",
              fax: "Fax",
              email: "email@company.com",
            };
          } else {
            throw companyError;
          }
        }

        // 2. Create EFT record
        const eftResponse = await axiosInstance.post(
          "/commission-trust-eft/outside-broker",
          {
            tradeId: trade._id,
            amount: Number(formState.netCommission),
            recipient: formState.outsideBrokerCompany
              ? `${formState.outsideBrokerName} - ${formState.outsideBrokerCompany}`
              : formState.outsideBrokerName,
            description: "Transfer commission to outside broker",
            chequeDate: formState.chequeDate,
          }
        );

        console.log("EFT Response:", eftResponse.data);
        const eftNumber = eftResponse.data.eftNumber;

        setOutsideBrokersReceiptData({
          companyInfo: companyInfo,
          eftNumber: eftNumber,
          chequeDate: formState.chequeDate,
          paidTo: formState.outsideBrokerCompany,
          trade: `${trade.tradeNumber} ${tradeAddress}`,
          notes: "Transfer commission to outside broker",
          amount: formState.netCommission,
          seller: sellers,
          buyer: buyers,
          firstPartyLabel: partyNames.firstPartyLabel,
          secondPartyLabel: partyNames.secondPartyLabel,
          payTo: formState.outsideBrokerCompany,
          orderOf: {
            address: formState.outsideBrokerAddress,
            cityProvincePostal: "",
          },
          note: `${trade.tradeNumber} ${tradeAddress}`,
        });
        setShowOutsideBrokersReceipt(true);
        // Set EFT as created to disable the button
        setEftCreated((prev) => ({ ...prev, outsideBrokersCommission: true }));
        toast.success(
          "Transaction posted to Chart of Accounts and Ledger successfully!"
        );
      } catch (error) {
        console.error("Error creating EFT record:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error message:", error.message);
        alert("Error creating EFT record. Please try again.");
      }
    };

    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg">
          Outside Brokers Commission Cheque Details
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cheque Date
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomDateOutside"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label
                htmlFor="useCustomDateOutside"
                className="text-sm text-gray-600"
              >
                Override Date
              </label>
            </div>
            {useCustomDate ? (
              <input
                type="date"
                name="chequeDate"
                value={
                  formState.chequeDate.includes("/")
                    ? (() => {
                        const [month, day, year] =
                          formState.chequeDate.split("/");
                        return `${year}-${month.padStart(
                          2,
                          "0"
                        )}-${day.padStart(2, "0")}`;
                      })()
                    : formState.chequeDate
                }
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value + "T00:00:00");
                  const formattedDate = `${(selectedDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${selectedDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${selectedDate.getFullYear()}`;
                  setFormState((prev) => ({
                    ...prev,
                    chequeDate: formattedDate,
                  }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            ) : (
              <input
                type="text"
                name="chequeDate"
                value={formState.chequeDate}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Account
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formState.bankAccount}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Outside Broker Name
            </label>
            <input
              type="text"
              name="outsideBrokerName"
              value={formState.outsideBrokerName}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Outside Broker Company
            </label>
            <input
              type="text"
              name="outsideBrokerCompany"
              value={formState.outsideBrokerCompany}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Outside Broker Address
            </label>
            <input
              type="text"
              name="outsideBrokerAddress"
              value={formState.outsideBrokerAddress}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trade Number
            </label>
            <input
              type="text"
              name="tradeNumber"
              value={formState.tradeNumber}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formState.address}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Commission
            </label>
            <input
              type="text"
              name="netCommission"
              value={formState.netCommission}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Cheque
            </label>
            <input
              type="text"
              name="netCheque"
              value={formState.netCheque}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Seller
            </label>
            <input
              type="text"
              name="seller"
              value={formState.seller}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buyer
            </label>
            <input
              type="text"
              name="buyer"
              value={formState.buyer}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Note on Stub
          </label>
          <input
            type="text"
            name="noteOnStub"
            value={formState.noteOnStub}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
          />
        </div>

        <div className="flex justify-start space-x-4 mt-6">
          <button className="bg-gray-200 text-black py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
            Print
          </button>
          <button className="bg-gray-200 text-black py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
            Batch
          </button>
          <button
            onClick={handleEFTClick}
            disabled={eftCreated}
            className={`py-2 px-6 rounded-md transition-colors ${
              eftCreated
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {eftCreated ? "EFT Created" : "E.F.T."}
          </button>
          <button
            onClick={onBack}
            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    );
  };

  // Our Brokerage Commission Details Form
  const OurBrokerageCommissionDetailsForm = ({ trade, onBack, eftCreated }) => {
    const [formState, setFormState] = useState({
      chequeDate: getCurrentMDYDate(),
      bankAccount: "Commission Trust",
      tradeNumber: trade?.tradeNumber || "",
      amount: "",
      noteOnStub: "Transfer Office Share",
    });

    const [useCustomDate, setUseCustomDate] = useState(false);
    useEffect(() => {
      if (trade) {
        // Sum all feesDeducted from agentCommissionList and add 15% tax
        const totalFees = (trade.agentCommissionList || []).reduce(
          (sum, agent) => sum + parseFloat(agent.feesDeducted || 0),
          0
        );
        const totalFeesWithTax = totalFees + totalFees * 0.15;

        // Sum all buyer rebate amounts from agentCommissionList
        const totalBuyerRebates = (trade.agentCommissionList || []).reduce(
          (sum, agent) => {
            const rebateAmount = parseFloat(agent.buyerRebateAmount || 0);
            return sum + rebateAmount;
          },
          0
        );

        // Total amount = fees with tax + buyer rebates
        const totalAmount = totalFeesWithTax + totalBuyerRebates;

        setFormState((prev) => ({
          ...prev,
          tradeNumber: trade.tradeNumber,
          amount: totalAmount.toFixed(2),
          noteOnStub:
            totalBuyerRebates > 0
              ? "Transfer Office Share (includes buyer rebates)"
              : "Transfer Office Share",
        }));
      }
    }, [trade]);
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    };
    // --- E.F.T. button logic ---
    const handleEFTClick = async () => {
      if (!trade) return;
      const tradeAddress = `${trade.keyInfo?.streetNumber || ""} ${
        trade.keyInfo?.streetName || ""
      }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();
      const amount = formState.amount;
      try {
        // 1. Create EFT record (endpoint must exist in backend)
        const eftResponse = await axiosInstance.post(
          "/commission-trust-eft/our-brokerage",
          {
            tradeId: trade._id,
            amount: Number(amount),
            recipient: "Bestway Real Estate Ltd., Brokerage",
            description: "Transfer Office Share",
            chequeDate: formState.chequeDate,
          }
        );
        const eftNumber = eftResponse.data.eftNumber;
        // 2. Post transaction - Credit 10004, Debit 10001
        await axiosInstance.post("/transactions", {
          date: (() => {
            const [month, day, year] = formState.chequeDate.split("/");
            return new Date(
              `${year}-${month.padStart(2, "0")}-${day.padStart(
                2,
                "0"
              )}T00:00:00`
            );
          })(),
          reference: `EFT#${eftNumber}`,
          description: "Our Brokerage Commission Transfer",
          debitAccount: "CASH - CURRENT ACCOUNT", // 10001
          creditAccount: "CASH - COMMISSION TRUST ACCOUNT", // 10004
          amount: Number(amount),
          tradeId: trade._id,
        });
        // Calculate if there are any buyer rebates
        const totalBuyerRebates = (trade.agentCommissionList || []).reduce(
          (sum, agent) => {
            const rebateAmount = parseFloat(agent.buyerRebateAmount || 0);
            return sum + rebateAmount;
          },
          0
        );

        // 3. Prepare receipt data
        const dataForReceipt = {
          eftNumber: eftNumber,
          paidTo: "Bestway Real Estate Ltd.y, Brokerage",
          trade: `${trade.tradeNumber} ${tradeAddress}`,
          notes:
            totalBuyerRebates > 0
              ? "Transfer Office Share (includes buyer rebates)"
              : "Transfer Office Share",
          amount: amount,
          payTo: "Bestway Real Estate Ltd., Brokerage",
          orderOf: {
            address: "500 St.George Street",
            cityProvincePostal: "Moncton, NB E1C 1Y3",
          },
          note: `${trade.tradeNumber} ${tradeAddress}`,
          chequeDate: formState.chequeDate,
        };
        setEftReceiptData(dataForReceipt);
        setIsOurBrokerageEFT(true);
        setShowEFTReceipt(true);
        // Set EFT as created to disable the button
        setEftCreated((prev) => ({ ...prev, ourBrokerageCommission: true }));
        toast.success(
          "Transaction posted to Chart of Accounts and Ledger successfully!"
        );
      } catch (error) {
        console.error("Error during EFT process:", error);
        toast.error(
          "Failed to complete EFT process. Please try again. (Check if backend endpoint exists)"
        );
      }
    };
    // --- end E.F.T. logic ---
    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg">
          Our Brokerage Commission Cheque Details
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cheque Date
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomDateOurBrokerage"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label
                htmlFor="useCustomDateOurBrokerage"
                className="text-sm text-gray-600"
              >
                Override Date
              </label>
            </div>
            {useCustomDate ? (
              <input
                type="date"
                name="chequeDate"
                value={
                  formState.chequeDate.includes("/")
                    ? (() => {
                        const [month, day, year] =
                          formState.chequeDate.split("/");
                        return `${year}-${month.padStart(
                          2,
                          "0"
                        )}-${day.padStart(2, "0")}`;
                      })()
                    : formState.chequeDate
                }
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value + "T00:00:00");
                  const formattedDate = `${(selectedDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${selectedDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${selectedDate.getFullYear()}`;
                  setFormState((prev) => ({
                    ...prev,
                    chequeDate: formattedDate,
                  }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            ) : (
              <input
                type="text"
                name="chequeDate"
                value={formState.chequeDate}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Account
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formState.bankAccount}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trade #
            </label>
            <input
              type="text"
              name="tradeNumber"
              value={formState.tradeNumber}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="text"
              name="amount"
              value={formState.amount}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          {(() => {
            // Calculate breakdown for display
            const totalFees = (trade?.agentCommissionList || []).reduce(
              (sum, agent) => sum + parseFloat(agent.feesDeducted || 0),
              0
            );
            const totalFeesWithTax = totalFees + totalFees * 0.15;
            const totalBuyerRebates = (trade?.agentCommissionList || []).reduce(
              (sum, agent) => {
                const rebateAmount = parseFloat(agent.buyerRebateAmount || 0);
                return sum + rebateAmount;
              },
              0
            );

            if (totalBuyerRebates > 0) {
              return (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Breakdown
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Fees + Tax:</span>
                      <span>${totalFeesWithTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Buyer Rebates:</span>
                      <span>${totalBuyerRebates.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>
                        ${(totalFeesWithTax + totalBuyerRebates).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Note on Stub
            </label>
            <input
              type="text"
              name="noteOnStub"
              value={formState.noteOnStub}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
        </div>
        <div className="flex justify-start space-x-4 mt-6">
          <button className="bg-gray-200 text-black py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
            Print
          </button>
          <button
            onClick={handleEFTClick}
            disabled={eftCreated}
            className={`py-2 px-6 rounded-md transition-colors ${
              eftCreated
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {eftCreated ? "EFT Created" : "E.F.T."}
          </button>
          <button
            onClick={onBack}
            className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    );
  };

  // Add state and handlers for Our Brokerage Commission
  const handleOurBrokerageTradeSearch = (searchTerm) => {
    setOurBrokerageForm((prev) => ({
      ...prev,
      tradeNumber: searchTerm,
      selectedTrade: null,
    }));
    if (searchTerm.trim() === "") {
      setFilteredTrades([]);
      setShowTradeDropdown(false);
      return;
    }
    const filtered = trades.filter(
      (trade) =>
        trade.tradeNumber.toString().includes(searchTerm) ||
        `${trade.keyInfo?.streetNumber || ""} ${
          trade.keyInfo?.streetName || ""
        }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredTrades(filtered);
    setShowTradeDropdown(true);
  };
  const selectOurBrokerageTrade = async (trade) => {
    const address = `${trade.keyInfo?.streetNumber || ""} ${
      trade.keyInfo?.streetName || ""
    }${trade.keyInfo?.unit ? ` ${trade.keyInfo.unit}` : ""}`.trim();
    try {
      // Check if Our Brokerage Commission EFT already exists for this trade
      const existingEFT = await checkCommissionTrustEFT(
        trade._id,
        "OurBrokerageCommission"
      );
      if (existingEFT.exists) {
        toast.error(
          `Payment already completed for Trade #${trade.tradeNumber}!\nEFT #${
            existingEFT.eftNumber
          } was created on ${formatDate(
            existingEFT.date
          )} for ${getEFTTypeDisplayName(existingEFT.type)}.`,
          { duration: 6000 }
        );
        // Set EFT as created to disable the button
        setEftCreated((prev) => ({ ...prev, ourBrokerageCommission: true }));
        return;
      }
      const response = await axiosInstance.get(`/trades/${trade._id}`);
      const fullTrade = response.data;
      setOurBrokerageForm((prev) => ({
        ...prev,
        tradeNumber: `${trade.tradeNumber} - ${address}`,
        selectedTrade: fullTrade,
      }));
      setShowTradeDropdown(false);
    } catch (error) {
      console.error("Error fetching full trade details:", error);
      toast.error("Could not load trade details. Please try again.");
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
              Commission Trust Payments
            </h2>

            {/* Secondary Horizontal Navbar */}
            <div className="bg-white py-4 border-b mb-6">
              <nav className="flex space-x-8">
                <button
                  className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                    activeSection === "outside-brokers"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveSection("outside-brokers")}
                >
                  Outside Brokers Commission Cheques
                </button>
                <button
                  className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                    activeSection === "agent-commission"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveSection("agent-commission")}
                >
                  Agent Commission Cheques
                </button>

                <button
                  className={`text-lg font-medium px-3 py-2 hover:text-blue-600 transition-colors ${
                    activeSection === "our-brokerage"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveSection("our-brokerage")}
                >
                  Our Brokerage Commission
                </button>
              </nav>
            </div>

            {/* Outside Brokers Commission Cheques Form */}
            {activeSection === "outside-brokers" && (
              <div className="space-y-4">
                {!showOutsideBrokersDetailsForm ? (
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">
                      Outside Brokers Commission Transfer Form
                    </h3>
                    <form
                      onSubmit={handleOutsideBrokersSubmit}
                      className="space-y-4"
                    >
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={outsideBrokersForm.name}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <input
                          type="text"
                          value={outsideBrokersForm.type}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Trade Number Search */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trade Number
                        </label>
                        <input
                          type="text"
                          value={outsideBrokersForm.tradeNumber}
                          onChange={(e) =>
                            handleOutsideBrokersTradeSearch(e.target.value)
                          }
                          placeholder="Search trade number or address..."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        {/* Dropdown for trade search results */}
                        {showTradeDropdown && filteredTrades.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredTrades.map((trade) => {
                              const address = `${
                                trade.keyInfo?.streetNumber || ""
                              } ${trade.keyInfo?.streetName || ""}${
                                trade.keyInfo?.unit
                                  ? ` ${trade.keyInfo.unit}`
                                  : ""
                              }`.trim();
                              return (
                                <div
                                  key={trade._id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                                  onClick={() =>
                                    selectOutsideBrokersTrade(trade)
                                  }
                                >
                                  <div className="font-medium">
                                    Trade #{trade.tradeNumber}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {address}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Outside Broker Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Outside Broker
                        </label>
                        <select
                          name="selectedOutsideBroker"
                          value={
                            outsideBrokersForm.selectedOutsideBroker
                              ? `${outsideBrokersForm.selectedOutsideBroker.firstName} ${outsideBrokersForm.selectedOutsideBroker.lastName}`
                              : ""
                          }
                          onChange={(e) => {
                            const selectedBrokerName = e.target.value;
                            if (selectedBrokerName) {
                              const selectedBroker =
                                outsideBrokersForm.selectedTrade?.outsideBrokers?.find(
                                  (broker) =>
                                    `${broker.firstName} ${broker.lastName}` ===
                                    selectedBrokerName
                                );
                              setOutsideBrokersForm((prev) => ({
                                ...prev,
                                selectedOutsideBroker: selectedBroker,
                              }));
                            } else {
                              setOutsideBrokersForm((prev) => ({
                                ...prev,
                                selectedOutsideBroker: null,
                              }));
                            }
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                          required
                          disabled={!outsideBrokersForm.selectedTrade}
                        >
                          <option value="" disabled>
                            {outsideBrokersForm.selectedTrade
                              ? "Select an outside broker"
                              : "Select a trade first"}
                          </option>
                          {outsideBrokersForm.selectedTrade?.outsideBrokers?.map(
                            (broker, index) => (
                              <option
                                key={index}
                                value={`${broker.firstName} ${broker.lastName}`}
                              >
                                {broker.firstName} {broker.lastName} -{" "}
                                {broker.company}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* Proceed Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Proceed
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <OutsideBrokersCommissionDetailsForm
                    trade={outsideBrokersForm.selectedTrade}
                    selectedOutsideBroker={
                      outsideBrokersForm.selectedOutsideBroker
                    }
                    onBack={() => setShowOutsideBrokersDetailsForm(false)}
                    eftCreated={eftCreated.outsideBrokersCommission}
                  />
                )}
              </div>
            )}

            {/* Agent Commission Cheques Form */}
            {activeSection === "agent-commission" && (
              <div className="space-y-4">
                {!showDetailsForm ? (
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">
                      Agent Commission Transfer Form
                    </h3>
                    <form
                      onSubmit={handleAgentCommissionSubmit}
                      className="space-y-4"
                    >
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={agentCommissionForm.name}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Cheque Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Type
                        </label>
                        <input
                          type="text"
                          value={agentCommissionForm.chequeType}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Trade Number Search */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trade Number
                        </label>
                        <input
                          type="text"
                          value={agentCommissionForm.tradeNumber}
                          onChange={(e) =>
                            handleAgentCommissionTradeSearch(e.target.value)
                          }
                          placeholder="Search trade number or address..."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />

                        {/* Dropdown for trade search results */}
                        {showTradeDropdown && filteredTrades.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredTrades.map((trade) => {
                              const address = `${
                                trade.keyInfo?.streetNumber || ""
                              } ${trade.keyInfo?.streetName || ""}${
                                trade.keyInfo?.unit
                                  ? ` ${trade.keyInfo.unit}`
                                  : ""
                              }`.trim();
                              return (
                                <div
                                  key={trade._id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                                  onClick={() =>
                                    selectAgentCommissionTrade(trade)
                                  }
                                >
                                  <div className="font-medium">
                                    Trade #{trade.tradeNumber}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {address}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Agent Number Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agent
                        </label>
                        <select
                          name="selectedAgentId"
                          value={agentCommissionForm.selectedAgentId}
                          onChange={(e) =>
                            setAgentCommissionForm((prev) => ({
                              ...prev,
                              selectedAgentId: e.target.value,
                            }))
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                          required
                          disabled={!agentCommissionForm.selectedTrade}
                        >
                          <option value="" disabled>
                            {agentCommissionForm.selectedTrade
                              ? "Select an agent"
                              : "Select a trade first"}
                          </option>
                          {agentCommissionForm.selectedTrade?.agentCommissionList?.map(
                            (agent, index) => (
                              <option key={index} value={agent.agentId}>
                                {agent.agentName} ({agent.agentId})
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* Proceed Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Proceed
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <AgentCommissionDetailsForm
                    trade={agentCommissionForm.selectedTrade}
                    selectedAgentId={agentCommissionForm.selectedAgentId}
                    onBack={() => setShowDetailsForm(false)}
                  />
                )}
              </div>
            )}

            {/* Our Brokerage Commission Section */}
            {activeSection === "our-brokerage" && (
              <div className="space-y-4">
                {!showOurBrokerageDetailsForm ? (
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-4 text-lg">
                      Our Brokerage Commission Transfer Form
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (ourBrokerageForm.selectedTrade) {
                          setShowOurBrokerageDetailsForm(true);
                        } else {
                          alert("Please select a trade to proceed.");
                        }
                      }}
                      className="space-y-4"
                    >
                      {/* Trade Number Search */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trade Number
                        </label>
                        <input
                          type="text"
                          value={ourBrokerageForm.tradeNumber}
                          onChange={(e) =>
                            handleOurBrokerageTradeSearch(e.target.value)
                          }
                          placeholder="Search trade number or address..."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {/* Dropdown for trade search results */}
                        {showTradeDropdown && filteredTrades.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredTrades.map((trade) => {
                              const address = `${
                                trade.keyInfo?.streetNumber || ""
                              } ${trade.keyInfo?.streetName || ""}${
                                trade.keyInfo?.unit
                                  ? ` ${trade.keyInfo.unit}`
                                  : ""
                              }`.trim();
                              return (
                                <div
                                  key={trade._id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                                  onClick={() => selectOurBrokerageTrade(trade)}
                                >
                                  <div className="font-medium">
                                    Trade #{trade.tradeNumber}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {address}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {/* Proceed Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Proceed
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <OurBrokerageCommissionDetailsForm
                    trade={ourBrokerageForm.selectedTrade}
                    onBack={() => setShowOurBrokerageDetailsForm(false)}
                    eftCreated={eftCreated.ourBrokerageCommission}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EFT Receipt Modal */}
      {showEFTReceipt && eftReceiptData && (
        <EFTReceipt
          data={eftReceiptData}
          hideTradeSellerBuyer={isOurBrokerageEFT}
          onClose={() => {
            setShowEFTReceipt(false);
            setEftReceiptData(null);
            setEftNumber(null);
            setIsOurBrokerageEFT(false);
          }}
        />
      )}

      {/* EFT Receipt Modal for Outside Brokers Commission Cheques */}
      {showOutsideBrokersReceipt && outsideBrokersReceiptData && (
        <EFTReceipt
          data={outsideBrokersReceiptData}
          onClose={() => {
            setShowOutsideBrokersReceipt(false);
            setOutsideBrokersReceiptData(null);
          }}
        />
      )}
    </div>
  );
};

export default CommissionTrustPayments;
