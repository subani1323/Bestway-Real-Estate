import React, { useState, useEffect } from "react";
import { FaTimes, FaEdit, FaTrash, FaStickyNote } from "react-icons/fa"; // Added FaStickyNote
import { toast } from "react-toastify";
import ListingInfoForm from "./ListingInfoForm";
import axiosInstance from "../config/axios";

const DetailItem = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-base text-gray-900">{value || "-"}</p>
  </div>
);

const ListingDetailsModal = ({
  listing,
  onClose,
  onListingUpdated,
  showAdminActions = false, // Added prop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // Note state
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteEditMode, setNoteEditMode] = useState(false);

  useEffect(() => {
    console.log("Modal listing data:", listing);
    console.log("People data:", listing?.people);
    console.log("Agents data:", listing?.agents);
    if (listing && listing._id) {
      setNoteLoading(true);
      axiosInstance
        .get(`/listings/${listing._id}/note`)
        .then((res) => {
          setNote(res.data.note || "");
          setNoteInput(res.data.note || "");
        })
        .catch(() => {
          setNote("");
          setNoteInput("");
        })
        .finally(() => setNoteLoading(false));
    }
  }, [listing]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    if (onListingUpdated) {
      onListingUpdated(); // Refresh data in the parent table
    }
    // Optionally, you might want to re-fetch the specific listing here if needed,
    // or rely on onListingUpdated to refresh the whole list which includes this item.
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axiosInstance.delete(`/listings/${listing._id}`);
        toast.success("Listing deleted successfully!");
        if (onListingUpdated) {
          onListingUpdated();
        }
        handleClose(); // Close modal after successful deletion
      } catch (error) {
        console.error("Error deleting listing:", error);
        toast.error(
          `Failed to delete listing: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const handleSaveNote = () => {
    setNoteLoading(true);
    axiosInstance
      .put(`/listings/${listing._id}/note`, {
        note: noteInput,
      })
      .then((res) => {
        setNote(res.data.note);
        setNoteEditMode(false);
        toast.success("Note saved successfully!");
      })
      .catch(() => {
        toast.error("Failed to save note.");
      })
      .finally(() => setNoteLoading(false));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    // Handle both Date objects and date strings
    let date;
    if (dateString instanceof Date) {
      date = dateString;
    } else {
      // Parse the date string and create a date in local timezone
      const [year, month, day] = dateString.split('-');
      if (year && month && day) {
        // Create date in local timezone to avoid UTC conversion issues
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Fallback to original method for other date formats
        date = new Date(dateString);
      }
    }
    
    return date.toLocaleDateString("en-US"); // MM/DD/YYYY format
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        {/* Note Button */}
        <button
          onClick={() => setShowNote((v) => !v)}
          className="absolute top-4 right-16 bg-blue-800 hover:bg-blue-900 text-white font-semibold px-4 py-1 rounded shadow"
          aria-label="Show Note"
        >
          Note
        </button>
        {/* Note Section */}
        {showNote && (
          <div className="absolute top-16 right-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4 w-80 shadow-lg z-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-yellow-700">Note</span>
              {!noteEditMode && (
                <button
                  onClick={() => setNoteEditMode(true)}
                  className="text-xs text-blue-600 hover:underline ml-2"
                >
                  {note ? "Edit" : "Add"}
                </button>
              )}
              {noteEditMode && (
                <button
                  onClick={() => {
                    setNoteEditMode(false);
                    setNoteInput(note);
                  }}
                  className="text-xs text-gray-500 hover:underline ml-2"
                >
                  Cancel
                </button>
              )}
            </div>
            {noteLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : noteEditMode ? (
              <div>
                <textarea
                  className="w-full border rounded p-1 text-sm"
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  disabled={noteLoading}
                />
                <button
                  onClick={handleSaveNote}
                  className="mt-2 px-3 py-1 bg-blue-900 text-white rounded text-sm hover:bg-blue-800"
                  disabled={noteLoading}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-800 whitespace-pre-wrap min-h-[2rem]">
                {note ? (
                  note
                ) : (
                  <span className="text-gray-400">No note yet.</span>
                )}
              </div>
            )}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-3">
          {isEditing ? "Edit Listing" : "Listing Details"}: #
          {listing.listingNumber}
        </h2>

        {isEditing ? (
          <ListingInfoForm
            listingToEdit={listing}
            onSubmitSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {/* Address Section */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
                  <DetailItem
                    label="Street #"
                    value={listing.address?.streetNumber}
                  />
                  <DetailItem
                    label="Street Name"
                    value={listing.address?.streetName}
                  />
                  <DetailItem label="Unit" value={listing.address?.unit} />
                  <DetailItem label="City" value={listing.address?.city} />
                  <DetailItem
                    label="Province"
                    value={listing.address?.province}
                  />
                  <DetailItem
                    label="Postal Code"
                    value={listing.address?.postalCode}
                  />
                </div>
              </div>

              {/* Seller Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Seller Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
                  {/* Split seller name into first and last name */}
                  {(() => {
                    const sellerName = listing.seller?.name || "";
                    const nameParts = sellerName.trim().split(" ");
                    const lastName = nameParts.pop() || "";
                    const firstName = nameParts.join(" ") || "";

                    return (
                      <>
                        <DetailItem label="First Name" value={firstName} />
                        <DetailItem label="Last Name" value={lastName} />
                        <DetailItem
                          label="Home Phone #"
                          value={listing.seller?.phoneNumber}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Commission */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Commission
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <DetailItem label="List %" value={listing.commission?.list} />
                  <DetailItem label="Sell %" value={listing.commission?.sell} />
                </div>
              </div>

              {/* Property Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
                  <DetailItem
                    label="Property Type"
                    value={listing.propertyType}
                  />
                  <DetailItem label="Status" value={listing.status} />
                  <DetailItem label="MLS #" value={listing.mlsNumber} />
                  <DetailItem
                    label="We Manage"
                    value={listing.weManage ? "Yes" : "No"}
                  />
                </div>
              </div>

              {/* Agent Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Agent Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
                  {/* Get agent details from agents array or fallback to old structure */}
                  {(() => {
                    if (listing.agents && listing.agents.length > 0) {
                      const primaryAgent = listing.agents[0];
                      return (
                        <>
                          <DetailItem
                            label="First Name"
                            value={primaryAgent.firstName || ""}
                          />
                          <DetailItem
                            label="Last Name"
                            value={primaryAgent.lastName || ""}
                          />
                          <DetailItem
                            label="Office #"
                            value={primaryAgent.officeNo || ""}
                          />
                          <DetailItem
                            label="Lead"
                            value={primaryAgent.lead || "No"}
                          />
                        </>
                      );
                    } else if (listing.agent && listing.agent.name) {
                      // Fallback to old agent structure
                      const agentName = listing.agent.name;
                      const nameParts = agentName.trim().split(" ");
                      const lastName = nameParts.pop() || "";
                      const firstName = nameParts.join(" ") || "";
                      return (
                        <>
                          <DetailItem label="First Name" value={firstName} />
                          <DetailItem label="Last Name" value={lastName} />
                          <DetailItem
                            label="Office #"
                            value={listing.agent.officeNumber || ""}
                          />
                          <DetailItem
                            label="Lead"
                            value={listing.agent.isLead ? "Yes" : "No"}
                          />
                        </>
                      );
                    } else {
                      return (
                        <>
                          <DetailItem label="First Name" value="-" />
                          <DetailItem label="Last Name" value="-" />
                          <DetailItem label="Office #" value="-" />
                          <DetailItem label="Lead" value="-" />
                        </>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Important Dates */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Important Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6">
                  <DetailItem
                    label="Listing Date"
                    value={formatDate(listing.dates?.listing)}
                  />
                  <DetailItem
                    label="Entry Date"
                    value={formatDate(listing.dates?.entry)}
                  />
                  <DetailItem
                    label="Expiry Date"
                    value={formatDate(listing.dates?.expiry)}
                  />
                  <DetailItem
                    label="Sold Date"
                    value={formatDate(listing.dates?.sold)}
                  />
                  {listing.dates?.lastEdit && (
                    <DetailItem
                      label="Last Edited"
                      value={formatDate(listing.dates?.lastEdit)}
                    />
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Pricing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <DetailItem
                    label="Listed Price"
                    value={
                      listing.prices?.listed
                        ? `$${listing.prices.listed.toLocaleString()}`
                        : "N/A"
                    }
                  />
                  {listing.status === "Sold" && (
                    <DetailItem
                      label="Sold Price"
                      value={
                        listing.prices?.sold
                          ? `$${listing.prices.sold.toLocaleString()}`
                          : "N/A"
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {/* People Details Section */}
            {listing.people && listing.people.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">People Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          First Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {listing.people.map((person, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {person.firstName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {person.lastName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {person.address}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {person.phone}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {person.end || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Agents Details Section */}
            {listing.agents && listing.agents.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">Agent Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent No
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Office #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Send Page
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {listing.agents.map((agent, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.agentNo}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.firstName} {agent.lastName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.officeNo}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.lead}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.sendPage}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.expense}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {agent.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t flex justify-between items-center">
              <div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center mr-3" // Added margin-right
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
              </div>
              <div className="flex items-center">
                {showAdminActions && ( // Conditionally render delete button
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center mr-3"
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListingDetailsModal;
