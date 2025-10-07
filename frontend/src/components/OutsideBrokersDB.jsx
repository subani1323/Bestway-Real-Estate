import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import { toast } from "react-toastify";

const OutsideBrokersDB = () => {
  const [brokers, setBrokers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBroker, setEditingBroker] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState(null);
  const navigate = useNavigate();

  // Form state for add/edit
  const [formData, setFormData] = useState({
    type: "Listing Broker",
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    payBroker: "No",
    end: "Listing End",
    primaryPhone: "",
    chargedHST: "Yes",
    address: "",
  });

  // Filter brokers based on search query
  const filteredBrokers = brokers.filter((broker) =>
    `${broker.firstName} ${broker.lastName} ${broker.company} ${broker.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/outside-brokers");
      setBrokers(response.data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to fetch brokers");
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
          ? value === "Listing Broker"
            ? "Listing End"
            : "Selling End"
          : prev.end,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBroker) {
        await axiosInstance.put(
          `/outside-brokers/${editingBroker._id}`,
          formData
        );
        toast.success("Broker updated successfully");
      } else {
        await axiosInstance.post("/outside-brokers", formData);
        toast.success("Broker added successfully");
      }
      setShowAddModal(false);
      setEditingBroker(null);
      resetForm();
      fetchBrokers();
    } catch (error) {
      console.error("Error saving broker:", error);
      toast.error("Failed to save broker");
    }
  };

  const handleEdit = (broker) => {
    setEditingBroker(broker);
    setFormData({
      type: broker.type,
      firstName: broker.firstName,
      lastName: broker.lastName,
      company: broker.company || "",
      email: broker.email || "",
      payBroker: broker.payBroker,
      end: broker.end,
      primaryPhone: broker.primaryPhone || "",
      chargedHST: broker.chargedHST,
      address: broker.address || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = (broker) => {
    setBrokerToDelete(broker);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/outside-brokers/${brokerToDelete._id}`);
      toast.success("Broker deleted successfully");
      fetchBrokers();
    } catch (error) {
      console.error("Error deleting broker:", error);
      toast.error("Failed to delete broker");
    } finally {
      setShowDeleteConfirm(false);
      setBrokerToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "Listing Broker",
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      payBroker: "No",
      end: "Listing End",
      primaryPhone: "",
      chargedHST: "Yes",
      address: "",
    });
  };

  const openAddModal = () => {
    setEditingBroker(null);
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingBroker(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading brokers...</div>
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
          <h1 className="text-3xl font-bold text-gray-800">
            Outside Brokers Database
          </h1>
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
              <FaPlus /> Add New Broker
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search brokers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Brokers Table */}
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
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay Broker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrokers.map((broker) => (
                  <tr key={broker._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {broker.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broker.firstName} {broker.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broker.company || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broker.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broker.primaryPhone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broker.payBroker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(broker)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(broker)}
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

        {filteredBrokers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery
              ? "No brokers found matching your search."
              : "No brokers found."}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBroker ? "Edit Broker" : "Add New Broker"}
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
                    <option value="Listing Broker">Listing Broker</option>
                    <option value="Cooperating Broker">
                      Cooperating Broker
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Broker
                  </label>
                  <select
                    name="payBroker"
                    value={formData.payBroker}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
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
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
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
                    Charged HST
                  </label>
                  <select
                    name="chargedHST"
                    value={formData.chargedHST}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
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
                  {editingBroker ? "Update" : "Add"} Broker
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
              Are you sure you want to delete {brokerToDelete?.firstName}{" "}
              {brokerToDelete?.lastName}? This action cannot be undone.
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

export default OutsideBrokersDB;
