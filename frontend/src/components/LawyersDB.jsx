import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import { toast } from "react-toastify";

const LawyersDB = () => {
  const [lawyers, setLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLawyer, setEditingLawyer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lawyerToDelete, setLawyerToDelete] = useState(null);
  const navigate = useNavigate();

  // Form state for add/edit
  const [formData, setFormData] = useState({
    type: "Seller Lawyer",
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    end: "Listing End",
    primaryPhone: "",
    cellPhone: "",
    address: "",
  });

  // Filter lawyers based on search query
  const filteredLawyers = lawyers.filter((lawyer) =>
    `${lawyer.firstName} ${lawyer.lastName} ${lawyer.companyName} ${lawyer.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/lawyers");
      setLawyers(response.data);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      toast.error("Failed to fetch lawyers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      end:
        name === "type"
          ? value === "Seller Lawyer" || value === "Buyer Lawyer"
            ? "Selling End"
            : "Listing End"
          : prev.end,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLawyer) {
        await axiosInstance.put(`/lawyers/${editingLawyer._id}`, formData);
        toast.success("Lawyer updated successfully");
      } else {
        await axiosInstance.post("/lawyers", formData);
        toast.success("Lawyer added successfully");
      }
      setShowAddModal(false);
      setEditingLawyer(null);
      resetForm();
      fetchLawyers();
    } catch (error) {
      console.error("Error saving lawyer:", error);
      toast.error("Failed to save lawyer");
    }
  };

  const handleEdit = (lawyer) => {
    setEditingLawyer(lawyer);
    setFormData({
      type: lawyer.type,
      firstName: lawyer.firstName,
      lastName: lawyer.lastName,
      companyName: lawyer.companyName || "",
      email: lawyer.email || "",
      end: lawyer.end,
      primaryPhone: lawyer.primaryPhone || "",
      cellPhone: lawyer.cellPhone || "",
      address: lawyer.address || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = (lawyer) => {
    setLawyerToDelete(lawyer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/lawyers/${lawyerToDelete._id}`);
      toast.success("Lawyer deleted successfully");
      fetchLawyers();
    } catch (error) {
      console.error("Error deleting lawyer:", error);
      toast.error("Failed to delete lawyer");
    } finally {
      setShowDeleteConfirm(false);
      setLawyerToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "Seller Lawyer",
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      end: "Listing End",
      primaryPhone: "",
      cellPhone: "",
      address: "",
    });
  };

  const openAddModal = () => {
    setEditingLawyer(null);
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingLawyer(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading lawyers...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Lawyers Database</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/database")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FaArrowLeft /> Back to Database
            </button>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Add New Lawyer
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lawyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lawyers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cell Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLawyers.map((lawyer) => (
                  <tr key={lawyer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lawyer.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lawyer.firstName} {lawyer.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lawyer.companyName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lawyer.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lawyer.primaryPhone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lawyer.cellPhone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(lawyer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(lawyer)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLawyers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery
              ? "No lawyers found matching your search."
              : "No lawyers found."}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingLawyer ? "Edit Lawyer" : "Add New Lawyer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Tenant">Tenant</option>
                    <option value="Landlord">Landlord</option>
                    <option value="Seller">Seller</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Seller Lawyer">Seller Lawyer</option>
                    <option value="Buyer Lawyer">Buyer Lawyer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End
                  </label>
                  <select
                    name="end"
                    value={formData.end}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Listing End">Listing End</option>
                    <option value="Selling End">Selling End</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    name="primaryPhone"
                    value={formData.primaryPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cell Phone
                  </label>
                  <input
                    type="tel"
                    name="cellPhone"
                    value={formData.cellPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingLawyer ? "Update" : "Add"} Lawyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete {lawyerToDelete?.firstName}{" "}
              {lawyerToDelete?.lastName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyersDB;
