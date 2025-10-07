import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaPrint, FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../config/axios";

const FinancialReportsAgentPaymentSummary = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalTrades: 0,
    totalAwardAmount: 0,
    totalCommission: 0,
    totalOfficeShare: 0,
    totalHST: 0,
    totalCommissionWithoutHST: 0,
    totalNetCommission: 0,
  });

  // Check if user is reports admin
  useEffect(() => {
    const isReportsAdmin = sessionStorage.getItem("isReportsAdmin") === "true";
    if (!isReportsAdmin) {
      navigate("/");
    }
  }, [navigate]);

  // Generate report function
  const handleGenerateReport = () => {
    setShowTable(true);
    fetchSummaryData();
  };

  const fetchSummaryData = async () => {
    try {
      setIsLoading(true);

      // Fetch Commission Trust EFTs (Agent Commission Transfers) with populated trade data
      const eftResponse = await axiosInstance.get("/commission-trust-eft");
      const efts = eftResponse.data.filter(
        (eft) => eft.type === "AgentCommissionTransfer"
      );

      // Fetch all agents to get fee information
      const agentsResponse = await axiosInstance.get("/agents");
      const agents = agentsResponse.data;

      // Filter EFTs by date range if dates are provided
      let filteredEfts = efts;
      if (fromDate && toDate) {
        filteredEfts = efts.filter((eft) => {
          // Create date objects using local timezone to avoid UTC conversion issues
          const eftDate = new Date(eft.date);
          const from = new Date(fromDate + "T00:00:00");
          const to = new Date(toDate + "T23:59:59");

          // Compare only the date parts (year, month, day)
          const eftDateOnly = new Date(
            eftDate.getFullYear(),
            eftDate.getMonth(),
            eftDate.getDate()
          );
          const fromDateOnly = new Date(
            from.getFullYear(),
            from.getMonth(),
            from.getDate()
          );
          const toDateOnly = new Date(
            to.getFullYear(),
            to.getMonth(),
            to.getDate()
          );

          return eftDateOnly >= fromDateOnly && eftDateOnly <= toDateOnly;
        });
      }

      // Group data by agent
      const agentSummary = {};

      filteredEfts.forEach((eft) => {
        // Find the agent
        const agent = agents.find(
          (a) =>
            a.employeeNo?.toString() === eft.agentId || a._id === eft.agentId
        );

        const agentId = agent?.employeeNo || eft.agentId;
        const agentName =
          eft.agentName || agent?.firstName + " " + agent?.lastName;

        if (!agentSummary[agentId]) {
          agentSummary[agentId] = {
            agentId,
            agentName,
            totalTrades: 0,
            totalAwardAmount: 0,
            totalCommission: 0,
            totalOfficeShare: 0,
            totalHST: 0,
            totalNetCommission: 0,
            trades: [],
          };
        }

        // Use populated trade data from EFT
        const trade = eft.tradeId;

        // Find agent commission data from the trade
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

        // Calculate fees if not found in agent commission data
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
            case "plan5050":
              baseFee = parseFloat(eft.amount) * 0.5;
              break;
            case "plan8020":
              baseFee = parseFloat(eft.amount) * 0.2;
              break;
            case "plan150":
              baseFee = 150;
              break;
            default:
              baseFee = 0;
          }

          const taxOnFees = baseFee * 0.15;
          calculatedFees = (baseFee + taxOnFees).toFixed(2);
        }

        const netCommission = parseFloat(eft.amount) || 0;
        const feesDeducted = parseFloat(
          agentCommission?.totalFees || calculatedFees
        );
        const hst = netCommission * (0.15 / 1.15);

        // Calculate additional fields
        const awardAmount = parseFloat(agentCommission?.awardAmount || 0);
        const commission = parseFloat(agentCommission?.amount || 0);
        const officeShare = feesDeducted;
        const calculatedHST = (netCommission / 115) * 15;

        // Add to agent summary
        agentSummary[agentId].totalTrades += 1;
        agentSummary[agentId].totalAwardAmount += awardAmount;
        agentSummary[agentId].totalCommission += commission;
        agentSummary[agentId].totalOfficeShare += officeShare;
        agentSummary[agentId].totalHST += calculatedHST;
        agentSummary[agentId].totalNetCommission += netCommission;
        agentSummary[agentId].trades.push({
          eftNumber: eft.eftNumber,
          tradeNumber: trade?.tradeNumber,
          date: eft.chequeDate || eft.date,
          netCommission,
          feesDeducted,
          hst,
        });
      });

      // Convert to array and sort by total net commission (descending)
      const summaryArray = Object.values(agentSummary).sort(
        (a, b) => b.totalNetCommission - a.totalNetCommission
      );

      setSummaryData(summaryArray);

      // Calculate total statistics
      const totals = summaryArray.reduce(
        (acc, agent) => ({
          totalTrades: acc.totalTrades + agent.totalTrades,
          totalAwardAmount: acc.totalAwardAmount + agent.totalAwardAmount,
          totalCommission: acc.totalCommission + agent.totalCommission,
          totalOfficeShare: acc.totalOfficeShare + agent.totalOfficeShare,
          totalHST: acc.totalHST + agent.totalHST,
          totalNetCommission: acc.totalNetCommission + agent.totalNetCommission,
        }),
        {
          totalTrades: 0,
          totalAwardAmount: 0,
          totalCommission: 0,
          totalOfficeShare: 0,
          totalHST: 0,
          totalNetCommission: 0,
        }
      );

      totals.totalCommissionWithoutHST =
        totals.totalNetCommission - totals.totalHST;
      setTotalStats(totals);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Handle YYYY-MM-DD format without timezone conversion
    if (
      typeof dateString === "string" &&
      dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      const [year, month, day] = dateString.split("-");
      return `${year}-${month}-${day}`;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Agent Payment Summary Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px; 
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .report-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .report-subtitle { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 5px;
          }
          .report-info { 
            font-size: 12px; 
            color: #666; 
            margin-bottom: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
            text-align: center;
          }
          .summary { 
            margin-top: 20px; 
            padding: 15px; 
            background-color: #f9f9f9; 
            border: 1px solid #ddd;
          }
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 5px;
          }
          .total-row { 
            font-weight: bold; 
            border-top: 2px solid #333; 
            padding-top: 10px; 
            margin-top: 10px;
          }
          .red-text { color: #000000; }
          .green-text { color: #000000; }
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Bestway Real Estate Ltd., Brokerage</div>
          <div class="report-title">Agent Payment Summary Report</div>
          <div class="report-subtitle">Agent Commission Summary by Agent</div>
          <div class="report-info">
            ${
              fromDate && toDate
                ? `Period: ${formatDate(fromDate)} to ${formatDate(
                    toDate
                  )} | Generated: ${currentDate}`
                : fromDate
                ? `From: ${formatDate(fromDate)} | Generated: ${currentDate}`
                : toDate
                ? `Up to: ${formatDate(toDate)} | Generated: ${currentDate}`
                : `All Data | Generated: ${currentDate}`
            }
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Agent #</th>
              <th>Agent Name</th>
              <th>Total Trades</th>
              <th>Award Amount</th>
              <th>Commission (HST Excluded)</th>
              <th>Net Commission (HST Included)</th>
              <th>Office Share (HST Included)</th>
              <th>HST Paid to Agent</th>
            </tr>
          </thead>
          <tbody>
            ${
              summaryData.length > 0
                ? summaryData
                    .map(
                      (agent) => `
                <tr>
                  <td>${agent.agentId || "N/A"}</td>
                  <td>${agent.agentName || "N/A"}</td>
                  <td>${agent.totalTrades}</td>
                  <td>${formatCurrency(agent.totalAwardAmount)}</td>
                  <td>${formatCurrency(agent.totalCommission)}</td>
                  <td>${formatCurrency(agent.totalNetCommission)}</td>
                  <td>${formatCurrency(agent.totalOfficeShare)}</td>
                  <td>${formatCurrency(agent.totalHST)}</td>
                </tr>
              `
                    )
                    .join("")
                : `<tr><td colspan="8" style="text-align: center; padding: 20px;">No data available.</td></tr>`
            }
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Total Agents:</span>
            <span>${summaryData.length}</span>
          </div>
          <div class="summary-row">
            <span>Total Trades:</span>
            <span>${totalStats.totalTrades}</span>
          </div>
          <div class="summary-row">
            <span>Total Commission:</span>
            <span>${formatCurrency(totalStats.totalCommission)}</span>
          </div>
          <div class="summary-row total-row">
            <span>Total Net Commission:</span>
            <span>${formatCurrency(totalStats.totalNetCommission)}</span>
          </div>
        </div>

        <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/financial-reports")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
                Back to Financial Reports
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Agent Payment Summary Report
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {showTable && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPrint />
                  Print Report
                </button>
              )}
            </div>
          </div>

          {/* Date Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Filter by Date Range
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
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
              <div className="flex-1">
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
              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
            {(fromDate || toDate) && (
              <div className="mt-3 text-sm text-gray-600">
                {fromDate && toDate
                  ? `Showing data from ${formatDate(fromDate)} to ${formatDate(
                      toDate
                    )}`
                  : fromDate
                  ? `Showing data from ${formatDate(fromDate)} onwards`
                  : `Showing data up to ${formatDate(toDate)}`}
              </div>
            )}
          </div>

          {/* Agent Summary Table */}
          {showTable && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Agent Commission Summary by Agent
                </h3>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading agent payment summary...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Trades
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Award Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission (HST Excluded)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Commission (HST Included)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Office Share (HST Included)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HST Paid to Agent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summaryData.length > 0 ? (
                        summaryData.map((agent, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {agent.agentId || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agent.agentName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agent.totalTrades}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(agent.totalAwardAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(agent.totalCommission)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(agent.totalNetCommission)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(agent.totalOfficeShare)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(agent.totalHST)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No agent payment data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary Statistics */}
              {summaryData.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Agents:</span>
                      <span className="font-semibold ml-2">
                        {summaryData.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Trades:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {totalStats.totalTrades}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Commission:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(totalStats.totalCommission)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Total Net Commission:
                      </span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(totalStats.totalNetCommission)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsAgentPaymentSummary;
