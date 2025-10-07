import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaSearch, FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import VendorInfoForm from "./VendorInfoForm";
import { canadianProvinces } from "../utils/provinces";
import { toast } from "react-toastify";
import { handlePhoneNumberChange } from "../utils/phoneUtils";
import axiosInstance from "../config/axios";

const VendorInfoNew = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/vendors");
      const sortedVendors = response.data.sort(
        (a, b) => a.vendorNumber - b.vendorNumber
      );
      setVendors(sortedVendors);
      setFilteredVendors(sortedVendors);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setIsLoading(false);
      toast.error("Failed to fetch vendors");
    }
  };

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setFilteredVendors(
        [...vendors].sort((a, b) => a.vendorNumber - b.vendorNumber)
      );
      return;
    }

    const filtered = vendors.filter(
      (vendor) =>
        vendor.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
        vendor.lastName.toLowerCase().includes(searchInput.toLowerCase()) ||
        vendor.vendorNumber.toString().includes(searchInput) ||
        vendor.phoneNumber.includes(searchInput) ||
        (vendor.companyName &&
          vendor.companyName
            .toLowerCase()
            .includes(searchInput.toLowerCase())) ||
        (vendor.city &&
          vendor.city.toLowerCase().includes(searchInput.toLowerCase())) ||
        (vendor.streetName &&
          vendor.streetName.toLowerCase().includes(searchInput.toLowerCase()))
    );

    setFilteredVendors(filtered);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
    setSelectedVendor(null);
  };

  const handleVendorAdded = (newVendor) => {
    if (editingVendor) {
      setVendors(
        vendors.map((v) => (v._id === editingVendor._id ? newVendor : v))
      );
      setFilteredVendors(
        filteredVendors.map((v) =>
          v._id === editingVendor._id ? newVendor : v
        )
      );
      setEditingVendor(null);
    } else {
      const updatedVendors = [...vendors, newVendor].sort(
        (a, b) => a.vendorNumber - b.vendorNumber
      );
      setVendors(updatedVendors);
      setFilteredVendors(updatedVendors);
    }
    setShowForm(false);
    toast.success(
      editingVendor
        ? "Vendor updated successfully!"
        : "Vendor added successfully!"
    );
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/vendors/${id}`);
      const updatedVendors = vendors.filter((vendor) => vendor._id !== id);
      setVendors(updatedVendors);
      setFilteredVendors(updatedVendors);
      setSelectedVendor(null);
      setShowDeleteConfirm(false);
      toast.success("Vendor deleted successfully!");
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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
                activeTab === "info"
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("info")}
            >
              Info Form
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
                      placeholder="Search by vendor name, number, or phone..."
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
                    setFilteredVendors(
                      [...vendors].sort(
                        (a, b) => a.vendorNumber - b.vendorNumber
                      )
                    );
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Vendors Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    style={{ backgroundColor: "#1e3a8a" }}
                    className="text-white"
                  >
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Vendor #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Phone Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Loading vendors...
                        </td>
                      </tr>
                    ) : filteredVendors.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          {searchInput
                            ? "No vendors found matching your search."
                            : "No vendors found."}
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((vendor) => (
                        <tr
                          key={vendor._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {vendor.vendorNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vendor.companyName || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vendor.firstName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vendor.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vendor.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vendor.phoneNumber}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="p-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Add New Vendor
              </h2>
              <div className="w-full">
                <VendorInfoInlineForm
                  onVendorAdded={handleVendorAdded}
                  editingVendor={null}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedVendor(null)}
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Vendor Details
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Vendor Number:</strong> {selectedVendor.vendorNumber}
              </div>
              <div>
                <strong>Company Name:</strong>{" "}
                {selectedVendor.companyName || "N/A"}
              </div>
              <div>
                <strong>First Name:</strong> {selectedVendor.firstName}
              </div>
              <div>
                <strong>Last Name:</strong> {selectedVendor.lastName}
              </div>
              <div>
                <strong>Street #:</strong> {selectedVendor.streetNumber}
              </div>
              <div>
                <strong>Street Name:</strong> {selectedVendor.streetName}
              </div>
              <div>
                <strong>Unit:</strong> {selectedVendor.unit || "N/A"}
              </div>
              <div>
                <strong>City:</strong> {selectedVendor.city}
              </div>
              <div>
                <strong>Province:</strong>{" "}
                {canadianProvinces.find(
                  (p) => p.value === selectedVendor.province
                )?.label || selectedVendor.province}
              </div>
              <div>
                <strong>Postal Code:</strong> {selectedVendor.postalCode}
              </div>
              <div>
                <strong>Phone Number:</strong> {selectedVendor.phoneNumber}
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                onClick={() => handleEditVendor(selectedVendor)}
              >
                <FaEdit className="inline mr-2" /> Edit
              </button>
              <button
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-semibold"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
            </div>
            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                <div className="mb-2 text-red-700 font-semibold">
                  Are you sure you want to delete this vendor?
                </div>
                <div className="flex space-x-2">
                  <button
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-semibold"
                    onClick={() => handleDelete(selectedVendor._id)}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendor Form Modal */}
      {showForm && (
        <VendorInfoForm
          onVendorAdded={handleVendorAdded}
          onClose={handleCloseForm}
          editingVendor={editingVendor}
        />
      )}
    </div>
  );
};

// Inline form component for the Info Form tab
const VendorInfoInlineForm = ({ onVendorAdded, editingVendor }) => {
  const [formData, setFormData] = useState({
    vendorNumber: "",
    firstName: "",
    lastName: "",
    streetNumber: "",
    streetName: "",
    unit: "",
    postalCode: "",
    city: "",
    province: "",
    phoneNumber: "",
    companyName: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingVendor) {
      setFormData({
        vendorNumber: editingVendor.vendorNumber,
        firstName: editingVendor.firstName,
        lastName: editingVendor.lastName,
        streetNumber: editingVendor.streetNumber || "",
        streetName: editingVendor.streetName || "",
        unit: editingVendor.unit || "",
        postalCode: editingVendor.postalCode || "",
        city: editingVendor.city || "",
        province: editingVendor.province || "",
        phoneNumber: editingVendor.phoneNumber,
        companyName: editingVendor.companyName || "",
      });
    } else {
      fetchNextVendorNumber();
    }
  }, [editingVendor]);

  const fetchNextVendorNumber = async () => {
    try {
      const response = await axiosInstance.get("/vendors/next-vendor-no");
      setFormData((prev) => ({
        ...prev,
        vendorNumber: response.data.nextVendorNo,
      }));
    } catch (error) {
      console.error("Error fetching next vendor number:", error);
      toast.error("Failed to fetch vendor number");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (editingVendor) {
        response = await axiosInstance.put(
          `/vendors/${editingVendor._id}`,
          formData
        );
        toast.success("Vendor updated successfully!");
      } else {
        response = await axiosInstance.post("/vendors", formData);
        toast.success("Vendor added successfully!");
      }

      if (onVendorAdded) {
        onVendorAdded(response.data);
      }

      // Reset form if not editing
      if (!editingVendor) {
        setFormData({
          vendorNumber: "",
          firstName: "",
          lastName: "",
          streetNumber: "",
          streetName: "",
          unit: "",
          postalCode: "",
          city: "",
          province: "",
          phoneNumber: "",
          companyName: "",
        });
        await fetchNextVendorNumber();
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(error.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor Number
          </label>
          <input
            type="number"
            name="vendorNumber"
            value={formData.vendorNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!editingVendor}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street # *
          </label>
          <input
            type="text"
            name="streetNumber"
            value={formData.streetNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Name *
          </label>
          <input
            type="text"
            name="streetName"
            value={formData.streetName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province *
          </label>
          <select
            name="province"
            value={formData.province}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a province</option>
            {canadianProvinces.map((province) => (
              <option key={province.value} value={province.value}>
                {province.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e, setFormData)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div></div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <FaSave className="mr-2" />
              {editingVendor ? "Update Vendor" : "Save Vendor"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default VendorInfoNew;
