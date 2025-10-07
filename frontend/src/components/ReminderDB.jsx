import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";

const ReminderDB = () => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState({
    _id: null,
    date: "",
    reminder: "",
  });
  const navigate = useNavigate();

  const fetchAllReminders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/reminders");
      setReminders(res.data);
    } catch (error) {
      setError("Failed to fetch reminders. Please try again later.");
      console.error("Error fetching all reminders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReminders();
  }, []);

  const handleEdit = (reminderToEdit) => {
    setCurrentReminder({ ...reminderToEdit });
    setIsEditModalOpen(true);
  };

  const handleUpdateReminder = async (e) => {
    e.preventDefault();
    if (!currentReminder.date || !currentReminder.reminder.trim()) {
      alert("Date and reminder text cannot be empty.");
      return;
    }
    // Basic dd/MM/yyyy validation (can be enhanced with date-fns if needed)
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(currentReminder.date)) {
      alert("Invalid date format. Please use DD/MM/YYYY.");
      return;
    }

    try {
      setIsLoading(true); // Optional: show loading state
      await axiosInstance.put(
        `/reminders/${currentReminder._id}`,
        {
          date: currentReminder.date,
          reminder: currentReminder.reminder.trim(),
        }
      );
      alert("Reminder updated successfully.");
      setIsEditModalOpen(false);
      fetchAllReminders();
    } catch (err) {
      console.error("Error updating reminder:", err);
      // Use a more specific error message if available from backend
      alert(err.response?.data?.message || "Failed to update reminder.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentReminder((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      try {
        setIsLoading(true); // Optional: show loading state during delete
        await axiosInstance.delete(`/reminders/${id}`);
        alert("Reminder deleted successfully.");
        fetchAllReminders(); // Re-fetch to update the list
      } catch (err) {
        console.error("Error deleting reminder:", err);
        setError(err.response?.data?.message || "Failed to delete reminder.");
        // alert("Failed to delete reminder."); // Or use the setError state
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded mt-2"
              onClick={fetchAllReminders}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/database")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Database
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          All Reminders
        </h1>
        {isLoading ? (
          <p>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p className="text-gray-500">No reminders found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">
                    Reminder
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reminders.map((reminder) => (
                  <tr key={reminder._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">
                      {reminder.date}
                    </td>
                    <td className="py-4 px-6">{reminder.reminder}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(reminder)} // Pass the whole reminder object
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Reminder Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Edit Reminder
            </h2>
            <form onSubmit={handleUpdateReminder}>
              <div className="mb-4">
                <label
                  htmlFor="edit-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  id="edit-date"
                  name="date"
                  value={currentReminder.date}
                  onChange={handleModalInputChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring-blue-700 focus:border-blue-700"
                  placeholder="DD/MM/YYYY"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="edit-reminder"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reminder Text
                </label>
                <textarea
                  id="edit-reminder"
                  name="reminder"
                  value={currentReminder.reminder}
                  onChange={handleModalInputChange}
                  rows="3"
                  className="border border-gray-300 p-2 rounded w-full focus:ring-blue-700 focus:border-blue-700"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderDB;
