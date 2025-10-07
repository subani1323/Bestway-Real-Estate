import React, { useState } from "react";
import Navbar from "../components/Navbar";
import MiscSettingsForm from "../components/MiscSettingsForm";
import GeneralLedgerForm from "../components/GeneralLedgerForm";
import MLSFeeForm from "../components/MLSFeeForm";
import CompanyProfileForm from "../components/CompanyProfileForm";

const cardItems = [
  {
    name: "Company Profile",
    route: "companyProfile",
    icon: "fa-building",
  },
  {
    name: "General Ledger",
    route: "ledger",
    icon: "fa-book",
  },
  {
    name: "MLS Fee",
    route: "mlsFee",
    icon: "fa-dollar-sign",
  },
  {
    name: "Miscellaneous Settings",
    route: "miscSettings",
    icon: "fa-cogs",
  },
];

const CompanyInfo = () => {
  const [selectedForm, setSelectedForm] = useState(null);

  const handleFormSelect = (formName) => {
    console.log("Selected form:", formName);
    setSelectedForm(formName);
  };

  const renderSelectedForm = () => {
    console.log("Current selected form:", selectedForm);
    switch (selectedForm) {
      case "companyProfile":
        return <CompanyProfileForm setSelectedForm={setSelectedForm} />;
      case "ledger":
        return <GeneralLedgerForm setSelectedForm={setSelectedForm} />;
      case "mlsFee":
        return <MLSFeeForm setSelectedForm={setSelectedForm} />;
      case "miscSettings":
        return <MiscSettingsForm setSelectedForm={setSelectedForm} />;
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Company Information
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cardItems.map((item) => (
                  <button
                    key={item.route}
                    onClick={() => handleFormSelect(item.route)}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center space-y-4 border-2 border-blue-900"
                  >
                    <div className="text-3xl text-blue-900">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {renderSelectedForm()}
    </div>
  );
};

export default CompanyInfo;
