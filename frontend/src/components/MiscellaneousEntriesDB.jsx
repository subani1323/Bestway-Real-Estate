import React from "react";
import Navbar from "./Navbar";

const MiscellaneousEntriesDB = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Miscellaneous Entries Database
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">
              This feature is currently under development. Please check back
              later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiscellaneousEntriesDB;
