import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import companyLogo from "../Assets/logo.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";

const MiscellaneousDB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [miscData, setMiscData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default fields that are always present
  const defaultFields = [
    "lastListing",
    "lastTrade",
    "compassDirection",
    "cdaAddress",
    "multipleOffices",
    "mainOfficeNumber",
    "hstNumber",
    "payrollNumber",
    "expStmtAddress",
    "openingBalanceFormat",
  ];

  const systemFields = ["_id", "__v", "createdAt", "updatedAt"];

  // Function to format field name for display
  const formatFieldName = (key) => {
    // Special cases for acronyms
    if (key.toLowerCase().includes("hst")) {
      return key.replace(/hst/i, "HST");
    }
    if (key.toLowerCase().includes("cda")) {
      return key.replace(/cda/i, "CDA");
    }

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  useEffect(() => {
    fetchMiscSettings();
  }, [location]);

  const fetchMiscSettings = async () => {
    try {
      const response = await axiosInstance.get(
        "/misc-settings"
      );
      setMiscData(response.data);
    } catch (err) {
      console.error("Error fetching miscellaneous settings:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirm) return;

    try {
      await axiosInstance.delete(`/misc-settings/${id}`);
      setMiscData(miscData.filter((entry) => entry._id !== id));
    } catch (err) {
      alert("Error deleting entry: " + err.message);
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await axiosInstance.get(
        `/misc-settings/${id}`
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
            <title>Miscellaneous Settings Print</title>
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
            <h2 class="title">Miscellaneous Settings Entry</h2>
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

  const renderFields = (entry) => {
    const fieldsToRender = [];

    // Add default fields first
    defaultFields.forEach((field) => {
      if (entry[field] !== undefined) {
        fieldsToRender.push({
          key: field,
          value: entry[field],
          isCustom: false,
        });
      }
    });

    // Find custom fields (fields that are not default or system fields)
    const customFieldKeys = Object.keys(entry).filter(
      (key) => !defaultFields.includes(key) && !systemFields.includes(key)
    );

    // Add custom fields
    customFieldKeys.forEach((key) => {
      fieldsToRender.push({
        key: key,
        value: entry[key],
        isCustom: true,
      });
    });

    return fieldsToRender;
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="text-red-600 p-4">
          Failed to load miscellaneous settings: {error}
        </div>
      </>
    );
  }

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
      <div className="container mx-auto my-6 px-4">
        <h2 className="text-2xl font-bold mb-6">
          Miscellaneous Settings Entries
        </h2>
        <div className="space-y-6">
          {miscData.map((entry) => (
            <div
              key={entry._id}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/edit-misc/${entry._id}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePrint(entry._id)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Print
                </button>
              </div>

              <div className="mt-12 space-y-4">
                {renderFields(entry).map((field) => (
                  <div
                    key={field.key}
                    className="flex border-b border-gray-200 pb-3"
                  >
                    <div className="w-1/3 text-sm font-medium text-gray-600">
                      {formatFieldName(field.key)}
                    </div>
                    <div className="w-2/3 font-medium">
                      {typeof field.value === "boolean"
                        ? field.value
                          ? "Yes"
                          : "No"
                        : field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MiscellaneousDB;
