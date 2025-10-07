import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import ListingDetailsModal from "./ListingDetailsModal";
import axiosInstance from "../config/axios"; // Import the modal component

const ListingTable = ({ showAdminActions = false }) => {
  // Accept showAdminActions prop
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "sold", "available"

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/listings");
      const sortedListings = response.data.sort(
        (a, b) => b.listingNumber - a.listingNumber
      );
      setListings(sortedListings);
      // Apply both search and status filters
      const result = sortedListings.filter((listing) => {
        const matchesSearch =
          !searchInput ||
          listing.listingNumber.toString().includes(searchInput.trim());
        const matchesStatus =
          statusFilter === "all" ||
          listing.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
      });
      setFilteredListings(result);
      return sortedListings; // Return the fetched listings for further processing
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to fetch listings");
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleListingUpdated = async () => {
    const updatedListings = await fetchListings(); // Re-fetch listings
    if (selectedListing && updatedListings.length > 0) {
      const newlyFetchedVersion = updatedListings.find(
        (l) => l._id === selectedListing._id
      );
      if (newlyFetchedVersion) {
        setSelectedListing(newlyFetchedVersion); // Update the selectedListing state
      } else {
        // The listing might have been deleted by another user, or ID changed (unlikely)
        // For now, if not found, we can close the modal or keep it as is.
        // Keeping it as is might show stale data if it was deleted.
        // Or, if it was truly updated, it should be found.
        // If it's not found after an update, it's an edge case.
        // For simplicity, we assume it will be found if it was an update.
      }
    }
    // The search filter is reapplied within fetchListings if searchInput is present.
  };

  const handleSearch = () => {
    // Apply both search and status filters
    const result = listings.filter((listing) => {
      const matchesSearch =
        !searchInput.trim() ||
        listing.listingNumber.toString().includes(searchInput.trim());
      const matchesStatus =
        statusFilter === "all" || listing.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredListings(result);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    // Apply both search and status filters
    const result = listings.filter((listing) => {
      const matchesSearch =
        !value.trim() ||
        listing.listingNumber.toString().includes(value.trim());
      const matchesStatus =
        statusFilter === "all" || listing.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredListings(result);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    // Apply both search and status filters
    const result = listings.filter((listing) => {
      const matchesSearch =
        !searchInput.trim() ||
        listing.listingNumber.toString().includes(searchInput.trim());
      const matchesStatus =
        status === "all" || listing.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
    setFilteredListings(result);
  };

  const handleRowClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] w-full p-6">
      <h2 className="text-2xl font-bold mb-4">Listings</h2>

      {/* Search bar and Status Filter Checkboxes */}
      <div className="mb-6 flex items-center gap-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter Listing #"
            value={searchInput}
            onChange={handleSearchInputChange}
            className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={statusFilter === "available"}
              onChange={() => handleStatusFilterChange("available")}
              className="form-checkbox h-4 w-4 text-blue-900"
            />
            <span className="ml-2">Available</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={statusFilter === "sold"}
              onChange={() => handleStatusFilterChange("sold")}
              className="form-checkbox h-4 w-4 text-blue-900"
            />
            <span className="ml-2">Sold</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div>
        <table className="w-full bg-white shadow-md rounded-lg table-fixed">
          <thead className="bg-blue-900">
            <tr>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[6%]">
                Listing #
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[6%]">
                Street #
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[26%]">
                Street Name
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[6%]">
                Unit
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[11%]">
                City
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[11%]">
                MLS #
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[18%]">
                Agent Name
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[12%]">
                Price
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[10%]">
                Type
              </th>
              <th className="px-3 py-3 text-left text-base font-semibold text-white w-[10%]">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredListings.map((listing) => (
              <tr
                key={listing._id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(listing)}
              >
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  #{listing.listingNumber}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  {listing.address.streetNumber}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {listing.address.streetName}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  {listing.address.unit || "-"}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  {listing.address.city || "-"}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  {listing.mlsNumber || "-"}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {(() => {
                    // Try to get agent names from agents array first
                    if (listing.agents && listing.agents.length > 0) {
                      return listing.agents
                        .map((agent) => `${agent.firstName} ${agent.lastName}`)
                        .join(", ");
                    }
                    // Fallback to old agent structure if agents array is empty
                    if (listing.agent && listing.agent.name) {
                      return listing.agent.name;
                    }
                    // If no agent info available, show dash
                    return "-";
                  })()}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  ${listing.prices.listed.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-base text-gray-900 whitespace-nowrap">
                  {listing.propertyType}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      listing.status === "Sold"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {listing.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={closeModal}
          onListingUpdated={handleListingUpdated}
          showAdminActions={showAdminActions} // Pass it to the modal
        />
      )}
    </div>
  );
};

export default ListingTable;
