import React, {useState, useEffect} from "react";
import {toast} from "react-toastify";
import axiosInstance from "../config/axios";

const MiscSettingsForm = ({setSelectedForm}) => {
    console.log("MiscSettingsForm rendered");

    const [formData, setFormData] = useState({
        lastListing: "",
        lastTrade: "",
        compassDirection: "Lorem Ipsum 1",
        cdaAddress: "Lorem Ipsum 1",
        multipleOffices: "No",
        mainOfficeNumber: "",
        hstNumber: "",
        payrollNumber: "",
        expStmtAddress: "Lorem Ipsum 1",
        openingBalanceFormat: "Lorem Ipsum 1",
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("MiscSettingsForm useEffect running");
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching settings from:", `/misc-settings`);
                const response = await axiosInstance.get(`/misc-settings`);
                console.log("Fetched settings:", response.data);

                // Fetch the highest listing number from the database
                const listingsResponse = await axiosInstance.get(`/listings`);
                console.log("Fetched listings:", listingsResponse.data);

                let highestListingNumber = 0;
                if (listingsResponse.data && listingsResponse.data.length > 0) {
                    // Find the highest listing number
                    highestListingNumber = Math.max(...listingsResponse.data.map((listing) => listing.listingNumber || 0));
                }

                // Fetch the highest trade number from the database
                const tradesResponse = await axiosInstance.get(`/trades`);
                console.log("Fetched trades:", tradesResponse.data);

                let highestTradeNumber = 0;
                if (tradesResponse.data && tradesResponse.data.length > 0) {
                    // Find the highest trade number
                    highestTradeNumber = Math.max(...tradesResponse.data.map((trade) => trade.tradeNumber || 0));
                }

                if (response.data && response.data.length > 0) {
                    const settings = response.data[0];
                    setFormData({
                        ...settings, // Use the highest listing number from the database
                        lastListing: highestListingNumber.toString(), // Use the highest trade number from the database
                        lastTrade: highestTradeNumber.toString(),
                        mainOfficeNumber: settings.mainOfficeNumber || "",
                        hstNumber: settings.hstNumber || "",
                        payrollNumber: settings.payrollNumber || "",
                    });
                } else {
                    // If no settings exist yet, still set the lastListing and lastTrade to the highest numbers
                    setFormData((prev) => ({
                        ...prev, lastListing: highestListingNumber.toString(), lastTrade: highestTradeNumber.toString(),
                    }));
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
                toast.error("Failed to load settings. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev, [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                lastListing: Number(formData.lastListing),
                lastTrade: Number(formData.lastTrade),
                mainOfficeNumber: Number(formData.mainOfficeNumber),
                hstNumber: Number(formData.hstNumber),
                payrollNumber: Number(formData.payrollNumber),
            };

            if (formData._id) {
                await axiosInstance.put(`/misc-settings/${formData._id}`, payload);
                toast.success("Settings updated successfully!");
            } else {
                await axiosInstance.post(`/misc-settings`, payload);
                toast.success("Settings saved successfully!");
            }

            setTimeout(() => {
                setSelectedForm(null);
            }, 1500);
        } catch (err) {
            console.error("Error saving settings:", err);
            toast.error(err.response?.data?.message || "Failed to save settings. Please check your input and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (<div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Miscellaneous Settings
                    </h2>
                    <button
                        onClick={() => setSelectedForm(null)}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        ← Back
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 bg-white p-6 rounded-lg shadow-md"
                >
                    {/* TRADES & LISTINGS Section */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                            TRADES & LISTINGS
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Listing
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="lastListing"
                                    value={formData.lastListing}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Auto-generated from the database
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Trade
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="lastTrade"
                                    value={formData.lastTrade}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Auto-generated from the database
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Compass Direction
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="compassDirection"
                                    value={formData.compassDirection}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                >
                                    <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                                    <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                                    <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CDA,Address
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="cdaAddress"
                                    value={formData.cdaAddress}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                >
                                    <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                                    <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                                    <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* COMPANY SETTINGS Section */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                            COMPANY SETTINGS
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Multiple Offices
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="multipleOffices"
                                    value={formData.multipleOffices}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Main Office #<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="mainOfficeNumber"
                                    value={formData.mainOfficeNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    HST #<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="hstNumber"
                                    value={formData.hstNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payroll #<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="payrollNumber"
                                    value={formData.payrollNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    8.61 - Exp. Stmt. Address
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="expStmtAddress"
                                    value={formData.expStmtAddress}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                >
                                    <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                                    <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                                    <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Opening Balance Format
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="openingBalanceFormat"
                                    value={formData.openingBalanceFormat}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    required
                                >
                                    <option value="Lorem Ipsum 1">Lorem Ipsum 1</option>
                                    <option value="Lorem Ipsum 2">Lorem Ipsum 2</option>
                                    <option value="Lorem Ipsum 3">Lorem Ipsum 3</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"}`}
                        >
                            {isLoading ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </div>);
};

export default MiscSettingsForm;
