import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const CompanyProfileForm = ({ setShowProfileForm }) => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    setError("");
    setSuccess(false);

    try {
      await axiosInstance.post("/company-profile", formData);

      toast.success("Company profile submitted successfully!");
      setFormData({
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Company Profile</h2>
        <button
          onClick={() => setShowProfileForm(false)}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
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
            className="h-4 w-4 text-blue-900 focus:ring-blue-900 border-gray-300 rounded"
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
                : "bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileForm;
