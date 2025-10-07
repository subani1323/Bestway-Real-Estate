import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import FinanceSidebar from "./FinanceSidebar";
import { FaPrint } from "react-icons/fa";
import AgentPaymentPrintModal from "./AgentPaymentPrintModal";
import axiosInstance from "../config/axios";

const AgentPaymentInfo = () => {
  const [eftData, setEftData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch EFT data on component mount
  useEffect(() => {
    fetchEFTData();
  }, []);

  const fetchEFTData = async () => {
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

      // Combine the data using populated trade data from EFTs
      const combinedData = efts.map((eft) => {
        // Find the agent
        const agent = agents.find(
          (a) =>
            a.employeeNo?.toString() === eft.agentId || a._id === eft.agentId
        );

        // Use populated trade data from EFT
        const trade = eft.tradeId; // This is already populated

        // Find agent commission data from the trade - try multiple matching strategies
        let agentCommission = null;

        if (
          trade?.agentCommissionList &&
          trade.agentCommissionList.length > 0
        ) {
          // Try exact agentId match first
          agentCommission = trade.agentCommissionList.find(
            (ac) => ac.agentId === eft.agentId
          );

          // If not found, try agent name match
          if (!agentCommission) {
            agentCommission = trade.agentCommissionList.find(
              (ac) => ac.agentName === eft.agentName
            );
          }

          // If still not found, try employee number match
          if (!agentCommission && agent?.employeeNo) {
            agentCommission = trade.agentCommissionList.find(
              (ac) => ac.agentId === agent.employeeNo.toString()
            );
          }

          // If still not found, try first agent in the list (fallback)
          if (!agentCommission && trade.agentCommissionList.length === 1) {
            agentCommission = trade.agentCommissionList[0];
          }
        }

        // Debug logging
        console.log("EFT Data:", {
          eftNumber: eft.eftNumber,
          agentId: eft.agentId,
          agentName: eft.agentName,
          tradeNumber: trade?.tradeNumber,
          agentCommissionList: trade?.agentCommissionList,
          agentCommission: agentCommission,
          totalFees: agentCommission?.totalFees,
          agentEmployeeNo: agent?.employeeNo,
        });

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
              baseFee = parseFloat(eft.amount) * 0.1; // 10% of net commission
              break;
            case "plan955":
              baseFee = parseFloat(eft.amount) * 0.05; // 5% of net commission
              break;
            case "plan8515":
              baseFee = parseFloat(eft.amount) * 0.15; // 15% of net commission
              break;
            default:
              baseFee = 0;
          }

          const taxOnFees = baseFee * 0.15; // 15% HST
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
          feesDeducted: agentCommission?.totalFees || calculatedFees, // Use calculated fees as fallback
          date: eft.chequeDate || eft.date, // Use chequeDate if available, fallback to date
          tradeAddress: trade?.keyInfo
            ? `${trade.keyInfo.streetNumber || ""} ${
                trade.keyInfo.streetName || ""
              }`.trim()
            : "",
        };
      });

      // Sort by date (newest first)
      combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEftData(combinedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching EFT data:", error);
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
      flatFee: "Flat Fee",
      garnishment: "Garnishment",
      buyerRebate: "Buyer Rebate",
      noFee: "No Fee",
    };

    return planMap[feeInfo] || feeInfo;
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handlePrintReport = (filteredData, agentName, fromDate, toDate) => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();

    const formatCurrency = (amount) => {
      if (!amount) return "$0.00";
      return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      }).format(parseFloat(amount));
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-CA", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    };

    const totalNetCommission = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.netCommission || 0),
      0
    );

    const totalFees = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.feesDeducted || 0),
      0
    );

    const totalHST = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.netCommission || 0) * (0.15 / 1.15),
      0
    );

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Agent Payment Report - ${agentName}</title>
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
          <div class="logo-container">
            <img src="/logo1.jpg" alt="Bestway Real Estate Ltd. Logo" style="max-width: 120px; height: auto; margin-bottom: 10px;">
          </div>
          <div class="company-name">Bestway Real Estate Ltd., Brokerage</div>
          <div class="report-title">Agent Payment Report</div>
          <div class="report-subtitle">Complete Agent Commission Information - All Trades</div>
          <div class="report-info">
            Agent: ${agentName} | Period: ${formatDate(
      fromDate
    )} to ${formatDate(toDate)} | Generated: ${currentDate}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Agent #</th>
              <th>Agent Name</th>
              <th>EFT #</th>
              <th>Trade #</th>
              <th>Date Issued</th>
              <th>Plan Info</th>
              <th>Office Total Fees<br /><small>*HST Included</small></th>
              <th>Net Commission<br /><small>*HST Included</small></th>
              <th>HST</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredData.length > 0
                ? filteredData
                    .map(
                      (item, index) => `
                <tr>
                  <td>${item.agentId || "N/A"}</td>
                  <td>${item.agentName || "N/A"}</td>
                  <td>${item.eftNumber ? `EFT-${item.eftNumber}` : "N/A"}</td>
                  <td>${item.tradeNumber || "N/A"}</td>
                  <td>${formatDate(item.date)}</td>
                  <td>${item.planInfo}</td>
                  <td class="red-text">${formatCurrency(item.feesDeducted)}</td>
                  <td class="green-text">${formatCurrency(
                    item.netCommission
                  )}</td>
                  <td class="red-text">${formatCurrency(
                    parseFloat(item.netCommission || 0) * (0.15 / 1.15)
                  )}</td>
                </tr>
              `
                    )
                    .join("")
                : `<tr><td colspan="9" style="text-align: center; padding: 20px;">No data available for the selected period.</td></tr>`
            }
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Total Records:</span>
            <span>${filteredData.length}</span>
          </div>
          <div class="summary-row">
            <span>Office Total Fees (HST INCLUDED):</span>
            <span class="red-text">${formatCurrency(totalFees)}</span>
          </div>
          <div class="summary-row">
            <span>Total HST:</span>
            <span class="red-text">${formatCurrency(totalHST)}</span>
          </div>
          <div class="summary-row">
            <span>Total Commission Paid WITHOUT HST:</span>
            <span class="green-text">${formatCurrency(
              totalNetCommission - totalHST
            )}</span>
          </div>
          <div class="summary-row total-row">
            <span>Total Net Commission:</span>
            <span class="green-text">${formatCurrency(
              totalNetCommission
            )}</span>
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
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Left Sidebar */}
        <FinanceSidebar />
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Agent Payment Information
              </h2>
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors print:hidden"
              >
                <FaPrint />
                Print Report
              </button>
            </div>

            {/* Agent Commission Information Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Complete Agent Commission Information - All Trades
                </h3>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading agent payment data...
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
                          EFT #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trade #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Issued
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Office Total Fees
                          <br />
                          <span className="text-xs font-normal text-gray-400">
                            *HST Included
                          </span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Commission
                          <br />
                          <span className="text-xs font-normal text-gray-400">
                            *HST Included
                          </span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HST
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {eftData.length > 0 ? (
                        eftData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.agentId || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.agentName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.eftNumber ? `EFT-${item.eftNumber}` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.tradeNumber || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.planInfo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.feesDeducted)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatCurrency(item.netCommission)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(
                                (
                                  parseFloat(item.netCommission || 0) *
                                  (0.15 / 1.15)
                                ).toFixed(2)
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
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
              {eftData.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Records:</span>
                      <span className="font-semibold ml-2">
                        {eftData.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Office Total Fees:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(
                          eftData.reduce(
                            (sum, item) =>
                              sum + parseFloat(item.feesDeducted || 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total HST:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(
                          eftData.reduce(
                            (sum, item) =>
                              sum +
                              parseFloat(item.netCommission || 0) *
                                (0.15 / 1.15),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Total Commission Paid WITHOUT HST:
                      </span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(
                          eftData.reduce(
                            (sum, item) =>
                              sum + parseFloat(item.netCommission || 0),
                            0
                          ) -
                            eftData.reduce(
                              (sum, item) =>
                                sum +
                                parseFloat(item.netCommission || 0) *
                                  (0.15 / 1.15),
                              0
                            )
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Total Net Commission:
                      </span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(
                          eftData.reduce(
                            (sum, item) =>
                              sum + parseFloat(item.netCommission || 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      {/* Print Modal */}
      <AgentPaymentPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={handlePrintReport}
      />
    </div>
  );
};

export default AgentPaymentInfo;
