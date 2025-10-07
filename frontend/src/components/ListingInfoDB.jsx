import React from "react";
import ListingTable from "./ListingTable"; // Assuming ListingTable handles fetching and displaying
import Navbar from "./Navbar"; // Optional: if you want the main navbar on this page too
import { useNavigate } from "react-router-dom";

const ListingInfoDB = () => {
  const navigate = useNavigate();
  // State for managing the modal (visibility, data for editing) will be added later
  // For now, we focus on displaying the table.

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Optional: Consistent navigation */}
      <div className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/database")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Database
          </button>
        </div>
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Listing Information Database
          </h1>
        </header>
        <main>
          {/* 
            The ListingTable component is expected to fetch its own data 
            and manage its internal state (like pagination, sorting if any).
            We will later enhance this page to include a modal for viewing/editing
            which will interact with ListingTable (e.g., on row click).
          */}
          <ListingTable showAdminActions={true} />
        </main>
      </div>
    </div>
  );
};

export default ListingInfoDB;
