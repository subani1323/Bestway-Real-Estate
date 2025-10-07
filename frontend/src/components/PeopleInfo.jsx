import React, { useState, useEffect } from "react";
import { handlePhoneNumberChange } from "../utils/phoneUtils";
import axiosInstance from "../config/axios";

const PeopleInfo = () => {
  // State for the left form (People)
  const [people, setPeople] = useState([]);
  const [person, setPerson] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // State for the right form (Agents)
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [agent, setAgent] = useState({
    agentNo: "",
    firstName: "",
    lastName: "",
    officeNo: "",
    sendPage: "No",
    lead: "No",
    expense: "",
  });
  const [editingAgentIndex, setEditingAgentIndex] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get("/agents");
        setAllAgents(response.data);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };
    fetchAgents();
  }, []);

  // Handlers for the People form
  const handlePersonInputChange = (e) => {
    const { name, value } = e.target;
    setPerson({ ...person, [name]: value });
  };

  const handlePersonSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updatedPeople = [...people];
      updatedPeople[editingIndex] = person;
      setPeople(updatedPeople);
      setEditingIndex(null);
    } else {
      setPeople([...people, person]);
    }
    setPerson({ firstName: "", lastName: "", address: "", phone: "" });
  };

  const handlePersonEdit = (index) => {
    setPerson(people[index]);
    setEditingIndex(index);
  };

  const handlePersonAddNew = () => {
    setPerson({ firstName: "", lastName: "", address: "", phone: "" });
    setEditingIndex(null);
  };

  // Handlers for the Agent form
  const handleAgentInputChange = (e) => {
    const { name, value } = e.target;
    setAgent({ ...agent, [name]: value });
  };

  const handleAgentSelectChange = (e) => {
    const selectedAgent = allAgents.find(
      (a) => a.employeeNo === parseInt(e.target.value)
    );
    if (selectedAgent) {
      setAgent({
        agentNo: selectedAgent.employeeNo,
        firstName: selectedAgent.firstName,
        lastName: selectedAgent.lastName,
        officeNo: selectedAgent.officeNo || "",
        sendPage: selectedAgent.sendPage || "No",
        lead: selectedAgent.lead || "No",
        expense: selectedAgent.expense || "",
      });
    }
  };

  const handleAgentSubmit = (e) => {
    e.preventDefault();
    if (editingAgentIndex !== null) {
      const updatedAgents = [...agents];
      updatedAgents[editingAgentIndex] = agent;
      setAgents(updatedAgents);
      setEditingAgentIndex(null);
    } else {
      setAgents([...agents, agent]);
    }
    setAgent({
      agentNo: "",
      firstName: "",
      lastName: "",
      officeNo: "",
      sendPage: "No",
      lead: "No",
      expense: "",
    });
  };

  const handleAgentEdit = (index) => {
    setAgent(agents[index]);
    setEditingAgentIndex(index);
  };

  const handleAgentAddNew = () => {
    setAgent({
      agentNo: "",
      firstName: "",
      lastName: "",
      officeNo: "",
      sendPage: "No",
      lead: "No",
      expense: "",
    });
    setEditingAgentIndex(null);
  };

  return (
    <div className="flex flex-col md:flex-row md:space-x-2">
      {/* Left Side: People Form and Table */}
      <div className="w-1/2 flex flex-col">
        <h2 className="text-xl font-bold mb-4">People Details</h2>
        <form
          onSubmit={handlePersonSubmit}
          className="space-y-4 p-4 border rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={person.firstName}
                onChange={handlePersonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={person.lastName}
                onChange={handlePersonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={person.address}
              onChange={handlePersonInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Cellular Phone #
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={person.phone}
              onChange={handlePersonInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              {editingIndex !== null ? "Update Person" : "Add Person"}
            </button>
            <button
              type="button"
              onClick={handlePersonAddNew}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Add New
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">People List</h3>
          <div className="mt-4">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-blue-900">
                <tr>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Phone #
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {people.map((p, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePersonEdit(index)}
                        className="text-blue-900 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Side: Agents Form and Table */}
      <div className="w-1/2 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Agent Details</h2>
        <form
          onSubmit={handleAgentSubmit}
          className="space-y-4 p-4 border rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="agentNo"
                className="block text-sm font-medium text-gray-700"
              >
                Agents #
              </label>
              <select
                name="agentNo"
                id="agentNo"
                value={agent.agentNo}
                onChange={handleAgentSelectChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              >
                <option value="">Select an agent</option>
                {allAgents.map((a) => (
                  <option key={a.employeeNo} value={a.employeeNo}>
                    {a.employeeNo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="agentFirstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="agentFirstName"
                value={agent.firstName}
                onChange={handleAgentInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                required
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="agentLastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="agentLastName"
                value={agent.lastName}
                onChange={handleAgentInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                required
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="officeNo"
                className="block text-sm font-medium text-gray-700"
              >
                Office #
              </label>
              <input
                type="tel"
                name="officeNo"
                id="officeNo"
                value={agent.officeNo}
                onChange={(e) => handlePhoneNumberChange(e, setAgent)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sendPage"
                className="block text-sm font-medium text-gray-700"
              >
                Send Page
              </label>
              <select
                name="sendPage"
                id="sendPage"
                value={agent.sendPage}
                onChange={handleAgentInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="lead"
                className="block text-sm font-medium text-gray-700"
              >
                Lead
              </label>
              <select
                name="lead"
                id="lead"
                value={agent.lead}
                onChange={handleAgentInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="expense"
                className="block text-sm font-medium text-gray-700"
              >
                Expense %
              </label>
              <input
                type="text"
                name="expense"
                id="expense"
                value={agent.expense}
                onChange={handleAgentInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              {editingAgentIndex !== null ? "Update Agent" : "Add Agent"}
            </button>
            <button
              type="button"
              onClick={handleAgentAddNew}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Add New
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Agent List</h3>
          <div className="mt-4">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-blue-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Agent #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Office #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Expense %
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((a, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.agentNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {a.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {a.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {a.officeNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {a.expense}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAgentEdit(index)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleInfo;
