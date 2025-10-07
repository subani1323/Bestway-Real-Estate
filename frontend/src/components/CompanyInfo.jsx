import React, { useState } from "react";
import Navbar from "./Navbar";
import CompanyProfileForm from "./CompanyProfileForm";
import GeneralLedgerForm from "./GeneralLedgerForm";
import MLSFeeForm from "./MLSFeeForm";
import MiscSettingsForm from "./MiscSettingsForm";

const cardItems = [
  { name: "General Ledger Account Setup", route: "ledger" },
  { name: "Miscellaneous Settings", route: "misc" },
  { name: "MLS Fee Setup", route: "mls" },
];

const CompanyInfo = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const handleCardClick = (item) => {
    setSelectedForm(item.route);
    setShowProfileForm(false);
  };

  const renderForm = () => {
    if (showProfileForm) {
      return <CompanyProfileForm setShowProfileForm={setShowProfileForm} />;
    }

    switch (selectedForm) {
      case "ledger":
        return <GeneralLedgerForm setSelectedForm={setSelectedForm} />;
      case "mls":
        return <MLSFeeForm setSelectedForm={setSelectedForm} />;
      case "misc":
        return <MiscSettingsForm setSelectedForm={setSelectedForm} />;
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Company Information
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => setShowProfileForm(true)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  Company Profile
                </h2>
              </div>

              {cardItems.map((item) => (
                <div
                  key={item.route}
                  onClick={() => handleCardClick(item)}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h2>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {renderForm()}
    </div>
  );
};

export default CompanyInfo;
