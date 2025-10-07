import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Navbar from "./Navbar";
import axiosInstance from "../config/axios";

const MLSFeeList = () => {
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

  const componentRef = useRef();

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

  // Handle print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
    if (window.confirm("Are you sure you want to delete this MLS fee?")) {
      try {
        await axiosInstance.delete(`/mls-fees/${id}`);
        fetchMLSFees(); // Refresh the list
      } catch (err) {
        setError("Failed to delete MLS fee");
      }
    }
  };

  // Handle save edit
  const handleSaveEdit = async (id) => {
    try {
      await axiosInstance.put(`/mls-fees/${id}`, editFormData);
      setEditingId(null);
      fetchMLSFees(); // Refresh the list
    } catch (err) {
      setError("Failed to update MLS fee");
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Navbar />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">MLS Fee List</h2>
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Print
        </button>
      </div>

      <div ref={componentRef} className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Fee</th>
              <th className="px-6 py-3 border-b text-left">Selection Option</th>
              <th className="px-6 py-3 border-b text-left">Tax Applicable</th>
              <th className="px-6 py-3 border-b text-left">Post to A/P</th>
              <th className="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mlsFees.map((mlsFee) => (
              <tr key={mlsFee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
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
                </td>
                <td className="px-6 py-4 border-b">
                  {editingId === mlsFee._id ? (
                    <select
                      name="selectionOption"
                      value={editFormData.selectionOption}
                      onChange={handleEditFormChange}
                      className="border rounded px-2 py-1"
                    >
                      <option value="% of Sell Price">% of Sell Price</option>
                      <option value="Flat Amount">Flat Amount</option>
                    </select>
                  ) : (
                    mlsFee.selectionOption
                  )}
                </td>
                <td className="px-6 py-4 border-b">
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
                </td>
                <td className="px-6 py-4 border-b">
                  {editingId === mlsFee._id ? (
                    <select
                      name="postToAP"
                      value={editFormData.postToAP}
                      onChange={handleEditFormChange}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Yes Post to A/P">Yes, Post to A/P</option>
                      <option value="No dont post to A/P">
                        No, dont post to A/P
                      </option>
                    </select>
                  ) : (
                    mlsFee.postToAP
                  )}
                </td>
                <td className="px-6 py-4 border-b">
                  {editingId === mlsFee._id ? (
                    <button
                      onClick={() => handleSaveEdit(mlsFee._id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(mlsFee)}
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded mr-2"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MLSFeeList;
