import React, { useEffect, useState } from "react";
import { handlePhoneNumberChange } from "../utils/phoneUtils";

const Info1Form = ({
  formData: parentFormData,
  setFormData: setParentFormData,
  handleSubmit,
  fetchNextEmployeeNo,
  combinedFormData,
  onTabChange,
}) => {
  // Use local state for the form
  const [formData, setFormData] = useState({
    employeeNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    legalName: "",
    nickname: "",
    spouseName: "",
    status: "",
    gender: "",
    streetNumber: "",
    streetName: "",
    unitNumber: "",
    city: "",
    province: "",
    postalCode: "",
    email: "",
    website: "",
    homePhone: "",
    cellPhone: "",
    fax: "",
    birthDate: "",
    startDate: "",
    contactAnniversary: "",
    franchiseAnniversary: "",
    terminationDate: "",
    lastPayDate: "",
    bondExpiryDate: "",
    incorporatedDate: "",
    unincorporatedDate: "",
  });

  // On mount or when combinedFormData.basicInfo changes, initialize local state
  useEffect(() => {
    if (
      combinedFormData.basicInfo &&
      Object.keys(combinedFormData.basicInfo).length > 0
    ) {
      setFormData(combinedFormData.basicInfo);
    } else {
      // Only fetch next employee number if not editing
      const getNextEmployeeNo = async () => {
        const nextNo = await fetchNextEmployeeNo();
        setFormData((prev) => ({ ...prev, employeeNo: nextNo }));
      };
      getNextEmployeeNo();
    }
    // eslint-disable-next-line
  }, [combinedFormData.basicInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sync data to parent when form data changes
  const syncToParent = () => {
    setParentFormData(formData);
  };

  // Sync data to parent after a delay when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        syncToParent();
      }
    }, 500); // Sync after 500ms of no changes

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Remove onSubmit function since we don't have a submit button anymore

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-6">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee #
          </label>
          <input
            type="text"
            name="employeeNo"
            value={formData.employeeNo || ""}
            className="w-full p-2 bg-gray-100 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Legal Name
          </label>
          <input
            type="text"
            name="legalName"
            value={formData.legalName || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nickname
          </label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spouse Name
          </label>
          <input
            type="text"
            name="spouseName"
            value={formData.spouseName || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-6">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street #
          </label>
          <input
            type="text"
            name="streetNumber"
            value={formData.streetNumber || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Name
          </label>
          <input
            type="text"
            name="streetName"
            value={formData.streetName || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit #
          </label>
          <input
            type="text"
            name="unitNumber"
            value={formData.unitNumber || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={formData.province || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="text"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Home Phone
          </label>
          <input
            type="tel"
            name="homePhone"
            value={formData.homePhone || ""}
            onChange={(e) => handlePhoneNumberChange(e, setFormData)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cell Phone
          </label>
          <input
            type="tel"
            name="cellPhone"
            value={formData.cellPhone || ""}
            onChange={(e) => handlePhoneNumberChange(e, setFormData)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fax
          </label>
          <input
            type="tel"
            name="fax"
            value={formData.fax || ""}
            onChange={(e) => handlePhoneNumberChange(e, setFormData)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-6">Important Dates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Anniversary
          </label>
          <input
            type="date"
            name="contactAnniversary"
            value={formData.contactAnniversary || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise Anniversary
          </label>
          <input
            type="date"
            name="franchiseAnniversary"
            value={formData.franchiseAnniversary || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Termination Date
          </label>
          <input
            type="date"
            name="terminationDate"
            value={formData.terminationDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Pay Date
          </label>
          <input
            type="date"
            name="lastPayDate"
            value={formData.lastPayDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bond Expiry Date
          </label>
          <input
            type="date"
            name="bondExpiryDate"
            value={formData.bondExpiryDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incorporated Date
          </label>
          <input
            type="date"
            name="incorporatedDate"
            value={formData.incorporatedDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unincorporated Date
          </label>
          <input
            type="date"
            name="unincorporatedDate"
            value={formData.unincorporatedDate || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      <div className="flex justify-end">
        {/* Save button removed - only main Save Changes button will be used */}
      </div>
    </div>
  );
};

export default Info1Form;
