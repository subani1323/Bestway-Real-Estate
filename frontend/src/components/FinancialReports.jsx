import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";

import {

  FaReceipt,

  FaFileAlt,

  FaBook,

  FaChartLine,

  FaUserCog,

  FaChartBar,

  FaHandshake,

  FaHome,

  FaSearch,

  FaArrowLeft,

} from "react-icons/fa";

import axiosInstance from "../config/axios";



const FinancialReports = () => {

  const navigate = useNavigate();

  const [showTradesTable, setShowTradesTable] = useState(false);

  const [showListingsTable, setShowListingsTable] = useState(false);

  const [trades, setTrades] = useState([]);

  const [listings, setListings] = useState([]);

  const [isLoadingTrades, setIsLoadingTrades] = useState(false);

  const [isLoadingListings, setIsLoadingListings] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [listingSearchQuery, setListingSearchQuery] = useState("");

  const [openDeals, setOpenDeals] = useState(false);

  const [closedDeals, setClosedDeals] = useState(false);

  const [availableListings, setAvailableListings] = useState(false);

  const [soldListings, setSoldListings] = useState(false);

  const [showTradeModal, setShowTradeModal] = useState(false);

  const [selectedTrade, setSelectedTrade] = useState(null);

  const [showListingModal, setShowListingModal] = useState(false);

  const [selectedListing, setSelectedListing] = useState(null);



  // Check if user is reports admin

  useEffect(() => {

    const isReportsAdmin = sessionStorage.getItem("isReportsAdmin") === "true";

    if (!isReportsAdmin) {

      navigate("/");

    }

  }, [navigate]);



  // Fetch trades data

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



  // Fetch listings data

  const fetchListings = async () => {

    setIsLoadingListings(true);

    try {

      const response = await axiosInstance.get("/listings");

      console.log("Fetched listings:", response.data);

      // Sort listings in descending order by listing number

      const sortedListings = response.data.sort(

        (a, b) => b.listingNumber - a.listingNumber

      );

      setListings(sortedListings);

    } catch (error) {

      console.error("Error fetching listings:", error);

    } finally {

      setIsLoadingListings(false);

    }

  };



  // Filter trades based on search and checkboxes

  const filteredTrades = trades.filter((trade) => {

    const matchesSearch =

      searchQuery === "" || trade.tradeNumber?.toString().includes(searchQuery);



    // Check if trade is closed based on finalizedDate (like in TradeInfo component)

    const isClosed = Boolean(trade.keyInfo?.finalizedDate);



    const matchesOpenDeals = !openDeals || !isClosed;



    const matchesClosedDeals = !closedDeals || isClosed;



    return matchesSearch && matchesOpenDeals && matchesClosedDeals;

  });



  // Filter listings based on search and checkboxes

  const filteredListings = listings.filter((listing) => {

    const matchesSearch =

      listingSearchQuery === "" ||

      listing.listingNumber?.toString().includes(listingSearchQuery);



    const matchesAvailable =

      !availableListings || listing.status?.toLowerCase() === "available";



    const matchesSold =

      !soldListings || listing.status?.toLowerCase() === "sold";



    return matchesSearch && matchesAvailable && matchesSold;

  });



  const handleReportClick = (reportType) => {

    if (reportType === "trade-info") {

      setShowTradesTable(true);

      fetchTrades();

    } else if (reportType === "listing-info") {

      setShowListingsTable(true);

      fetchListings();

    } else {

      navigate(`/financial-reports-${reportType}`);

    }

  };



  const handleBackToCards = () => {

    setShowTradesTable(false);

    setShowListingsTable(false);

    setSearchQuery("");

    setListingSearchQuery("");

    setOpenDeals(false);

    setClosedDeals(false);

    setAvailableListings(false);

    setSoldListings(false);

  };



  const handleTradeRowClick = (trade) => {

    setSelectedTrade(trade);

    setShowTradeModal(true);

  };



  const handleListingRowClick = (listing) => {

    setSelectedListing(listing);

    setShowListingModal(true);

  };



  const reportSections = [

    {

      id: "hst",

      title: "HST Report",

      icon: FaReceipt,

      color: "bg-blue-900",

    },

    {

      id: "disbursements",

      title: "Disbursement Journal",

      icon: FaFileAlt,

      color: "bg-blue-900",

    },

    {

      id: "trust",

      title: "Trust Journal",

      icon: FaBook,

      color: "bg-blue-900",

    },

    {

      id: "trade-ar",

      title: "Trade A/R Journal",

      icon: FaChartLine,

      color: "bg-blue-900",

    },

    {

      id: "agent-payment",

      title: "Agent Payment Report",

      icon: FaUserCog,

      color: "bg-blue-900",

    },

    {

      id: "agent-payment-summary",

      title: "Agent Payment Summary Report",

      icon: FaChartBar,

      color: "bg-blue-900",

    },

    {

      id: "trade-info",

      title: "Trade Info",

      icon: FaHandshake,

      color: "bg-blue-900",

    },

    {

      id: "listing-info",

      title: "Listing Info",

      icon: FaHome,

      color: "bg-blue-900",

    },

  ];



  return (

    <div className="flex flex-col">

      <Navbar />



      <div className="flex-1 p-6">

        <div className="max-w-7xl mx-auto">

          {showTradesTable ? (

            // Trades Table View

            <div>

              <div className="flex items-center justify-between mb-6">

                <div className="flex items-center">

                  <button

                    onClick={handleBackToCards}

                    className="flex items-center text-gray-600 hover:text-gray-800 mr-4"

                  >

                    <FaArrowLeft className="mr-2" />

                    Back to Reports

                  </button>

                  <h1 className="text-3xl font-bold text-gray-900">Trades</h1>

                </div>

              </div>



              {/* Search and Filter Section */}

              <div className="bg-white p-4 rounded-lg shadow-md mb-6">

                <div className="flex flex-col md:flex-row gap-4 items-center">

                  <div className="relative flex-1">

                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                    <input

                      type="text"

                      placeholder="Enter Trade #"

                      value={searchQuery}

                      onChange={(e) => setSearchQuery(e.target.value)}

                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  </div>

                  <div className="flex gap-4">

                    <label className="flex items-center">

                      <input

                        type="checkbox"

                        checked={openDeals}

                        onChange={(e) => setOpenDeals(e.target.checked)}

                        className="mr-2"

                      />

                      Open Deals

                    </label>

                    <label className="flex items-center">

                      <input

                        type="checkbox"

                        checked={closedDeals}

                        onChange={(e) => setClosedDeals(e.target.checked)}

                        className="mr-2"

                      />

                      Closed Deals

                    </label>

                  </div>

                </div>

              </div>



              {/* Trades Table */}

              {isLoadingTrades ? (

                <div className="flex justify-center items-center h-40">

                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>

                </div>

              ) : filteredTrades.length === 0 ? (

                <div className="text-center py-8 text-gray-500">

                  {searchQuery || openDeals || closedDeals

                    ? "No trades found matching your search."

                    : "No trades found in the database."}

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="min-w-full bg-white shadow-md rounded-lg">

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

                      </tr>

                    </thead>

                    <tbody>

                      {filteredTrades.map((trade) => {

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

                          </tr>

                        );

                      })}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          ) : showListingsTable ? (

            // Listings Table View

            <div>

              <div className="flex items-center justify-between mb-6">

                <div className="flex items-center">

                  <button

                    onClick={handleBackToCards}

                    className="flex items-center text-gray-600 hover:text-gray-800 mr-4"

                  >

                    <FaArrowLeft className="mr-2" />

                    Back to Reports

                  </button>

                  <h1 className="text-3xl font-bold text-gray-900">Listings</h1>

                </div>

              </div>



              {/* Search and Filter Section */}

              <div className="bg-white p-4 rounded-lg shadow-md mb-6">

                <div className="flex flex-col md:flex-row gap-4 items-center">

                  <div className="relative flex-1">

                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                    <input

                      type="text"

                      placeholder="Enter Listing #"

                      value={listingSearchQuery}

                      onChange={(e) => setListingSearchQuery(e.target.value)}

                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  </div>

                  <div className="flex gap-4">

                    <label className="flex items-center">

                      <input

                        type="checkbox"

                        checked={availableListings}

                        onChange={(e) => setAvailableListings(e.target.checked)}

                        className="mr-2"

                      />

                      Available

                    </label>

                    <label className="flex items-center">

                      <input

                        type="checkbox"

                        checked={soldListings}

                        onChange={(e) => setSoldListings(e.target.checked)}

                        className="mr-2"

                      />

                      Sold

                    </label>

                  </div>

                </div>

              </div>



              {/* Listings Table */}

              {isLoadingListings ? (

                <div className="flex justify-center items-center h-40">

                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>

                </div>

              ) : filteredListings.length === 0 ? (

                <div className="text-center py-8 text-gray-500">

                  {listingSearchQuery || availableListings || soldListings

                    ? "No listings found matching your search."

                    : "No listings found in the database."}

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="min-w-full bg-white shadow-md rounded-lg">

                    <thead>

                      <tr className="bg-blue-900 text-white">

                        <th className="px-4 py-3 text-left font-medium border-b">

                          Listing #

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

                          City

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

                      </tr>

                    </thead>

                    <tbody>

                      {filteredListings.map((listing) => {

                        // Get agent name from agents array or fallback to agent object

                        const agentName = (() => {

                          if (listing.agents && listing.agents.length > 0) {

                            return listing.agents

                              .map(

                                (agent) =>

                                  `${agent.firstName} ${agent.lastName}`

                              )

                              .join(", ");

                          }

                          if (listing.agent && listing.agent.name) {

                            return listing.agent.name;

                          }

                          return "-";

                        })();



                        return (

                          <tr

                            key={listing._id}

                            className="hover:bg-gray-100 cursor-pointer"

                            onClick={() => handleListingRowClick(listing)}

                          >

                            <td className="px-4 py-3 border-b">

                              #{listing.listingNumber || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              {listing.address?.streetNumber || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              {listing.address?.streetName || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              {listing.address?.unit || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              {listing.address?.city || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              {listing.mlsNumber || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">{agentName}</td>

                            <td className="px-4 py-3 border-b">

                              {listing.prices?.listed

                                ? `$${listing.prices.listed.toLocaleString()}`

                                : "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              {listing.propertyType || "-"}

                            </td>

                            <td className="px-4 py-3 border-b">

                              <span

                                className={`px-2 py-1 rounded-full text-sm font-semibold ${

                                  listing.status === "Sold"

                                    ? "bg-green-100 text-green-800"

                                    : listing.status === "Pending"

                                    ? "bg-yellow-100 text-yellow-800"

                                    : listing.status === "Cancelled"

                                    ? "bg-red-100 text-red-800"

                                    : "bg-yellow-100 text-yellow-800"

                                }`}

                              >

                                {listing.status || "Available"}

                              </span>

                            </td>

                          </tr>

                        );

                      })}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          ) : (

            // Cards View

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {reportSections.map((section) => {

                const IconComponent = section.icon;

                return (

                  <div

                    key={section.id}

                    className="bg-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg p-6 cursor-pointer transform hover:scale-105"

                    onClick={() => handleReportClick(section.id)}

                  >

                    <div className="flex flex-col items-center text-center">

                      <div className={`${section.color} rounded-full p-4 mb-4`}>

                        <IconComponent className="text-white text-2xl" />

                      </div>

                      <h3 className="text-lg font-semibold text-gray-800">

                        {section.title}

                      </h3>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      </div>



      {/* Simplified Trade Details Modal without Print/Edit buttons */}

      {showTradeModal && selectedTrade && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full relative overflow-y-auto max-h-[90vh]">

            {/* Close button */}

            <button

              className="text-2xl text-gray-500 hover:text-gray-700 px-2 absolute top-4 right-6 z-10"

              onClick={() => setShowTradeModal(false)}

              style={{ lineHeight: 1 }}

            >

              ×

            </button>



            {/* Modal content - simplified version of TradeDetailsModal */}

            <div className="pr-8">

              <h2 className="text-2xl font-bold mb-6 text-amber-800">

                Trade Details: #{selectedTrade.tradeNumber}

              </h2>



              {/* Address Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Address

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Street #:</span>{" "}

                    {selectedTrade.keyInfo?.streetNumber || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Street Name:</span>{" "}

                    {selectedTrade.keyInfo?.streetName || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Unit:</span>{" "}

                    {selectedTrade.keyInfo?.unit || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">City:</span>{" "}

                    {selectedTrade.keyInfo?.city || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Province:</span>{" "}

                    {selectedTrade.keyInfo?.province || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Postal Code:</span>{" "}

                    {selectedTrade.keyInfo?.postalCode || "-"}

                  </div>

                </div>

              </div>



              {/* Important Dates Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Important Dates

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Offer Date:</span>{" "}

                    {selectedTrade.keyInfo?.offerDate || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Firm Date:</span>{" "}

                    {selectedTrade.keyInfo?.firmDate || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Close Date:</span>{" "}

                    {selectedTrade.keyInfo?.closeDate || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Entry Date:</span>{" "}

                    {selectedTrade.keyInfo?.entryDate || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Finalized Date:</span>{" "}

                    {selectedTrade.keyInfo?.finalizedDate || "-"}

                  </div>

                </div>

              </div>



              {/* Key Information Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Key Information

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Listing Number:</span>{" "}

                    {selectedTrade.keyInfo?.listingNumber || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Sell Price:</span>{" "}

                    {selectedTrade.keyInfo?.sellPrice || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Classification:</span>{" "}

                    {selectedTrade.keyInfo?.classification || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Firm:</span>{" "}

                    {selectedTrade.keyInfo?.firm ? "Yes" : "No"}

                  </div>

                </div>

              </div>



              {/* Commission Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Commission

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">List %:</span>{" "}

                    {selectedTrade.keyInfo?.listPercentage || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Sell %:</span>{" "}

                    {selectedTrade.keyInfo?.sellPercentage || "-"}

                  </div>

                </div>

              </div>



              {/* Property Details Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Property Details

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Property Type:</span>{" "}

                    {selectedTrade.keyInfo?.propertyType || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Status:</span>{" "}

                    {selectedTrade.keyInfo?.status || "Available"}

                  </div>

                  <div>

                    <span className="text-gray-600">MLS #:</span>{" "}

                    {selectedTrade.keyInfo?.mlsNumber || "-"}

                  </div>

                </div>

              </div>



              {/* Conditions Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Conditions

                </h3>

                <div className="text-sm text-gray-600">

                  {selectedTrade.conditions &&

                  selectedTrade.conditions.length > 0

                    ? selectedTrade.conditions.map((condition, idx) => (

                        <div key={idx} className="mb-1">

                          <div className="font-medium">

                            {condition.conditionText || "-"}

                          </div>

                          <div className="text-xs text-gray-500">

                            Due: {condition.dueDate || "-"} | Met:{" "}

                            {condition.conditionMetDate || "Not met"}

                          </div>

                        </div>

                      ))

                    : "No conditions available."}

                </div>

              </div>



              {/* Commission Details Section */}

              {selectedTrade.commission && (

                <div className="mb-6">

                  <h3 className="font-semibold text-lg mb-2 text-gray-800">

                    Commission Details

                  </h3>



                  {/* Sale Closing Rows */}

                  {selectedTrade.commission.saleClosingRows &&

                    selectedTrade.commission.saleClosingRows.length > 0 && (

                      <div className="mb-4">

                        <h4 className="text-gray-700 mb-2 font-medium">

                          Sale Closing Rows

                        </h4>

                        <div className="overflow-x-auto">

                          <table className="min-w-full border border-gray-300 text-sm">

                            <thead>

                              <tr className="bg-gray-100">

                                <th className="px-2 py-1 text-left border">

                                  SellPrice

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  ClosingDate

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  TradeNumber

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Status

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Ar

                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {selectedTrade.commission.saleClosingRows.map(

                                (row, idx) => (

                                  <tr key={idx}>

                                    <td className="border px-2 py-1">

                                      {row.sellPrice || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.closingDate || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.tradeNumber || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.status || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.ar || "-"}

                                    </td>

                                  </tr>

                                )

                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    )}



                  {/* Commission Income Rows */}

                  {selectedTrade.commission.commissionIncomeRows &&

                    selectedTrade.commission.commissionIncomeRows.length >

                      0 && (

                      <div className="mb-4">

                        <h4 className="text-gray-700 mb-2 font-medium">

                          Commission Income Rows

                        </h4>

                        <div className="overflow-x-auto">

                          <table className="min-w-full border border-gray-300 text-sm">

                            <thead>

                              <tr className="bg-gray-100">

                                <th className="px-2 py-1 text-left border">

                                  Income

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  ListingAmount

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  SellingAmount

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  ListingTax

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  SellingTax

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Tax

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Total

                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {selectedTrade.commission.commissionIncomeRows.map(

                                (row, idx) => (

                                  <tr key={idx}>

                                    <td className="border px-2 py-1">

                                      {row.income || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.listingAmount || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.sellingAmount || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.listingTax || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.sellingTax || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.tax || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.total || "-"}

                                    </td>

                                  </tr>

                                )

                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    )}



                  {/* Outside Brokers Rows */}

                  {selectedTrade.commission.outsideBrokersRows &&

                    selectedTrade.commission.outsideBrokersRows.length > 0 && (

                      <div className="mb-4">

                        <h4 className="text-gray-700 mb-2 font-medium">

                          Outside Brokers Rows

                        </h4>

                        <div className="overflow-x-auto">

                          <table className="min-w-full border border-gray-300 text-sm">

                            <thead>

                              <tr className="bg-gray-100">

                                <th className="px-2 py-1 text-left border">

                                  AgentName

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Brokerage

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  SellingAmount

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Tax

                                </th>

                                <th className="px-2 py-1 text-left border">

                                  Total

                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {selectedTrade.commission.outsideBrokersRows.map(

                                (row, idx) => (

                                  <tr key={idx}>

                                    <td className="border px-2 py-1">

                                      {row.agentName || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.brokerage || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.sellingAmount || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.tax || "-"}

                                    </td>

                                    <td className="border px-2 py-1">

                                      {row.total || "-"}

                                    </td>

                                  </tr>

                                )

                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    )}

                </div>

              )}



              {/* Agent Commission Info Section */}

              {selectedTrade.agentCommissionList &&

                selectedTrade.agentCommissionList.length > 0 && (

                  <div className="mb-6">

                    <h3 className="font-semibold text-lg mb-2 text-gray-800">

                      Agent Commission Info

                    </h3>

                    <div className="overflow-x-auto">

                      <table className="min-w-full border border-gray-300 text-sm">

                        <thead>

                          <tr className="bg-gray-100">

                            <th className="px-2 py-1 text-left border">

                              Agent Name

                            </th>

                            <th className="px-2 py-1 text-left border">

                              Classification

                            </th>

                            <th className="px-2 py-1 text-left border">

                              Amount

                            </th>

                            <th className="px-2 py-1 text-left border">

                              Net Commission

                            </th>

                            <th className="px-2 py-1 text-left border">Lead</th>

                            <th className="px-2 py-1 text-left border">

                              Fee Info

                            </th>

                            <th className="px-2 py-1 text-left border">

                              Total Fees

                            </th>

                            <th className="px-2 py-1 text-left border">Tax</th>

                            <th className="px-2 py-1 text-left border">

                              Total

                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {selectedTrade.agentCommissionList.map(

                            (agent, idx) => (

                              <tr key={idx}>

                                <td className="border px-2 py-1">

                                  {agent.agentName || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.classification || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.amount || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.netCommission || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.lead || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.feeInfo || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.totalFees || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.tax || "-"}

                                </td>

                                <td className="border px-2 py-1">

                                  {agent.total || "-"}

                                </td>

                              </tr>

                            )

                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                )}



              {/* Real Estate Trust Payments Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Real Estate Trust Payments

                </h3>

                <div className="text-sm text-gray-600">

                  No Real Estate Trust Payments found for this trade.

                </div>

              </div>



              {/* Commission Trust Payments Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Commission Trust Payments

                </h3>

                <div className="text-sm text-gray-600">

                  No Commission Trust Payments found for this trade.

                </div>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Simplified Listing Details Modal without Edit/Note buttons */}

      {showListingModal && selectedListing && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full relative overflow-y-auto max-h-[90vh]">

            {/* Close button */}

            <button

              className="text-2xl text-gray-500 hover:text-gray-700 px-2 absolute top-4 right-6 z-10"

              onClick={() => setShowListingModal(false)}

              style={{ lineHeight: 1 }}

            >

              ×

            </button>



            {/* Modal content - simplified version of ListingDetailsModal */}

            <div className="pr-8">

              <h2 className="text-2xl font-bold mb-6 text-blue-600">

                Listing Details: #{selectedListing.listingNumber}

              </h2>



              {/* Address Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Address

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Street #:</span>{" "}

                    {selectedListing.address?.streetNumber || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Street Name:</span>{" "}

                    {selectedListing.address?.streetName || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Unit:</span>{" "}

                    {selectedListing.address?.unit || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">City:</span>{" "}

                    {selectedListing.address?.city || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Province:</span>{" "}

                    {selectedListing.address?.province || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Postal Code:</span>{" "}

                    {selectedListing.address?.postalCode || "-"}

                  </div>

                </div>

              </div>



              {/* Seller Details Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Seller Details

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">First Name:</span>{" "}

                    {selectedListing.seller?.name?.split(" ")[0] || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Last Name:</span>{" "}

                    {selectedListing.seller?.name

                      ?.split(" ")

                      .slice(1)

                      .join(" ") || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Home Phone #:</span>{" "}

                    {selectedListing.seller?.phoneNumber || "-"}

                  </div>

                </div>

              </div>



              {/* Commission Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Commission

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">List %:</span>{" "}

                    {selectedListing.commission?.list || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Sell %:</span>{" "}

                    {selectedListing.commission?.sell || "-"}

                  </div>

                </div>

              </div>



              {/* Property Details Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Property Details

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Property Type:</span>{" "}

                    {selectedListing.propertyType || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Status:</span>{" "}

                    {selectedListing.status || "Available"}

                  </div>

                  <div>

                    <span className="text-gray-600">MLS #:</span>{" "}

                    {selectedListing.mlsNumber || "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">We Manage:</span>{" "}

                    {selectedListing.weManage ? "Yes" : "No"}

                  </div>

                </div>

              </div>



              {/* Agent Details Section */}

              {selectedListing.agents && selectedListing.agents.length > 0 && (

                <div className="mb-6">

                  <h3 className="font-semibold text-lg mb-2 text-gray-800">

                    Agent Details

                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>

                      <span className="text-gray-600">First Name:</span>{" "}

                      {selectedListing.agents[0]?.firstName || "-"}

                    </div>

                    <div>

                      <span className="text-gray-600">Last Name:</span>{" "}

                      {selectedListing.agents[0]?.lastName || "-"}

                    </div>

                    <div>

                      <span className="text-gray-600">Office #:</span>{" "}

                      {selectedListing.agents[0]?.officeNo || "-"}

                    </div>

                  </div>

                </div>

              )}



              {/* Important Dates Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Important Dates

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Listing Date:</span>{" "}

                    {selectedListing.dates?.listing

                      ? new Date(

                          selectedListing.dates.listing

                        ).toLocaleDateString()

                      : "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Entry Date:</span>{" "}

                    {selectedListing.dates?.entry

                      ? new Date(

                          selectedListing.dates.entry

                        ).toLocaleDateString()

                      : "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Expiry Date:</span>{" "}

                    {selectedListing.dates?.expiry

                      ? new Date(

                          selectedListing.dates.expiry

                        ).toLocaleDateString()

                      : "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Sold Date:</span>{" "}

                    {selectedListing.dates?.sold

                      ? new Date(

                          selectedListing.dates.sold

                        ).toLocaleDateString()

                      : "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Last Edited:</span>{" "}

                    {selectedListing.dates?.lastEdit

                      ? new Date(

                          selectedListing.dates.lastEdit

                        ).toLocaleDateString()

                      : "-"}

                  </div>

                </div>

              </div>



              {/* Pricing Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Pricing

                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">Listed Price:</span>{" "}

                    {selectedListing.prices?.listed

                      ? `$${selectedListing.prices.listed.toLocaleString()}`

                      : "-"}

                  </div>

                  <div>

                    <span className="text-gray-600">Sold Price:</span>{" "}

                    {selectedListing.prices?.sold

                      ? `$${selectedListing.prices.sold.toLocaleString()}`

                      : "-"}

                  </div>

                </div>

              </div>



              {/* People Details Section */}

              {selectedListing.people && selectedListing.people.length > 0 && (

                <div className="mb-6">

                  <h3 className="font-semibold text-lg mb-2 text-gray-800">

                    People Details

                  </h3>

                  <div className="overflow-x-auto">

                    <table className="min-w-full border border-gray-300 text-sm">

                      <thead>

                        <tr className="bg-gray-100">

                          <th className="px-2 py-1 text-left border">

                            FIRST NAME

                          </th>

                          <th className="px-2 py-1 text-left border">

                            LAST NAME

                          </th>

                          <th className="px-2 py-1 text-left border">

                            ADDRESS

                          </th>

                          <th className="px-2 py-1 text-left border">PHONE</th>

                          <th className="px-2 py-1 text-left border">END</th>

                        </tr>

                      </thead>

                      <tbody>

                        {selectedListing.people.map((person, idx) => (

                          <tr key={idx}>

                            <td className="border px-2 py-1">

                              {person.firstName || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {person.lastName || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {person.address || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {person.phone || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {person.end || "-"}

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}



              {/* Agent Details Table Section */}

              {selectedListing.agents && selectedListing.agents.length > 0 && (

                <div className="mb-6">

                  <h3 className="font-semibold text-lg mb-2 text-gray-800">

                    Agent Details

                  </h3>

                  <div className="overflow-x-auto">

                    <table className="min-w-full border border-gray-300 text-sm">

                      <thead>

                        <tr className="bg-gray-100">

                          <th className="px-2 py-1 text-left border">

                            AGENT NO

                          </th>

                          <th className="px-2 py-1 text-left border">NAME</th>

                          <th className="px-2 py-1 text-left border">

                            OFFICE #

                          </th>

                          <th className="px-2 py-1 text-left border">LEAD</th>

                          <th className="px-2 py-1 text-left border">

                            SEND PAGE

                          </th>

                          <th className="px-2 py-1 text-left border">

                            EXPENSE

                          </th>

                          <th className="px-2 py-1 text-left border">AMOUNT</th>

                        </tr>

                      </thead>

                      <tbody>

                        {selectedListing.agents.map((agent, idx) => (

                          <tr key={idx}>

                            <td className="border px-2 py-1">

                              {agent.agentNo || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {`${agent.firstName || ""} ${

                                agent.lastName || ""

                              }`.trim() || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {agent.officeNo || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {agent.lead || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {agent.sendPage || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {agent.expense || "-"}

                            </td>

                            <td className="border px-2 py-1">

                              {agent.amount || "-"}

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}



              {/* Note Section */}

              <div className="mb-6">

                <h3 className="font-semibold text-lg mb-2 text-gray-800">

                  Note

                </h3>

                <div className="text-sm text-gray-600">

                  {selectedListing.note || "No notes available."}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};



export default FinancialReports;

