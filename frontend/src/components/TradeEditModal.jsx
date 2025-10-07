import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import KeyInfoForm from "./KeyInfoForm";
import PeopleForm from "./PeopleForm";
import OutsideBrokersForm from "./OutsideBrokersForm";
import TrustForm from "./TrustForm";
import CommissionForm from "./CommissionForm";
import AgentCommissionInfo from "./AgentCommissionInfo";
import axiosInstance from "../config/axios";

const TradeEditModal = ({ trade, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("key-info");
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [isLoadingTradeNumber, setIsLoadingTradeNumber] = useState(false);
  const [nextTradeNumber, setNextTradeNumber] = useState(
    trade?.tradeNumber || ""
  );

  // Form data states
  const [keyInfoData, setKeyInfoData] = useState({
    listingNumber: trade?.keyInfo?.listingNumber || "",
    tradeNumber: trade?.tradeNumber || "",
    status: trade?.keyInfo?.status || "AVAILABLE",
    streetNumber: trade?.keyInfo?.streetNumber || "",
    streetName: trade?.keyInfo?.streetName || "",
    unit: trade?.keyInfo?.unit || "",
    city: trade?.keyInfo?.city || "",
    province: trade?.keyInfo?.province || "",
    postalCode: trade?.keyInfo?.postalCode || "",
    offerDate: trade?.keyInfo?.offerDate || "",
    firmDate: trade?.keyInfo?.firmDate || "",
    closeDate: trade?.keyInfo?.closeDate || "",
    entryDate: trade?.keyInfo?.entryDate || "",
    finalizedDate: trade?.keyInfo?.finalizedDate || "",
    sellPrice: trade?.keyInfo?.sellPrice || "",
    mlsNumber: trade?.keyInfo?.mlsNumber || "",
    propertyType: trade?.keyInfo?.propertyType || "",
    dealType: trade?.keyInfo?.dealType || "",
    weManage: trade?.keyInfo?.weManage || "",
    classification: trade?.keyInfo?.classification || "LISTING SIDE",
    firm: trade?.keyInfo?.firm || "",
    listCommission: trade?.keyInfo?.listCommission || "",
    sellCommission: trade?.keyInfo?.sellCommission || "",
    conditions: trade?.conditions || [],
  });

  const [people, setPeople] = useState(trade?.people || []);

  // Debug people state changes
  useEffect(() => {
    console.log("People state changed:", people);
  }, [people]);
  const [person, setPerson] = useState({
    type: "",
    firstName: "",
    lastName: "",
    email: "",
    primaryPhone: "",
    cellPhone: "",
    address: "",
    end: "Listing End",
    companyName: "",
  });

  const [outsideBrokers, setOutsideBrokers] = useState(
    trade?.outsideBrokers || []
  );

  // Debug outside brokers state changes
  useEffect(() => {
    console.log("Outside brokers state changed:", outsideBrokers);
  }, [outsideBrokers]);
  const [broker, setBroker] = useState({
    type: "",
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    payBroker: "",
    end: "",
    primaryPhone: "",
    chargedHST: "Yes",
    address: "",
    sellingAmount: "",
    tax: "",
    total: "",
  });

  const [trustRecords, setTrustRecords] = useState(trade?.trustRecords || []);
  const [trust, setTrust] = useState({
    weHold: "",
    heldBy: "",
    received: "",
    depositDate: "",
    receivedFrom: "",
    amount: "",
    reference: "",
    paymentType: "",
    currency: "",
    earnInterest: "",
  });

  // Commission form states
  const [commissionClosingDate, setCommissionClosingDate] = useState(
    trade?.keyInfo?.closeDate || ""
  );
  const [commissionStatus, setCommissionStatus] = useState("Active");
  const [commissionAR, setCommissionAR] = useState("");
  const [listingCommission, setListingCommission] = useState(
    trade?.keyInfo?.listCommission || ""
  );
  const [sellingCommission, setSellingCommission] = useState(
    trade?.keyInfo?.sellCommission || ""
  );
  const [saleClosingRows, setSaleClosingRows] = useState(
    trade?.commission?.saleClosingRows || []
  );
  const [commissionIncomeRows, setCommissionIncomeRows] = useState(
    trade?.commission?.commissionIncomeRows || []
  );
  const [outsideBrokersRows, setOutsideBrokersRows] = useState(
    trade?.commission?.outsideBrokersRows || []
  );
  const [commissionTotal, setCommissionTotal] = useState(0);

  // Agent commission states
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
    taxOnFees: "",
    total: "",
    totalFees: "",
    netCommission: "",
    lead: "No",
  });
  const [agentCommissionList, setAgentCommissionList] = useState(
    trade?.agentCommissionList || []
  );

  // Form management states
  const [selectedPersonType, setSelectedPersonType] = useState("");
  const [editingPersonIndex, setEditingPersonIndex] = useState(null);
  const [showDeletePersonConfirm, setShowDeletePersonConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);

  const [selectedBrokerType, setSelectedBrokerType] = useState("");
  const [editingBrokerIndex, setEditingBrokerIndex] = useState(null);
  const [showDeleteBrokerConfirm, setShowDeleteBrokerConfirm] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState(null);

  const [editingTrustIndex, setEditingTrustIndex] = useState(null);
  const [showDeleteTrustConfirm, setShowDeleteTrustConfirm] = useState(false);
  const [trustToDelete, setTrustToDelete] = useState(null);

  const [editingSaleClosingIdx, setEditingSaleClosingIdx] = useState(null);
  const [editingCommissionIncomeIdx, setEditingCommissionIncomeIdx] =
    useState(null);
  const [editingOutsideBrokerIdx, setEditingOutsideBrokerIdx] = useState(null);

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
  ] = useState("");
  const [
    agentCommissionBuyerRebateAmount,
    setAgentCommissionBuyerRebateAmount,
  ] = useState("");
  const [agentCommissionPendingAgent, setAgentCommissionPendingAgent] =
    useState(null);
  const [agentCommissionValidationErrors, setAgentCommissionValidationErrors] =
    useState({});

  // Commission data calculation
  const [commissionData, setCommissionData] = useState({
    listingAmount: "0.00",
    sellingAmount: "0.00",
    listingTax: "0.00",
    sellingTax: "0.00",
  });

  // Initialize commission data from existing trade data
  useEffect(() => {
    if (trade?.commission?.commissionIncomeRows?.length > 0) {
      const row = trade.commission.commissionIncomeRows[0];
      setCommissionData({
        listingAmount: row.listingAmount || "0.00",
        sellingAmount: row.sellingAmount || "0.00",
        listingTax: row.listingTax || "0.00",
        sellingTax: row.sellingTax || "0.00",
      });
    }
  }, [trade]);

  // Initialize commission percentages from keyInfo when trade loads
  useEffect(() => {
    if (trade?.keyInfo) {
      setListingCommission(trade.keyInfo.listCommission || "");
      setSellingCommission(trade.keyInfo.sellCommission || "");
    }
  }, [trade]);

  // Add these states after other commission form states
  const [brokerAgentName, setBrokerAgentName] = useState("");
  const [brokerBrokerage, setBrokerBrokerage] = useState("");
  const [brokerSellingAmount, setBrokerSellingAmount] = useState("");

  // Add new state for brokerTotal
  const [brokerTotal, setBrokerTotal] = useState("");

  // Initialize broker data from existing trade data
  useEffect(() => {
    if (trade?.commission?.outsideBrokersRows?.length > 0) {
      const row = trade.commission.outsideBrokersRows[0];
      setBrokerAgentName(row.agentName || "");
      setBrokerBrokerage(row.brokerage || "");
      setBrokerSellingAmount(row.sellingAmount || "");
    }
  }, [trade]);

  // Initialize agent commission data from existing trade data
  useEffect(() => {
    if (trade?.agentCommissionList?.length > 0) {
      const firstAgent = trade.agentCommissionList[0];
      setAgentCommissionData({
        agentId: firstAgent.agentId || "",
        agentName: firstAgent.agentName || "",
        classification: firstAgent.classification || "",
        ytdCommission: firstAgent.ytdCommission || "Yes",
        awardAmount: firstAgent.awardAmount || "",
        percentage: firstAgent.percentage || 100,
        amount: firstAgent.amount || "",
        feeInfo: firstAgent.feeInfo || "plan500",
        feesDeducted: firstAgent.feesDeducted || "",
        tax: firstAgent.tax || "",
        taxOnFees: firstAgent.taxOnFees || "",
        total: firstAgent.total || "",
        totalFees: firstAgent.totalFees || "",
        netCommission: firstAgent.netCommission || "",
        lead: firstAgent.lead || "No",
      });
    }
  }, [trade]);

  // Populate people and agents from listing when trade is loaded in edit mode
  useEffect(() => {
    if (trade && keyInfoData.listingNumber && listings.length > 0) {
      // Find the listing data from the listings array
      const selectedListing = listings.find(
        (listing) =>
          listing.listingNumber.toString() === keyInfoData.listingNumber
      );

      if (selectedListing) {
        console.log("Found selected listing:", selectedListing);
        console.log("Listing people:", selectedListing.people);
        console.log("Listing agents:", selectedListing.agents);

        // Only populate if people are empty (initial load) - outside brokers should be manually entered
        if (people.length === 0) {
          // Set people from listing
          if (selectedListing.people && Array.isArray(selectedListing.people)) {
            const mappedPeople = selectedListing.people.map((person) => ({
              ...person,
              // For Sale: type = 'Seller', For Lease: type = 'Landlord'
              type: keyInfoData.dealType === "Lease" ? "Landlord" : "Seller",
            }));
            console.log("Setting people:", mappedPeople);
            setPeople(mappedPeople);
          }

          // Outside brokers should be manually entered - no auto-population from listing
        }
      }
    }
  }, [
    trade,
    keyInfoData.listingNumber,
    keyInfoData.dealType,
    listings,
    people.length,
  ]);

  // Fetch listings on mount
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

  // Fetch trades on mount
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axiosInstance.get("/trades");
        setTrades(response.data);
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };
    fetchTrades();
  }, []);

  // Calculate commission data when commission income rows change
  useEffect(() => {
    // Find the first commission income row (usually only one)
    const row = commissionIncomeRows[0] || {};
    setCommissionData({
      listingAmount: row.listingAmount || "0.00",
      sellingAmount: row.sellingAmount || "0.00",
    });
  }, [commissionIncomeRows]);

  // Recalculate commission data when percentages or sell price change
  useEffect(() => {
    if (keyInfoData.sellPrice && (listingCommission || sellingCommission)) {
      const sellPriceNum = parseFloat(keyInfoData.sellPrice) || 0;
      const listingCommissionNum = parseFloat(listingCommission) || 0;
      const sellingCommissionNum = parseFloat(sellingCommission) || 0;

      const listingAmount = (
        (sellPriceNum * listingCommissionNum) /
        100
      ).toFixed(2);
      const sellingAmount = (
        (sellPriceNum * sellingCommissionNum) /
        100
      ).toFixed(2);

      const listingTax = (parseFloat(listingAmount) * 0.15).toFixed(2);
      const sellingTax = (parseFloat(sellingAmount) * 0.15).toFixed(2);

      setCommissionData({
        listingAmount,
        sellingAmount,
        listingTax,
        sellingTax,
      });
    }
  }, [keyInfoData.sellPrice, listingCommission, sellingCommission]);

  // Calculate commission percentages from existing commission income rows
  useEffect(() => {
    if (commissionIncomeRows.length > 0 && keyInfoData.sellPrice) {
      const row = commissionIncomeRows[0];
      const sellPriceNum = parseFloat(keyInfoData.sellPrice) || 0;

      if (sellPriceNum > 0) {
        // Calculate listing commission percentage
        const listingAmount = parseFloat(row.listingAmount) || 0;
        const listingCommissionPercent =
          listingAmount > 0
            ? ((listingAmount / sellPriceNum) * 100).toFixed(2)
            : "";

        // Calculate selling commission percentage
        const sellingAmount = parseFloat(row.sellingAmount) || 0;
        const sellingCommissionPercent =
          sellingAmount > 0
            ? ((sellingAmount / sellPriceNum) * 100).toFixed(2)
            : "";

        setListingCommission(listingCommissionPercent);
        setSellingCommission(sellingCommissionPercent);
      }
    }
  }, [commissionIncomeRows, keyInfoData.sellPrice]);

  // Auto-sync commission closing date with key info close date
  useEffect(() => {
    if (keyInfoData.closeDate) {
      setCommissionClosingDate(keyInfoData.closeDate);
    }
  }, [keyInfoData.closeDate]);

  // Sync commission percentages when key info changes
  useEffect(() => {
    setListingCommission(keyInfoData.listCommission || "");
    setSellingCommission(keyInfoData.sellCommission || "");
  }, [keyInfoData.listCommission, keyInfoData.sellCommission]);

  // Form handlers
  const handleKeyInfoChange = (e) => {
    const { name, value } = e.target;
    setKeyInfoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonInputChange = (e) => {
    const { name, value } = e.target;
    setPerson((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    console.log("handlePersonSubmit called");
    console.log("Current person:", person);
    console.log("Selected person type:", selectedPersonType);
    console.log("Current people array:", people);

    // Ensure the person object has the correct type
    const personToAdd = {
      ...person,
      type: selectedPersonType,
    };

    console.log("Person to add:", personToAdd);

    if (editingPersonIndex !== null) {
      const updatedPeople = [...people];
      updatedPeople[editingPersonIndex] = personToAdd;
      setPeople(updatedPeople);
      setEditingPersonIndex(null);
      console.log("Updated person at index:", editingPersonIndex);
    } else {
      setPeople([...people, personToAdd]);
      console.log("Added new person to array");
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
      companyName: "",
    });
    setSelectedPersonType("");
  };

  const handlePersonEdit = (index) => {
    setPerson(people[index]);
    setEditingPersonIndex(index);
    setSelectedPersonType(people[index].type);
  };

  const handlePersonDelete = (index) => {
    setPersonToDelete(index);
    setShowDeletePersonConfirm(true);
  };

  const confirmDeletePerson = () => {
    const updatedPeople = people.filter((_, index) => index !== personToDelete);
    setPeople(updatedPeople);
    setShowDeletePersonConfirm(false);
    setPersonToDelete(null);
  };

  const cancelDeletePerson = () => {
    setShowDeletePersonConfirm(false);
    setPersonToDelete(null);
  };

  const handleBrokerInputChange = (e) => {
    const { name, value } = e.target;
    setBroker((prev) => ({
      ...prev,
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
    if (editingBrokerIndex !== null) {
      const updatedBrokers = [...outsideBrokers];
      updatedBrokers[editingBrokerIndex] = broker;
      setOutsideBrokers(updatedBrokers);
      setEditingBrokerIndex(null);
    } else {
      setOutsideBrokers([...outsideBrokers, broker]);
    }
    setBroker({
      type: "",
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      payBroker: "",
      end: "",
      primaryPhone: "",
      chargedHST: "Yes",
      address: "",
      sellingAmount: "",
      tax: "",
      total: "",
    });
    setSelectedBrokerType("");
  };

  const handleBrokerEdit = (index) => {
    setBroker(outsideBrokers[index]);
    setEditingBrokerIndex(index);
    setSelectedBrokerType(outsideBrokers[index].type);
  };

  const handleBrokerDelete = (index) => {
    setBrokerToDelete(index);
    setShowDeleteBrokerConfirm(true);
  };

  const confirmDeleteBroker = () => {
    const updatedBrokers = outsideBrokers.filter(
      (_, index) => index !== brokerToDelete
    );
    setOutsideBrokers(updatedBrokers);
    setShowDeleteBrokerConfirm(false);
    setBrokerToDelete(null);
  };

  const cancelDeleteBroker = () => {
    setShowDeleteBrokerConfirm(false);
    setBrokerToDelete(null);
  };

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
      const updatedTrustRecords = [...trustRecords];
      updatedTrustRecords[editingTrustIndex] = trust;
      setTrustRecords(updatedTrustRecords);
      setEditingTrustIndex(null);
    } else {
      setTrustRecords([...trustRecords, trust]);
    }
    setTrust({
      weHold: "",
      heldBy: "",
      received: "",
      depositDate: "",
      receivedFrom: "",
      amount: "",
      reference: "",
      paymentType: "",
      currency: "",
      earnInterest: "",
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
    const updatedTrustRecords = trustRecords.filter(
      (_, index) => index !== trustToDelete
    );
    setTrustRecords(updatedTrustRecords);
    setShowDeleteTrustConfirm(false);
    setTrustToDelete(null);
  };

  const cancelDeleteTrust = () => {
    setShowDeleteTrustConfirm(false);
    setTrustToDelete(null);
  };

  const handleAddCommissionInfo = ({ type, data }) => {
    switch (type) {
      case "saleClosing":
        setSaleClosingRows([...saleClosingRows, data]);
        break;
      case "commissionIncome":
        setCommissionIncomeRows([...commissionIncomeRows, data]);
        break;
      case "outsideBroker":
        setOutsideBrokersRows([...outsideBrokersRows, data]);
        break;
      default:
        break;
    }
  };

  // CommissionForm edit logic
  const [commissionFormFields, setCommissionFormFields] = useState({});

  // Edit handlers for CommissionForm
  const handleEditSaleClosing = () => {
    if (saleClosingRows.length > 0) {
      setEditingSaleClosingIdx(0); // Only one row supported in UI
      setCommissionFormFields({ ...saleClosingRows[0] });
    }
  };
  const handleEditCommissionIncome = () => {
    if (commissionIncomeRows.length > 0) {
      setEditingCommissionIncomeIdx(0);
      setCommissionFormFields({ ...commissionIncomeRows[0] });
    }
  };
  const handleEditOutsideBroker = () => {
    if (outsideBrokersRows.length > 0) {
      setEditingOutsideBrokerIdx(0);
      setCommissionFormFields({ ...outsideBrokersRows[0] });
    }
  };
  // Update handlers for CommissionForm
  const handleUpdateSaleClosing = (updatedRow) => {
    const updatedRows = [...saleClosingRows];
    updatedRows[editingSaleClosingIdx] = updatedRow;
    setSaleClosingRows(updatedRows);
    setEditingSaleClosingIdx(null);
    setCommissionFormFields({});
  };
  const handleUpdateCommissionIncome = (updatedRow) => {
    const updatedRows = [...commissionIncomeRows];
    updatedRows[editingCommissionIncomeIdx] = updatedRow;
    setCommissionIncomeRows(updatedRows);
    setEditingCommissionIncomeIdx(null);
    setCommissionFormFields({});
  };
  const handleUpdateOutsideBroker = (updatedRow) => {
    const updatedRows = [...outsideBrokersRows];
    updatedRows[editingOutsideBrokerIdx] = updatedRow;
    setOutsideBrokersRows(updatedRows);
    setEditingOutsideBrokerIdx(null);
    setCommissionFormFields({});
  };

  const handleSaveTrade = async () => {
    setIsLoading(true);
    try {
      const updatedTrade = {
        ...trade,
        keyInfo: keyInfoData,
        people: people,
        outsideBrokers: outsideBrokers,
        trustRecords: trustRecords,
        commission: {
          saleClosingRows: saleClosingRows,
          commissionIncomeRows: commissionIncomeRows,
          outsideBrokersRows: outsideBrokersRows,
        },
        agentCommissionList: agentCommissionList,
        conditions: keyInfoData.conditions,
      };

      await axiosInstance.put(`/trades/${trade._id}`, updatedTrade);
      toast.success("Trade updated successfully!");
      onUpdate(updatedTrade);
      onClose();
    } catch (error) {
      console.error("Error updating trade:", error);
      toast.error("Failed to update trade. Please try again.");
    } finally {
      setIsLoading(false);
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

  const handleDeleteSaleClosing = () => {
    if (saleClosingRows.length > 0) {
      setSaleClosingRows([]);
      setEditingSaleClosingIdx(null);
      setCommissionFormFields({});
    }
  };

  const handleDeleteCommissionIncome = () => {
    if (commissionIncomeRows.length > 0) {
      setCommissionIncomeRows([]);
      setEditingCommissionIncomeIdx(null);
      setCommissionFormFields({});
    }
  };

  const handleDeleteOutsideBroker = () => {
    if (outsideBrokersRows.length > 0) {
      setOutsideBrokersRows([]);
      setEditingOutsideBrokerIdx(null);
      setCommissionFormFields({});
    }
  };

  // Add these handlers
  const handleBrokerAgentNameChange = (e) => setBrokerAgentName(e.target.value);
  const handleBrokerBrokerageChange = (e) => setBrokerBrokerage(e.target.value);
  const handleBrokerSellingAmountChange = (e) =>
    setBrokerSellingAmount(e.target.value);

  // Handle commission percentage changes and sync with key info
  const handleListingCommissionChange = (e) => {
    const value = e.target.value;
    setListingCommission(value);
    setKeyInfoData((prev) => ({
      ...prev,
      listCommission: value,
    }));
  };

  const handleSellingCommissionChange = (e) => {
    const value = e.target.value;
    setSellingCommission(value);
    setKeyInfoData((prev) => ({
      ...prev,
      sellCommission: value,
    }));
  };

  // Handle listing selection to populate people and agents
  const handleListingSelected = (selectedListing) => {
    if (!selectedListing) return;

    // Set people from listing
    if (selectedListing.people && Array.isArray(selectedListing.people)) {
      setPeople(
        selectedListing.people.map((person) => ({
          ...person,
          // For Sale: type = 'Seller', For Lease: type = 'Landlord'
          type: keyInfoData.dealType === "Lease" ? "Landlord" : "Seller",
        }))
      );
    }

    // Outside brokers should be manually entered - no auto-population from listing
  };

  // Add useEffect to update commissionAR based on classification, trust amount, and totals
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">
            Edit Trade #{trade?.tradeNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
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
          </nav>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "key-info" && (
            <KeyInfoForm
              keyInfoData={keyInfoData}
              handleKeyInfoChange={handleKeyInfoChange}
              goToNextSection={goToNextSection}
              listings={listings}
              setKeyInfoData={setKeyInfoData}
              isLoadingTradeNumber={isLoadingTradeNumber}
              nextTradeNumber={nextTradeNumber}
              onListingSelected={handleListingSelected}
              trades={trades}
              currentTradeNumber={trade?.tradeNumber}
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
              userName="Admin"
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
              onListingCommissionChange={handleListingCommissionChange}
              onSellingCommissionChange={handleSellingCommissionChange}
              goToNextSection={goToNextSection}
              goToPreviousSection={goToPreviousSection}
              tradeNumber={nextTradeNumber}
              saleClosingRows={saleClosingRows}
              commissionIncomeRows={commissionIncomeRows}
              outsideBrokersRows={outsideBrokersRows}
              editingSaleClosingIdx={editingSaleClosingIdx}
              editingCommissionIncomeIdx={editingCommissionIncomeIdx}
              editingOutsideBrokerIdx={editingOutsideBrokerIdx}
              commissionFormFields={commissionFormFields}
              onUpdateSaleClosing={handleUpdateSaleClosing}
              onUpdateCommissionIncome={handleUpdateCommissionIncome}
              onUpdateOutsideBroker={handleUpdateOutsideBroker}
              onEditSaleClosing={handleEditSaleClosing}
              onEditCommissionIncome={handleEditCommissionIncome}
              onEditOutsideBroker={handleEditOutsideBroker}
              onAddCommissionInfo={handleAddCommissionInfo}
              onDeleteSaleClosing={handleDeleteSaleClosing}
              onDeleteCommissionIncome={handleDeleteCommissionIncome}
              onDeleteOutsideBroker={handleDeleteOutsideBroker}
              outsideBrokers={outsideBrokers}
              onCommissionTotalChange={setCommissionTotal}
              onBrokerTotalChange={setBrokerTotal}
              brokerAgentName={brokerAgentName}
              brokerBrokerage={brokerBrokerage}
              brokerSellingAmount={brokerSellingAmount}
              onBrokerAgentNameChange={handleBrokerAgentNameChange}
              onBrokerBrokerageChange={handleBrokerBrokerageChange}
              onBrokerSellingAmountChange={handleBrokerSellingAmountChange}
            />
          )}
          {activeTab === "agent-info" && (
            <AgentCommissionInfo
              goToNextSection={handleSaveTrade}
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
              isEditMode={true}
            />
          )}
        </div>

        {/* Footer with Navigation Buttons */}
        <div className="border-t p-6 flex justify-between">
          <button
            onClick={goToPreviousSection}
            disabled={activeTab === "key-info"}
            className={`px-6 py-2 rounded-md font-medium ${
              activeTab === "key-info"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700"
            >
              Cancel
            </button>
            {activeTab === "agent-info" ? (
              <button
                onClick={handleSaveTrade}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? "Saving..." : "Save Trade"}
              </button>
            ) : (
              <button
                onClick={goToNextSection}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeEditModal;
