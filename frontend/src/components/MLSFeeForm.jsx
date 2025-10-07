import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../config/axios";

const MLSFeeForm = ({ setSelectedForm }) => {
  const [formData, setFormData] = useState({
    fee: "",
    selectionOption: "% of Sell Price",
    mlsFeeTaxApplicable: "No",
    postToAP: "No dont post to A/P",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate fee is a valid decimal
      if (isNaN(formData.fee) || formData.fee <= 0) {
        throw new Error("Please enter a valid fee amount");
      }

      const response = await axiosInstance.post(
        "/mls-fees",
        formData
      );

      console.log("MLS Fee created:", response.data);
      toast.success("MLS Fee created successfully!");
      setFormData({
        fee: "",
        selectionOption: "% of Sell Price",
        mlsFeeTaxApplicable: "No",
        postToAP: "No dont post to A/P",
      });

      // Return to main menu after 1 second
      setTimeout(() => {
        setSelectedForm(null);
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Failed to create MLS fee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">MLS Fee Setup</h2>
          <button
            onClick={() => setSelectedForm(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
          {/* Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            />
          </div>

          {/* Selection Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selection Option
              <span className="text-red-500">*</span>
            </label>
            <select
              name="selectionOption"
              value={formData.selectionOption}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="% of Sell Price">% of Sell Price</option>
              <option value="Flat Amount">Flat Amount</option>
            </select>
          </div>

          {/* MLS Fee Tax Applicable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MLS Fee Tax Applicable
              <span className="text-red-500">*</span>
            </label>
            <select
              name="mlsFeeTaxApplicable"
              value={formData.mlsFeeTaxApplicable}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Post to A/P */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post to A/P
              <span className="text-red-500">*</span>
            </label>
            <select
              name="postToAP"
              value={formData.postToAP}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="Yes Post to A/P">Yes, Post to A/P</option>
              <option value="No dont post to A/P">No, dont post to A/P</option>
            </select>
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
              {isLoading ? "Creating..." : "Create MLS Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MLSFeeForm;
