import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";

const CompanyInfoDB = () => {
  const navigate = useNavigate();
  const [companyProfiles, setCompanyProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyProfiles();
  }, []);

  const fetchCompanyProfiles = async () => {
    try {
      const response = await axiosInstance.get(
        "/company-profile"
      );
      setCompanyProfiles(
        Array.isArray(response.data) ? response.data : [response.data]
      );
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch company profiles");
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this company profile?")
    ) {
      try {
        await axiosInstance.delete(`/company-profile/${id}`);
        toast.success("Company profile deleted successfully!");
        fetchCompanyProfiles();
      } catch (error) {
        toast.error("Failed to delete company profile");
      }
    }
  };

  const handlePrint = (profile) => {
    const printWindow = window.open("", "_blank");
    const logoImg = profile.logoUrl
      ? `<img src="${profile.logoUrl}" alt="Company Logo" style="max-height: 100px; margin-bottom: 20px;"/>`
      : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Company Profile - ${profile.companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${logoImg}
              <h1>Company Profile</h1>
            </div>
            <div class="field"><span class="label">Company Name:</span> ${
              profile.companyName
            }</div>
            <div class="field"><span class="label">Address:</span> ${
              profile.address
            }</div>
            <div class="field"><span class="label">City:</span> ${
              profile.city
            }</div>
            <div class="field"><span class="label">Province:</span> ${
              profile.province
            }</div>
            <div class="field"><span class="label">Postal Code:</span> ${
              profile.postalCode
            }</div>
            <div class="field"><span class="label">Phone:</span> ${
              profile.phone
            }</div>
            <div class="field"><span class="label">Fax:</span> ${
              profile.fax
            }</div>
            <div class="field"><span class="label">Email:</span> ${
              profile.email
            }</div>
            <div class="field"><span class="label">TREB #:</span> ${
              profile.trebNumber
            }</div>
            <div class="field"><span class="label">RECO #:</span> ${
              profile.recoNumber
            }</div>
            <div class="field"><span class="label">Trust Status Company:</span> ${
              profile.trustStatusCompany ? "Yes" : "No"
            }</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-4">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/database")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Database
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6">Company Profiles</h2>
        <div className="grid gap-6">
          {companyProfiles.map((profile) => (
            <div
              key={profile._id}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/edit-company-profile`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(profile._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePrint(profile)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Print
                </button>
              </div>

              {profile.logoUrl && (
                <div className="mb-4">
                  <img
                    src={profile.logoUrl}
                    alt="Company Logo"
                    className="h-20 object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mt-12">
                {[
                  { label: "Company Name", value: profile.companyName },
                  { label: "Address", value: profile.address },
                  { label: "City", value: profile.city },
                  { label: "Province", value: profile.province },
                  { label: "Postal Code", value: profile.postalCode },
                  { label: "Phone", value: profile.phone },
                  { label: "Fax", value: profile.fax },
                  { label: "Email", value: profile.email },
                  { label: "TREB #", value: profile.trebNumber },
                  { label: "RECO #", value: profile.recoNumber },
                  {
                    label: "Trust Status Company",
                    value: profile.trustStatusCompany ? "Yes" : "No",
                  },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="border-b border-gray-200 pb-2"
                  >
                    <div className="text-sm text-gray-600">{field.label}</div>
                    <div className="font-medium">{field.value}</div>
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

export default CompanyInfoDB;
