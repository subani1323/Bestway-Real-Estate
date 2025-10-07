import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import companyLogo from "../Assets/logo.jpeg";
import axiosInstance from "../config/axios";

const MLSFeeDB = () => {
  const [mlsFees, setMlsFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fee: "",
    selectionOption: "",
    mlsFeeTaxApplicable: "",
    postToAP: "",
  });

  // Fetch MLS fees
  const fetchMLSFees = async () => {
    try {
      const response = await axiosInstance.get("/mls-fees");
      setMlsFees(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch MLS fees");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMLSFees();
  }, []);

  // Format field name for display
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Handle print
  const handlePrint = async (id) => {
    try {
      const response = await axiosInstance.get(
        `/mls-fees/${id}`
      );
      const data = response.data;
      const { _id, __v, createdAt, updatedAt, ...printData } = data;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const capitalizedData = Object.entries(printData)
        .map(([key, value]) => {
          const label = formatFieldName(key);
          return `<p><strong>${label}:</strong> ${value}</p>`;
        })
        .join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>MLS Fee Print</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; }
              img { width: 120px; height: auto; }
              .logo { position: absolute; top: 30px; left: 30px; }
              .title { margin-top: 100px; }
              p { margin: 8px 0; }
            </style>
          </head>
          <body>
            <img class="logo" src="${companyLogo}" alt="Company Logo" />
            <h2 class="title">MLS Fee Entry</h2>
            <div>${capitalizedData}</div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      alert("Failed to print: " + err.message);
    }
  };

  // Handle edit
  const handleEdit = (mlsFee) => {
    setEditingId(mlsFee._id);
    setEditFormData({
      fee: mlsFee.fee,
      selectionOption: mlsFee.selectionOption,
      mlsFeeTaxApplicable: mlsFee.mlsFeeTaxApplicable,
      postToAP: mlsFee.postToAP,
    });
  };

  // Handle delete
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this MLS fee?"
    );
    if (!confirm) return;

    try {
      await axiosInstance.delete(`/mls-fees/${id}`);
      setMlsFees(mlsFees.filter((fee) => fee._id !== id));
    } catch (err) {
      alert("Error deleting entry: " + err.message);
    }
  };

  // Handle save edit
  const handleSaveEdit = async (id) => {
    try {
      await axiosInstance.put(`/mls-fees/${id}`, editFormData);
      setEditingId(null);
      fetchMLSFees(); // Refresh the list
    } catch (err) {
      alert("Failed to update MLS fee: " + err.message);
    }
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="text-red-600 p-4">Failed to load MLS fees: {error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">MLS Fee Database</h2>
        </div>

        <div className="space-y-6">
          {mlsFees.map((mlsFee) => (
            <div
              key={mlsFee._id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">Fee:</span>
                      <span>
                        {editingId === mlsFee._id ? (
                          <input
                            type="number"
                            name="fee"
                            value={editFormData.fee}
                            onChange={handleEditFormChange}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          mlsFee.fee
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">
                        Selection Option:
                      </span>
                      <span>
                        {editingId === mlsFee._id ? (
                          <select
                            name="selectionOption"
                            value={editFormData.selectionOption}
                            onChange={handleEditFormChange}
                            className="border rounded px-2 py-1"
                          >
                            <option value="% of Sell Price">
                              % of Sell Price
                            </option>
                            <option value="Flat Amount">Flat Amount</option>
                          </select>
                        ) : (
                          mlsFee.selectionOption
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">
                        Tax Applicable:
                      </span>
                      <span>
                        {editingId === mlsFee._id ? (
                          <select
                            name="mlsFeeTaxApplicable"
                            value={editFormData.mlsFeeTaxApplicable}
                            onChange={handleEditFormChange}
                            className="border rounded px-2 py-1"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        ) : (
                          mlsFee.mlsFeeTaxApplicable
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-gray-700">
                        Post to A/P:
                      </span>
                      <span>
                        {editingId === mlsFee._id ? (
                          <select
                            name="postToAP"
                            value={editFormData.postToAP}
                            onChange={handleEditFormChange}
                            className="border rounded px-2 py-1"
                          >
                            <option value="Yes Post to A/P">
                              Yes, Post to A/P
                            </option>
                            <option value="No dont post to A/P">
                              No, dont post to A/P
                            </option>
                          </select>
                        ) : (
                          mlsFee.postToAP
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  {editingId === mlsFee._id ? (
                    <button
                      onClick={() => handleSaveEdit(mlsFee._id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePrint(mlsFee._id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handleEdit(mlsFee)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mlsFee._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MLSFeeDB;
