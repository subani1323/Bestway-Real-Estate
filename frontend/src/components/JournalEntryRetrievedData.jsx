import React from "react";

const JournalEntryRetrievedData = ({ entries, dateRange, onClose }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Journal Entries ({dateRange.fromDate} to {dateRange.toDate})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              No journal entries found for the selected date range.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group entries by reference number
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.reference]) {
      acc[entry.reference] = [];
    }
    acc[entry.reference].push(entry);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Journal Entries ({dateRange.fromDate} to {dateRange.toDate})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedEntries).map(
            ([reference, referenceEntries]) => {
              const firstEntry = referenceEntries[0];
              const totalDebits = referenceEntries.reduce(
                (sum, entry) => sum + (parseFloat(entry.debit) || 0),
                0
              );
              const totalCredits = referenceEntries.reduce(
                (sum, entry) => sum + (parseFloat(entry.credit) || 0),
                0
              );

              return (
                <div
                  key={reference}
                  className="border border-gray-300 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-semibold">Date: </span>
                      {new Date(firstEntry.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Reference: </span>
                      {firstEntry.reference}
                    </div>
                    <div>
                      <span className="font-semibold">Description: </span>
                      {firstEntry.description || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Type: </span>
                      {firstEntry.type || "Journal Entry"}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                            Account Number
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                            Account Name
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                            Debit
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                            Credit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {referenceEntries.map((entry, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2 text-sm">
                              {entry.accountNumber}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {entry.accountName}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {parseFloat(entry.debit) > 0
                                ? `$${parseFloat(entry.debit).toFixed(2)}`
                                : "$0.00"}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {parseFloat(entry.credit) > 0
                                ? `$${parseFloat(entry.credit).toFixed(2)}`
                                : "$0.00"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end space-x-4 text-sm font-semibold mt-4 pt-2 border-t">
                    <span>Total Debits: ${totalDebits.toFixed(2)}</span>
                    <span>Total Credits: ${totalCredits.toFixed(2)}</span>
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryRetrievedData;
