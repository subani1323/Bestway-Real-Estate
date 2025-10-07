import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import VendorInfoForm from "./VendorInfoForm";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { canadianProvinces } from "../utils/provinces";
import axiosInstance from "../config/axios";

const GOLD = "#b6862c";

const VendorInfoDB = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/vendors");
      setVendors(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/vendors/${id}`);
      setVendors(vendors.filter((vendor) => vendor._id !== id));
      setSelectedVendor(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("Failed to delete vendor");
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
    setSelectedVendor(null);
  };

  const handleVendorAdded = (newVendor) => {
    if (editingVendor) {
      setVendors(
        vendors.map((v) => (v._id === editingVendor._id ? newVendor : v))
      );
      setEditingVendor(null);
    } else {
      setVendors([...vendors, newVendor]);
    }
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorNumber.toString().includes(searchTerm) ||
      vendor.phoneNumber.includes(searchTerm) ||
      (vendor.companyName &&
        vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.city &&
        vendor.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.streetName &&
        vendor.streetName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading vendors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/database")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Database
          </button>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Vendor Information Database
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Vendors</h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name, number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Vendor
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Vendors Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead
                style={{ backgroundColor: "#1e3a8a" }}
                className="text-white"
              >
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    Vendor #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    Phone Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchTerm
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                        {vendor.vendorNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {vendor.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {vendor.firstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {vendor.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-b">
                        <div className="max-w-xs truncate" title={vendor.city}>
                          {vendor.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
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

      {/* Vendor Details Popup */}
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
            <div className="mb-2">
              <strong>Vendor Number:</strong> {selectedVendor.vendorNumber}
            </div>
            <div className="mb-2">
              <strong>Company Name:</strong> {selectedVendor.companyName}
            </div>
            <div className="mb-2">
              <strong>First Name:</strong> {selectedVendor.firstName}
            </div>
            <div className="mb-2">
              <strong>Last Name:</strong> {selectedVendor.lastName}
            </div>
            <div className="mb-2">
              <strong>Street #:</strong> {selectedVendor.streetNumber}
            </div>
            <div className="mb-2">
              <strong>Street Name:</strong> {selectedVendor.streetName}
            </div>
            <div className="mb-2">
              <strong>Unit:</strong> {selectedVendor.unit || "N/A"}
            </div>
            <div className="mb-2">
              <strong>City:</strong> {selectedVendor.city}
            </div>
            <div className="mb-2">
              <strong>Province:</strong>{" "}
              {canadianProvinces.find(
                (p) => p.value === selectedVendor.province
              )?.label || selectedVendor.province}
            </div>
            <div className="mb-2">
              <strong>Postal Code:</strong> {selectedVendor.postalCode}
            </div>
            <div className="mb-4">
              <strong>Phone Number:</strong> {selectedVendor.phoneNumber}
            </div>
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                onClick={() => handleEdit(selectedVendor)}
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

export default VendorInfoDB;
