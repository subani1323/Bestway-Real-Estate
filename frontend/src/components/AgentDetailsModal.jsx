import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import AgentEditModal from "./AgentEditModal";

const AgentDetailsModal = ({ agent, onClose, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agent);

  React.useEffect(() => {
    if (agent) {
      console.log("Agent data in modal:", JSON.stringify(agent, null, 2));
      setCurrentAgent(agent);
    }
  }, [agent]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (!currentAgent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Top-right action buttons */}
        <div className="flex gap-3 absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl px-2"
            style={{ lineHeight: 1 }}
          >
            <FaTimes />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-blue-900 mb-6 mt-8">
          Agent Details: #{currentAgent.employeeNo}
        </h1>

        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-y-4">
              <div>
                <div className="text-gray-600">Employee No</div>
                <div>{currentAgent.employeeNo || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">First Name</div>
                <div>{currentAgent.firstName || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Middle Name</div>
                <div>{currentAgent.middleName || ""}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Last Name</div>
                <div>{currentAgent.lastName || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Legal Name</div>
                <div>{currentAgent.legalName || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Nickname</div>
                <div>{currentAgent.nickname || ""}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Spouse Name</div>
                <div>{currentAgent.spouseName || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Gender</div>
                <div>{currentAgent.gender || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <div>{currentAgent.status || ""}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Contact Information
          </h2>
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-y-4">
              <div>
                <div className="text-gray-600">Street #</div>
                <div>{currentAgent.streetNumber || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Street Name</div>
                <div>{currentAgent.streetName || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Unit #</div>
                <div>{currentAgent.unitNumber || ""}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">City</div>
                <div>{currentAgent.city || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Province</div>
                <div>{currentAgent.province || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Postal Code</div>
                <div>{currentAgent.postalCode || ""}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Email</div>
                <div>{currentAgent.email || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Website</div>
                <div>{currentAgent.website || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">HST #</div>
                <div>{currentAgent.hstNumber || ""}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Home Phone</div>
                <div>{currentAgent.homePhone || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Cell Phone</div>
                <div>{currentAgent.cellPhone || ""}</div>
              </div>
              <div>
                <div className="text-gray-600">Fax</div>
                <div>{currentAgent.fax || ""}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Important Dates
          </h2>
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-y-4">
              <div>
                <div className="text-gray-600">Date of Birth</div>
                <div>{formatDate(currentAgent.dateOfBirth)}</div>
              </div>
              <div>
                <div className="text-gray-600">Start Date</div>
                <div>{formatDate(currentAgent.startDate)}</div>
              </div>
              <div>
                <div className="text-gray-600">End Date</div>
                <div>{formatDate(currentAgent.endDate)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Contact Anniversary</div>
                <div>{formatDate(currentAgent.contactAnniversary)}</div>
              </div>
              <div>
                <div className="text-gray-600">Franchise Anniversary</div>
                <div>{formatDate(currentAgent.franchiseAnniversary)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Last Pay Date</div>
                <div>{formatDate(currentAgent.lastPayDate)}</div>
              </div>
              <div>
                <div className="text-gray-600">Bond Expiry Date</div>
                <div>{formatDate(currentAgent.bondExpiryDate)}</div>
              </div>
              <div>
                <div className="text-gray-600">Incorporated Date</div>
                <div>{formatDate(currentAgent.incorporatedDate)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-4 mt-4">
              <div>
                <div className="text-gray-600">Unincorporated Date</div>
                <div>{formatDate(currentAgent.unincorporatedDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            License Information
          </h2>
          <div className="border-t border-gray-200 pt-4">
            {currentAgent.licenses && currentAgent.licenses.length > 0 ? (
              currentAgent.licenses.map((license, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-100">
                  <div className="grid grid-cols-3 gap-y-4">
                    <div>
                      <div className="text-gray-600">License Type</div>
                      <div>{license.licenseType || ""}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">License Number</div>
                      <div>{license.licenseNumber || ""}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Status</div>
                      <div>{license.status || ""}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 mt-4">
                    <div>
                      <div className="text-gray-600">Issue Date</div>
                      <div>{formatDate(license.issueDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Expiry Date</div>
                      <div>{formatDate(license.expiryDate)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">
                No license information available
              </div>
            )}
          </div>
        </div>

        {/* Fee Information */}
        {currentAgent.feeInfo && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Fee Information
            </h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <div className="text-gray-600">Fee Plan</div>
                  <div>
                    {currentAgent.feeInfo === "flatFee" && "Flat Fee"}
                    {currentAgent.feeInfo === "garnishment" && "Garnishment"}
                    {currentAgent.feeInfo === "plan250" && "Plan 250"}
                    {currentAgent.feeInfo === "plan500" && "Plan 500"}
                    {currentAgent.feeInfo === "plan9010" && "Plan 90/10"}
                    {currentAgent.feeInfo === "plan955" && "Plan 95/5"}
                    {currentAgent.feeInfo === "plan8515" && "Plan 85/15"}
                    {currentAgent.feeInfo === "plan5050" && "Plan 50/50"}
                    {currentAgent.feeInfo === "plan8020" && "Plan 80/20"}
                    {currentAgent.feeInfo === "plan150" && "Plan 150"}
                    {currentAgent.feeInfo === "buyerRebate" && "Buyer Rebate"}
                    {currentAgent.feeInfo === "noFee" && "No Fee"}
                    {currentAgent.feeInfo === "" && "No fee plan selected"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payroll Information */}
        {currentAgent.payroll && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payroll Information
            </h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-3 gap-y-4">
                <div>
                  <div className="text-gray-600">Position</div>
                  <div>{currentAgent.payroll.position || ""}</div>
                </div>
                <div>
                  <div className="text-gray-600">Hourly Rate</div>
                  <div>
                    {currentAgent.payroll.hourlyRate
                      ? `$${currentAgent.payroll.hourlyRate}`
                      : ""}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Hours Worked</div>
                  <div>{currentAgent.payroll.hoursWorked || ""}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-y-4 mt-4">
                <div>
                  <div className="text-gray-600">Gross Pay</div>
                  <div>
                    {currentAgent.payroll.grossPay
                      ? `$${currentAgent.payroll.grossPay}`
                      : ""}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Deductions</div>
                  <div>
                    {currentAgent.payroll.deductions
                      ? `$${currentAgent.payroll.deductions}`
                      : ""}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Net Pay</div>
                  <div>
                    {currentAgent.payroll.netPay
                      ? `$${currentAgent.payroll.netPay}`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>

        {showEditModal && (
          <AgentEditModal
            agent={currentAgent}
            onClose={() => setShowEditModal(false)}
            onUpdate={(updatedAgent) => {
              setShowEditModal(false);
              // Update local state with the saved data
              setCurrentAgent(updatedAgent);
              // Don't call onEdit to prevent additional popups
              // The data is already saved to the database
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AgentDetailsModal;
