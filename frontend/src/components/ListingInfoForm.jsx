import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { handlePhoneNumberChange } from "../utils/phoneUtils";
import axiosInstance from "../config/axios";

const ListingInfoForm = ({ onSubmitSuccess, listingToEdit, onCancel }) => {
  // Add onCancel to the props
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // State to know if we are editing
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Helper to format date for input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Helper to create dates in local timezone to avoid UTC conversion issues
  const createLocalDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    // Create date in local timezone (month is 0-indexed in Date constructor)
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const initialFormData = {
    streetNumber: "",
    streetName: "",
    unit: "",
    city: "",
    province: "",
    postalCode: "",
    sellerFirstName: "",
    sellerLastName: "",
    sellerPhone: "",
    listCommission: "",
    sellCommission: "",
    propertyType: "",
    dealType: "",
    status: "",
    agentNo: "",
    agentOffice: "",
    agentLead: "",
    listingDate: "",
    entryDate: "",
    expiryDate: "",
    soldDate: "",
    lastEdit: new Date().toISOString().split("T")[0],
    listedPrice: "",
    soldPrice: "",
    mlsNumber: "",
    weManage: "",
    listingNumber: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (listingToEdit) {
      setIsEditMode(true);
      setFormData({
        streetNumber: (listingToEdit.address?.streetNumber || "").trim(),
        streetName: (listingToEdit.address?.streetName || "").trim(),
        unit: (listingToEdit.address?.unit || "").trim(),
        city: (listingToEdit.address?.city || "").trim(),
        province: listingToEdit.address?.province || "",
        postalCode: (listingToEdit.address?.postalCode || "").trim(),
        sellerFirstName: listingToEdit.seller?.name?.split(" ")[0] || "",
        sellerLastName:
          listingToEdit.seller?.name?.split(" ").slice(1).join(" ") || "",
        sellerPhone: (listingToEdit.seller?.phoneNumber || "").trim(),
        listCommission: listingToEdit.commission?.list?.toString() || "",
        sellCommission: listingToEdit.commission?.sell?.toString() || "",
        propertyType: listingToEdit.propertyType || "",
        status: listingToEdit.status || "",
        agentNo: (listingToEdit.agent?.employeeNo || "").trim(),
        agentOffice: (listingToEdit.agent?.officeNumber || "").trim(),
        agentLead: listingToEdit.agent?.isLead ? "Yes" : "No",
        listingDate: formatDateForInput(listingToEdit.dates?.listing),
        entryDate: formatDateForInput(listingToEdit.dates?.entry),
        expiryDate: formatDateForInput(listingToEdit.dates?.expiry),
        soldDate: formatDateForInput(listingToEdit.dates?.sold),
        lastEdit: formatDateForInput(listingToEdit.dates?.lastEdit),
        listedPrice: listingToEdit.prices?.listed?.toString() || "",
        soldPrice: listingToEdit.prices?.sold?.toString() || "",
        mlsNumber: (listingToEdit.mlsNumber || "").trim(),
        weManage: listingToEdit.weManage ? "Yes" : "No",
        listingNumber: listingToEdit.listingNumber || "",
        dealType: listingToEdit.dealType || "",
      });

      if (listingToEdit.people && listingToEdit.people.length > 0) {
        setPeople(listingToEdit.people);
      }

      if (listingToEdit.agents && listingToEdit.agents.length > 0) {
        setAgents(listingToEdit.agents);
      }
    } else {
      setIsEditMode(false);
      setFormData(initialFormData);
      setPeople([]);
      setAgents([]);
    }
  }, [listingToEdit]);

  const provinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Northwest Territories",
    "Nunavut",
    "Yukon",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = type === "checkbox" ? checked : value;
    if (
      typeof processedValue === "string" &&
      name !== "weManage" &&
      name !== "agentLead" &&
      name !== "propertyType" &&
      name !== "status" &&
      name !== "province" &&
      name !== "sellerFirstName" &&
      name !== "streetName"
    ) {
      // Don't trim select values directly here as they are fixed options
      // For text inputs, trim the value.
      processedValue = processedValue.trim();
    }

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [name]: processedValue,
        lastEdit: new Date().toISOString().split("T")[0], // Always update lastEdit on any change
      };

      // Auto-add seller to people table when seller details are entered
      if (
        name === "sellerFirstName" ||
        name === "sellerLastName" ||
        name === "sellerPhone"
      ) {
        const sellerFirstName =
          name === "sellerFirstName" ? processedValue : prev.sellerFirstName;
        const sellerLastName =
          name === "sellerLastName" ? processedValue : prev.sellerLastName;
        const sellerPhone =
          name === "sellerPhone" ? processedValue : prev.sellerPhone;

        // Remove any existing seller entries first
        const updatedPeople = people.filter((p) => p.type !== "Seller");
        setPeople(updatedPeople);

        // Only add seller if both first and last names are provided AND not empty
        if (
          sellerFirstName &&
          sellerFirstName.trim() &&
          sellerLastName &&
          sellerLastName.trim()
        ) {
          const sellerPerson = {
            type: "Seller",
            firstName: sellerFirstName.trim(),
            lastName: sellerLastName.trim(),
            phone: sellerPhone || "",
            address: "",
            end: "Listing End",
            email: "",
            primaryPhone: "",
            cellPhone: sellerPhone || "",
            companyName: "",
          };

          // Add the new seller entry
          setPeople((prevPeople) => [...prevPeople, sellerPerson]);
        }
      }

      return updatedFormData;
    });

    // Clear sold date and price if status is changed to Available
    if (name === "status" && value === "Available") {
      setFormData((prev) => ({
        ...prev,
        soldDate: "",
        soldPrice: "",
        [name]: value, // ensure status is updated
      }));
    }
  };

  const validateForm = () => {
    if (!formData.streetNumber || !formData.streetName) {
      toast.error("Street number and street name are required");
      return false;
    }

    if (!formData.city) {
      toast.error("City is required");
      return false;
    }

    if (!formData.sellerFirstName || !formData.sellerLastName) {
      toast.error("Seller first name and last name are required");
      return false;
    }

    if (!formData.status) {
      toast.error("Status is required");
      return false;
    }

    if (!formData.propertyType) {
      toast.error("Property type is required");
      return false;
    }

    if (!formData.listedPrice) {
      toast.error("Listed price is required");
      return false;
    }

    if (
      formData.status === "Sold" &&
      (!formData.soldDate || !formData.soldPrice)
    ) {
      toast.error("Sold date and sold price are required when status is Sold");
      return false;
    }

    if (!formData.dealType) {
      toast.error("Deal type is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Submitting form...");

      // Create a properly structured payload for the listings endpoint
      const payload = {
        address: {
          streetNumber: formData.streetNumber || "",
          streetName: formData.streetName || "",
          unit: formData.unit || "",
          city: formData.city || "",
          province: formData.province || "",
          postalCode: formData.postalCode || "",
        },
        seller: {
          name: `${formData.sellerFirstName || ""} ${
            formData.sellerLastName || ""
          }`.trim(),
          phoneNumber: formData.sellerPhone || "",
        },
        commission: {
          list: parseFloat(formData.listCommission) || 0,
          sell: parseFloat(formData.sellCommission) || 0,
        },
        propertyType: formData.propertyType || "",
        dealType: formData.dealType || "",
        status: formData.status || "Available",
        agent: {
          employeeNo: formData.agentNo || "",
          officeNumber: formData.agentOffice || "",
          isLead: formData.agentLead === "Yes",
        },
        mlsNumber: formData.mlsNumber || "",
        dates: {
          listing: formData.listingDate
            ? createLocalDate(formData.listingDate)
            : null,
          entry: formData.entryDate
            ? createLocalDate(formData.entryDate)
            : null,
          expiry: formData.expiryDate
            ? createLocalDate(formData.expiryDate)
            : null,
          sold: formData.soldDate ? createLocalDate(formData.soldDate) : null,
          lastEdit: new Date(),
        },
        weManage: formData.weManage === "Yes",
        prices: {
          listed: parseFloat(formData.listedPrice) || 0,
          sold: formData.soldPrice ? parseFloat(formData.soldPrice) : null,
        },
        people: people,
        agents: agents,
      };

      console.log("Data being sent:", payload);

      let response;
      if (isEditMode && listingToEdit?._id) {
        // Use the listings endpoint for updates
        response = await axiosInstance.put(
          `/listings/${listingToEdit._id}`,
          payload
        );
      } else {
        // Use the listings endpoint for new listings
        response = await axiosInstance.post("/listings", payload);
      }

      console.log("Response:", response.data);
      toast.success(
        `Listing ${isEditMode ? "updated" : "created"} successfully!`
      );

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} listing:`,
        error
      );

      let errorMessage = `Error ${
        isEditMode ? "updating" : "creating"
      } listing. `;

      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      toast.error(errorMessage);
    }
  };

  // Add PeopleInfo state
  // State for the left form (People)
  const [people, setPeople] = useState([]);
  const [person, setPerson] = useState({
    type: "",
    firstName: "",
    lastName: "",
    email: "",
    primaryPhone: "",
    cellPhone: "",
    address: "",
    end: "",
    companyName: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // State for the right form (Agents)
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [agent, setAgent] = useState({
    agentNo: "",
    firstName: "",
    lastName: "",
    officeNo: "",
    sendPage: "No",
    lead: "No",
    expense: "",
    amount: "", // New field
    cooperation: "No", // New field
  });
  const [editingAgentIndex, setEditingAgentIndex] = useState(null);

  // Add PeopleInfo useEffect
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get("/agents");
        console.log("Fetched agents:", response.data);
        setAllAgents(response.data);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };
    fetchAgents();
  }, []);

  // Handlers for the People form
  const handlePersonInputChange = (e) => {
    const { name, value } = e.target;
    setPerson({ ...person, [name]: value });
  };

  const handlePersonSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting person:", person);
    console.log("Current editing index:", editingIndex);

    if (editingIndex !== null) {
      const updatedPeople = [...people];
      updatedPeople[editingIndex] = { ...person };
      console.log("Updating person at index:", editingIndex);
      console.log("Updated people array:", updatedPeople);
      setPeople(updatedPeople);
      setEditingIndex(null);
      toast.success("Person updated successfully!");
    } else {
      console.log("Adding new person");
      setPeople([...people, { ...person }]);
      toast.success("Person added successfully!");
    }

    setPerson({
      type: "",
      firstName: "",
      lastName: "",
      email: "",
      primaryPhone: "",
      cellPhone: "",
      address: "",
      end: "",
      companyName: "",
      phone: "",
    });
  };

  const handlePersonEdit = (index) => {
    setPerson(people[index]);
    setEditingIndex(index);
  };

  const handlePersonAddNew = () => {
    setPerson({
      type: "",
      firstName: "",
      lastName: "",
      email: "",
      primaryPhone: "",
      cellPhone: "",
      address: "",
      end: "",
      companyName: "",
      phone: "",
    });
    setEditingIndex(null);
  };

  // Handlers for the Agent form
  const handleAgentInputChange = (e) => {
    const { name, value } = e.target;
    setAgent({ ...agent, [name]: value });
  };

  // Let's try a different approach with the Agent Full Name dropdown
  // First, let's modify the handleAgentSelectChange function

  const handleAgentSelectChange = (e) => {
    const agentId = e.target.value;
    setSelectedAgentId(agentId);

    if (!agentId) {
      setAgent((prev) => ({
        ...prev,
        agentNo: "",
        firstName: "",
        lastName: "",
        officeNo: "",
      }));
      return;
    }

    const selectedAgent = allAgents.find((a) => a._id === agentId);
    if (selectedAgent) {
      setAgent((prev) => ({
        ...prev,
        agentNo: selectedAgent.employeeNo?.toString() || "",
        firstName: selectedAgent.firstName || "",
        lastName: selectedAgent.lastName || "",
        officeNo: selectedAgent.officeNo || "",
      }));
    }
  };

  const handleAgentSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting agent:", agent);
    console.log("Current editing agent index:", editingAgentIndex);
    console.log("Current agents array:", agents);

    // Validate that we have at least agent number and name
    if (!agent.agentNo || !agent.firstName || !agent.lastName) {
      toast.error("Please select an agent and fill in required fields");
      return;
    }

    if (editingAgentIndex !== null) {
      const updatedAgents = [...agents];
      updatedAgents[editingAgentIndex] = { ...agent };
      console.log("Updating agent at index:", editingAgentIndex);
      console.log("Updated agents array:", updatedAgents);
      setAgents(updatedAgents);
      setEditingAgentIndex(null);
      toast.success("Agent updated successfully!");
    } else {
      console.log("Adding new agent");
      const newAgentsArray = [...agents, { ...agent }];
      console.log("New agents array:", newAgentsArray);
      setAgents(newAgentsArray);
      toast.success("Agent added successfully!");
    }

    // Reset form after successful submission
    setAgent({
      agentNo: "",
      firstName: "",
      lastName: "",
      officeNo: "",
      sendPage: "No",
      lead: "No",
      expense: "",
      amount: "",
      cooperation: "No",
    });
    setSelectedAgentId("");
  };

  const handleAgentEdit = (index) => {
    console.log("Editing agent at index:", index);
    console.log("Agent data:", agents[index]);
    const agentToEdit = agents[index];
    setAgent(agentToEdit);
    setEditingAgentIndex(index);

    // Set the selected agent ID for the dropdown
    if (agentToEdit.firstName && agentToEdit.lastName) {
      const matchingAgent = allAgents.find(
        (a) =>
          a.firstName === agentToEdit.firstName &&
          a.lastName === agentToEdit.lastName
      );
      if (matchingAgent) {
        setSelectedAgentId(matchingAgent._id);
      }
    }
  };

  const handleAgentDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      const updatedAgents = agents.filter((_, i) => i !== index);
      setAgents(updatedAgents);
      toast.success("Agent deleted successfully!");
    }
  };

  const handleAgentAddNew = () => {
    setAgent({
      agentNo: "",
      firstName: "",
      lastName: "",
      officeNo: "",
      sendPage: "No",
      lead: "No",
      expense: "",
      amount: "", // Reset new fields
      cooperation: "No", // Reset new fields
    });
    setSelectedAgentId(""); // Reset the selected agent ID
    setEditingAgentIndex(null);
  };

  // Add a test function to check the API connection
  const testApiEndpoint = async () => {
    try {
      console.log("Testing API endpoint...");
      const response = await axiosInstance.get("/complete-listings/test");
      console.log("API test endpoint response:", response.data);
      return true;
    } catch (error) {
      console.error("API test endpoint failed:", error);
      return false;
    }
  };

  // Add a function to test creating a minimal listing
  const testCreateListing = async () => {
    try {
      console.log("Testing create listing...");
      const minimalData = {
        address: {
          streetNumber: "123",
          streetName: "Test Street",
        },
        seller: {
          name: "Test Seller",
        },
        status: "Available",
      };

      const response = await axiosInstance.post(
        "/complete-listings",
        minimalData
      );

      console.log("Create listing test response:", response.data);
      return true;
    } catch (error) {
      console.error("Create listing test failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      return false;
    }
  };

  // Add a function to check the server health
  const checkServerHealth = async () => {
    try {
      console.log("Checking server health...");
      const response = await axiosInstance.get("/health");
      console.log("Server health:", response.data);

      // Alert if MongoDB is not connected
      if (response.data.mongo.status !== "connected") {
        console.error(
          "MongoDB is not connected! Status:",
          response.data.mongo.status
        );
        toast(
          `Warning: MongoDB is not connected. Status: ${response.data.mongo.status}`
        );
      }

      return response.data;
    } catch (error) {
      console.error("Server health check failed:", error);
      toast("Server health check failed. The server might be down.");
      return null;
    }
  };

  useEffect(() => {
    checkServerHealth();
    testApiEndpoint();
    // Uncomment this to test creating a minimal listing
    // testCreateListing();
  }, []);

  // Add useEffect to auto-populate People List with seller details (only on initial load)
  useEffect(() => {
    // Only auto-populate if we're in edit mode and there are no existing people
    if (listingToEdit && people.length === 0) {
      if (formData.sellerFirstName && formData.sellerLastName) {
        setPeople([
          {
            firstName: formData.sellerFirstName,
            lastName: formData.sellerLastName,
            address: formData.city
              ? `${formData.city}, ${formData.province}`
              : "",
            phone: formData.sellerPhone || "",
          },
        ]);
      }
    }
  }, [
    listingToEdit,
    people.length,
    formData.sellerFirstName,
    formData.sellerLastName,
    formData.city,
    formData.province,
    formData.sellerPhone,
  ]);

  // Add useEffect to auto-populate Agent List with agent details (only on initial load)
  useEffect(() => {
    // Only auto-populate if we're in edit mode and there are no existing agents
    if (listingToEdit && agents.length === 0) {
      if (
        formData.agentNo &&
        formData.agentNo.trim() &&
        formData.agentNo !== "" &&
        formData.agentNo !== undefined &&
        formData.agentNo !== null &&
        formData.agentNo !== "Auto-generated after save"
      ) {
        // Try to get the selected agent from allAgents
        let firstName = "";
        let lastName = "";
        if (selectedAgentId) {
          const selectedAgent = allAgents.find(
            (a) => a._id === selectedAgentId
          );
          if (selectedAgent) {
            firstName = selectedAgent.firstName || "";
            lastName = selectedAgent.lastName || "";
          }
        }
        setAgents([
          {
            agentNo: formData.agentNo,
            firstName,
            lastName,
            officeNo: formData.agentOffice || "",
            lead: formData.agentLead || "",
            sendPage: "",
            expense: "",
            amount: "",
            cooperation: agent.cooperation || formData.cooperation || "",
          },
        ]);
      }
    }
  }, [
    listingToEdit,
    agents.length,
    formData.agentNo,
    formData.agentOffice,
    formData.agentLead,
    agent.cooperation,
    formData.cooperation,
    selectedAgentId,
    allAgents,
  ]);

  return (
    <div className="space-y-8">
      <form
        id="listingForm"
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white rounded-lg shadow"
      >
        {/* Removed outer h3 title, as modal provides it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {" "}
          {/* Adjusted gap */}
          {/* Address Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Address</h3>{" "}
            {/* Adjusted heading size and margin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {" "}
              {/* Adjusted gap */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Street #
                </label>
                <input
                  type="text"
                  name="streetNumber"
                  value={formData.streetNumber}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Street Name
                </label>
                <input
                  type="text"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Province
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
          </div>
          {/* Seller Details */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Seller Detail</h3>{" "}
            {/* Adjusted heading size and margin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {" "}
              {/* Adjusted for First Name, Last Name, Phone */}{" "}
              {/* Adjusted gap */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="sellerFirstName"
                  value={formData.sellerFirstName}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="sellerLastName"
                  value={formData.sellerLastName}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Cellular Phone #
                </label>
                <input
                  type="tel"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={(e) => handlePhoneNumberChange(e, setFormData)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
          </div>
          {/* Commission */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Commission</h3>{" "}
            {/* Adjusted heading size and margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {" "}
              {/* Adjusted gap */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  List %
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="listCommission"
                  value={formData.listCommission}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Sell %
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="sellCommission"
                  value={formData.sellCommission}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
          </div>
          {/* Property Type and Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Property Type
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">Select Type</option>
              <option value="Commercial">Commercial</option>
              <option value="Residential">Residential</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">Select Status</option>
              <option value="Sold">Sold</option>
              <option value="Available">Available</option>
            </select>
          </div>
          {/* Deal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Type
            </label>
            <select
              name="dealType"
              value={formData.dealType || ""}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
              required
            >
              <option value="">Select Deal Type</option>
              <option value="Sale">Sale</option>
              <option value="Lease">Lease</option>
            </select>
          </div>
          {/* Agent Details */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Agent Detail</h3>{" "}
            {/* Adjusted heading size and margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {" "}
              {/* Adjusted gap */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Agent Number
                </label>
                <input
                  type="text"
                  name="agentNo"
                  value={formData.agentNo}
                  onChange={handleChange}
                  readOnly
                  className="mt-2 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Agent Name
                </label>
                <select
                  name="selectedAgent"
                  value={selectedAgentId}
                  onChange={handleAgentSelectChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="">Select Agent</option>
                  {allAgents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.firstName} {a.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Office #
                </label>
                <input
                  type="tel"
                  name="agentOffice"
                  value={formData.agentOffice}
                  onChange={(e) => handlePhoneNumberChange(e, setFormData)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lead
                </label>
                <select
                  name="agentLead"
                  value={formData.agentLead}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>
          {/* Listing Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Listing Number
            </label>
            <input
              type="text"
              name="listingNumber"
              value={formData.listingNumber}
              readOnly
              placeholder={
                isEditMode
                  ? formData.listingNumber
                    ? ""
                    : "Not available"
                  : "Auto-generated after save"
              }
              className="mt-2 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              MLS Number
            </label>
            <input
              type="text"
              name="mlsNumber"
              value={formData.mlsNumber}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Listing Date
            </label>
            <input
              type="date"
              name="listingDate"
              value={formData.listingDate}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Entry Date
            </label>
            <input
              type="date"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
          {/* Only show sold date and price fields if status is Sold */}
          {formData.status === "Sold" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Sold Date
                </label>
                <input
                  type="date"
                  name="soldDate"
                  value={formData.soldDate}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  {/* Adjusted font size */}
                  Sold Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="soldPrice"
                  value={formData.soldPrice}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Last Edit
            </label>
            <input
              type="date"
              name="lastEdit"
              value={formData.lastEdit}
              readOnly
              className="mt-2 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              We Manage
            </label>
            <select
              name="weManage"
              value={formData.weManage}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {/* Prices */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              {/* Adjusted font size */}
              Listed Price
            </label>
            <input
              type="number"
              step="0.01"
              name="listedPrice"
              value={formData.listedPrice}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {" "}
          {/* Adjusted margin and added flex for button alignment */}
          {onCancel /* Show cancel button only if onCancel is provided (i.e. in edit mode from modal) */ && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
            >
              Cancel
            </button>
          )}
          {/* Save button removed from here */}
        </div>
      </form>

      {/* People and Agent Forms */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Additional Information</h2>
        <div className="flex flex-col space-y-8">
          {/* Left Side: People Form and Table */}
          <div className="w-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">People Details</h2>
            <form
              onSubmit={handlePersonSubmit}
              className="space-y-4 p-4 border rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={person.firstName}
                    onChange={handlePersonInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={person.lastName}
                    onChange={handlePersonInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={person.address}
                  onChange={handlePersonInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cellular Phone #
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={person.phone}
                  onChange={(e) => handlePhoneNumberChange(e, setPerson)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="end"
                  className="block text-sm font-medium text-gray-700"
                >
                  End
                </label>
                <select
                  name="end"
                  id="end"
                  value={person.end}
                  onChange={handlePersonInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                >
                  <option value="">Select the end</option>
                  <option value="Listing End">Listing End</option>
                  <option value="Selling End">Selling End</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  {editingIndex !== null ? "Update Person" : "Add Person"}
                </button>
                <button
                  type="button"
                  onClick={handlePersonAddNew}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  Add New
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">People List</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-blue-900">
                    <tr>
                      <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        End
                      </th>
                      <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Cell Phone #
                      </th>
                      <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Address
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {people.map((p, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.end}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handlePersonEdit(index)}
                            className="text-blue-900 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side: Agents Form and Table */}
          <div className="w-full flex flex-col mt-8">
            <h2 className="text-xl font-bold mb-4">Agent Details</h2>
            <form
              onSubmit={handleAgentSubmit}
              className="space-y-4 p-4 border rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="agentNo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Agent #
                  </label>
                  <input
                    type="text"
                    name="agentNo"
                    id="agentNo"
                    value={agent.agentNo || ""}
                    onChange={handleAgentInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="agentFullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Agent Full Name
                  </label>
                  <select
                    name="agentFullName"
                    id="agentFullName"
                    onChange={handleAgentSelectChange}
                    value={selectedAgentId} // Use the stored selected agent ID
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  >
                    <option value="">Select an agent</option>
                    {allAgents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.firstName} {a.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="officeNo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Office #
                  </label>
                  <input
                    type="tel"
                    name="officeNo"
                    id="officeNo"
                    value={agent.officeNo}
                    onChange={(e) => handlePhoneNumberChange(e, setAgent)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="sendPage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Send Page
                  </label>
                  <select
                    name="sendPage"
                    id="sendPage"
                    value={agent.sendPage}
                    onChange={handleAgentInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="lead"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Lead
                  </label>
                  <select
                    name="lead"
                    id="lead"
                    value={agent.lead}
                    onChange={handleAgentInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="cooperation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Co-Operation
                  </label>
                  <select
                    name="cooperation"
                    id="cooperation"
                    value={agent.cooperation}
                    onChange={handleAgentInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="expense"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Expense %
                  </label>
                  <input
                    type="text"
                    name="expense"
                    id="expense"
                    value={agent.expense}
                    onChange={handleAgentInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount
                  </label>
                  <input
                    type="text"
                    name="amount"
                    id="amount"
                    value={agent.amount}
                    onChange={handleAgentInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  {editingAgentIndex !== null ? "Update Agent" : "Add Agent"}
                </button>
                <button
                  type="button"
                  onClick={handleAgentAddNew}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Agent List</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-blue-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Agent No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Office No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Co-Op
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Expense
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="relative px-4 py-2">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agents.map((a, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {a.agentNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {a.firstName} {a.lastName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {a.officeNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {a.lead}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {a.cooperation}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {a.expense}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {a.amount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => handleAgentEdit(index)}
                              className="text-blue-900 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleAgentDelete(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button placed here, after all content */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          form="listingForm"
          disabled={isSubmitting}
          className="px-8 py-4 text-lg font-medium text-white bg-blue-900 hover:bg-blue-800 border border-transparent rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
        >
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
            ? "Update Listing"
            : "Save Listing"}
        </button>
      </div>
    </div>
  );
};

export default ListingInfoForm;
