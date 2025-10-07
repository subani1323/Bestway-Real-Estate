import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import axiosInstance from "../config/axios";

const EditMisc = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    lastListing: "",
    lastTrade: "",
    compassDirection: "",
    cdaAddress: "",
    multipleOffices: "No",
    mainOfficeNumber: "",
    hstNumber: "",
    payrollNumber: "",
    expStmtAddress: "",
    openingBalanceFormat: "",
  });

  useEffect(() => {
    const fetchMiscSettings = async () => {
      try {
        const response = await axiosInstance.get(
          `/misc-settings/${id}`
        );

        // Fetch the highest trade number from the database
        const tradesResponse = await axiosInstance.get(
          "/trades"
        );
        let highestTradeNumber = 0;
        if (tradesResponse.data && tradesResponse.data.length > 0) {
          highestTradeNumber = Math.max(
            ...tradesResponse.data.map((trade) => trade.tradeNumber || 0)
          );
        }

        // Use the higher of the stored lastTrade or the current highest trade number
        const currentLastTrade = response.data.lastTrade || 0;
        const updatedLastTrade = Math.max(currentLastTrade, highestTradeNumber);

        setFormData({
          ...response.data,
          lastTrade: updatedLastTrade.toString(),
        });
      } catch (err) {
        toast.error("Failed to fetch miscellaneous settings");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMiscSettings();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put(
        `/misc-settings/${id}`,
        formData
      );
      toast.success("Miscellaneous settings updated successfully!");
      navigate("/miscellaneous-db");
    } catch (err) {
      toast.error("Failed to update miscellaneous settings");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Miscellaneous Settings
            </h2>
            <button
              onClick={() => navigate("/miscellaneous-db")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last Listing
                </label>
                <input
                  type="number"
                  name="lastListing"
                  value={formData.lastListing}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last Trade
                </label>
                <input
                  type="number"
                  name="lastTrade"
                  value={formData.lastTrade}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Should reflect the current highest trade number from the
                  database
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Compass Direction
                </label>
                <select
                  name="compassDirection"
                  value={formData.compassDirection}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                  <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                  <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  CDA Address
                </label>
                <select
                  name="cdaAddress"
                  value={formData.cdaAddress}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                  <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                  <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Multiple Offices
                </label>
                <select
                  name="multipleOffices"
                  value={formData.multipleOffices}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Main Office Number
                </label>
                <input
                  type="number"
                  name="mainOfficeNumber"
                  value={formData.mainOfficeNumber}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  HST Number
                </label>
                <input
                  type="number"
                  name="hstNumber"
                  value={formData.hstNumber}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Payroll Number
                </label>
                <input
                  type="number"
                  name="payrollNumber"
                  value={formData.payrollNumber}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Expense Statement Address
                </label>
                <select
                  name="expStmtAddress"
                  value={formData.expStmtAddress}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                  <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                  <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Opening Balance Format
                </label>
                <select
                  name="openingBalanceFormat"
                  value={formData.openingBalanceFormat}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                  <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                  <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditMisc;
