import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import AgentDetailsModal from "./AgentDetailsModal";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { handlePhoneNumberChange } from "../utils/phoneUtils";
import axiosInstance from "../config/axios";

const AgentInfoDB = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/agents");
      // Sort agents by employeeNo ascending
      const sortedAgents = [...response.data].sort(
        (a, b) => Number(a.employeeNo) - Number(b.employeeNo)
      );
      setAgents(sortedAgents);
      setFilteredAgents(sortedAgents);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setIsLoading(false);
    }
  };

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
        ?.toString()
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
        ?.toString()
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

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    const {
      licenses,
      payroll,
      feeInfo,
      _id,
      __v,
      createdAt,
      updatedAt,
      ...basicInfo
    } = selectedAgent;

    // Convert feeInfo string to object with boolean properties for checkboxes
    const feeInfoObject = {};
    if (feeInfo && typeof feeInfo === "string") {
      const feeOptions = [
        "flatFee",
        "garnishment",
        "plan250",
        "plan500",
        "plan9010",
        "plan955",
        "plan8515",
        "plan5050",
        "plan8020",
        "plan150",
        "buyerRebate",
        "noFee",
      ];
      feeOptions.forEach((option) => {
        feeInfoObject[option] = feeInfo === option;
      });
    }

    setEditFormData({
      basicInfo,
      licenseInfo: licenses || [],
      payrollInfo: payroll || {},
      feeInfo: feeInfoObject,
    });
  };

  const handleInputChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setEditFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [name]: inputValue,
      },
    }));
  };

  const handleLicenseChange = (index, field, value) => {
    const updatedLicenses = [...editFormData.licenseInfo];
    updatedLicenses[index] = {
      ...updatedLicenses[index],
      [field]: value,
    };

    setEditFormData((prev) => ({
      ...prev,
      licenseInfo: updatedLicenses,
    }));
  };

  const addLicense = () => {
    setEditFormData((prev) => ({
      ...prev,
      licenseInfo: [
        ...prev.licenseInfo,
        {
          licenseType: "",
          licenseNumber: "",
          issueDate: "",
          expiryDate: "",
          status: "Active",
        },
      ],
    }));
  };

  const removeLicense = (index) => {
    const updatedLicenses = [...editFormData.licenseInfo];
    updatedLicenses.splice(index, 1);

    setEditFormData((prev) => ({
      ...prev,
      licenseInfo: updatedLicenses,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const { basicInfo, licenseInfo, payrollInfo, feeInfo } = editFormData;

      // Convert feeInfo object to string value
      let feeInfoString = "";
      if (feeInfo) {
        // Find the first fee option that is true
        const feeOptions = [
          "flatFee",
          "garnishment",
          "plan250",
          "plan500",
          "plan9010",
          "plan955",
          "plan8515",
          "plan5050",
          "plan8020",
          "plan150",
          "buyerRebate",
          "noFee",
        ];
        for (const option of feeOptions) {
          if (feeInfo[option] === true) {
            feeInfoString = option;
            break;
          }
        }
      }

      const agentData = {
        ...basicInfo,
        licenses: licenseInfo,
        payroll: payrollInfo,
        feeInfo: feeInfoString, // Send as string, not object
      };

      await axiosInstance.put(`/agents/${selectedAgent._id}`, agentData);

      // Refresh data and close edit mode
      fetchAgents();
      setIsEditing(false);
      setIsModalOpen(false);
      alert("Agent updated successfully!");
    } catch (error) {
      console.error("Error updating agent:", error);
      alert("Failed to update agent");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await axiosInstance.delete(`/agents/${selectedAgent._id}`);
        fetchAgents();
        setIsModalOpen(false);
        alert("Agent deleted successfully!");
      } catch (error) {
        console.error("Error deleting agent:", error);
        alert("Failed to delete agent");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
    setIsEditing(false);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Agent Information Database
        </h1>

        {/* Search bar */}
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

        {/* Table */}
        {isLoading ? (
          <p className="text-center py-4">Loading agents...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="py-3 px-4 text-left font-medium">Agent #</th>
                  <th className="py-3 px-4 text-left font-medium">
                    First Name
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Last Name</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAgents.length > 0 ? (
                  filteredAgents
                    .sort((a, b) => {
                      const numA = Number(
                        String(a.employeeNo).replace(/\D/g, "")
                      );
                      const numB = Number(
                        String(b.employeeNo).replace(/\D/g, "")
                      );
                      return numA - numB;
                    })
                    .map((agent) => (
                      <tr
                        key={agent._id}
                        className="hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAgentClick(agent)}
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
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      {searchInput
                        ? "No agents found matching your search."
                        : "No agents available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent Details Modal */}
      {isModalOpen && selectedAgent && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Agent Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <AgentDetailsModal
              agent={selectedAgent}
              onClose={closeModal}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {isModalOpen && isEditing && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Agent</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Basic Information Form */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Agent #
                  </label>
                  <input
                    type="text"
                    name="employeeNo"
                    value={editFormData.basicInfo?.employeeNo || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editFormData.basicInfo?.status || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.basicInfo?.firstName || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={editFormData.basicInfo?.middleName || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.basicInfo?.lastName || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.basicInfo?.email || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.basicInfo?.address || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={editFormData.basicInfo?.city || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={editFormData.basicInfo?.province || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={editFormData.basicInfo?.postalCode || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    value={editFormData.basicInfo?.legalName || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nickname
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={editFormData.basicInfo?.nickname || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Spouse Name
                  </label>
                  <input
                    type="text"
                    name="spouseName"
                    value={editFormData.basicInfo?.spouseName || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={editFormData.basicInfo?.gender || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={editFormData.basicInfo?.website || ""}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Home Phone
                  </label>
                  <input
                    type="tel"
                    name="homePhone"
                    value={editFormData.basicInfo?.homePhone || ""}
                    onChange={(e) =>
                      handlePhoneNumberChange(e, (updater) => {
                        const newData =
                          typeof updater === "function"
                            ? updater(editFormData.basicInfo || {})
                            : updater;
                        setEditFormData((prev) => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, ...newData },
                        }));
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cell Phone
                  </label>
                  <input
                    type="tel"
                    name="cellPhone"
                    value={editFormData.basicInfo?.cellPhone || ""}
                    onChange={(e) =>
                      handlePhoneNumberChange(e, (updater) => {
                        const newData =
                          typeof updater === "function"
                            ? updater(editFormData.basicInfo || {})
                            : updater;
                        setEditFormData((prev) => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, ...newData },
                        }));
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fax
                  </label>
                  <input
                    type="tel"
                    name="fax"
                    value={editFormData.basicInfo?.fax || ""}
                    onChange={(e) =>
                      handlePhoneNumberChange(e, (updater) => {
                        const newData =
                          typeof updater === "function"
                            ? updater(editFormData.basicInfo || {})
                            : updater;
                        setEditFormData((prev) => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, ...newData },
                        }));
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                Important Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formatDateForInput(
                      editFormData.basicInfo?.dateOfBirth
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formatDateForInput(
                      editFormData.basicInfo?.startDate
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Termination Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formatDateForInput(editFormData.basicInfo?.endDate)}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Anniversary
                  </label>
                  <input
                    type="date"
                    name="contactAnniversary"
                    value={formatDateForInput(
                      editFormData.basicInfo?.contactAnniversary
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Franchise Anniversary
                  </label>
                  <input
                    type="date"
                    name="franchiseAnniversary"
                    value={formatDateForInput(
                      editFormData.basicInfo?.franchiseAnniversary
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Pay Date
                  </label>
                  <input
                    type="date"
                    name="lastPayDate"
                    value={formatDateForInput(
                      editFormData.basicInfo?.lastPayDate
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bond Expiry Date
                  </label>
                  <input
                    type="date"
                    name="bondExpiryDate"
                    value={formatDateForInput(
                      editFormData.basicInfo?.bondExpiryDate
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incorporated Date
                  </label>
                  <input
                    type="date"
                    name="incorporatedDate"
                    value={formatDateForInput(
                      editFormData.basicInfo?.incorporatedDate
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unincorporated Date
                  </label>
                  <input
                    type="date"
                    name="unincorporatedDate"
                    value={formatDateForInput(
                      editFormData.basicInfo?.unincorporatedDate
                    )}
                    onChange={(e) => handleInputChange(e, "basicInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>

            {/* License Information Form */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                License Information
              </h3>
              <div className="space-y-4">
                {editFormData.licenseInfo?.map((license, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        License Type
                      </label>
                      <input
                        type="text"
                        name="licenseType"
                        value={license.licenseType || ""}
                        onChange={(e) =>
                          handleLicenseChange(
                            index,
                            "licenseType",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        License Number
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={license.licenseNumber || ""}
                        onChange={(e) =>
                          handleLicenseChange(
                            index,
                            "licenseNumber",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formatDateForInput(license.expiryDate)}
                        onChange={(e) =>
                          handleLicenseChange(
                            index,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formatDateForInput(license.issueDate)}
                        onChange={(e) =>
                          handleLicenseChange(
                            index,
                            "issueDate",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={license.status || "Active"}
                        onChange={(e) =>
                          handleLicenseChange(index, "status", e.target.value)
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <button
                        onClick={() => removeLicense(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Remove License
                      </button>
                    </div>
                  </div>
                ))}
                <div className="col-span-3">
                  <button
                    onClick={addLicense}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Add License
                  </button>
                </div>
              </div>
            </div>

            {/* Payroll Information Form */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                Payroll Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={editFormData.payrollInfo?.position || ""}
                    onChange={(e) => handleInputChange(e, "payrollInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={editFormData.payrollInfo?.hourlyRate || ""}
                    onChange={(e) => handleInputChange(e, "payrollInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    name="hoursWorked"
                    value={editFormData.payrollInfo?.hoursWorked || ""}
                    onChange={(e) => handleInputChange(e, "payrollInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gross Pay
                  </label>
                  <input
                    type="number"
                    name="grossPay"
                    value={editFormData.payrollInfo?.grossPay || ""}
                    onChange={(e) => handleInputChange(e, "payrollInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deductions
                  </label>
                  <input
                    type="number"
                    name="deductions"
                    value={editFormData.payrollInfo?.deductions || ""}
                    onChange={(e) => handleInputChange(e, "payrollInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Net Pay
                  </label>
                  <input
                    type="number"
                    name="netPay"
                    value={editFormData.payrollInfo?.netPay || ""}
                    onChange={(e) => handleInputChange(e, "payrollInfo")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>

            {/* Fee Information Form */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                Fee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Flat Fee
                  </label>
                  <input
                    type="checkbox"
                    name="flatFee"
                    checked={editFormData.feeInfo?.flatFee || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Garnishment
                  </label>
                  <input
                    type="checkbox"
                    name="garnishment"
                    checked={editFormData.feeInfo?.garnishment || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 250
                  </label>
                  <input
                    type="checkbox"
                    name="plan250"
                    checked={editFormData.feeInfo?.plan250 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 500
                  </label>
                  <input
                    type="checkbox"
                    name="plan500"
                    checked={editFormData.feeInfo?.plan500 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 9010
                  </label>
                  <input
                    type="checkbox"
                    name="plan9010"
                    checked={editFormData.feeInfo?.plan9010 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 955
                  </label>
                  <input
                    type="checkbox"
                    name="plan955"
                    checked={editFormData.feeInfo?.plan955 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 8515
                  </label>
                  <input
                    type="checkbox"
                    name="plan8515"
                    checked={editFormData.feeInfo?.plan8515 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 50/50
                  </label>
                  <input
                    type="checkbox"
                    name="plan5050"
                    checked={editFormData.feeInfo?.plan5050 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 80/20
                  </label>
                  <input
                    type="checkbox"
                    name="plan8020"
                    checked={editFormData.feeInfo?.plan8020 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan 150
                  </label>
                  <input
                    type="checkbox"
                    name="plan150"
                    checked={editFormData.feeInfo?.plan150 || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Buyer Rebate
                  </label>
                  <input
                    type="checkbox"
                    name="buyerRebate"
                    checked={editFormData.feeInfo?.buyerRebate || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    No Fee
                  </label>
                  <input
                    type="checkbox"
                    name="noFee"
                    checked={editFormData.feeInfo?.noFee || false}
                    onChange={(e) => handleInputChange(e, "feeInfo")}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentInfoDB;
