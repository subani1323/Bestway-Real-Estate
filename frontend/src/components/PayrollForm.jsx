import React, { useEffect, useState } from "react";

const PayrollForm = ({
  employeeNo = "",
  payrollData = {},
  onSubmit = () => {},
}) => {
  const [formData, setFormData] = useState({
    employeeNo: employeeNo,
    position: "",
    hourlyRate: "",
    hoursWorked: "",
    grossPay: "",
    deductions: "",
    netPay: "",
  });

  // Update employeeNo when it changes from parent
  useEffect(() => {
    setFormData((prev) => ({ ...prev, employeeNo }));
  }, [employeeNo]);

  // Populate form with existing payroll data when editing
  useEffect(() => {
    if (payrollData && Object.keys(payrollData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        position: payrollData.position || "",
        hourlyRate: payrollData.hourlyRate
          ? payrollData.hourlyRate.toString()
          : "",
        hoursWorked: payrollData.hoursWorked
          ? payrollData.hoursWorked.toString()
          : "",
        grossPay: payrollData.grossPay ? payrollData.grossPay.toString() : "",
        deductions: payrollData.deductions
          ? payrollData.deductions.toString()
          : "",
        netPay: payrollData.netPay ? payrollData.netPay.toString() : "",
      }));
    }
  }, [payrollData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update parent state immediately when form data changes
    onSubmit({ ...formData, [name]: value });
  };

  // Remove handleSubmit since we don't have a submit button anymore

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Payroll Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Employee No
          </label>
          <input
            type="text"
            name="employeeNo"
            value={formData.employeeNo}
            className="w-full p-2 bg-gray-100 border rounded-md"
            readOnly
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Position
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Hourly Rate
          </label>
          <input
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Hours Worked
          </label>
          <input
            type="number"
            name="hoursWorked"
            value={formData.hoursWorked}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Gross Pay
          </label>
          <input
            type="number"
            name="grossPay"
            value={formData.grossPay}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Deductions
          </label>
          <input
            type="number"
            name="deductions"
            value={formData.deductions}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Net Pay
          </label>
          <input
            type="number"
            name="netPay"
            value={formData.netPay}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end">
        {/* Save button removed - only main Save Changes button will be used */}
      </div>
    </div>
  );
};

export default PayrollForm;
