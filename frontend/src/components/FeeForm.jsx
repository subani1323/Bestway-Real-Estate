import React, { useEffect } from "react";

const feeOptions = [
  { value: "flatFee", label: "Flat Fee" },
  { value: "garnishment", label: "Garnishment" },
  { value: "plan250", label: "Plan 250" },
  { value: "plan500", label: "Plan 500" },
  { value: "plan9010", label: "Plan 90/10" },
  { value: "plan955", label: "Plan 95/5" },
  { value: "plan8515", label: "Plan 85/15" },
  { value: "plan5050", label: "Plan 50/50" },
  { value: "plan8020", label: "Plan 80/20" },
  { value: "plan150", label: "Plan 150" },
  { value: "buyerRebate", label: "Buyer Rebate" },
  { value: "noFee", label: "No Fee" },
];

const FeeForm = ({
  selectedFee,
  setSelectedFee,
  handleSubmit,
  combinedFormData,
  onSave,
  isLoading = false,
}) => {
  useEffect(() => {
    if (combinedFormData.feeInfo) {
      setSelectedFee(combinedFormData.feeInfo);
    }
    // eslint-disable-next-line
  }, [combinedFormData.feeInfo]);

  const handleChange = (e) => {
    setSelectedFee(e.target.value);

    // Update parent state immediately when selection changes
    handleSubmit(e.target.value);
  };

  // Remove handleFormSubmit since we don't have a submit button anymore

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-6">Fee Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {feeOptions.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={option.value}
              name="feeOption"
              value={option.value}
              checked={selectedFee === option.value}
              onChange={handleChange}
              className="h-5 w-5 text-blue-900"
            />
            <label htmlFor={option.value} className="ml-2 text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Saving..." : "Save Agent Information"}
        </button>
      </div>
    </div>
  );
};

export default FeeForm;
