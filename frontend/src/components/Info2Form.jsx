import React, { useEffect, useState } from "react";

const Info2Form = ({
  licenses,
  setLicenses,
  handleSubmit,
  combinedFormData,
  setCombinedFormData,
  setActiveTab,
}) => {
  const [hstNumber, setHstNumber] = useState(
    combinedFormData.basicInfo?.hstNumber || ""
  );
  useEffect(() => {
    if ((!licenses || licenses.length === 0) && setLicenses) {
      setLicenses([
        {
          licenseNumber: "",
          licenseType: "",
          issueDate: "",
          expiryDate: "",
          status: "Active",
        },
      ]);
    }
    if (
      combinedFormData.licenseInfo &&
      combinedFormData.licenseInfo.length > 0
    ) {
      setLicenses(combinedFormData.licenseInfo);
    }
    // Update HST number when combined form data changes
    if (combinedFormData.basicInfo?.hstNumber !== undefined) {
      setHstNumber(combinedFormData.basicInfo.hstNumber);
    }
    // eslint-disable-next-line
  }, [combinedFormData.licenseInfo, combinedFormData.basicInfo?.hstNumber]);

  const handleLicenseChange = (index, field, value) => {
    const updatedLicenses = [...licenses];
    updatedLicenses[index][field] = value;
    setLicenses(updatedLicenses);
  };

  const addLicense = () => {
    setLicenses([
      ...licenses,
      {
        licenseNumber: "",
        licenseType: "",
        issueDate: "",
        expiryDate: "",
        status: "Active",
      },
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-6">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HST #
          </label>
          <input
            type="text"
            value={hstNumber}
            onChange={(e) => {
              setHstNumber(e.target.value);
              // Update the combined form data
              setCombinedFormData((prev) => ({
                ...prev,
                basicInfo: {
                  ...prev.basicInfo,
                  hstNumber: e.target.value,
                },
              }));
            }}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">License Information</h3>
      {licenses.map((license, index) => (
        <div key={index} className="mb-8 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                value={license.licenseNumber}
                onChange={(e) =>
                  handleLicenseChange(index, "licenseNumber", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Type
              </label>
              <select
                value={license.licenseType}
                onChange={(e) =>
                  handleLicenseChange(index, "licenseType", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select License Type</option>
                <option value="Real Estate Agent">Real Estate Agent</option>
                <option value="Broker">Broker</option>
                <option value="Property Manager">Property Manager</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={license.issueDate}
                onChange={(e) =>
                  handleLicenseChange(index, "issueDate", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={license.expiryDate}
                onChange={(e) =>
                  handleLicenseChange(index, "expiryDate", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={license.status}
                onChange={(e) =>
                  handleLicenseChange(index, "status", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={addLicense}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add License
        </button>
        {/* Save button removed - only main Save Changes button will be used */}
      </div>
    </div>
  );
};

export default Info2Form;
