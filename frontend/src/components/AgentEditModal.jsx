import React, { useState, useEffect } from "react";
import Info1Form from "./Info1Form";
import Info2Form from "./Info2Form";
import PayrollForm from "./PayrollForm";
import FeeForm from "./FeeForm";
import axiosInstance from "../config/axios";

const AgentEditModal = ({ agent, onClose, onUpdate }) => {
  // Shared state for all forms
  const [combinedFormData, setCombinedFormData] = useState({
    basicInfo: {},
    licenseInfo: [],
    payroll: {},
    feeInfo: "",
  });
  const [activeTab, setActiveTab] = useState("info1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // For Info2Form
  const [licenses, setLicenses] = useState([]);
  // For FeeForm
  const [selectedFee, setSelectedFee] = useState("");

  useEffect(() => {
    if (agent) {
      setCombinedFormData({
        basicInfo: agent.basicInfo || agent, // fallback to agent root for backward compatibility
        licenseInfo: agent.licenseInfo || [],
        payroll: agent.payroll || {},
        feeInfo: agent.feeInfo || "",
      });
      setLicenses(agent.licenseInfo || []);
      setSelectedFee(agent.feeInfo || "");
    }
  }, [agent]);

  // Handlers for each form
  const handleInfo1Submit = (data) => {
    setCombinedFormData((prev) => ({ ...prev, basicInfo: data }));
    setActiveTab("info2");
  };
  const handleInfo2Submit = (data) => {
    setCombinedFormData((prev) => ({ ...prev, licenseInfo: data }));
    setLicenses(data);
    setActiveTab("payroll");
  };
  const handlePayrollSubmit = (data) => {
    setCombinedFormData((prev) => ({ ...prev, payroll: data }));
    setActiveTab("fee");
  };
  const handleFeeSubmit = (data) => {
    setCombinedFormData((prev) => ({ ...prev, feeInfo: data }));
    setSelectedFee(data);
    // Optionally, you can trigger save here or keep Save button at the bottom
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    console.log(
      "Current combinedFormData:",
      JSON.stringify(combinedFormData, null, 2)
    );

    try {
      // Validate required fields before saving
      const basicInfo = combinedFormData.basicInfo;
      const missingFields = [];

      if (!basicInfo?.firstName?.trim()) {
        missingFields.push("First Name");
      }
      if (!basicInfo?.lastName?.trim()) {
        missingFields.push("Last Name");
      }
      if (!basicInfo?.employeeNo) {
        missingFields.push("Employee Number");
      }

      if (missingFields.length > 0) {
        setError(
          `Missing required fields: ${missingFields.join(
            ", "
          )}. Please complete the basic information form first.`
        );
        setIsLoading(false);
        return;
      }

      // Structure the data to match the backend expectations
      const payload = {
        employeeNo: Number(basicInfo.employeeNo),
        firstName: basicInfo.firstName.trim(),
        middleName: basicInfo.middleName || "",
        lastName: basicInfo.lastName.trim(),
        legalName: basicInfo.legalName || "",
        nickname: basicInfo.nickname || "",
        spouseName: basicInfo.spouseName || "",
        gender: basicInfo.gender || "",
        email: basicInfo.email || "",
        website: basicInfo.website || "",
        homePhone: basicInfo.homePhone || "",
        cellPhone: basicInfo.cellPhone || "",
        fax: basicInfo.fax || "",
        streetNumber: basicInfo.streetNumber || "",
        streetName: basicInfo.streetName || "",
        unitNumber: basicInfo.unitNumber || "",
        city: basicInfo.city || "",
        province: basicInfo.province || "",
        postalCode: basicInfo.postalCode || "",
        hstNumber: basicInfo.hstNumber || "",
        dateOfBirth: basicInfo.birthDate || null,
        startDate: basicInfo.startDate || null,
        endDate: basicInfo.terminationDate || null,
        contactAnniversary: basicInfo.contactAnniversary || null,
        franchiseAnniversary: basicInfo.franchiseAnniversary || null,
        lastPayDate: basicInfo.lastPayDate || null,
        bondExpiryDate: basicInfo.bondExpiryDate || null,
        incorporatedDate: basicInfo.incorporatedDate || null,
        unincorporatedDate: basicInfo.unincorporatedDate || null,
        status: basicInfo.status || "Active",
        licenses: combinedFormData.licenseInfo || [],
        payroll: combinedFormData.payroll || {},
        feeInfo: combinedFormData.feeInfo || "",
      };

      console.log("Saving agent data:", JSON.stringify(payload, null, 2));

      const response = await axiosInstance.put(
        `/agents/${agent._id}`,
        payload
      );

      console.log(
        "Response from server:",
        JSON.stringify(response.data, null, 2)
      );

      // Call onUpdate with the updated agent data
      if (onUpdate) {
        console.log(
          "Calling onUpdate with:",
          JSON.stringify(response.data, null, 2)
        );
        onUpdate(response.data);
      }

      // Close modal immediately after successful save
      onClose();
    } catch (err) {
      console.error("Error updating agent:", err);
      setError(err.response?.data?.message || "Error updating agent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-900">
            Edit Agent: #{agent.employeeNo}
          </h2>
          <button
            className="text-2xl text-gray-500 hover:text-gray-700"
            onClick={handleCancel}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b">
          {[
            { id: "info1", label: "Info 1" },
            { id: "info2", label: "Info 2" },
            { id: "payroll", label: "Payroll" },
            { id: "fee", label: "Fee" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-900 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {activeTab === "info1" && (
            <Info1Form
              formData={combinedFormData.basicInfo}
              setFormData={(data) =>
                setCombinedFormData((prev) => ({ ...prev, basicInfo: data }))
              }
              handleSubmit={(data) => {
                setCombinedFormData((prev) => ({ ...prev, basicInfo: data }));
              }}
              combinedFormData={combinedFormData}
              fetchNextEmployeeNo={async () => agent.employeeNo}
            />
          )}
          {activeTab === "info2" && (
            <Info2Form
              licenses={combinedFormData.licenseInfo}
              setLicenses={(data) => {
                setCombinedFormData((prev) => ({ ...prev, licenseInfo: data }));
                setLicenses(data);
              }}
              handleSubmit={(data) => {
                setCombinedFormData((prev) => ({ ...prev, licenseInfo: data }));
                setLicenses(data);
              }}
              combinedFormData={combinedFormData}
              setCombinedFormData={setCombinedFormData}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "payroll" && (
            <PayrollForm
              employeeNo={agent.employeeNo}
              payrollData={combinedFormData.payroll}
              onSubmit={(data) => {
                setCombinedFormData((prev) => ({ ...prev, payroll: data }));
              }}
            />
          )}
          {activeTab === "fee" && (
            <FeeForm
              selectedFee={combinedFormData.feeInfo}
              setSelectedFee={(value) => {
                setCombinedFormData((prev) => ({ ...prev, feeInfo: value }));
                setSelectedFee(value);
              }}
              handleSubmit={(data) => {
                setCombinedFormData((prev) => ({ ...prev, feeInfo: data }));
                setSelectedFee(data);
              }}
              combinedFormData={combinedFormData}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentEditModal;
