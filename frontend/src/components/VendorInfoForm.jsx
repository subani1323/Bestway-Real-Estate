import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { handlePhoneNumberChange } from "../utils/phoneUtils";
import { canadianProvinces } from "../utils/provinces";
import axiosInstance from "../config/axios";

const VendorInfoForm = ({ onVendorAdded, onClose, editingVendor }) => {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (editingVendor) {
      // If editing, populate form with existing data
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
      // If creating new, fetch next vendor number
      fetchNextVendorNumber();
    }
  }, [editingVendor]);

  const fetchNextVendorNumber = async () => {
    try {
      const response = await axiosInstance.get(
        "/vendors/next-vendor-no"
      );
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
    setError("");
    setSuccess("");

    try {
      let response;
      if (editingVendor) {
        // Update existing vendor
        response = await axiosInstance.put(
          `/vendors/${editingVendor._id}`,
          formData
        );
        toast.success("Vendor updated successfully!");
      } else {
        // Create new vendor
        response = await axiosInstance.post(
          "/vendors",
          formData
        );
        toast.success("Vendor added successfully!");
      }

      // Notify parent component
      if (onVendorAdded) {
        onVendorAdded(response.data);
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(error.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingVendor ? "Edit Vendor Info" : "Add Vendor Info"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-3 gap-4">
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
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorInfoForm;
