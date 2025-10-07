import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { handlePhoneNumberChange } from "../utils/phoneUtils";
import axiosInstance from "../config/axios";
import { toast } from "react-toastify";

const PeopleForm = ({
  people,
  person,
  setPerson,
  selectedPersonType,
  setSelectedPersonType,
  editingPersonIndex,
  setEditingPersonIndex,
  showDeletePersonConfirm,
  handlePersonInputChange,
  handlePersonTypeSelect,
  handlePersonSubmit,
  handlePersonEdit,
  confirmDeletePerson,
  cancelDeletePerson,
  goToNextSection,
  goToPreviousSection,
  listingNumber,
  dealType,
}) => {
  // Add state for listing people
  const [listingPeople, setListingPeople] = useState([]);
  const [isLoadingListingPeople, setIsLoadingListingPeople] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);

  // State for company dropdown
  const [companies, setCompanies] = useState([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Function to fetch people for the selected listing
  const fetchPeopleForListing = async (listingNum) => {
    if (!listingNum) {
      setListingPeople([]);
      return;
    }

    setIsLoadingListingPeople(true);
    try {
      const response = await axiosInstance.get(
        `/listings/${listingNum}/people`
      );
      setListingPeople(response.data);
    } catch (error) {
      console.error("Error fetching people for listing:", error);
      setListingPeople([]);
    } finally {
      setIsLoadingListingPeople(false);
    }
  };

  // Effect to fetch listing people when listingNumber changes
  useEffect(() => {
    if (listingNumber) {
      fetchPeopleForListing(listingNumber);
    } else {
      setListingPeople([]);
    }
  }, [listingNumber]);

  // Fetch companies from lawyers database
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await axiosInstance.get("/lawyers");
      // Extract unique companies from the response
      const uniqueCompanies = response.data.reduce((acc, lawyer) => {
        if (
          lawyer.companyName &&
          !acc.find((c) => c.name === lawyer.companyName)
        ) {
          acc.push({
            name: lawyer.companyName,
            address: lawyer.address || "",
            email: lawyer.email || "",
            phone: lawyer.primaryPhone || "",
          });
        }
        return acc;
      }, []);
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleCompanySelect = (company) => {
    setPerson((prev) => ({
      ...prev,
      companyName: company.name,
      address: company.address || "",
      email: company.email || "",
      primaryPhone: company.phone || "",
    }));
    setCompanySearchTerm(company.name);
    setShowCompanyDropdown(false);
  };

  const handleCompanyInputChange = (e) => {
    const value = e.target.value;
    setCompanySearchTerm(value);
    setPerson((prev) => ({ ...prev, companyName: value }));
    setShowCompanyDropdown(value.length > 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCompanyDropdown &&
        !event.target.closest(".company-dropdown-container")
      ) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCompanyDropdown]);

  // Effect to auto-populate form when listing people are loaded and appropriate person type is selected
  useEffect(() => {
    if (listingPeople.length > 0) {
      const firstPerson = listingPeople[0];
      console.log("Auto-populate person:", firstPerson);
      if (
        (dealType === "Purchase" && selectedPersonType === "Seller") ||
        (dealType === "Lease" && selectedPersonType === "Landlord")
      ) {
        setPerson({
          type: firstPerson.type || selectedPersonType,
          firstName: firstPerson.firstName || "",
          lastName: firstPerson.lastName || "",
          email: firstPerson.email || "",
          primaryPhone: firstPerson.primaryPhone || firstPerson.phone || "",
          cellPhone: firstPerson.cellPhone || firstPerson.phone || "",
          address: firstPerson.address || "",
          end: firstPerson.end || "Listing End",
          companyName: firstPerson.companyName || "",
        });
        setIsAutoPopulated(true);
      }
    }
  }, [listingPeople, selectedPersonType, dealType]);

  // Add companyName to person state if not present
  useEffect(() => {
    setPerson((prev) => ({
      companyName: "",
      ...prev,
    }));
    // eslint-disable-next-line
  }, []);

  // Modified handlePersonTypeSelect to fetch listing people when appropriate person type is selected
  const handlePersonTypeSelectWithListing = (type) => {
    setSelectedPersonType(type);
    setPerson((prev) => ({
      ...prev,
      type: type,
    }));

    // If Seller is selected for Purchase deal or Landlord is selected for Lease deal, fetch listing people
    if (
      (dealType === "Purchase" && type === "Seller") ||
      (dealType === "Lease" && type === "Landlord")
    ) {
      if (listingNumber) {
        fetchPeopleForListing(listingNumber);
      }
    } else {
      // Clear form if not appropriate person type
      setPerson((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        address: "",
        cellPhone: "",
      }));
      setIsAutoPopulated(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    console.log("PeopleForm handleFormSubmit called");
    console.log("Current person state:", person);
    console.log("Selected person type:", selectedPersonType);

    // Check if this is a lawyer type that should be saved to database
    const isLawyer =
      selectedPersonType === "Seller Lawyer" ||
      selectedPersonType === "Buyer Lawyer";

    if (isLawyer) {
      try {
        const formData = {
          type: selectedPersonType,
          firstName: person.firstName || "",
          lastName: person.lastName || "",
          companyName: person.companyName || "",
          email: person.email || "",
          end:
            person.end ||
            (selectedPersonType === "Seller Lawyer" ||
            selectedPersonType === "Buyer Lawyer"
              ? "Selling End"
              : "Listing End"),
          primaryPhone: person.primaryPhone || "",
          cellPhone: person.cellPhone || "",
          address: person.address || "",
        };

        // Save to lawyers database
        const response = await axiosInstance.post("/lawyers", formData);
        const newLawyer = response.data;

        // Update local state
        if (handlePersonSubmit) {
          // Create a synthetic event to pass to parent
          const syntheticEvent = {
            ...e,
            preventDefault: () => {},
            target: { ...e.target },
          };
          handlePersonSubmit(syntheticEvent);
        }

        toast.success("Lawyer saved successfully");
      } catch (error) {
        console.error("Error saving lawyer:", error);
        toast.error("Failed to save lawyer");
      }
    } else {
      // Call the parent's handlePersonSubmit function for non-lawyer types
      if (handlePersonSubmit) {
        handlePersonSubmit(e);
      }
    }
  };

  const handleAddNew = () => {
    // Reset the person state to prepare for adding a new person
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
    setEditingPersonIndex(null);
    setSelectedPersonType("");
    setIsAutoPopulated(false);
    setCompanySearchTerm("");
  };

  // Determine which people to show in the table
  // Always show the people from the parent component (people prop)
  const peopleToShow = people;

  // Debug people prop changes
  useEffect(() => {
    console.log("PeopleForm received new people prop:", people);
    console.log("peopleToShow:", peopleToShow);
    console.log("Number of people:", people.length);
  }, [people, peopleToShow]);

  // Add this effect to update selectedPersonType when editing a person
  useEffect(() => {
    if (editingPersonIndex !== null && people[editingPersonIndex]) {
      setSelectedPersonType(people[editingPersonIndex].type || "");
      setCompanySearchTerm(people[editingPersonIndex].companyName || "");
    }
    // eslint-disable-next-line
  }, [editingPersonIndex]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">People Information</h2>

      {/* Show listing information if available */}
      {listingNumber && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected Listing:</strong> {listingNumber}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-medium text-gray-700 text-lg mb-2">
          Select Person Type
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            "Tenant",
            "Landlord",
            "Seller",
            "Buyer",
            "Seller Lawyer",
            "Buyer Lawyer",
          ].map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="radio"
                id={`type-${type}`}
                name="personType"
                checked={selectedPersonType === type}
                onChange={() => handlePersonTypeSelect(type)}
                className="mr-2"
              />
              <label
                htmlFor={`type-${type}`}
                className="text-sm font-medium text-gray-700"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Show loading indicator when fetching listing people */}
      {isLoadingListingPeople && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Loading people from listing {listingNumber}...
          </p>
        </div>
      )}

      {/* Show message when appropriate person type is selected and listing people are available */}
      {((dealType === "Purchase" && selectedPersonType === "Seller") ||
        (dealType === "Lease" && selectedPersonType === "Landlord")) &&
        listingPeople.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Showing {listingPeople.length} people from listing {listingNumber}
            </p>
          </div>
        )}

      {/* Show auto-population message */}
      {isAutoPopulated &&
        ((dealType === "Purchase" && selectedPersonType === "Seller") ||
          (dealType === "Lease" && selectedPersonType === "Landlord")) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              ✓ Form auto-populated with first person's details from listing{" "}
              {listingNumber}
            </p>
          </div>
        )}

      {selectedPersonType && (
        <form
          onSubmit={handleFormSubmit}
          className="space-y-4 p-4 border rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={person.type || selectedPersonType}
                onChange={handlePersonInputChange}
                placeholder="Enter person type or select from radio buttons above"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can type a custom type or select from the radio buttons
                above
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End
              </label>
              <select
                name="end"
                value={person.end || "Listing End"}
                onChange={handlePersonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              >
                <option value="Listing End">Listing End</option>
                <option value="Selling End">Selling End</option>
              </select>
            </div>
          </div>
          {/* Company Name field for Tenant, Landlord, Seller, Buyer, Seller Lawyer, Buyer Lawyer */}
          {(selectedPersonType === "Tenant" ||
            selectedPersonType === "Landlord" ||
            selectedPersonType === "Seller" ||
            selectedPersonType === "Buyer" ||
            selectedPersonType === "Seller Lawyer" ||
            selectedPersonType === "Buyer Lawyer") && (
            <div className="relative company-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="companyName"
                  value={companySearchTerm || person.companyName || ""}
                  onChange={handleCompanyInputChange}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm pr-8"
                  placeholder="Type to search or enter company name"
                />
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Company Dropdown - only show for lawyers */}
              {showCompanyDropdown &&
                (selectedPersonType === "Seller Lawyer" ||
                  selectedPersonType === "Buyer Lawyer") && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {isLoadingCompanies ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Loading companies...
                      </div>
                    ) : companies.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No companies found
                      </div>
                    ) : (
                      companies
                        .filter((company) =>
                          company.name
                            .toLowerCase()
                            .includes(companySearchTerm.toLowerCase())
                        )
                        .map((company, index) => (
                          <div
                            key={index}
                            onClick={() => handleCompanySelect(company)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {company.name}
                            </div>
                            {company.address && (
                              <div className="text-xs text-gray-500">
                                {company.address}
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={person.firstName || ""}
                onChange={handlePersonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={person.lastName || ""}
                onChange={handlePersonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={person.email || ""}
              onChange={handlePersonInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Phone Number
              </label>
              <input
                type="tel"
                name="primaryPhone"
                value={person.primaryPhone || ""}
                onChange={(e) => handlePhoneNumberChange(e, setPerson)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cell Phone Number
              </label>
              <input
                type="tel"
                name="cellPhone"
                value={person.cellPhone || ""}
                onChange={(e) => handlePhoneNumberChange(e, setPerson)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={person.address || ""}
              onChange={handlePersonInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Add New
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              {editingPersonIndex !== null ? "Update Person" : "Add Person"}
            </button>
          </div>
        </form>
      )}
      {/* People Table */}
      {console.log("Rendering table with peopleToShow:", peopleToShow)}
      {console.log("peopleToShow.length:", peopleToShow.length)}
      {peopleToShow.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 text-lg mb-2">
            {((dealType === "Purchase" && selectedPersonType === "Seller") ||
              (dealType === "Lease" && selectedPersonType === "Landlord")) &&
            listingPeople.length > 0
              ? `People from Listing ${listingNumber}`
              : "People List"}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border-b border-r text-left">
                    Type
                  </th>
                  <th className="px-4 py-2 border-b border-r text-left">End</th>
                  <th className="px-4 py-2 border-b border-r text-left">
                    Name
                  </th>
                  <th className="px-4 py-2 border-b border-r text-left">
                    Primary Phone
                  </th>
                  <th className="px-4 py-2 border-b border-r text-left">
                    Company Name
                  </th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {peopleToShow.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border-b border-r">
                      {p.type || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {p.end || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {`${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {p.primaryPhone || p.cellPhone || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b border-r">
                      {p.companyName || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        type="button"
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => handlePersonEdit(idx)}
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
      )}
      {/* Delete Person Confirmation Modal */}
      {showDeletePersonConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="mb-4">Are you sure you want to delete this person?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeletePerson}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePerson}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={goToPreviousSection}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          onClick={goToNextSection}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PeopleForm;
