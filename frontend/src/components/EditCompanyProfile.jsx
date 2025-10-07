import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import axiosInstance from "../config/axios";

const EditCompanyProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    fax: "",
    email: "",
    trustStatusCompany: false,
    trebNumber: "",
    recoNumber: "",
    logoUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  const provinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ];

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const response = await axiosInstance.get(
        "/company-profile"
      );
      if (response.data) {
        setFormData(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch company profile");
      setIsLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            logoUrl: e.target.result,
          }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axiosInstance.put(
        `/company-profile/${formData._id}`,
        formData
      );
      toast.success("Company profile updated successfully!");
      setTimeout(() => {
        navigate("/database/company-info-db");
      }, 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update company profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-4">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Edit Company Profile
          </h2>
          <button
            onClick={() => navigate("/database/company-info-db")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input Fields */}
          {[
            { label: "Company Name", name: "companyName" },
            { label: "Address", name: "address" },
            { label: "City", name: "city" },
            { label: "Postal Code", name: "postalCode" },
            { label: "Phone", name: "phone", type: "tel" },
            { label: "Fax", name: "fax", type: "tel" },
            { label: "Email", name: "email", type: "email" },
            { label: "TREB #", name: "trebNumber" },
            { label: "RECO #", name: "recoNumber" },
          ].map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                <span className="text-red-500">*</span>
              </label>
              <input
                type={field.type || "text"}
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
          ))}

          {/* Province Dropdown */}
          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Province
              <span className="text-red-500">*</span>
            </label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* Logo Upload */}
          <div>
            <label
              htmlFor="logo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Logo
            </label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <img
                  src={formData.logoUrl}
                  alt="Company Logo Preview"
                  className="h-20 object-contain"
                />
              </div>
            )}
          </div>

          {/* Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trustStatusCompany"
              name="trustStatusCompany"
              checked={formData.trustStatusCompany}
              onChange={handleChange}
              className="h-4 w-4 text-blue-900 focus:ring-blue-700 border-gray-300 rounded"
            />
            <label
              htmlFor="trustStatusCompany"
              className="ml-2 block text-sm text-gray-700"
            >
              Trust Status Company
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
              }`}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditCompanyProfile;
