import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import { FaSearch } from "react-icons/fa";
import AgentDetailsModal from "./AgentDetailsModal";
import Info1Form from "./Info1Form";
import Info2Form from "./Info2Form";
import PayrollForm from "./PayrollForm";
import FeeForm from "./FeeForm";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const AgentInfo = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [agentId, setAgentId] = useState(null);

  // Combined form data from all tabs
  const [combinedFormData, setCombinedFormData] = useState({
    basicInfo: {},
    licenseInfo: [],
    payrollInfo: {},
  });

  // Add a new state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Fee values mapping (for backend/calculation use)
  const feeValues = {
    plan250: 250,
    plan500: 500,
    plan9010: 0.1,
    plan955: 0.05,
    plan8515: 0.15,
    plan5050: 0.5,
    plan8020: 0.2,
    plan150: 150,
    buyerRebate: null, // Will be set elsewhere
    flatFee: null,
    garnishment: null,
    noFee: null,
  };

  // At the top of FeeTab
  const [selectedFeeOption, setSelectedFeeOption] = useState("");

  // Memoize the setFormData function to prevent unnecessary re-renders
  const setBasicInfoFormData = useCallback((data) => {
    setCombinedFormData((prev) => ({ ...prev, basicInfo: data }));
  }, []);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/agents");
      setAgents(response.data);
      setFilteredAgents(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!searchInput.trim()) {
      // Return all agents sorted by employeeNo
      const sortedAgents = [...agents].sort(
        (a, b) => Number(a.employeeNo) - Number(b.employeeNo)
      );
      setFilteredAgents(sortedAgents);
      return;
    }

    const lowerCaseSearchTerm = searchInput.toLowerCase().trim();

    const filtered = agents.filter((agent) => {
      // Search by employee number (with or without # prefix)
      const employeeNoMatch = agent.employeeNo
        .toString()
        .includes(lowerCaseSearchTerm.replace("#", ""));

      // Search by first name
      const firstNameMatch = agent.firstName
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);

      // Search by last name
      const lastNameMatch = agent.lastName
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);

      // Search by full name (first + last)
      const fullName = `${agent.firstName || ""} ${
        agent.lastName || ""
      }`.toLowerCase();
      const fullNameMatch = fullName.includes(lowerCaseSearchTerm);

      // Search by last + first name
      const reverseFullName = `${agent.lastName || ""} ${
        agent.firstName || ""
      }`.toLowerCase();
      const reverseFullNameMatch =
        reverseFullName.includes(lowerCaseSearchTerm);

      return (
        employeeNoMatch ||
        firstNameMatch ||
        lastNameMatch ||
        fullNameMatch ||
        reverseFullNameMatch
      );
    });

    // Sort the filtered results by employeeNo
    const sortedFiltered = filtered.sort(
      (a, b) => Number(a.employeeNo) - Number(b.employeeNo)
    );

    setFilteredAgents(sortedFiltered);
  };

  // Handle search input change with real-time search
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Perform real-time search
    if (!value.trim()) {
      // Return all agents sorted by employeeNo
      const sortedAgents = [...agents].sort(
        (a, b) => Number(a.employeeNo) - Number(b.employeeNo)
      );
      setFilteredAgents(sortedAgents);
      return;
    }

    const lowerCaseSearchTerm = value.toLowerCase().trim();

    const filtered = agents.filter((agent) => {
      // Search by employee number (with or without # prefix)
      const employeeNoMatch = agent.employeeNo
        .toString()
        .includes(lowerCaseSearchTerm.replace("#", ""));

      // Search by first name
      const firstNameMatch = agent.firstName
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);

      // Search by last name
      const lastNameMatch = agent.lastName
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm);

      // Search by full name (first + last)
      const fullName = `${agent.firstName || ""} ${
        agent.lastName || ""
      }`.toLowerCase();
      const fullNameMatch = fullName.includes(lowerCaseSearchTerm);

      // Search by last + first name
      const reverseFullName = `${agent.lastName || ""} ${
        agent.firstName || ""
      }`.toLowerCase();
      const reverseFullNameMatch =
        reverseFullName.includes(lowerCaseSearchTerm);

      return (
        employeeNoMatch ||
        firstNameMatch ||
        lastNameMatch ||
        fullNameMatch ||
        reverseFullNameMatch
      );
    });

    // Sort the filtered results by employeeNo
    const sortedFiltered = filtered.sort(
      (a, b) => Number(a.employeeNo) - Number(b.employeeNo)
    );

    setFilteredAgents(sortedFiltered);
  };

  // Fetch next employee number
  const fetchNextEmployeeNo = async () => {
    try {
      const response = await axiosInstance.get("/agents/next-employee-no");
      return response.data.nextEmployeeNo;
    } catch (error) {
      console.error("Error fetching next employee number:", error);
      return 100; // Default to 100 if there's an error
    }
  };

  // Add a function to start editing an agent
  const handleEditAgent = (agent) => {
    setIsEditMode(true);
    setAgentId(agent._id);

    // Populate the combined form data with the agent's information
    setCombinedFormData({
      basicInfo: {
        ...agent,
        birthDate: agent.dateOfBirth ? formatDate(agent.dateOfBirth) : "",
        startDate: agent.startDate ? formatDate(agent.startDate) : "",
        terminationDate: agent.endDate ? formatDate(agent.endDate) : "",
        contactAnniversary: agent.contactAnniversary
          ? formatDate(agent.contactAnniversary)
          : "",
        franchiseAnniversary: agent.franchiseAnniversary
          ? formatDate(agent.franchiseAnniversary)
          : "",
        lastPayDate: agent.lastPayDate ? formatDate(agent.lastPayDate) : "",
        bondExpiryDate: agent.bondExpiryDate
          ? formatDate(agent.bondExpiryDate)
          : "",
        incorporatedDate: agent.incorporatedDate
          ? formatDate(agent.incorporatedDate)
          : "",
        unincorporatedDate: agent.unincorporatedDate
          ? formatDate(agent.unincorporatedDate)
          : "",
      },
      licenseInfo: agent.licenses || [],
      payrollInfo: agent.payroll || {},
      feeInfo: agent.feeInfo || {},
    });

    // Switch to the info1 tab to start editing
    setActiveTab("info1");
    setIsModalOpen(false);
  };

  // Add a closeModal function
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
  };

  // Improve the date formatting function to handle all date formats
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Check if it's a valid date string
    if (
      typeof dateString === "string" &&
      (dateString.includes("T") || dateString.includes("-"))
    ) {
      // Remove the time part (T00:00:00.000Z)
      return dateString.split("T")[0];
    }
    return dateString;
  };

  const saveAgentData = async (dataToSave) => {
    try {
      setIsLoading(true);

      console.log("Data being passed to saveAgentData:", dataToSave);
      console.log("Basic info:", dataToSave.basicInfo);

      const { basicInfo, licenseInfo, payrollInfo, feeInfo } = dataToSave;

      // Clean up licenses: remove any _id fields (from MongoDB) before sending
      const cleanedLicenses = Array.isArray(licenseInfo)
        ? licenseInfo.map(({ _id, ...rest }) => ({ ...rest }))
        : [];

      // Clean up payroll: remove any _id field and convert numeric fields
      const cleanedPayroll = payrollInfo
        ? {
            position: payrollInfo.position || "",
            hourlyRate: payrollInfo.hourlyRate
              ? Number(payrollInfo.hourlyRate)
              : 0,
            hoursWorked: payrollInfo.hoursWorked
              ? Number(payrollInfo.hoursWorked)
              : 0,
            grossPay: payrollInfo.grossPay ? Number(payrollInfo.grossPay) : 0,
            deductions: payrollInfo.deductions
              ? Number(payrollInfo.deductions)
              : 0,
            netPay: payrollInfo.netPay ? Number(payrollInfo.netPay) : 0,
          }
        : null;

      const feeData = feeInfo || ""; // feeInfo should be a string, not an object

      // Enhanced validation with specific error messages
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
        const errorMessage = `Missing required fields: ${missingFields.join(
          ", "
        )}. Please complete the basic information form first.`;
        toast.error(errorMessage);
        setIsLoading(false);
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const agentData = {
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
        licenses: cleanedLicenses,
        payroll: cleanedPayroll,
        feeInfo: feeData, // This is now a string value
      };

      console.log("Final agent data being sent to server:", agentData);

      let response;
      if (isEditMode && agentId) {
        response = await axiosInstance.put(`/agents/${agentId}`, agentData);
      } else {
        response = await axiosInstance.post("/agents", agentData);
      }

      setIsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error saving agent data:", error);
      if (error.message.includes("Missing required fields")) {
        // Don't show the generic alert for validation errors
        setIsLoading(false);
        throw error;
      } else {
        toast.error("Failed to save agent information. Please try again.");
        setIsLoading(false);
        throw error;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Secondary Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === "list"
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("list")}
            >
              List
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === "info1"
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("info1")}
            >
              Info 1
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === "info2"
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("info2")}
            >
              Info 2
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === "payroll"
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("payroll")}
            >
              Payroll
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === "fee"
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("fee")}
            >
              Fee
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "list" && (
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by agent name or employee number..."
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchInput("");
                    setFilteredAgents(
                      [...agents].sort(
                        (a, b) => Number(a.employeeNo) - Number(b.employeeNo)
                      )
                    );
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Clear
                </button>
              </div>
              {searchInput && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {filteredAgents.length} of {agents.length} agents
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="py-3 px-4 text-left font-medium">Agent #</th>
                    <th className="py-3 px-4 text-left font-medium">
                      First Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Last Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.length > 0 ? (
                    filteredAgents
                      .sort(
                        (a, b) =>
                          Number(String(a.employeeNo).replace(/\D/g, "")) -
                          Number(String(b.employeeNo).replace(/\D/g, ""))
                      )
                      .map((agent) => (
                        <tr
                          key={agent._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsModalOpen(true);
                          }}
                        >
                          <td className="py-3 px-4">#{agent.employeeNo}</td>
                          <td className="py-3 px-4">{agent.firstName}</td>
                          <td className="py-3 px-4">{agent.lastName}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                agent.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : agent.status === "Inactive"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {agent.status || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-500"
                      >
                        {searchInput
                          ? "No agents found matching your search."
                          : "No agents available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "info1" && (
          <Info1Form
            formData={combinedFormData.basicInfo}
            setFormData={setBasicInfoFormData}
            handleSubmit={(data) => {
              setCombinedFormData((prev) => ({ ...prev, basicInfo: data }));
              setActiveTab("info2");
            }}
            fetchNextEmployeeNo={fetchNextEmployeeNo}
            combinedFormData={combinedFormData}
            setCombinedFormData={setCombinedFormData}
            setActiveTab={setActiveTab}
            onTabChange={(newTab) => {
              // Sync form data when leaving the info1 tab
              if (newTab !== "info1") {
                // This will be handled by the form's handleSubmit or we can add a sync mechanism
              }
            }}
          />
        )}
        {activeTab === "info2" && (
          <Info2Form
            licenses={combinedFormData.licenseInfo}
            setLicenses={(data) =>
              setCombinedFormData((prev) => ({ ...prev, licenseInfo: data }))
            }
            handleSubmit={(data) => {
              setCombinedFormData((prev) => ({
                ...prev,
                licenseInfo: data,
              }));
              setActiveTab("payroll");
            }}
            combinedFormData={combinedFormData}
            setCombinedFormData={setCombinedFormData}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "payroll" && (
          <PayrollForm
            employeeNo={combinedFormData.basicInfo?.employeeNo || ""}
            payrollData={combinedFormData.payrollInfo || {}}
            onSubmit={(data) => {
              setCombinedFormData((prev) => ({
                ...prev,
                payrollInfo: data,
              }));
              setActiveTab("fee");
            }}
          />
        )}
        {activeTab === "fee" && (
          <FeeForm
            selectedFee={combinedFormData.feeInfo}
            setSelectedFee={(value) =>
              setCombinedFormData((prev) => ({ ...prev, feeInfo: value }))
            }
            handleSubmit={(feeValue) => {
              // Update the combined form data with the fee string value
              const updatedFormData = {
                ...combinedFormData,
                feeInfo: feeValue,
              };
              setCombinedFormData(updatedFormData);
            }}
            combinedFormData={combinedFormData}
            onSave={async () => {
              // Validate that we have the required basic information before saving
              if (
                !combinedFormData.basicInfo?.firstName?.trim() ||
                !combinedFormData.basicInfo?.lastName?.trim() ||
                !combinedFormData.basicInfo?.employeeNo
              ) {
                toast.error(
                  "Please complete the basic information (Info 1) form before saving. First Name, Last Name, and Employee Number are required."
                );
                setActiveTab("info1");
                return;
              }

              try {
                setIsLoading(true);
                // Save the agent data with the current form data
                await saveAgentData(combinedFormData);
                toast.success("Agent information saved successfully!");
                setActiveTab("list");
                fetchAgents();
              } catch (err) {
                if (err.message.includes("Missing required fields")) {
                  // The error message is already shown in saveAgentData
                  // Switch to the info1 tab to help user complete the form
                  setActiveTab("info1");
                } else {
                  toast.error(
                    "Error saving agent information. Please try again."
                  );
                }
              } finally {
                setIsLoading(false);
              }
            }}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Add the modal */}
      {isModalOpen && (
        <AgentDetailsModal
          agent={selectedAgent}
          onClose={closeModal}
          onEdit={(updatedAgent) => {
            console.log(
              "onEdit called with updated agent:",
              JSON.stringify(updatedAgent, null, 2)
            );
            console.log("Current agents before update:", agents.length);

            // Update the agent in the local state
            setAgents((prevAgents) => {
              const updated = prevAgents.map((agent) =>
                agent._id === updatedAgent._id ? updatedAgent : agent
              );
              console.log("Updated agents array:", updated.length);
              return updated;
            });

            setFilteredAgents((prevAgents) => {
              const updated = prevAgents.map((agent) =>
                agent._id === updatedAgent._id ? updatedAgent : agent
              );
              console.log("Updated filtered agents array:", updated.length);
              return updated;
            });

            // Update the selected agent
            setSelectedAgent(updatedAgent);
            console.log("Updated selectedAgent");

            // Close the modal
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default AgentInfo;
