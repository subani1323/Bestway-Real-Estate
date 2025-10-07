import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Navbar from "./Navbar";
import TradeDetailsModal from "./TradeDetailsModal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";

const TradeDB = () => {
  const [trades, setTrades] = useState([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const navigate = useNavigate();

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

  // Filter trades based on search query
  const filteredTrades = trades.filter((trade) =>
    trade.tradeNumber?.toString().includes(searchQuery)
  );

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

  const handleTradeRowClick = async (trade) => {
    setSelectedTrade(trade);
    setShowTradeModal(true);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/database")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Database
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6">Trade Database</h2>

        {/* Search Bar */}
        <div className="mb-6 relative">
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
        </div>

        {isLoadingTrades ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery
              ? "No trades found matching your search."
              : "No trades found in the database."}
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
                  <th className="px-4 py-3 text-left font-medium border-b">
                    Finalized Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => {
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
                      <td className="px-4 py-3 border-b">
                        {trade.keyInfo?.finalizedDate
                          ? formatDate(trade.keyInfo.finalizedDate)
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Trade Details Modal */}
        {showTradeModal && (
          <TradeDetailsModal
            trade={selectedTrade}
            onClose={() => {
              setShowTradeModal(false);
              setSelectedTrade(null);
            }}
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
    </div>
  );
};

export default TradeDB;
