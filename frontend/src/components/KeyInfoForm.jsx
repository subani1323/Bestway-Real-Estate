import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

const KeyInfoForm = ({
  keyInfoData,
  handleKeyInfoChange,
  goToNextSection,
  lookupSuccess,
  lookupError,
  isLoading,
  isLoadingTradeNumber,
  nextTradeNumber,
  listings,
  setKeyInfoData,
  onListingSelected,
  trades = [], // Add trades prop to check for used listings
  currentTradeNumber = null, // Add current trade number to exclude from check
}) => {
  const [conditions, setConditions] = useState(keyInfoData.conditions || []);
  const [newCondition, setNewCondition] = useState({
    conditionText: "",
    dueDate: "",
    conditionMetDate: "",
  });

  // Update conditions when keyInfoData changes (for edit mode)
  useEffect(() => {
    if (keyInfoData.conditions) {
      setConditions(keyInfoData.conditions);
    }
  }, [keyInfoData.conditions]);

  const handleAddCondition = () => {
    console.log("handleAddCondition called");
    console.log("newCondition state:", newCondition);
    console.log("Condition field:", newCondition.conditionText);
    console.log("Due Date field:", newCondition.dueDate);
    console.log("Condition Met Date field:", newCondition.conditionMetDate);

    if (newCondition.conditionText && newCondition.dueDate) {
      const conditionToAdd = {
        conditionText: newCondition.conditionText,
        dueDate: newCondition.dueDate,
        conditionMetDate: newCondition.conditionMetDate,
      };

      console.log("Adding condition:", conditionToAdd);

      const updatedConditions = [...conditions, conditionToAdd];
      setConditions(updatedConditions);
      setNewCondition({
        conditionText: "",
        dueDate: "",
        conditionMetDate: "",
      });

      // Update the keyInfoData with the new conditions
      setKeyInfoData((prev) => {
        const updated = {
          ...prev,
          conditions: updatedConditions,
        };
        console.log("Updated keyInfoData:", updated);
        return updated;
      });
    } else {
      console.log("Validation failed - missing required fields");
    }
  };

  const handleDeleteCondition = (index) => {
    const conditionToDelete = conditions[index];
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the condition: "${conditionToDelete.conditionText}"?`
    );

    if (isConfirmed) {
      const updatedConditions = conditions.filter((_, i) => i !== index);
      setConditions(updatedConditions);

      // Update the keyInfoData with the updated conditions
      setKeyInfoData((prev) => ({
        ...prev,
        conditions: updatedConditions,
      }));
    }
  };

  const handleConditionChange = (field, value) => {
    setNewCondition((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Trade Record</h2>
        <h2 className="text-xl font-bold">Dates</h2>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToNextSection();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trade Number and Status */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Number
                </label>
                <input
                  type="text"
                  name="tradeNumber"
                  value={nextTradeNumber}
                  readOnly
                  className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
                {isLoadingTradeNumber && (
                  <p className="text-sm text-gray-500 mt-1">Loading...</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={keyInfoData.status}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
            </div>
            {/* Listing Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing Number *
              </label>
              <Select
                options={listings
                  .sort((a, b) => b.listingNumber - a.listingNumber)
                  .map((listing) => {
                    // Check if this listing is already used in any trade (excluding current trade)
                    const isUsed = trades.some(
                      (trade) =>
                        trade.keyInfo?.listingNumber ===
                          listing.listingNumber.toString() &&
                        trade.tradeNumber !== currentTradeNumber
                    );

                    return {
                      value: listing.listingNumber.toString(),
                      label: `${listing.listingNumber} - ${
                        listing.address.streetNumber
                      } ${listing.address.streetName}${
                        isUsed ? " (Already Used)" : ""
                      }`,
                      listing, // pass the whole listing for easy access
                      isUsed, // flag to indicate if listing is already used
                      isDisabled: isUsed, // disable used listings
                    };
                  })}
                value={
                  keyInfoData.listingNumber
                    ? {
                        value: keyInfoData.listingNumber,
                        label: listings.find(
                          (l) =>
                            l.listingNumber.toString() ===
                            keyInfoData.listingNumber
                        )
                          ? `${keyInfoData.listingNumber} - ${
                              listings.find(
                                (l) =>
                                  l.listingNumber.toString() ===
                                  keyInfoData.listingNumber
                              ).address.streetNumber
                            } ${
                              listings.find(
                                (l) =>
                                  l.listingNumber.toString() ===
                                  keyInfoData.listingNumber
                              ).address.streetName
                            }`
                          : keyInfoData.listingNumber,
                      }
                    : null
                }
                onChange={(selected) => {
                  if (selected && selected.listing) {
                    // Check if the selected listing is already used
                    if (selected.isUsed) {
                      // Show error toast and don't allow selection
                      toast.error(
                        `Listing ${selected.listing.listingNumber} is already used in another trade. Please select a different listing.`
                      );
                      return;
                    }

                    const selectedListing = selected.listing;
                    setKeyInfoData((prev) => ({
                      ...prev,
                      listingNumber:
                        selectedListing.listingNumber?.toString() ??
                        prev.listingNumber,
                      streetNumber:
                        selectedListing.address?.streetNumber ??
                        prev.streetNumber,
                      streetName:
                        selectedListing.address?.streetName ?? prev.streetName,
                      unit: selectedListing.address?.unit ?? prev.unit,
                      province:
                        selectedListing.address?.province ?? prev.province,
                      postalCode:
                        selectedListing.address?.postalCode ?? prev.postalCode,
                      entryDate: selectedListing.dates?.entry
                        ? new Date(selectedListing.dates.entry)
                            .toISOString()
                            .split("T")[0]
                        : prev.entryDate,
                      type: selectedListing.propertyType ?? prev.type,
                      propertyType:
                        selectedListing.propertyType ?? prev.propertyType,
                      dealType: selectedListing.dealType ?? prev.dealType,
                      mlsNumber: selectedListing.mlsNumber ?? prev.mlsNumber,
                      weManage:
                        selectedListing.lead !== undefined
                          ? selectedListing.lead === true ||
                            selectedListing.lead === "Yes"
                            ? "Yes"
                            : "No"
                          : selectedListing.weManage !== undefined
                          ? selectedListing.weManage
                            ? "Yes"
                            : "No"
                          : prev.weManage,
                      listCommission:
                        selectedListing.commission?.list?.toString() ??
                        prev.listCommission,
                      sellCommission:
                        selectedListing.commission?.sell?.toString() ??
                        prev.sellCommission,
                      // Auto-populate city from selected listing
                      city: selectedListing.address?.city ?? prev.city,
                      sellPrice: prev.sellPrice,
                    }));
                    // Call onListingSelected if provided
                    if (typeof onListingSelected === "function") {
                      onListingSelected(selectedListing);
                    }
                  } else {
                    setKeyInfoData((prev) => ({
                      ...prev,
                      listingNumber: "",
                    }));
                  }
                }}
                isClearable
                placeholder="Select a listing..."
                className="text-sm"
              />
            </div>
            {/* Address Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Number
                </label>
                <input
                  type="text"
                  name="streetNumber"
                  value={keyInfoData.streetNumber}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Name
                </label>
                <input
                  type="text"
                  name="streetName"
                  value={keyInfoData.streetName}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={keyInfoData.unit}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={keyInfoData.city}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={keyInfoData.province}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={keyInfoData.postalCode}
                onChange={handleKeyInfoChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
              />
            </div>
            {/* MLS Number, Property Type, Deal Type */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MLS Number
                </label>
                <input
                  type="text"
                  name="mlsNumber"
                  value={keyInfoData.mlsNumber || ""}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={keyInfoData.propertyType || ""}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                  required
                >
                  <option value="">Select Property Type</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Type
                </label>
                <select
                  name="dealType"
                  value={keyInfoData.dealType || ""}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                  required
                >
                  <option value="">Select Deal Type</option>
                  <option value="Sale">Sale</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>
            </div>
            {/* Property Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  We Manage
                </label>
                <select
                  name="weManage"
                  value={keyInfoData.weManage}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classification
                </label>
                <select
                  name="classification"
                  value={keyInfoData.classification}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="LISTING SIDE">Listing Side</option>
                  <option value="CO-OPERATING SIDE">Co-operating Side</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Commission
                </label>
                <input
                  type="text"
                  name="listCommission"
                  value={keyInfoData.listCommission}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Co-Operating Side commission
                </label>
                <input
                  type="text"
                  name="sellCommission"
                  value={keyInfoData.sellCommission}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sell Price
              </label>
              <input
                type="text"
                name="sellPrice"
                value={keyInfoData.sellPrice}
                onChange={handleKeyInfoChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Date
                </label>
                <input
                  type="date"
                  name="offerDate"
                  value={keyInfoData.offerDate}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firm Date
                </label>
                {conditions.length > 0 ? (
                  <input
                    type="date"
                    name="firmDate"
                    value={keyInfoData.firmDate}
                    readOnly
                    className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                  />
                ) : (
                  <input
                    type="date"
                    name="firmDate"
                    value={keyInfoData.firmDate}
                    onChange={handleKeyInfoChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Close Date
                </label>
                <input
                  type="date"
                  name="closeDate"
                  value={keyInfoData.closeDate}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Date
                </label>
                <input
                  type="date"
                  name="entryDate"
                  value={keyInfoData.entryDate}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Finalized Date
              </label>
              <input
                type="date"
                name="finalizedDate"
                value={keyInfoData.finalizedDate}
                onChange={handleKeyInfoChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  We Manage
                </label>
                <select
                  name="weManage"
                  value={keyInfoData.weManage}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firm
                </label>
                <select
                  name="firm"
                  value={keyInfoData.firm}
                  onChange={handleKeyInfoChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Conditions
          </h3>

          {/* Add Condition Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <select
                  value={newCondition.conditionText}
                  onChange={(e) =>
                    handleConditionChange("conditionText", e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                >
                  <option value="">Select Condition</option>
                  <option value="Finance">Finance</option>
                  <option value="Inspections">Inspections</option>
                  <option value="Status Certificate">Status Certificate</option>
                  <option value="Lawyers Approval">Lawyers Approval</option>
                  <option value="Due Diligence">Due Diligence</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newCondition.dueDate}
                  onChange={(e) =>
                    handleConditionChange("dueDate", e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition Met Date
                </label>
                <input
                  type="date"
                  value={newCondition.conditionMetDate}
                  onChange={(e) => {
                    handleConditionChange("conditionMetDate", e.target.value);
                    if (conditions.length >= 0 && e.target.value) {
                      // Set Firm Date to the latest Condition Met Date
                      setKeyInfoData((prev) => ({
                        ...prev,
                        firmDate: e.target.value,
                        status: "SOLD", // Automatically change status to Sold when condition met date is entered
                      }));
                    }
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddCondition}
                disabled={!newCondition.conditionText || !newCondition.dueDate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                Add Condition
              </button>
            </div>
          </div>

          {/* Conditions List */}
          {conditions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">
                Added Conditions:
              </h4>
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Condition:
                          </span>
                          <p className="text-sm text-gray-900">
                            {condition.conditionText}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Due Date:
                          </span>
                          <p className="text-sm text-gray-900">
                            {condition.dueDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Met Date:
                          </span>
                          <input
                            type="date"
                            value={condition.conditionMetDate || ""}
                            onChange={(e) => {
                              // Update the condition's met date
                              const updatedConditions = conditions.map((c, i) =>
                                i === index
                                  ? { ...c, conditionMetDate: e.target.value }
                                  : c
                              );
                              setConditions(updatedConditions);
                              setKeyInfoData((prev) => ({
                                ...prev,
                                conditions: updatedConditions,
                                firmDate: e.target.value, // Set Firm Date to the latest Condition Met Date
                                status: "SOLD", // Automatically change status to Sold when condition met date is entered
                              }));
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCondition(index)}
                      className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-yellow-300"
          >
            Next
          </button>
        </div>
      </form>
      {/* Status Messages */}
      {(lookupSuccess || lookupError) && (
        <div className="mt-4">
          {lookupSuccess && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-md text-green-800">
              {lookupSuccess}
            </div>
          )}
          {lookupError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
              {lookupError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyInfoForm;
