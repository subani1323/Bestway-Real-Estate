import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Navbar from "./Navbar";
import Select from "react-select";
import CommissionForm from "./CommissionForm";
import KeyInfoForm from "./KeyInfoForm";
import PeopleForm from "./PeopleForm";
import OutsideBrokersForm from "./OutsideBrokersForm";
import TrustForm from "./TrustForm";
import AgentCommissionInfo from "./AgentCommissionInfo";
import TradeDetailsModal from "./TradeDetailsModal";
import FinalizeTradeSection from "./FinalizeTradeSection";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const TradeInfo = ({ user }) => {
  const [activeTab, setActiveTab] = useState("list");
  const [trades, setTrades] = useState([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedListingDisplay, setSelectedListingDisplay] = useState("");
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("lease");
  const [dealType, setDealType] = useState("all");
  const [filteredTrades, setFilteredTrades] = useState([]);

  // Helper function to format dates in local timezone to avoid UTC conversion issues
  const formatDate = (dateString) => {
    if (!dateString) return "-";

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

    return date.toLocaleDateString();
  };

  // Filter trades based on search query and deal type
  const filteredTradesResult = trades.filter((trade) => {
    const matchesSearch = trade.tradeNumber?.toString().includes(searchQuery);
    const isClosed = Boolean(trade.keyInfo?.finalizedDate);
    if (dealType === "open") {
      return matchesSearch && !isClosed;
    } else if (dealType === "closed") {
      return matchesSearch && isClosed;
    } else {
      return matchesSearch;
    }
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axiosInstance.get("/listings");
        setListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoadingTrades(true);
      try {
        const response = await axiosInstance.get("/trades");
        console.log("Fetched trades:", response.data);
        setTrades(response.data);
      } catch (error) {
        console.error("Error fetching trades:", error);
      } finally {
        setIsLoadingTrades(false);
      }
    };

    fetchTrades();
  }, []);

  const TradeList = () => {
    const handleTradeRowClick = async (trade) => {
      setSelectedTrade(trade);
      setShowTradeModal(true);
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Trades</h2>

        {/* Search Bar and Deal Type Checkboxes */}
        <div className="mb-6 flex items-center gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Trade #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dealType === "open"}
                onChange={() => setDealType("open")}
                className="form-checkbox h-4 w-4 text-blue-900"
              />
              <span className="ml-2">Open Deals</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dealType === "closed"}
                onChange={() => setDealType("closed")}
                className="form-checkbox h-4 w-4 text-blue-900"
              />
              <span className="ml-2">Closed Deals</span>
            </label>
          </div>
        </div>

        {isLoadingTrades ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        ) : filteredTradesResult.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery
              ? "No trades found matching your search."
              : "No trades found. Create a new trade using the Key Info form."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Trade #
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Street #
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Street Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    MLS #
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Agent Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Status
                  </th>
                  {dealType === "closed" && (
                    <th className="px-4 py-3 text-left font-medium border-b">
                      Finalized Date
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTradesResult.map((trade) => {
                  // Get agent name from agentCommissionList (agent info section)
                  const agentFromCommission = (
                    trade.agentCommissionList || []
                  ).find((a) => a.agentName);
                  const agentName = agentFromCommission
                    ? agentFromCommission.agentName
                    : "-";
                  return (
                    <tr
                      key={trade._id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleTradeRowClick(trade)}
                    >
                      <td className="px-4 py-3 border-b">
                        {trade.tradeNumber || "-"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.streetNumber || "-"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.streetName || "-"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.unit || "-"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.mlsNumber || "-"}
                      </td>
                      <td className="px-4 py-3 border-b">{agentName}</td>
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.sellPrice
                          ? `$${trade.keyInfo.sellPrice.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.propertyType || "-"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            trade.keyInfo?.status === "CLOSED"
                              ? "bg-green-100 text-green-800"
                              : trade.keyInfo?.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : trade.keyInfo?.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {trade.keyInfo?.status || "Available"}
                        </span>
                      </td>
                      {dealType === "closed" && (
                        <td className="px-4 py-3 border-b">
                          {trade.keyInfo?.finalizedDate
                            ? formatDate(trade.keyInfo.finalizedDate)
                            : "-"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // State for people section
  const [people, setPeople] = useState([]);
  const [person, setPerson] = useState({
    type: "",
    firstName: "",
    lastName: "",
    email: "",
    primaryPhone: "",
    cellPhone: "",
    address: "",
    end: "Listing End",
    companyName: "", // Always include companyName
  });
  const [selectedPersonType, setSelectedPersonType] = useState("");
  const [editingPersonIndex, setEditingPersonIndex] = useState(null);
  const [showDeletePersonConfirm, setShowDeletePersonConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);

  // Add these state variables for Outside Brokers
  const [outsideBrokers, setOutsideBrokers] = useState([]);
  const [broker, setBroker] = useState({
    type: "",
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    payBroker: "No",
    end: "Listing End",
    primaryPhone: "",
    chargedHST: "Yes",
    address: "",
  });
  const [selectedBrokerType, setSelectedBrokerType] = useState("");
  const [editingBrokerIndex, setEditingBrokerIndex] = useState(null);
  const [showDeleteBrokerConfirm, setShowDeleteBrokerConfirm] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState(null);

  // Add these state variables at the top of your component
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupSuccess, setLookupSuccess] = useState("");
  const [formKey, setFormKey] = useState(0);

  // Add blocking states for save operations
  const [isSaving, setIsSaving] = useState(false);
  const [isTradeSaved, setIsTradeSaved] = useState(false);
  const [saleInfo, setSaleInfo] = useState({});
  const [savedCommissionData, setSavedCommissionData] = useState({});
  const [trustEntries, setTrustEntries] = useState([]);

  // Add these refs at the top of your component
  const tradeNumberRef = useRef(null);
  const statusRef = useRef(null);
  const listingNumberRef = useRef(null);
  const streetNumberRef = useRef(null);
  const streetNameRef = useRef(null);
  const unitRef = useRef(null);
  const cityRef = useRef(null);
  const provinceRef = useRef(null);
  const postalCodeRef = useRef(null);
  const offerDateRef = useRef(null);
  const firmDateRef = useRef(null);
  const closeDateRef = useRef(null);
  const entryDateRef = useRef(null);
  const finalizedDateRef = useRef(null);
  const sellPriceRef = useRef(null);
  const mlsNumberRef = useRef(null);
  const typeRef = useRef(null);
  const weManageRef = useRef(null);
  const classificationRef = useRef(null);
  const firmRef = useRef(null);

  // Add these state variables to the TradeInfo component
  const [nextTradeNumber, setNextTradeNumber] = useState("");
  const [isLoadingTradeNumber, setIsLoadingTradeNumber] = useState(false);

  const fetchNextTradeNumber = async () => {
    setIsLoadingTradeNumber(true);
    try {
      // Use the new endpoint to get the next sequential trade number
      const response = await axiosInstance.get("/trades/next-number");
      if (response.data && response.data.nextNumber) {
        setNextTradeNumber(response.data.nextNumber.toString());
      } else {
        // If no response, start with 200
        setNextTradeNumber("200");
      }
    } catch (error) {
      console.error("Error fetching next trade number:", error);
      // If there's an error, default to 200
      setNextTradeNumber("200");
    } finally {
      setIsLoadingTradeNumber(false);
    }
  };

  // Add this useEffect to fetch the next trade number when the component mounts
  useEffect(() => {
    fetchNextTradeNumber();
  }, []);

  // Add keyInfoData state
  const [keyInfoData, setKeyInfoData] = useState({
    tradeNumber: "",
    listingNumber: "",
    status: "AVAILABLE",
    streetNumber: "",
    streetName: "",
    unit: "",
    city: "",
    province: "",
    postalCode: "",
    offerDate: "",
    firmDate: "",
    closeDate: "",
    entryDate: "",
    finalizedDate: "",
    sellPrice: "",
    mlsNumber: "",
    type: "",
    weManage: "Yes",
    classification: "LISTING SIDE",
    firm: "Yes",
    listCommission: "",
    sellCommission: "",
    conditions: [],
  });

  // Auto-populate commission closing date from key info close date
  useEffect(() => {
    if (keyInfoData.closeDate) {
      setCommissionClosingDate(keyInfoData.closeDate);
    }
  }, [keyInfoData.closeDate]);

  // Auto-sync commission percentages from key info form
  useEffect(() => {
    if (keyInfoData.listCommission !== undefined) {
      setListingCommission(keyInfoData.listCommission);
    }
    if (keyInfoData.sellCommission !== undefined) {
      setSellingCommission(keyInfoData.sellCommission);
    }
  }, [keyInfoData.listCommission, keyInfoData.sellCommission]);

  // Handler for input changes
  const handleKeyInfoChange = (e) => {
    const { name, value } = e.target;
    console.log("handleKeyInfoChange called with:", { name, value });
    console.log("Current keyInfoData before update:", keyInfoData);
    setKeyInfoData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      console.log("Updated keyInfoData:", updated);
      return updated;
    });
  };

  // People section handlers
  const handlePersonInputChange = (e) => {
    const { name, value } = e.target;

    // Direct state update with no validation or processing
    setPerson((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Log for debugging
    console.log(`Field ${name} updated to: ${value}`);
  };

  const handlePersonTypeSelect = (type) => {
    setSelectedPersonType(type);
    setPerson((prev) => ({
      ...prev,
      type: type,
    }));
  };

  const handlePersonSubmit = (e) => {
    e.preventDefault();
    if (editingPersonIndex !== null) {
      const updatedPeople = [...people];
      updatedPeople[editingPersonIndex] = {
        ...person,
        companyName: person.companyName || "",
      };
      setPeople(updatedPeople);
      setEditingPersonIndex(null);
    } else {
      setPeople([
        ...people,
        { ...person, companyName: person.companyName || "" },
      ]);
    }
    setPerson({
      type: "",
      firstName: "",
      lastName: "",
      email: "",
      primaryPhone: "",
      cellPhone: "",
      address: "",
      end: "Listing End",
      companyName: "", // Reset companyName as well
    });
    setSelectedPersonType("");
  };

  const handlePersonEdit = (index) => {
    const personToEdit = people[index];
    setPerson(personToEdit);
    setSelectedPersonType(personToEdit.type);
    setEditingPersonIndex(index);
  };

  const handlePersonDelete = (index) => {
    setPersonToDelete(index);
    setShowDeletePersonConfirm(true);
  };

  const confirmDeletePerson = () => {
    if (personToDelete !== null) {
      setPeople(people.filter((_, index) => index !== personToDelete));
      setShowDeletePersonConfirm(false);
      setPersonToDelete(null);
    }
  };

  const cancelDeletePerson = () => {
    setShowDeletePersonConfirm(false);
    setPersonToDelete(null);
  };

  // Add broker handlers
  const handleBrokerInputChange = (e) => {
    const { name, value } = e.target;
    setBroker((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBrokerTypeSelect = (type) => {
    setSelectedBrokerType(type);
    setBroker((prev) => ({
      ...prev,
      type: type,
    }));
  };

  const handleBrokerSubmit = (e) => {
    e.preventDefault();

    // Calculate tax and total
    const sellingAmount = parseFloat(broker.sellingAmount) || 0;
    const tax = (sellingAmount * 0.15).toFixed(2);
    const total = (sellingAmount + parseFloat(tax)).toFixed(2);

    const brokerData = {
      ...broker,
      tax,
      total,
    };

    if (editingBrokerIndex !== null) {
      // Update existing broker
      const updatedBrokers = [...outsideBrokers];
      updatedBrokers[editingBrokerIndex] = brokerData;
      setOutsideBrokers(updatedBrokers);
      setEditingBrokerIndex(null);
    } else {
      // Add new broker
      setOutsideBrokers([...outsideBrokers, brokerData]);
    }

    // Reset form
    setBroker({
      type: "",
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      payBroker: "No",
      end: "Listing End",
      primaryPhone: "",
      chargedHST: "Yes",
      address: "",
      sellingAmount: "",
    });
    setSelectedBrokerType("");
  };

  const handleBrokerEdit = (index) => {
    const brokerToEdit = outsideBrokers[index];
    setBroker(brokerToEdit);
    setSelectedBrokerType(brokerToEdit.type);
    setEditingBrokerIndex(index);
  };

  const handleBrokerDelete = (index) => {
    setBrokerToDelete(index);
    setShowDeleteBrokerConfirm(true);
  };

  const confirmDeleteBroker = async () => {
    if (brokerToDelete !== null) {
      const brokerToDeleteData = outsideBrokers[brokerToDelete];

      try {
        // Delete from database if it has an _id
        if (brokerToDeleteData._id) {
          await axiosInstance.delete(
            `/outside-brokers/${brokerToDeleteData._id}`
          );
        }

        // Update local state
        setOutsideBrokers(
          outsideBrokers.filter((_, index) => index !== brokerToDelete)
        );
        setShowDeleteBrokerConfirm(false);
        setBrokerToDelete(null);
        toast.success("Broker deleted successfully");
      } catch (error) {
        console.error("Error deleting broker:", error);
        toast.error("Failed to delete broker");
      }
    }
  };

  const cancelDeleteBroker = () => {
    setShowDeleteBrokerConfirm(false);
    setBrokerToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Collect all form data from state, not refs
      const keyInfoDataToSubmit = { ...keyInfoData };

      // Prepare the trade data
      const tradeData = {
        tradeNumber: keyInfoDataToSubmit.tradeNumber,
        keyInfo: keyInfoDataToSubmit,
        people: people,
        outsideBrokers: outsideBrokers,
      };

      console.log("Sending trade data to server:", tradeData);

      // Send the data to the server
      const response = await axiosInstance.post("/trades", tradeData);

      // Update MiscSettings with the new trade number
      try {
        const miscSettingsResponse = await axiosInstance.get("/misc-settings");
        if (miscSettingsResponse.data && miscSettingsResponse.data.length > 0) {
          const miscSettings = miscSettingsResponse.data[0];
          await axiosInstance.put(`/misc-settings/${miscSettings._id}`, {
            ...miscSettings,
            lastTrade: parseInt(keyInfoDataToSubmit.tradeNumber),
          });
        }
      } catch (error) {
        console.error("Error updating MiscSettings:", error);
      }

      // Show success message or redirect
      console.log("Trade created successfully:", response.data);
      toast.success("Trade created successfully!");
    } catch (error) {
      console.error("Error creating trade:", error);
      toast.error(
        "Error creating trade: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const goToNextSection = () => {
    if (activeTab === "key-info") {
      setActiveTab("people");
    } else if (activeTab === "people") {
      setActiveTab("outside-brokers");
    } else if (activeTab === "outside-brokers") {
      setActiveTab("trust");
    } else if (activeTab === "trust") {
      setActiveTab("commission");
    } else if (activeTab === "commission") {
      setActiveTab("agent-info");
    }
  };

  const goToPreviousSection = () => {
    if (activeTab === "people") {
      setActiveTab("key-info");
    } else if (activeTab === "outside-brokers") {
      setActiveTab("people");
    } else if (activeTab === "trust") {
      setActiveTab("outside-brokers");
    } else if (activeTab === "commission") {
      setActiveTab("trust");
    } else if (activeTab === "agent-info") {
      setActiveTab("commission");
    }
  };

  // Add the handleStore function
  const handleStore = async () => {
    // Prevent multiple saves if already saving or trade is already saved
    if (isSaving || isTradeSaved) {
      return;
    }

    try {
      setIsSaving(true);
      setIsLoading(true);

      // Collect all form data from state, not refs
      const keyInfoDataToSubmit = {
        ...keyInfoData,
        tradeNumber: nextTradeNumber.toString(),
      };

      // Prepare the trade data
      const tradeData = {
        tradeNumber: Number(nextTradeNumber), // ✅ convert to actual number
        keyInfo: {
          ...keyInfoDataToSubmit,
          tradeNumber: Number(nextTradeNumber), // ✅ also update here
        },
        people: people,
        outsideBrokers: outsideBrokers,
      };

      console.log("Sending trade data to server:", tradeData);

      // Send the data to the server
      const response = await axiosInstance.post("/trades", tradeData);

      console.log("Server response:", response.data);

      // Show success message
      toast.success("Trade information stored successfully!");

      // Mark trade as saved to prevent further saves
      setIsTradeSaved(true);

      // Clear any previous errors
      setLookupError("");

      // Fetch the next trade number after storing
      await fetchNextTradeNumber();

      // Optional: Reset form or navigate to next section
      // goToNextSection();
    } catch (error) {
      console.error("Error storing trade:", error);

      // Show error message
      if (error.response) {
        setLookupError(
          `Error storing trade: ${
            error.response.data.message || "Server error"
          }`
        );
      } else if (error.request) {
        setLookupError(
          "No response from server. Please check your connection."
        );
      } else {
        setLookupError(`Error: ${error.message}`);
      }

      // Clear any previous success message
      setLookupSuccess("");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  // Add state for commission section fields
  const [commissionClosingDate, setCommissionClosingDate] = useState("");
  const [commissionStatus, setCommissionStatus] = useState("Active");
  const [commissionAR, setCommissionAR] = useState("");
  const [listingCommission, setListingCommission] = useState("");
  const [sellingCommission, setSellingCommission] = useState("");

  // Add state for commission form table data
  const [saleClosingRows, setSaleClosingRows] = useState([]);
  const [commissionIncomeRows, setCommissionIncomeRows] = useState([]);
  const [outsideBrokersRows, setOutsideBrokersRows] = useState([]);

  // Add state for commission form editing
  const [editingSaleClosingIdx, setEditingSaleClosingIdx] = useState(null);
  const [editingCommissionIncomeIdx, setEditingCommissionIncomeIdx] =
    useState(null);
  const [editingOutsideBrokerIdx, setEditingOutsideBrokerIdx] = useState(null);

  // Add state for commission form broker fields
  const [brokerAgentName, setBrokerAgentName] = useState("");
  const [brokerBrokerage, setBrokerBrokerage] = useState("");
  const [brokerSellingAmount, setBrokerSellingAmount] = useState("");
  const [brokerEnd, setBrokerEnd] = useState("");

  // Add state for commission total
  const [commissionTotal, setCommissionTotal] = useState("");

  // Add state for commission data to pass to AgentCommissionInfo
  const [commissionData, setCommissionData] = useState({
    listingAmount: "0.00",
    sellingAmount: "0.00",
    listingTax: "0.00",
    sellingTax: "0.00",
  });

  // Function to calculate commission data
  const calculateCommissionData = () => {
    const sellPriceNum = parseFloat(keyInfoData.sellPrice) || 0;
    const listingCommissionNum = parseFloat(listingCommission) || 0;
    const sellingCommissionNum = parseFloat(sellingCommission) || 0;

    const listingAmount = ((sellPriceNum * listingCommissionNum) / 100).toFixed(
      2
    );
    const sellingAmount = ((sellPriceNum * sellingCommissionNum) / 100).toFixed(
      2
    );
    const listingTax = (parseFloat(listingAmount) * 0.15).toFixed(2);
    const sellingTax = (parseFloat(sellingAmount) * 0.15).toFixed(2);

    setCommissionData({
      listingAmount,
      sellingAmount,
      listingTax,
      sellingTax,
    });
  };

  // Calculate commission data when commission values change
  useEffect(() => {
    calculateCommissionData();
  }, [keyInfoData.sellPrice, listingCommission, sellingCommission]);

  // Add state for AgentCommissionInfo
  const [agentCommissionData, setAgentCommissionData] = useState({
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
    total: "",
    totalFees: "",
    netCommission: "",
    lead: "",
  });
  const [agentCommissionList, setAgentCommissionList] = useState([]);
  const [agentCommissionEditingIndex, setAgentCommissionEditingIndex] =
    useState(null);
  const [agentCommissionShowDeleteModal, setAgentCommissionShowDeleteModal] =
    useState(false);
  const [agentCommissionDeletingIndex, setAgentCommissionDeletingIndex] =
    useState(null);
  const [
    agentCommissionShowBuyerRebateModal,
    setAgentCommissionShowBuyerRebateModal,
  ] = useState(false);
  const [
    agentCommissionBuyerRebateIncluded,
    setAgentCommissionBuyerRebateIncluded,
  ] = useState("no");
  const [
    agentCommissionBuyerRebateAmount,
    setAgentCommissionBuyerRebateAmount,
  ] = useState("");
  const [agentCommissionPendingAgent, setAgentCommissionPendingAgent] =
    useState(null);
  const [agentCommissionValidationErrors, setAgentCommissionValidationErrors] =
    useState({});

  // Add these state variables for Trust
  const [trustRecords, setTrustRecords] = useState([]);
  const [trust, setTrust] = useState({
    date: "",
    amount: "",
    payer: "",
    payee: "",
    notes: "",
  });
  const [editingTrustIndex, setEditingTrustIndex] = useState(null);
  const [showDeleteTrustConfirm, setShowDeleteTrustConfirm] = useState(false);
  const [trustToDelete, setTrustToDelete] = useState(null);

  // Add these handlers for Trust
  const handleTrustInputChange = (e) => {
    const { name, value } = e.target;
    setTrust((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrustSubmit = (e) => {
    e.preventDefault();
    if (editingTrustIndex !== null) {
      const updatedTrusts = [...trustRecords];
      updatedTrusts[editingTrustIndex] = trust;
      setTrustRecords(updatedTrusts);
      setEditingTrustIndex(null);
    } else {
      setTrustRecords([...trustRecords, trust]);
    }
    setTrust({
      date: "",
      amount: "",
      payer: "",
      payee: "",
      notes: "",
    });
  };

  const handleTrustEdit = (index) => {
    setTrust(trustRecords[index]);
    setEditingTrustIndex(index);
  };

  const handleTrustDelete = (index) => {
    setTrustToDelete(index);
    setShowDeleteTrustConfirm(true);
  };

  const confirmDeleteTrust = () => {
    if (trustToDelete !== null) {
      const updatedTrusts = trustRecords.filter(
        (_, index) => index !== trustToDelete
      );
      setTrustRecords(updatedTrusts);
      setShowDeleteTrustConfirm(false);
      setTrustToDelete(null);
    }
  };

  const cancelDeleteTrust = () => {
    setShowDeleteTrustConfirm(false);
    setTrustToDelete(null);
  };

  // Commission form handlers
  const handleAddCommissionInfo = ({ type, data }) => {
    switch (type) {
      case "saleClosing":
        if (editingSaleClosingIdx !== null) {
          // Update existing row
          const updatedRows = [...saleClosingRows];
          updatedRows[editingSaleClosingIdx] = data;
          setSaleClosingRows(updatedRows);
          setEditingSaleClosingIdx(null);
        } else {
          // Add new row
          setSaleClosingRows([...saleClosingRows, data]);
        }
        break;

      case "commissionIncome":
        if (editingCommissionIncomeIdx !== null) {
          const updatedRows = [...commissionIncomeRows];
          updatedRows[editingCommissionIncomeIdx] = data;
          setCommissionIncomeRows(updatedRows);
          setEditingCommissionIncomeIdx(null);
        } else {
          setCommissionIncomeRows([...commissionIncomeRows, data]);
        }
        break;

      case "outsideBroker":
        if (editingOutsideBrokerIdx !== null) {
          const updatedRows = [...outsideBrokersRows];
          updatedRows[editingOutsideBrokerIdx] = data;
          setOutsideBrokersRows(updatedRows);
          setEditingOutsideBrokerIdx(null);
        } else {
          setOutsideBrokersRows([...outsideBrokersRows, data]);
        }
        // Clear broker fields
        setBrokerAgentName("");
        setBrokerBrokerage("");
        setBrokerSellingAmount("");
        setBrokerEnd("");
        break;
    }
  };

  const handleEditSaleClosing = () => {
    if (saleClosingRows.length > 0) {
      const row = saleClosingRows[0]; // Edit first row for now
      setEditingSaleClosingIdx(0);
      // Update form fields with row data
      setKeyInfoData((prev) => ({
        ...prev,
        sellPrice: row.sellPrice,
      }));
      setCommissionClosingDate(row.closingDate);
      setCommissionStatus(row.status);
      setCommissionAR(row.ar);
    }
  };

  const handleEditCommissionIncome = () => {
    if (commissionIncomeRows.length > 0) {
      const row = commissionIncomeRows[0]; // Edit first row for now
      setEditingCommissionIncomeIdx(0);
      // Update form fields with row data
      const listingCommissionPercent = (
        (parseFloat(row.listingAmount) * 100) /
        parseFloat(keyInfoData.sellPrice)
      ).toFixed(2);
      const sellingCommissionPercent = (
        (parseFloat(row.sellingAmount) * 100) /
        parseFloat(keyInfoData.sellPrice)
      ).toFixed(2);
      setListingCommission(listingCommissionPercent);
      setSellingCommission(sellingCommissionPercent);
    }
  };

  const handleEditOutsideBroker = () => {
    if (outsideBrokersRows.length > 0) {
      const row = outsideBrokersRows[0]; // Edit first row for now
      setEditingOutsideBrokerIdx(0);
      // Update form fields with row data
      setBrokerAgentName(row.agentName);
      setBrokerBrokerage(row.brokerage);
      setBrokerSellingAmount(row.sellingAmount);
      setBrokerEnd(row.end || "");
    }
  };

  const handleDeleteSaleClosing = () => {
    setSaleClosingRows([]);
    setEditingSaleClosingIdx(null);
  };

  const handleDeleteCommissionIncome = () => {
    setCommissionIncomeRows([]);
    setEditingCommissionIncomeIdx(null);
  };

  const handleDeleteOutsideBroker = () => {
    setOutsideBrokersRows([]);
    setEditingOutsideBrokerIdx(null);
    setBrokerAgentName("");
    setBrokerBrokerage("");
    setBrokerSellingAmount("");
    setBrokerEnd("");
  };

  const handleSaveTrade = async () => {
    // Prevent multiple saves if already saving or trade is already saved
    if (isSaving || isTradeSaved) {
      return;
    }

    try {
      setIsSaving(true);

      // Ensure tradeNumber is a string
      const tradeData = {
        tradeNumber: nextTradeNumber.toString(),
        keyInfo: {
          ...keyInfoData,
          tradeNumber: nextTradeNumber.toString(),
        },
        people: people,
        outsideBrokers: outsideBrokers,
        trustRecords: trustRecords,
        commission: {
          saleClosingRows,
          commissionIncomeRows,
          outsideBrokersRows,
        },
        agentCommissionList,
        conditions: keyInfoData.conditions || [],
      };

      console.log(
        "Frontend - Trade data to send:",
        JSON.stringify(tradeData, null, 2)
      );
      console.log("Frontend - Conditions data:", keyInfoData.conditions);

      const response = await axiosInstance.post("/trades/full", tradeData);
      toast.success("Trade saved successfully!");

      // Mark trade as saved to prevent further saves
      setIsTradeSaved(true);

      // Fetch the next trade number after saving
      await fetchNextTradeNumber();
    } catch (error) {
      toast.error(
        "Error saving trade: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Add state for invoiceType at the top of the component
  const [invoiceType, setInvoiceType] = useState("lawyer");
  const [lawyerType, setLawyerType] = useState("");
  const [selectedTradeForInvoice, setSelectedTradeForInvoice] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState(30000);
  const [invoiceForm, setInvoiceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    trade: "",
    propertyType: "LEASE",
    lawyerName: "",
    address: "",
    re: "",
    propertyAddress: "",
    end: "",
    commissionPercentage: "",
    commissionAmount: "",
    sellPrice: "",
    leasePrice: "",
    deposit: "",
    hstAmount: "",
    balanceToVendor: "",
    closingDate: "",
    referenceNumber: "",
  });
  const [lawyerInvoiceForm, setLawyerInvoiceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    trade: "",
    propertyType: "PURCHASE AND SALE", // fixed value
    lawyerName: "",
    address: "",
    re: "",
    propertyAddress: "",
    end: "",
    commissionPercentage: "",
    commissionAmount: "",
    sellPrice: "",
    leasePrice: "",
    deposit: "",
    hstAmount: "",
    balanceToVendor: "",
    closingDate: "",
    referenceNumber: "",
    totalCommission: "", // <-- Add this line
    tradeClassification: "",
  });
  const [nextReferenceNumber, setNextReferenceNumber] = useState(4000);

  // Add state for data sources
  const [trustData, setTrustData] = useState([]);
  const [peopleData, setPeopleData] = useState([]);

  // Helper to get trade options for dropdown
  const tradeOptions = trades.map((trade) => ({
    value: trade.tradeNumber,
    label: `#${trade.tradeNumber} - ${trade.keyInfo?.streetNumber || ""} ${
      trade.keyInfo?.streetName || ""
    }`.trim(),
    trade,
  }));

  // Add state for next brokerage reference number
  const [nextBrokerageReferenceNumber, setNextBrokerageReferenceNumber] =
    useState(30000);

  // Initialize nextBrokerageReferenceNumber from localStorage if available
  useEffect(() => {
    const storedBrokerageRef = localStorage.getItem(
      "nextBrokerageReferenceNumber"
    );
    if (storedBrokerageRef) {
      setNextBrokerageReferenceNumber(parseInt(storedBrokerageRef, 10));
    }
  }, []);

  // When a trade is selected, update the form fields with its data (for brokerage invoice)
  const handleInvoiceTradeSelect = (option) => {
    if (!option) {
      setSelectedTrade(null);
      setInvoiceForm((prev) => ({
        ...prev,
        re: "",
        commissionType: "half month",
        commissionPercentage: "",
        referenceNumber: nextBrokerageReferenceNumber.toString(),
      }));
      // Increment and persist brokerage reference number
      setNextBrokerageReferenceNumber((prev) => {
        const next = prev + 1;
        localStorage.setItem("nextBrokerageReferenceNumber", next);
        return next;
      });
      return;
    }
    setSelectedTrade(option.trade);
    setInvoiceForm((prev) => ({
      ...prev,
      re: "",
      commissionType: "half month",
      commissionPercentage: "",
      referenceNumber: nextBrokerageReferenceNumber.toString(),
    }));
    // Increment and persist brokerage reference number
    setNextBrokerageReferenceNumber((prev) => {
      const next = prev + 1;
      localStorage.setItem("nextBrokerageReferenceNumber", next);
      return next;
    });
  };

  // Use selectedInvoiceTrade for all field values instead of firstBroker, firstOBRow, keyInfoData
  const selectedInvoiceTrade =
    selectedTrade ||
    trades.find((t) => t.tradeNumber === keyInfoData.tradeNumber) ||
    {};
  const invoiceKeyInfo = selectedInvoiceTrade.keyInfo || {};
  const invoiceOutsideBrokers = selectedInvoiceTrade.outsideBrokers || [];
  const invoiceFirstBroker =
    invoiceOutsideBrokers.length > 0 ? invoiceOutsideBrokers[0] : {};
  const invoiceCommission = selectedInvoiceTrade.commission || {};
  const invoiceOBRows = invoiceCommission.outsideBrokersRows || [];
  const invoiceFirstOBRow = invoiceOBRows.length > 0 ? invoiceOBRows[0] : {};

  const today = new Date().toLocaleDateString();

  const handleInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update propertyType effect to auto-set Re field
  useEffect(() => {
    if (invoiceType === "brokerage") {
      setInvoiceForm((prev) => ({
        ...prev,
        re:
          propertyType === "lease" ? "AGREEMENT TO LEASE" : "AGREEMENT TO RENT",
      }));
    }
    // eslint-disable-next-line
  }, [propertyType, invoiceType]);

  const handlePrintInvoice = () => {
    // Prepare invoice data
    const data = {
      date: invoiceForm.date,
      brokerageName: invoiceFirstBroker.company || "",
      brokerageAddress: invoiceFirstBroker.address || "",
      re:
        propertyTypeValue === "SALE"
          ? "AGREEMENT OF PURCHASE AND SALE"
          : "AGREEMENT OF LEASE",
      tradeNumber: selectedInvoiceTrade.tradeNumber || "",
      propertyAddress: `${invoiceKeyInfo.streetNumber || ""} ${
        invoiceKeyInfo.streetName || ""
      }`.trim(),
      commissionType:
        propertyTypeValue === "SALE" ? "commission percentage" : "half month",
      commissionPercentage: invoiceForm.commissionPercentage,
      leaseAmount: invoiceKeyInfo.sellPrice || "",
      sellPrice: invoiceKeyInfo.sellPrice || "",
      mlsFees: invoiceFirstOBRow.sellingAmount || "",
      hst: invoiceFirstOBRow.tax || "",
      total: invoiceFirstOBRow.total || "",
      closingDate: invoiceKeyInfo.closeDate || "",
      referenceNumber: selectedInvoiceTrade.tradeNumber || "",
    };

    // Commission description
    let commissionDesc = "";
    if (data.commissionType === "half month") {
      commissionDesc = "half month";
    } else if (data.commissionType === "commission percentage") {
      // Always use the Co-operating Commission (selling commission) for the percentage
      commissionDesc = `${invoiceKeyInfo.sellCommission || ""}%`;
    }

    // Rent/Lease/Sale description
    let atAmountDesc = "";
    if (propertyTypeValue === "SALE") {
      atAmountDesc = `AT A SALE PRICE OF $${Number(
        invoiceKeyInfo.sellPrice || 0
      ).toLocaleString()}`;
    } else if (propertyTypeValue === "LEASE") {
      atAmountDesc = `AT A RENT AMOUNT OF $${Number(
        invoiceKeyInfo.sellPrice || 0
      ).toLocaleString()}`;
    }

    // Generate printable HTML
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html><head><title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; }
        .header img { width: 120px; margin-bottom: 10px; }
        .bank-details { margin-top: 24px; }
        .bank-details b { display: inline-block; min-width: 120px; }
        .amount-table { margin-top: 24px; margin-bottom: 24px; }
        .amount-table td { padding: 2px 8px; }
        .amount-table .desc { min-width: 220px; }
        .amount-table .right { text-align: right; min-width: 100px; }
        .amount-table .bold { font-weight: bold; }
        .amount-table .balance { font-weight: bold; }
        .footer { margin-top: 32px; }
      </style>
      </head><body>
        <div class="header">
          <img src="${
            window.location.origin + require("../Assets/logo1.jpg")
          }" alt="Bestway Real Estate Ltd. Logo" />
                  <div style="font-size: 20px; font-weight: bold; margin-top: 8px;">Bestway Real Estate Ltd., Brokerage</div>
        <div>500 St.George Street<br/>Moncton, NB  E1C 1Y3</div>
        <div>Phone: 506-268-2900 &nbsp; Fax: 506-268-2910</div>
        </div>
        <br/>
        <div>${data.date}</div>
        <br/>
        <div style="font-weight: bold;">${data.brokerageName}</div>
        <div>${data.brokerageAddress}</div>
        <br/>
        <div><b>Re:</b> ${data.re}</div>
        <div>${data.tradeNumber ? `Trade #${data.tradeNumber}, ` : ""}${
      data.propertyAddress
    }</div>
        <br/>
        <div>To our commission of <b>${commissionDesc}</b></div>
        <div>${atAmountDesc}</div>
        <br/>
        <table class="amount-table">
          <tr>
            <td class="desc">Less share of MLS fees</td>
            <td class="right">$${Number(data.mlsFees).toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}</td>
          </tr>
                      <tr>
              <td class="desc">HST # 804667350RT</td>
              <td class="right">$${Number(data.hst).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>
            </tr>
          <tr class="balance">
            <td class="desc">Balance Due on Closing</td>
            <td class="right">$${Number(data.total).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</td>
          </tr>
        </table>
        <div>Closing Scheduled for ${data.closingDate}.</div>
        <div>Our reference number is ${data.referenceNumber}.</div>
        <br/>
        <div style="font-weight: bold;">Please make cheque payable to Bestway Real Estate Ltd., Brokerage or adding by EFT using the Bank Details below:</div>
        <div class="bank-details">
          <b>Bank:</b> TD Canada Trust<br/>
          <b>Institution:</b> 004<br/>
          <b>Transit:</b> 12892<br/>
          <b>Account:</b> 521-9966<br/>
        </div>
        <div class="footer">
          Please feel free to contact our Deals department should you require more information/clarification. 506-268-2900. Or E-mail adminnb@bestwayrealtyinc.com.<br/><br/>
          Sincerely,<br/>
          Daphney Roy<br/>
          Administrator
        </div>
      </body></html>
    `);
    win.document.close();
    win.print();
    setReferenceNumber((prev) => prev + 1);
  };

  // Email PDF invoice handler
  const handleEmailPDF = async () => {
    const brokerEmail = invoiceFirstBroker.email;
    if (!brokerEmail) {
      toast.error("No email address found for this broker");
      return;
    }

    try {
      // Prepare invoice data
      const invoiceData = {
        date: invoiceForm.date,
        brokerageName: invoiceFirstBroker.company || "",
        brokerageAddress: invoiceFirstBroker.address || "",
        re:
          propertyTypeValue === "SALE"
            ? "AGREEMENT OF PURCHASE AND SALE"
            : "AGREEMENT OF LEASE",
        tradeNumber: selectedInvoiceTrade.tradeNumber || "",
        propertyAddress: `${invoiceKeyInfo.streetNumber || ""} ${
          invoiceKeyInfo.streetName || ""
        }`.trim(),
        commissionDesc:
          propertyTypeValue === "SALE"
            ? `${invoiceKeyInfo.sellCommission || ""}%`
            : "half month",
        atAmountDesc:
          propertyTypeValue === "SALE"
            ? `AT A SALE PRICE OF $${Number(
                invoiceKeyInfo.sellPrice || 0
              ).toLocaleString()}`
            : `AT A RENT AMOUNT OF $${Number(
                invoiceKeyInfo.sellPrice || 0
              ).toLocaleString()}`,
        mlsFees: invoiceFirstOBRow.sellingAmount || "",
        hst: invoiceFirstOBRow.tax || "",
        total: invoiceFirstOBRow.total || "",
        closingDate: invoiceKeyInfo.closeDate || "",
        referenceNumber: selectedInvoiceTrade.tradeNumber || "",
      };

      toast.info("Generating and sending PDF invoice...");

      await axiosInstance.post("/email/send-invoice-pdf", {
        recipientEmail: brokerEmail,
        invoiceData,
        invoiceType: "brokerage",
      });

      toast.success(`Invoice PDF sent successfully to ${brokerEmail}`);
      setReferenceNumber((prev) => prev + 1);
    } catch (error) {
      console.error("Error sending invoice PDF:", error);
      toast.error(
        "Failed to send invoice PDF: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Email PDF lawyer invoice handler
  const handleEmailLawyerPDF = async () => {
    console.log("Email PDF button clicked");

    if (!selectedTradeForInvoice) {
      toast.error("Please select a trade first");
      return;
    }

    if (!lawyerType) {
      toast.error("Please select lawyer type (Seller or Buyer)");
      return;
    }

    // Get lawyer email based on lawyer type
    let lawyerEmail = "";
    let lawyerInfo = null;

    if (lawyerType === "seller") {
      lawyerInfo = selectedTradeForInvoice.people?.find(
        (p) => p.type === "Seller Lawyer"
      );
      lawyerEmail = lawyerInfo?.email || "";
    } else if (lawyerType === "buyer") {
      lawyerInfo = selectedTradeForInvoice.people?.find(
        (p) => p.type === "Buyer Lawyer"
      );
      lawyerEmail = lawyerInfo?.email || "";
    }

    console.log("Lawyer type:", lawyerType);
    console.log("Lawyer info:", lawyerInfo);
    console.log("Lawyer email:", lawyerEmail);

    if (!lawyerEmail) {
      toast.error(
        `No email address found for ${lawyerType} lawyer. Please add an email address in the trade's people section.`
      );
      return;
    }

    try {
      // Calculate values for lawyer invoice (matching printLawyerInvoice logic)
      const isLease = lawyerInvoiceForm.propertyType === "LEASE";
      const price = isLease
        ? lawyerInvoiceForm.leasePrice
        : lawyerInvoiceForm.sellPrice;

      // Sum both listing and selling side commissions and HST
      const listingCommissionPercent =
        parseFloat(lawyerInvoiceForm.listingCommissionPercent) || 0;
      const sellingCommissionPercent =
        parseFloat(lawyerInvoiceForm.sellingCommissionPercent) || 0;
      const totalCommissionPercent = (
        listingCommissionPercent + sellingCommissionPercent
      ).toFixed(2);

      const listingCommissionAmount =
        parseFloat(lawyerInvoiceForm.listingCommissionAmount) || 0;
      const sellingCommissionAmount =
        parseFloat(lawyerInvoiceForm.sellingCommissionAmount) || 0;
      const totalCommissionAmount = (
        listingCommissionAmount + sellingCommissionAmount
      ).toFixed(2);

      const listingHSTAmount =
        parseFloat(lawyerInvoiceForm.listingHSTAmount) || 0;
      const sellingHSTAmount =
        parseFloat(lawyerInvoiceForm.sellingHSTAmount) || 0;
      const totalHSTAmount = (listingHSTAmount + sellingHSTAmount).toFixed(2);

      // Calculate balance to vendor
      const balanceToVendor = calculateBalanceToVendor();
      const balanceLabel = getBalanceLabel();

      // Prepare lawyer invoice data with exact same structure as print
      const invoiceData = {
        date: lawyerInvoiceForm.date,
        lawyerName: lawyerInvoiceForm.lawyerName,
        address: lawyerInvoiceForm.address,
        re: lawyerInvoiceForm.re,
        propertyAddress: lawyerInvoiceForm.propertyAddress,
        propertyType: lawyerInvoiceForm.propertyType,
        sellPrice: lawyerInvoiceForm.sellPrice,
        leasePrice: lawyerInvoiceForm.leasePrice,
        commissionDescription: `To our commission of ${totalCommissionPercent}% + HST`,
        totalCommissionAmount: totalCommissionAmount,
        hstAmount: totalHSTAmount,
        deposit: lawyerInvoiceForm.deposit,
        balanceToVendor: balanceToVendor,
        balanceLabel: balanceLabel,
        closingDate: lawyerInvoiceForm.closingDate,
        referenceNumber: lawyerInvoiceForm.trade,
        tradeNumber: selectedTradeForInvoice.tradeNumber || "",
      };

      console.log("Sending lawyer invoice data:", invoiceData);
      toast.info("Generating and sending lawyer invoice PDF...");

      const response = await axiosInstance.post("/email/send-invoice-pdf", {
        recipientEmail: lawyerEmail,
        invoiceData,
        invoiceType: "lawyer",
      });

      console.log("Email response:", response.data);
      toast.success(`Lawyer invoice PDF sent successfully to ${lawyerEmail}`);
    } catch (error) {
      console.error("Error sending lawyer invoice PDF:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Failed to send lawyer invoice PDF";
      if (error.response?.data?.message) {
        errorMessage += ": " + error.response.data.message;
      } else if (error.message) {
        errorMessage += ": " + error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleLawyerInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setLawyerInvoiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLawyerTypeChange = (type) => {
    setLawyerType(type);
    const newReferenceNumber = nextReferenceNumber + 1;
    setNextReferenceNumber(newReferenceNumber);
    // Reset form when lawyer type changes
    setLawyerInvoiceForm({
      date: new Date().toISOString().split("T")[0],
      trade: "",
      propertyType: "PURCHASE AND SALE", // fixed value
      lawyerName: "",
      address: "",
      re: "",
      propertyAddress: "",
      end: "",
      commissionPercentage: "",
      commissionAmount: "",
      sellPrice: "",
      leasePrice: "",
      deposit: "",
      hstAmount: "",
      balanceToVendor: "",
      closingDate: "",
      referenceNumber: newReferenceNumber.toString(),
      totalCommission: "", // <-- Add this line
      tradeClassification: "",
    });
  };

  // Initialize nextReferenceNumber from localStorage if available
  useEffect(() => {
    const storedRef = localStorage.getItem("nextReferenceNumber");
    if (storedRef) {
      setNextReferenceNumber(parseInt(storedRef, 10));
    }
  }, []);

  const handleLawyerTradeSelect = (selectedOption) => {
    if (!selectedOption) {
      setSelectedTradeForInvoice(null);
      setLawyerInvoiceForm((prev) => ({
        ...prev,
        trade: "",
        propertyAddress: "",
        sellPrice: "",
        leasePrice: "",
        deposit: "",
        closingDate: "",
        listingCommissionPercent: "",
        sellingCommissionPercent: "",
        listingCommissionAmount: "",
        sellingCommissionAmount: "",
        listingHSTAmount: "",
        sellingHSTAmount: "",
        balanceToVendor: "",
        totalCommission: commissionTotal,
        referenceNumber: nextReferenceNumber.toString(),
        tradeClassification: "",
        lawyerName: "",
        address: "",
        propertyType: "PURCHASE AND SALE",
      }));
      setNextReferenceNumber((prev) => {
        const next = prev + 1;
        localStorage.setItem("nextReferenceNumber", next);
        return next;
      });
      return;
    }

    const selectedTrade = trades.find(
      (trade) => trade.tradeNumber === selectedOption.value
    );
    setSelectedTradeForInvoice(selectedTrade);

    if (selectedTrade) {
      const keyInfo = selectedTrade.keyInfo || {};
      const trustRecords = selectedTrade.trustRecords || [];
      const commission = selectedTrade.commission || {};
      const commissionIncomeRows = commission.commissionIncomeRows || [];
      const totalCommissionValue = commissionIncomeRows
        .reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0)
        .toFixed(2);
      const people = selectedTrade.people || [];
      const depositAmount =
        trustRecords.length > 0 ? trustRecords[0].amount : "";
      let lawyerName = "";
      let lawyerAddress = "";
      // Always auto-populate lawyer details based on lawyerType
      if (lawyerType === "seller") {
        const sellerLawyer = people.find((p) => p.type === "Seller Lawyer");
        lawyerName = sellerLawyer
          ? `${sellerLawyer.firstName} ${sellerLawyer.lastName}`
          : "";
        lawyerAddress = sellerLawyer?.address || "";
      } else if (lawyerType === "buyer") {
        const buyerLawyer = people.find((p) => p.type === "Buyer Lawyer");
        lawyerName = buyerLawyer
          ? `${buyerLawyer.firstName} ${buyerLawyer.lastName}`
          : "";
        lawyerAddress = buyerLawyer?.address || "";
      }

      // Get trade classification
      const tradeClassification = keyInfo.classification || "";

      // Find commission rows based on classification
      let listingRow = commissionIncomeRows.find(
        (r) => r.end === "Listing Side"
      );
      let sellingRow = commissionIncomeRows.find(
        (r) => r.end === "Selling Side"
      );

      // If no specific end field, use the first row for both
      if (!listingRow && commissionIncomeRows.length > 0) {
        listingRow = commissionIncomeRows[0];
      }
      if (!sellingRow && commissionIncomeRows.length > 0) {
        sellingRow = commissionIncomeRows[0];
      }

      const leasePrice = parseFloat(
        keyInfo.leasePrice || keyInfo.sellPrice || 0
      );
      const listingAmount = parseFloat(listingRow?.listingAmount || 0);
      const sellingAmount = parseFloat(sellingRow?.sellingAmount || 0);
      const listingCommissionPercent = leasePrice
        ? ((listingAmount / leasePrice) * 100).toFixed(2)
        : "";
      const sellingCommissionPercent = leasePrice
        ? ((sellingAmount / leasePrice) * 100).toFixed(2)
        : "";
      setLawyerInvoiceForm((prev) => ({
        ...prev,
        trade: selectedTrade.tradeNumber,
        propertyAddress: `${keyInfo.streetNumber || ""} ${
          keyInfo.streetName || ""
        }`.trim(),
        sellPrice: keyInfo.sellPrice || keyInfo.leasePrice || "",
        leasePrice: keyInfo.leasePrice || keyInfo.sellPrice || "",
        deposit: depositAmount,
        closingDate: keyInfo.closeDate || "", // auto-populate from keyInfo
        lawyerName: lawyerName,
        address: lawyerAddress,
        re: "AGREEMENT OF PURCHASE AND SALE",
        listingCommissionPercent,
        sellingCommissionPercent,
        listingCommissionAmount: listingRow?.listingAmount || "",
        sellingCommissionAmount: sellingRow?.sellingAmount || "",
        listingHSTAmount: listingRow?.listingTax || "",
        sellingHSTAmount: sellingRow?.sellingTax || "",
        totalCommission: totalCommissionValue,
        referenceNumber: nextReferenceNumber.toString(),
        tradeClassification: tradeClassification,
        propertyType: "PURCHASE AND SALE",
      }));
      setNextReferenceNumber((prev) => {
        const next = prev + 1;
        localStorage.setItem("nextReferenceNumber", next);
        return next;
      });
    }
  };

  const calculateBalanceToVendor = () => {
    // Use total commission and deposit only
    const deposit = parseFloat(lawyerInvoiceForm.deposit) || 0;
    const totalCommission = parseFloat(lawyerInvoiceForm.totalCommission) || 0;
    return (totalCommission - deposit).toFixed(2);
  };

  // Helper to get the correct balance label
  const getBalanceLabel = () => {
    const balance = parseFloat(calculateBalanceToVendor());
    return balance > 0 ? "Balance to Brokerage" : "Balance to Vendor";
  };

  const printLawyerInvoice = () => {
    const printWindow = window.open("", "_blank");
    const balanceToVendor = calculateBalanceToVendor();
    const balanceLabel = getBalanceLabel();
    const isLease = lawyerInvoiceForm.propertyType === "LEASE";
    const price = isLease
      ? lawyerInvoiceForm.leasePrice
      : lawyerInvoiceForm.sellPrice;
    // Sum both listing and selling side commissions and HST
    const listingCommissionPercent =
      parseFloat(lawyerInvoiceForm.listingCommissionPercent) || 0;
    const sellingCommissionPercent =
      parseFloat(lawyerInvoiceForm.sellingCommissionPercent) || 0;
    const totalCommissionPercent = (
      listingCommissionPercent + sellingCommissionPercent
    ).toFixed(2);
    const listingCommissionAmount =
      parseFloat(lawyerInvoiceForm.listingCommissionAmount) || 0;
    const sellingCommissionAmount =
      parseFloat(lawyerInvoiceForm.sellingCommissionAmount) || 0;
    const totalCommissionAmount = (
      listingCommissionAmount + sellingCommissionAmount
    ).toFixed(2);
    const listingHSTAmount =
      parseFloat(lawyerInvoiceForm.listingHSTAmount) || 0;
    const sellingHSTAmount =
      parseFloat(lawyerInvoiceForm.sellingHSTAmount) || 0;
    const totalHSTAmount = (listingHSTAmount + sellingHSTAmount).toFixed(2);
    const deposit = lawyerInvoiceForm.deposit;
    const closingDate = lawyerInvoiceForm.closingDate;
    const referenceNumber = lawyerInvoiceForm.trade;
    const propertyAddress = lawyerInvoiceForm.propertyAddress;
    const re = lawyerInvoiceForm.re;
    const lawyerName = lawyerInvoiceForm.lawyerName;
    const address = lawyerInvoiceForm.address;
    const date = lawyerInvoiceForm.date;
    // Commission description
    const commissionDescription = `To our commission of ${totalCommissionPercent}% + HST`;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lawyer Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header img { width: 120px; margin-bottom: 10px; }
          .company-title { font-size: 20px; font-weight: bold; margin-top: 8px; }
          .company-address { margin-bottom: 8px; }
          .section { margin-bottom: 24px; }
          .label { font-weight: bold; display: inline-block; min-width: 120px; }
          .value { display: inline-block; }
          .amount-table { margin-top: 24px; margin-bottom: 24px; }
          .amount-table td { padding: 2px 8px; }
          .amount-table .desc { min-width: 220px; }
          .amount-table .right { text-align: right; min-width: 100px; }
          .amount-table .bold { font-weight: bold; }
          .amount-table .balance { font-weight: bold; }
          .footer { margin-top: 32px; }
          .bank-details { margin-top: 16px; font-size: 15px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${
            window.location.origin + require("../Assets/logo1.jpg")
          }" alt="Bestway Real Estate Ltd. Logo" />
                  <div class="company-title">Bestway Real Estate Ltd., Brokerage</div>
        <div class="company-address">500 St.George Street, Moncton, NB  E1C 1Y3</div>
          <div>Office: 506-268-2900 | Fax: 506-268-2910</div>
        </div>
        <div class="section">
          <div>${date}</div>
          <br/>
          <div>${lawyerName}</div>
          <div>${address}</div>
          <br/>
          <div>Re: ${re}</div>
          <div>${propertyAddress}</div>
        </div>
        <div class="section">
          <div><b>${commissionDescription}</b></div>
          <div>At a ${isLease ? "lease" : "sale"} price of <b>$${Number(
      price
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}</b></div>
          <table class="amount-table">
            <tr>
              <td class="desc">Commission payable</td>
              <td class="right">$${Number(totalCommissionAmount).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}</td>
            </tr>
            <tr>
              <td class="desc">HST # 804667350RT</td>
              <td class="right">$${Number(totalHSTAmount).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}</td>
            </tr>
            <tr>
              <td class="desc">Less: Deposit</td>
              <td class="right">$${Number(deposit).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>
            </tr>
            <tr class="balance">
              <td class="desc">${balanceLabel}</td>
              <td class="right">$${Number(balanceToVendor).toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</td>
            </tr>
          </table>
          <div>Closing Date: <b>${closingDate}</b></div>
          <div>Reference Number: <b>${referenceNumber}</b></div>
          ${
            balanceLabel === "Balance to Brokerage"
              ? `
          <div class="bank-details">
            <br/>
            <b>Please make cheque payable to Bestway Real Estate Ltd., Brokerage or adding by EFT using the Bank Details below:</b><br/>
            Bank: TD Canada Trust<br/>
            Institution: 004<br/>
            Transit: 12892<br/>
            Account: 521-9966
          </div>
          `
              : ""
          }
        </div>
        <div class="footer">
          Please feel free to contact our deals department should you require more information/clarification. 506-268-2900. Or E-mail adminnb@bestwayrealtyinc.com.<br/><br/>
          Sincerely,<br/>
          Administrator<br/>
                  Bestway Real Estate Ltd., Brokerage<br/>
       500 St.George Street<br/>
        Moncton, NB E1C 1Y3<br/>
                  Office:506-268-2900<br/>
        Fax: 506-268-2910<br/>
          adminnb@bestwayrealtyinc.com
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Add state for brokerTotal (from CommissionForm)
  const [brokerTotal, setBrokerTotal] = useState("");

  // Auto-calculate AR based on Classification, trust amount, and totals
  useEffect(() => {
    // Calculate total trust amount from trust records
    const totalTrustAmount = trustRecords.reduce((sum, record) => {
      return sum + (parseFloat(record.amount) || 0);
    }, 0);

    if (keyInfoData.classification === "LISTING SIDE") {
      // Check if we hold is "Yes" in any trust record
      const weHoldYes = trustRecords.some((record) => record.weHold === "Yes");

      if (weHoldYes) {
        // AR = Amount (Trust Section) - Total (Commission Income section)
        const arValue = totalTrustAmount - parseFloat(commissionTotal || 0);
        setCommissionAR(arValue.toFixed(2));
      } else {
        // If we don't hold, AR = Total (Commission Income section)
        setCommissionAR(commissionTotal);
      }
    } else if (keyInfoData.classification === "CO-OPERATING SIDE") {
      // AR = Total (Commission Income section)
      setCommissionAR(commissionTotal);
    }
  }, [keyInfoData.classification, commissionTotal, brokerTotal, trustRecords]);

  // Add handler to auto-populate people from selected listing
  const handleListingSelected = (selectedListing) => {
    if (!selectedListing) return;

    console.log("handleListingSelected called with:", selectedListing);
    console.log("selectedListing.agent:", selectedListing.agent);
    console.log("selectedListing.agents:", selectedListing.agents);
    console.log("selectedListing keys:", Object.keys(selectedListing));

    // Set the selected listing state
    setSelectedListing(selectedListing);

    // Set people from listing (only people section should bring data from listing)
    if (selectedListing.people && Array.isArray(selectedListing.people)) {
      setPeople(
        selectedListing.people.map((person) => ({
          ...person,
          // For Sale: type = 'Seller', For Lease: type = 'Landlord'
          type: keyInfoData.dealType === "Lease" ? "Landlord" : "Seller",
        }))
      );
    }
    // Outside brokers section should be manually entered - no auto-population from listing
  };

  // Define these variables before the return/JSX
  const propertyTypeValue =
    (invoiceKeyInfo.dealType || "").toUpperCase() === "LEASE"
      ? "LEASE"
      : "SALE";
  const classificationValue = invoiceKeyInfo.classification || "";
  let commissionPercentageValue = "";
  if (propertyTypeValue === "SALE") {
    if (classificationValue === "LISTING SIDE") {
      commissionPercentageValue = invoiceKeyInfo.listingCommission || "";
    } else if (classificationValue === "SELLING SIDE") {
      commissionPercentageValue = invoiceKeyInfo.sellingCommission || "";
    }
  }

  return (
    <div className="flex flex-col">
      <Navbar />

      {/* Secondary Navigation */}
      <div className="bg-white py-4 border-b">
        <div className="max-w-screen-2xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "list"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("list")}
            >
              List
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "key-info"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("key-info")}
            >
              Key Info
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "people"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("people")}
            >
              People
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "outside-brokers"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("outside-brokers")}
            >
              Outside Brokers
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "trust"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("trust")}
            >
              Trust
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "commission"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("commission")}
            >
              Commission
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "agent-info"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("agent-info")}
            >
              Agent Info
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "invoice"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("invoice")}
            >
              Invoice
            </button>
            <button
              className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                activeTab === "finalize-trade"
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("finalize-trade")}
            >
              Finalize Trade
            </button>
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-screen-2xl mx-auto py-6 px-4">
        {activeTab === "list" && <TradeList />}
        {activeTab === "key-info" && (
          <KeyInfoForm
            keyInfoData={keyInfoData}
            handleKeyInfoChange={handleKeyInfoChange}
            goToNextSection={goToNextSection}
            lookupSuccess={lookupSuccess}
            lookupError={lookupError}
            isLoading={isLoading}
            isLoadingTradeNumber={isLoadingTradeNumber}
            nextTradeNumber={nextTradeNumber}
            listings={listings}
            setKeyInfoData={setKeyInfoData}
            onListingSelected={handleListingSelected}
            trades={trades}
            currentTradeNumber={nextTradeNumber}
          />
        )}
        {activeTab === "people" && (
          <PeopleForm
            people={people}
            person={person}
            setPerson={setPerson}
            setPeople={setPeople}
            selectedPersonType={selectedPersonType}
            setSelectedPersonType={setSelectedPersonType}
            editingPersonIndex={editingPersonIndex}
            setEditingPersonIndex={setEditingPersonIndex}
            showDeletePersonConfirm={showDeletePersonConfirm}
            setShowDeletePersonConfirm={setShowDeletePersonConfirm}
            personToDelete={personToDelete}
            setPersonToDelete={setPersonToDelete}
            handlePersonInputChange={handlePersonInputChange}
            handlePersonTypeSelect={handlePersonTypeSelect}
            handlePersonSubmit={handlePersonSubmit}
            handlePersonEdit={handlePersonEdit}
            handlePersonDelete={handlePersonDelete}
            confirmDeletePerson={confirmDeletePerson}
            cancelDeletePerson={cancelDeletePerson}
            goToNextSection={goToNextSection}
            goToPreviousSection={goToPreviousSection}
            listingNumber={keyInfoData.listingNumber}
            dealType={keyInfoData.dealType}
            weManage={keyInfoData.weManage}
          />
        )}
        {activeTab === "outside-brokers" && (
          // Only render OutsideBrokersForm here, with correct props
          <OutsideBrokersForm
            outsideBrokers={outsideBrokers}
            setOutsideBrokers={setOutsideBrokers}
            broker={broker}
            setBroker={setBroker}
            selectedBrokerType={selectedBrokerType}
            setSelectedBrokerType={setSelectedBrokerType}
            editingBrokerIndex={editingBrokerIndex}
            setEditingBrokerIndex={setEditingBrokerIndex}
            showDeleteBrokerConfirm={showDeleteBrokerConfirm}
            setShowDeleteBrokerConfirm={setShowDeleteBrokerConfirm}
            brokerToDelete={brokerToDelete}
            setBrokerToDelete={setBrokerToDelete}
            handleBrokerInputChange={handleBrokerInputChange}
            handleBrokerTypeSelect={handleBrokerTypeSelect}
            handleBrokerSubmit={handleBrokerSubmit}
            handleBrokerEdit={handleBrokerEdit}
            handleBrokerDelete={handleBrokerDelete}
            confirmDeleteBroker={confirmDeleteBroker}
            cancelDeleteBroker={cancelDeleteBroker}
            goToNextSection={goToNextSection}
            goToPreviousSection={goToPreviousSection}
            listingNumber={keyInfoData.listingNumber}
            weManage={keyInfoData.weManage}
            dealType={keyInfoData.dealType}
          />
        )}
        {activeTab === "trust" && (
          // Only render TrustForm here, with correct props
          <TrustForm
            trustRecords={trustRecords}
            setTrustRecords={setTrustRecords}
            trust={trust}
            setTrust={setTrust}
            editingTrustIndex={editingTrustIndex}
            setEditingTrustIndex={setEditingTrustIndex}
            showDeleteTrustConfirm={showDeleteTrustConfirm}
            setShowDeleteTrustConfirm={setShowDeleteTrustConfirm}
            trustToDelete={trustToDelete}
            setTrustToDelete={setTrustToDelete}
            handleTrustInputChange={handleTrustInputChange}
            handleTrustSubmit={handleTrustSubmit}
            handleTrustEdit={handleTrustEdit}
            handleTrustDelete={handleTrustDelete}
            confirmDeleteTrust={confirmDeleteTrust}
            cancelDeleteTrust={cancelDeleteTrust}
            goToNextSection={goToNextSection}
            goToPreviousSection={goToPreviousSection}
            tradeNumber={keyInfoData.tradeNumber || nextTradeNumber}
            userName={user?.displayName || user?.email || ""}
          />
        )}
        {activeTab === "commission" && (
          <CommissionForm
            sellPrice={keyInfoData.sellPrice}
            closingDate={commissionClosingDate}
            status={commissionStatus}
            ar={commissionAR}
            onClosingDateChange={(e) =>
              setCommissionClosingDate(e.target.value)
            }
            onStatusChange={(e) => setCommissionStatus(e.target.value)}
            onARChange={(e) => setCommissionAR(e.target.value)}
            listingCommission={listingCommission}
            sellingCommission={sellingCommission}
            onListingCommissionChange={(e) =>
              setListingCommission(e.target.value)
            }
            onSellingCommissionChange={(e) =>
              setSellingCommission(e.target.value)
            }
            goToNextSection={goToNextSection}
            goToPreviousSection={goToPreviousSection}
            tradeNumber={nextTradeNumber}
            saleClosingRows={saleClosingRows}
            commissionIncomeRows={commissionIncomeRows}
            outsideBrokersRows={outsideBrokersRows}
            editingSaleClosingIdx={editingSaleClosingIdx}
            editingCommissionIncomeIdx={editingCommissionIncomeIdx}
            editingOutsideBrokerIdx={editingOutsideBrokerIdx}
            brokerAgentName={brokerAgentName}
            brokerBrokerage={brokerBrokerage}
            brokerSellingAmount={brokerSellingAmount}
            brokerEnd={brokerEnd}
            onBrokerAgentNameChange={(e) => setBrokerAgentName(e.target.value)}
            onBrokerBrokerageChange={(e) => setBrokerBrokerage(e.target.value)}
            onBrokerSellingAmountChange={(e) =>
              setBrokerSellingAmount(e.target.value)
            }
            onBrokerEndChange={(e) => setBrokerEnd(e.target.value)}
            onAddCommissionInfo={handleAddCommissionInfo}
            onEditSaleClosing={handleEditSaleClosing}
            onDeleteSaleClosing={handleDeleteSaleClosing}
            onEditCommissionIncome={handleEditCommissionIncome}
            onDeleteCommissionIncome={handleDeleteCommissionIncome}
            onEditOutsideBroker={handleEditOutsideBroker}
            onDeleteOutsideBroker={handleDeleteOutsideBroker}
            outsideBrokers={outsideBrokers}
            onCommissionTotalChange={setCommissionTotal}
            // Add a new prop to get brokerTotal from CommissionForm
            onBrokerTotalChange={setBrokerTotal}
          />
        )}
        {activeTab === "agent-info" && (
          <AgentCommissionInfo
            goToNextSection={goToNextSection}
            goToPreviousSection={goToPreviousSection}
            agent={agentCommissionData}
            setAgent={setAgentCommissionData}
            agents={agentCommissionList}
            setAgents={setAgentCommissionList}
            editingIndex={agentCommissionEditingIndex}
            setEditingIndex={setAgentCommissionEditingIndex}
            showDeleteModal={agentCommissionShowDeleteModal}
            setShowDeleteModal={setAgentCommissionShowDeleteModal}
            deletingIndex={agentCommissionDeletingIndex}
            setDeletingIndex={setAgentCommissionDeletingIndex}
            showBuyerRebateModal={agentCommissionShowBuyerRebateModal}
            setShowBuyerRebateModal={setAgentCommissionShowBuyerRebateModal}
            buyerRebateIncluded={agentCommissionBuyerRebateIncluded}
            setBuyerRebateIncluded={setAgentCommissionBuyerRebateIncluded}
            buyerRebateAmount={agentCommissionBuyerRebateAmount}
            setBuyerRebateAmount={setAgentCommissionBuyerRebateAmount}
            pendingAgent={agentCommissionPendingAgent}
            setPendingAgent={setAgentCommissionPendingAgent}
            validationErrors={agentCommissionValidationErrors}
            setValidationErrors={setAgentCommissionValidationErrors}
            onSaveTrade={handleSaveTrade}
            commissionTotal={commissionTotal}
            classification={keyInfoData.classification}
            commissionData={commissionData}
            selectedListing={selectedListing}
            isEditingExistingTrade={false}
          ></AgentCommissionInfo>
        )}
        {activeTab === "invoice" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4">Invoice</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-md font-medium mb-2">
                  Select Invoice Type:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="lawyer"
                      checked={invoiceType === "lawyer"}
                      onChange={(e) => setInvoiceType("lawyer")}
                      className="form-radio text-blue-900"
                    />
                    <span className="ml-2">Invoice Lawyer</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="brokerage"
                      checked={invoiceType === "brokerage"}
                      onChange={(e) => setInvoiceType("brokerage")}
                      className="form-radio text-blue-900"
                    />
                    <span className="ml-2">Listing Brokerage</span>
                  </label>
                </div>
              </div>
              {invoiceType === "brokerage" && (
                <div className="space-y-4 border-t pt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Select Trade
                    </label>
                    <Select
                      options={tradeOptions}
                      onChange={handleInvoiceTradeSelect}
                      value={
                        selectedInvoiceTrade
                          ? tradeOptions.find(
                              (opt) =>
                                opt.value === selectedInvoiceTrade.tradeNumber
                            )
                          : null
                      }
                      placeholder="Type or select trade number/address..."
                      isClearable
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    {/* Property type radio buttons removed as per request */}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={invoiceForm.date}
                        onChange={handleInvoiceFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Trade #
                      </label>
                      <input
                        type="text"
                        value={selectedInvoiceTrade.tradeNumber || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Brokerage Name
                      </label>
                      <input
                        type="text"
                        value={invoiceFirstBroker.company || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={invoiceFirstBroker.address || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Re
                      </label>
                      <input
                        type="text"
                        value={
                          propertyTypeValue === "SALE"
                            ? "AGREEMENT OF PURCHASE AND SALE"
                            : "AGREEMENT OF LEASE"
                        }
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Property Address
                      </label>
                      <input
                        type="text"
                        value={`${invoiceKeyInfo.streetNumber || ""} ${
                          invoiceKeyInfo.streetName || ""
                        }`.trim()}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        To our commission
                      </label>
                      <input
                        type="text"
                        value={
                          propertyTypeValue === "SALE"
                            ? "Commission Percentage"
                            : "Half Month"
                        }
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    {/* Co-operating Commission field, only show percentage if SALE */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Co-operating Commission
                      </label>
                      <input
                        type="text"
                        value={
                          propertyTypeValue === "SALE"
                            ? invoiceKeyInfo.sellCommission || ""
                            : ""
                        }
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    {propertyTypeValue === "LEASE" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Lease Amount
                        </label>
                        <input
                          type="text"
                          value={invoiceKeyInfo.sellPrice || ""}
                          readOnly
                          className="w-full rounded border-gray-300 bg-gray-100"
                        />
                      </div>
                    )}
                    {propertyTypeValue === "RENT" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Sell Price
                        </label>
                        <input
                          type="text"
                          value={invoiceKeyInfo.sellPrice || ""}
                          readOnly
                          className="w-full rounded border-gray-300 bg-gray-100"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        MLS Fees
                      </label>
                      <input
                        type="text"
                        value={invoiceFirstOBRow.sellingAmount || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Total
                      </label>
                      <input
                        type="text"
                        value={invoiceFirstOBRow.total || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Closing Date
                      </label>
                      <input
                        type="text"
                        value={invoiceKeyInfo.closeDate || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.referenceNumber}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sale Price
                      </label>
                      <input
                        type="text"
                        value={invoiceKeyInfo.sellPrice || ""}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Property Type
                      </label>
                      <input
                        type="text"
                        value={propertyTypeValue}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Classification
                      </label>
                      <input
                        type="text"
                        value={classificationValue}
                        readOnly
                        className="w-full rounded border-gray-300 bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePrintInvoice();
                      }}
                      className="bg-blue-900 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors"
                    >
                      Print Invoice
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEmailPDF();
                      }}
                      className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                      disabled={!invoiceFirstBroker.email}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email PDF
                    </button>
                  </div>
                </div>
              )}
              {invoiceType === "lawyer" && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Select Lawyer Type:
                  </h3>
                  <div className="flex space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="lawyerType"
                        value="seller"
                        checked={lawyerType === "seller"}
                        onChange={(e) => handleLawyerTypeChange(e.target.value)}
                        className="mr-2"
                      />
                      Seller Lawyer
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="lawyerType"
                        value="buyer"
                        checked={lawyerType === "buyer"}
                        onChange={(e) => handleLawyerTypeChange(e.target.value)}
                        className="mr-2"
                      />
                      Buyer Lawyer
                    </label>
                  </div>

                  {lawyerType && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h4 className="text-lg font-semibold mb-4">
                        Lawyer Invoice Form
                      </h4>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trade Number
                        </label>
                        <Select
                          value={
                            selectedTradeForInvoice
                              ? {
                                  value: selectedTradeForInvoice.tradeNumber,
                                  label:
                                    `${selectedTradeForInvoice.tradeNumber} - ${
                                      selectedTradeForInvoice.keyInfo
                                        ?.streetNumber || ""
                                    } ${
                                      selectedTradeForInvoice.keyInfo
                                        ?.streetName || ""
                                    }`.trim() || "No Address",
                                }
                              : null
                          }
                          onChange={handleLawyerTradeSelect}
                          options={trades.map((trade) => ({
                            value: trade.tradeNumber,
                            label:
                              `${trade.tradeNumber} - ${
                                trade.keyInfo?.streetNumber || ""
                              } ${trade.keyInfo?.streetName || ""}`.trim() ||
                              "No Address",
                          }))}
                          isClearable
                          placeholder="Search and select trade..."
                          className="w-full"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Type
                        </label>
                        <input
                          type="text"
                          name="propertyType"
                          value="PURCHASE AND SALE"
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={lawyerInvoiceForm.date}
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trade
                          </label>
                          <input
                            type="text"
                            value={lawyerInvoiceForm.trade}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference Number
                          </label>
                          <input
                            type="text"
                            name="referenceNumber"
                            value={lawyerInvoiceForm.referenceNumber}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lawyer Name
                          </label>
                          <input
                            type="text"
                            name="lawyerName"
                            value={lawyerInvoiceForm.lawyerName}
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={lawyerInvoiceForm.address}
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Re
                          </label>
                          <input
                            type="text"
                            value={
                              lawyerInvoiceForm.propertyType === "LEASE"
                                ? "AGREEMENT OF LEASE"
                                : "AGREEMENT OF PURCHASE AND SALE"
                            }
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Address
                          </label>
                          <input
                            type="text"
                            name="propertyAddress"
                            value={lawyerInvoiceForm.propertyAddress}
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {lawyerInvoiceForm.propertyType === "LEASE"
                              ? "Lease Price"
                              : "Sell Price"}
                          </label>
                          <input
                            type="text"
                            name={
                              lawyerInvoiceForm.propertyType === "LEASE"
                                ? "leasePrice"
                                : "sellPrice"
                            }
                            value={
                              lawyerInvoiceForm.propertyType === "LEASE"
                                ? lawyerInvoiceForm.leasePrice
                                : lawyerInvoiceForm.sellPrice
                            }
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deposit
                          </label>
                          <input
                            type="text"
                            name="deposit"
                            value={lawyerInvoiceForm.deposit}
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {(() => {
                              const deposit =
                                parseFloat(lawyerInvoiceForm.deposit) || 0;
                              const tradeClassification =
                                lawyerInvoiceForm.tradeClassification || "";

                              let commissionAmount = 0;
                              let hstAmount = 0;

                              if (tradeClassification === "LISTING SIDE") {
                                commissionAmount =
                                  parseFloat(
                                    lawyerInvoiceForm.listingCommissionAmount
                                  ) || 0;
                                hstAmount =
                                  parseFloat(
                                    lawyerInvoiceForm.listingHSTAmount
                                  ) || 0;
                              } else if (
                                tradeClassification === "SELLING SIDE"
                              ) {
                                commissionAmount =
                                  parseFloat(
                                    lawyerInvoiceForm.sellingCommissionAmount
                                  ) || 0;
                                hstAmount =
                                  parseFloat(
                                    lawyerInvoiceForm.sellingHSTAmount
                                  ) || 0;
                              } else {
                                commissionAmount =
                                  parseFloat(
                                    lawyerInvoiceForm.totalCommission
                                  ) || 0;
                                hstAmount =
                                  (parseFloat(
                                    lawyerInvoiceForm.listingHSTAmount
                                  ) || 0) +
                                  (parseFloat(
                                    lawyerInvoiceForm.sellingHSTAmount
                                  ) || 0);
                              }

                              return commissionAmount + hstAmount > deposit
                                ? "Balance to Brokerage"
                                : "Balance to Vendor";
                            })()}
                          </label>
                          <input
                            type="text"
                            name="balanceToVendor"
                            value={calculateBalanceToVendor()}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Closing Date
                          </label>
                          <input
                            type="text"
                            name="closingDate"
                            value={lawyerInvoiceForm.closingDate}
                            onChange={handleLawyerInvoiceFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Commission
                          </label>
                          <input
                            type="text"
                            name="totalCommission"
                            value={lawyerInvoiceForm.totalCommission}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Listing Side Commission (%)
                          </label>
                          <input
                            type="text"
                            name="listingCommissionPercent"
                            value={
                              lawyerInvoiceForm.listingCommissionPercent || ""
                            }
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selling Side Commission (%)
                          </label>
                          <input
                            type="text"
                            name="sellingCommissionPercent"
                            value={
                              lawyerInvoiceForm.sellingCommissionPercent || ""
                            }
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Listing Side Commission Amount
                          </label>
                          <input
                            type="text"
                            name="listingCommissionAmount"
                            value={
                              lawyerInvoiceForm.listingCommissionAmount || ""
                            }
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selling Side Commission Amount
                          </label>
                          <input
                            type="text"
                            name="sellingCommissionAmount"
                            value={
                              lawyerInvoiceForm.sellingCommissionAmount || ""
                            }
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Listing Side HST Amount
                          </label>
                          <input
                            type="text"
                            name="listingHSTAmount"
                            value={lawyerInvoiceForm.listingHSTAmount || ""}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selling Side HST Amount
                          </label>
                          <input
                            type="text"
                            name="sellingHSTAmount"
                            value={lawyerInvoiceForm.sellingHSTAmount || ""}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trade Classification
                          </label>
                          <input
                            type="text"
                            name="tradeClassification"
                            value={lawyerInvoiceForm.tradeClassification || ""}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            printLawyerInvoice();
                          }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Print Invoice
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEmailLawyerPDF();
                          }}
                          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
                          disabled={!selectedTradeForInvoice || !lawyerType}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Email PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
        {activeTab === "finalize-trade" && (
          <FinalizeTradeSection
            trades={trades}
            onTradeFinalized={() => {
              // Refresh trades data after finalization
              const fetchTrades = async () => {
                try {
                  const response = await axiosInstance.get("/trades");
                  setTrades(response.data);
                } catch (error) {
                  console.error("Error fetching trades:", error);
                }
              };
              fetchTrades();
            }}
          />
        )}
      </div>

      {showTradeModal && selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          onClose={() => setShowTradeModal(false)}
          onUpdate={(updatedTrade) => {
            // Update the selected trade with the new data
            setSelectedTrade(updatedTrade);
            // Refresh the trades list to show updated data
            const fetchTrades = async () => {
              try {
                const response = await axiosInstance.get("/trades");
                setTrades(response.data);
              } catch (error) {
                console.error("Error fetching trades:", error);
              }
            };
            fetchTrades();
          }}
        />
      )}
    </div>
  );
};

export default TradeInfo;
