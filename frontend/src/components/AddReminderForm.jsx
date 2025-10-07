import React, { useState } from "react";
import axiosInstance from "../config/axios";

const AddReminderForm = ({ onReminderAdded }) => {
  const [date, setDate] = useState("");
  const [reminder, setReminder] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !reminder.trim()) {
      alert("Please fill out both fields.");
      return;
    }

    // If date is in YYYY-MM-DD format from date picker, parse it.
    // If it's empty, it's caught by the initial check.
    let dateToSend = "";
    if (date) {
      // date state now holds YYYY-MM-DD
      const parts = date.split("-");
      if (parts.length === 3) {
        // Reconstruct to DD/MM/YYYY for backend
        dateToSend = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        // This case should ideally not happen if using date picker correctly
        alert("Invalid date selected from picker.");
        return;
      }
    } else {
      alert("Please select a date."); // Should be caught by earlier check too
      return;
    }

    try {
      await axiosInstance.post("/reminders", {
        date: dateToSend, // Send in DD/MM/YYYY format
        reminder: reminder.trim(),
      });

      setDate("");
      setReminder("");
      onReminderAdded(); // Call parent refresh handler
      alert("Reminder added successfully!");
    } catch (error) {
      console.error("Error adding reminder:", error);
      alert("Failed to add reminder.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date
        </label>
        <input
          type="date" // Changed to date type
          id="date"
          name="date"
          // placeholder is not very effective for type="date"
          value={date} // Expects YYYY-MM-DD
          onChange={(e) => setDate(e.target.value)} // e.target.value will be YYYY-MM-DD
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label
          htmlFor="reminder"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reminder
        </label>
        <input
          type="text"
          id="reminder"
          name="reminder"
          placeholder="Enter Reminder"
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 self-start"
      >
        Add Reminder
      </button>
    </form>
  );
};

export default AddReminderForm;
