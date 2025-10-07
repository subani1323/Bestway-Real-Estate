import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaListAlt,
  FaUserTie,
  FaHandshake,
  FaMoneyBillWave,
  FaUserFriends,
  FaBalanceScale,
  FaBuilding,
  FaGavel,
} from "react-icons/fa"; // Added FaFileAlt, FaRegBuilding, FaMoneyBillWave, FaCog, FaChartBar, FaBalanceScale
import TrialBalanceCard from "./TrialBalanceCard";
import Navbar from "./Navbar";

const databases = [
  {
    id: "reminders",
    name: "Reminders Database",
    icon: <FaBell size={40} className="text-blue-900" />,
    route: "/database/reminders",
  },
  {
    id: "company-profile",
    name: "Company Profile Database",
    icon: <FaUser size={40} className="text-blue-900" />,
    route: "/company-profile-db",
  },
  {
    id: "listing-info",
    name: "Listing Info Database",
    icon: <FaListAlt size={40} className="text-blue-900" />,
    route: "/listing-info-db",
  },
  {
    id: "agent-info",
    name: "Agent Info Database",
    icon: <FaUserTie size={40} className="text-blue-900" />,
    route: "/agent-info-db",
  },
  {
    id: "trade-info",
    name: "Trade Info Database",
    icon: <FaHandshake size={40} className="text-blue-900" />,
    route: "/trade-db",
  },
  {
    id: "finance-db",
    name: "Finance Database",
    icon: <FaMoneyBillWave size={40} className="text-blue-900" />,
    route: "/finance-db",
  },
  {
    id: "vendor-info",
    name: "Vendor Info Database",
    icon: <FaUserFriends size={40} className="text-blue-900" />,
    route: "/vendor-info-db",
  },
  {
    id: "trial-balance",
    name: "Trial Balance",
    icon: <FaBalanceScale size={40} className="text-blue-900" />,
    route: "/trial-balance",
  },
  {
    id: "outside-brokers",
    name: "Outside Brokers Database",
    icon: <FaBuilding size={40} className="text-blue-900" />,
    route: "/outside-brokers-db",
  },
  {
    id: "lawyers",
    name: "Lawyers Database",
    icon: <FaGavel size={40} className="text-blue-900" />,
    route: "/lawyers-db",
  },
  // Add more database cards here as needed
];

const Database = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    // Check if user is admin (you can replace this with your actual auth logic)
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/");
    }
  }, [navigate]);

  const handleCardClick = (database) => {
    if (database.id === "trial-balance") {
      setSelectedCard(database);
    } else {
      navigate(database.route);
    }
  };

  const cardStyle =
    "p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out";
  const iconStyle = "text-5xl text-blue-900 mb-4"; // Updated to navy blue

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-8">
        {selectedCard ? (
          <>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {selectedCard.name}
              </h1>
              <TrialBalanceCard />
            </div>
            <div className="mt-6">
              <button
                onClick={() => setSelectedCard(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                ← Back to Database
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Database</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {databases.map(({ id, name, icon, route }) => (
                <div
                  key={id}
                  onClick={() => handleCardClick({ id, name, icon, route })}
                  className={cardStyle}
                >
                  {icon}
                  <h2 className="text-xl font-semibold mb-2">{name}</h2>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Database;
