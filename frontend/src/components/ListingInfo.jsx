import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import ListingInfoForm from "./ListingInfoForm";
import ListingTable from "./ListingTable";

const ListingInfo = () => {
  const [activeTab, setActiveTab] = useState("list");
  const tabs = ["List", "Info", "Details"]; // Removed "People" tab

  return (
    <div className="flex flex-col">
      <Navbar />

      {/* Secondary Navigation */}
      <div className="bg-white py-4 border-b">
        <div className="max-w-screen-2xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.toLowerCase()}
                className={`text-lg font-medium px-3 py-2 hover:text-blue-900 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? "text-blue-900 border-b-2 border-blue-900"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-screen-2xl mx-auto py-6">
        {activeTab === "list" && <ListingTable />}
        {activeTab === "info" && (
          <ListingInfoForm onSubmitSuccess={() => setActiveTab("list")} />
        )}
        {activeTab === "details" && <div>Details Content</div>}
      </div>
    </div>
  );
};

export default ListingInfo;
