import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parse as parseDateFns,
} from "date-fns";
import Navbar from "./Navbar";
import AddReminderForm from "./AddReminderForm";
import {
  FaBuilding,
  FaList,
  FaExchangeAlt,
  FaUser,
  FaChartLine,
  FaUserFriends,
  FaFileAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DatabaseLoginModal from "./DatabaseLoginModal";
import FinanceLoginModal from "./FinanceLoginModal";
import FinancialReportsLoginModal from "./FinancialReportsLoginModal";
import TradeInfoLoginModal from "./TradeInfoLoginModal";
import ListingInfoLoginModal from "./ListingInfoLoginModal";
import AgentInfoLoginModal from "./AgentInfoLoginModal";
import VendorInfoLoginModal from "./VendorInfoLoginModal";
import axiosInstance from "../config/axios";

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFinanceLoginModalOpen, setIsFinanceLoginModalOpen] = useState(false);
  const [
    isFinancialReportsLoginModalOpen,
    setIsFinancialReportsLoginModalOpen,
  ] = useState(false);
  const [isTradeInfoLoginModalOpen, setIsTradeInfoLoginModalOpen] =
    useState(false);
  const [isListingInfoLoginModalOpen, setIsListingInfoLoginModalOpen] =
    useState(false);
  const [isAgentInfoLoginModalOpen, setIsAgentInfoLoginModalOpen] =
    useState(false);
  const [isVendorInfoLoginModalOpen, setIsVendorInfoLoginModalOpen] =
    useState(false);
  const navigate = useNavigate();

  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch reminders from the API
      const res = await axiosInstance.get(`/reminders`);
      setReminders(res.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);

      // More specific error messages
      if (error.code === "ECONNABORTED") {
        setError(
          "Request timed out. Please check your connection and try again."
        );
      } else if (error.response) {
        // Server responded with error status
        setError(
          `Server error: ${error.response.status}. Please try again later.`
        );
      } else if (error.request) {
        // Request was made but no response received
        setError(
          "Unable to connect to server. Please check if the backend is running."
        );
      } else {
        setError("Failed to fetch reminders. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return "";
    return [
      ("0" + d.getDate()).slice(-2),
      ("0" + (d.getMonth() + 1)).slice(-2),
      d.getFullYear(),
    ].join("/");
  };

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : "";

  const parseReminderDate = (dateStr) => {
    return parseDateFns(dateStr, "dd/MM/yyyy", new Date());
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    return {
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    };
  };

  const handleReminderAdded = () => {
    fetchReminders();
  };

  const handleCompanyProfileClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleFinanceClick = () => {
    setIsFinanceLoginModalOpen(true);
  };

  const handleFinancialReportsClick = () => {
    setIsFinancialReportsLoginModalOpen(true);
  };

  const handleTradeInfoClick = () => {
    setIsTradeInfoLoginModalOpen(true);
  };

  const handleListingInfoClick = () => {
    setIsListingInfoLoginModalOpen(true);
  };

  const handleAgentInfoClick = () => {
    setIsAgentInfoLoginModalOpen(true);
  };

  const handleVendorInfoClick = () => {
    setIsVendorInfoLoginModalOpen(true);
  };

  const handleClearReminders = () => {
    setReminders([]);
  };

  const currentWeekRange = getCurrentWeekRange();
  const weeklyFilteredReminders = reminders.filter((rem) => {
    try {
      const reminderDateObj = parseReminderDate(rem.date);
      return isWithinInterval(reminderDateObj, currentWeekRange);
    } catch (e) {
      console.error("Error parsing reminder date for filtering:", rem.date, e);
      return false;
    }
  });

  const dailyFilteredReminders = selectedDate
    ? weeklyFilteredReminders.filter((rem) => rem.date === selectedDateStr)
    : weeklyFilteredReminders;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <div className="mt-3 space-x-2">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={fetchReminders}
            >
              Retry
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex flex-col md:flex-row p-6">
        {/* Calendar Section */}
        <div className="md:flex-1 bg-white rounded-lg shadow-md p-6 mb-8 md:mb-0">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
            Calendar
          </h2>

          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="mx-auto border-none"
            tileClassName={({ date }) =>
              formatDate(date) === selectedDateStr
                ? "bg-yellow-300 rounded-lg"
                : ""
            }
          />
        </div>

        {/* Reminder Section */}
        <div className="md:flex-1 bg-white rounded-lg shadow-md p-6 md:ml-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Add Reminder
          </h2>
          <AddReminderForm onReminderAdded={handleReminderAdded} />

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-700">
                {selectedDate
                  ? `Reminders for ${selectedDateStr} (This Week)`
                  : "This Week's Reminders"}
              </h3>
              <button
                onClick={() => navigate("/database/reminders")}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
              >
                View All Reminders
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading reminders...</span>
              </div>
            )}

            {!isLoading && dailyFilteredReminders.length === 0 && (
              <p className="text-gray-500">
                {selectedDate
                  ? `No reminders for ${selectedDateStr} this week.`
                  : "No reminders for this week."}
              </p>
            )}

            {!isLoading && dailyFilteredReminders.length > 0 && (
              <ul className="space-y-2 mb-4">
                {dailyFilteredReminders.map((reminder) => (
                  <li
                    key={reminder._id}
                    className="p-3 bg-gray-100 rounded-md shadow-sm"
                  >
                    <p className="font-semibold text-gray-800">
                      {reminder.date}
                    </p>
                    <p className="text-gray-600">{reminder.reminder}</p>
                  </li>
                ))}
              </ul>
            )}

            {weeklyFilteredReminders.length > 0 && !isLoading && (
              <div className="space-x-2">
                <button
                  onClick={handleClearReminders}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                >
                  Clear Displayed Weekly Reminders
                </button>
                <button
                  onClick={fetchReminders}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                >
                  Refresh All Reminders
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 px-6 pb-10">
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleCompanyProfileClick}
        >
          <FaBuilding className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">
            Company Profile
          </h3>
        </div>
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleListingInfoClick}
        >
          <FaList className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">Listing Info</h3>
        </div>
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleTradeInfoClick}
        >
          <FaExchangeAlt className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">Trade Info</h3>
        </div>
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleAgentInfoClick}
        >
          <FaUser className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">Agent Info</h3>
        </div>
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleFinanceClick}
        >
          <FaChartLine className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">Finance</h3>
        </div>
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleVendorInfoClick}
        >
          <FaUserFriends className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">Vendor Info</h3>
        </div>
        <div
          className="bg-white shadow-md hover:shadow-lg transition rounded-lg p-6 flex flex-col items-center cursor-pointer"
          onClick={handleFinancialReportsClick}
        >
          <FaFileAlt className="text-4xl text-blue-900 mb-2" />
          <h3 className="text-lg font-semibold text-gray-700">
            Financial Reports
          </h3>
        </div>
      </div>

      <DatabaseLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        source="companyProfile"
      />
      <FinanceLoginModal
        isOpen={isFinanceLoginModalOpen}
        onClose={() => setIsFinanceLoginModalOpen(false)}
      />
      <FinancialReportsLoginModal
        isOpen={isFinancialReportsLoginModalOpen}
        onClose={() => setIsFinancialReportsLoginModalOpen(false)}
      />
      <TradeInfoLoginModal
        isOpen={isTradeInfoLoginModalOpen}
        onClose={() => setIsTradeInfoLoginModalOpen(false)}
      />
      <ListingInfoLoginModal
        isOpen={isListingInfoLoginModalOpen}
        onClose={() => setIsListingInfoLoginModalOpen(false)}
      />
      <AgentInfoLoginModal
        isOpen={isAgentInfoLoginModalOpen}
        onClose={() => setIsAgentInfoLoginModalOpen(false)}
      />
      <VendorInfoLoginModal
        isOpen={isVendorInfoLoginModalOpen}
        onClose={() => setIsVendorInfoLoginModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
