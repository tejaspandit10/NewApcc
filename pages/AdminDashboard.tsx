import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://razorpay-backend-1-aeoq.onrender.com";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<"agents" | "users" | "summary">("agents");
  const [agentSubTab, setAgentSubTab] = useState<"all" | "approved">("all");
  const [agents, setAgents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [summarySubTab, setSummarySubTab] = useState<"agents" | "users" | "revenue">("agents");

  const token = localStorage.getItem("adminToken");

  //////////////////////////////////////////////////////
  // 🔐 Redirect if no token
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
    }
  }, [token, navigate]);

  const handleDownloadResume = async (userId: string) => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/users/${userId}/resume`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    if (!res.ok) {
      alert("Failed to download resume");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error(err);
    alert("Error downloading resume");
  }
};

  //////////////////////////////////////////////////////
  // 📥 Fetch Agents
  //////////////////////////////////////////////////////
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/agents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin-login");
          return;
        }

        const data = await res.json();
        setAgents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUsers(data);
    console.log(data);
  } catch (err) {
    console.error(err);
  }
};

fetchUsers();

    fetchAgents();
  }, [token, navigate]);

  //////////////////////////////////////////////////////
  // ✅ Approve Agent
  //////////////////////////////////////////////////////
  const handleApproveAgent = async (agentId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/agents/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Approval failed");
        return;
      }

      // Update UI
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? { ...agent, isActive: true }
            : agent
        )
      );

      alert("Agent approved successfully");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  //////////////////////////////////////////////////////
  // 🚪 Logout
  //////////////////////////////////////////////////////
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    navigate("/admin-login");
  };

  const handleToggleAgent = async (agentId: string, currentStatus: boolean) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/agents/toggle-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        agentId,
        isActive: !currentStatus,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update status");
      return;
    }

    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? { ...agent, isActive: !currentStatus }
          : agent
      )
    );

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  //////////////////////////////////////////////////////
  // 📊 Stats
  //////////////////////////////////////////////////////
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.isActive).length;
  const pendingAgents = totalAgents - activeAgents;

  const tabClass = (t: string) =>
    `px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${
      tab === t
        ? "bg-[#003366] text-white shadow-lg"
        : "bg-white text-slate-500 hover:bg-slate-50"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tight">
            APCC Admin Dashboard
          </h1>
          <p className="text-slate-500">
            Secure Management Panel
          </p>
        </div></div>


      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("agents")}
          className={tabClass("agents")}
        >
          Agents
        </button>

	<button
  onClick={() => setTab("users")}
  className={tabClass("users")}
>
  Users
</button>

        <button
          onClick={() => setTab("summary")}
          className={tabClass("summary")}
        >
          Summary
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Loading data...
          </div>
        ) : (
          <>
            {tab === "agents" && (
  <div className="p-6">

    {/* Sub Tabs */}
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setAgentSubTab("all")}
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${
          agentSubTab === "all"
            ? "bg-[#003366] text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        All Agents
      </button>

      <button
        onClick={() => setAgentSubTab("approved")}
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${
          agentSubTab === "approved"
            ? "bg-[#003366] text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        Approved Agents
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
          <tr>
            <th className="p-5">Name</th>
            <th className="p-5">Email</th>
            <th className="p-5">City</th>
            <th className="p-5">Contact</th>
            <th className="p-5">Aadhaar</th>

            {agentSubTab === "approved" && (
              <>
                <th className="p-5">Agent Code</th>
                <th className="p-5">Account No.</th>
                <th className="p-5">IFSC Code</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Action</th>
              </>
            )}

            {agentSubTab === "all" && (
              <>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Action</th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-black">
          {(agentSubTab === "all"
            ? agents
            : agents.filter((a) => a.isActive)
          ).length > 0 ? (
            (agentSubTab === "all"
              ? agents
              : agents.filter((a) => a.isActive)
            ).map((agent) => (
              <tr key={agent.id}>
                <td className="p-5 font-bold">{agent.name}</td>
                <td className="p-5">{agent.email}</td>
                <td className="p-5">{agent.addressCity}</td>
                <td className="p-5">{agent.phone}</td>
                <td className="p-5 font-mono">{agent.aadhaarNumber}</td>

                {agentSubTab === "approved" && (
                  <>
                    <td className="p-5 font-bold text-[#003366]">
                      {agent.agentCode}
                    </td>

                    <td className="p-5 font-mono">
                      {agent.accountNumber || "—"}
                    </td>

                    <td className="p-5 font-mono">
                      {agent.ifscCode || "—"}
                    </td>

                    <td className="p-5">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      <button
                        onClick={() =>
                          handleToggleAgent(agent.id, agent.isActive)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                      >
                        Block
                      </button>
                    </td>
                  </>
                )}

                {agentSubTab === "all" && (
                  <>
                    <td className="p-5">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          agent.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {agent.isActive ? "Active" : "Pending"}
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      {!agent.isActive && (
                        <button
                          onClick={() =>
                            handleApproveAgent(agent.id)
                          }
                          className="bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={agentSubTab === "approved" ? 10 : 7}
                className="p-10 text-center text-slate-400 italic"
              >
                No agents found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

{tab === "users" && (
  <div className="overflow-x-auto">
    <table className="w-full text-xs text-left">
      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
        <tr>
          <th className="p-5">Name</th>
          <th className="p-5">Email</th>
          <th className="p-5">Phone</th>
          <th className="p-5">Aadhaar</th>
          <th className="p-5">Preferred Sector</th>
          <th className="p-5">Expected Salary</th>
          <th className="p-5">Payment</th>
          <th className="p-5">Details</th>
          <th className="p-5 text-center">Resume</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 text-black">
        {users.length > 0 ? (
          users.map((user) => (
            <tr key={user.id}>
              <td className="p-5 font-bold">
                {user.firstName} {user.lastName}
              </td>

              <td className="p-5">{user.email}</td>

              <td className="p-5">{user.phone}</td>

              <td className="p-5 font-mono">
                {user.aadhaar}
              </td>

              <td className="p-5">
                {Array.isArray(user.preferredSector)
                  ? user.preferredSector.join(", ")
                  : "-"}
              </td>

              <td className="p-5">
                ₹{user.expectedSalary}
              </td>

              <td className="p-5">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    user.paymentStatus === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.paymentStatus}
                </span>
              </td>

	      <td className="p-5">
  <button
    onClick={() => {
      setSelectedUser(user);
      setShowUserModal(true);
    }}
    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
  >
    View
  </button>
</td>

              <td className="p-5 text-center">
                {user.resume ? (
                  <button
  onClick={() => handleDownloadResume(user.id)}
  className="text-blue-600 underline"
>
  Download
</button>
                ) : (
                  <span className="text-slate-400 italic">
                    No Resume
                  </span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={8}
              className="p-10 text-center text-slate-400 italic"
            >
              No users registered yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>

{showUserModal && selectedUser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-[#003366]">
          User Details
        </h2>

        <button
          onClick={() => setShowUserModal(false)}
          className="text-red-600 font-bold"
        >
          Close
        </button>
      </div>

      {/* EDUCATION SECTION */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 text-[#003366]">
          Education Details
        </h3>

        {selectedUser.education?.length > 0 ? (
          <table className="w-full text-sm border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 border">Qualification</th>
                <th className="p-2 border">Year</th>
                <th className="p-2 border">Result</th>
                <th className="p-2 border">Stream</th>
                <th className="p-2 border">College</th>
              </tr>
            </thead>
            <tbody>
              {selectedUser.education.map((edu: any, i: number) => (
                <tr key={i}>
                  <td className="p-2 border">{edu.qualification}</td>
                  <td className="p-2 border">{edu.passingYear}</td>
                  <td className="p-2 border">{edu.percentage}</td>
                  <td className="p-2 border">{edu.stream}</td>
                  <td className="p-2 border">{edu.collegeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-500 italic">No education data</p>
        )}
      </div>

      {/* EXPERIENCE SECTION */}
<div>
  <h3 className="text-lg font-bold mb-4 text-[#003366]">
    Previous Work Experience
  </h3>

  {selectedUser?.previousExperience ? (
    <div className="space-y-2">
      <p>
        <strong>Company:</strong>{" "}
        {selectedUser.previousExperience.company || "-"}
      </p>
      <p>
        <strong>Designation:</strong>{" "}
        {selectedUser.previousExperience.designation || "-"}
      </p>
      <p>
        <strong>Duration:</strong>{" "}
        {selectedUser.previousExperience.duration || "-"}
      </p>
    </div>
  ) : (
    <p className="text-slate-500 italic">
      No previous experience
    </p>
  )}
</div>

    </div>
  </div>
)}
  </div>
)}
               

            {tab === "summary" && (
  <div className="p-8">

    {/* Summary Sub Tabs */}
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => setSummarySubTab("agents")}
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${
          summarySubTab === "agents"
            ? "bg-[#003366] text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        Agents
      </button>

      <button
        onClick={() => setSummarySubTab("users")}
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${
          summarySubTab === "users"
            ? "bg-[#003366] text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        Users
      </button>

      <button
        onClick={() => setSummarySubTab("revenue")}
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${
          summarySubTab === "revenue"
            ? "bg-[#003366] text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        Revenue
      </button>
    </div>

    {/* AGENTS SUMMARY */}
    {summarySubTab === "agents" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <p className="text-xs font-bold text-blue-500 uppercase mb-2">
            Total Agents Applied
          </p>
          <p className="text-4xl font-black text-[#003366]">
            {agents.length}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <p className="text-xs font-bold text-green-500 uppercase mb-2">
            Active Agents
          </p>
          <p className="text-4xl font-black text-green-700">
            {agents.filter(a => a.isActive).length}
          </p>
        </div>

        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <p className="text-xs font-bold text-amber-500 uppercase mb-2">
            Pending Agents
          </p>
          <p className="text-4xl font-black text-amber-700">
            {agents.filter(a => !a.isActive).length}
          </p>
        </div>

      </div>
    )}

    {/* USERS SUMMARY */}
    {summarySubTab === "users" && (
      <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100">
        <p className="text-xs font-bold text-purple-500 uppercase mb-2">
          Total Registered Users
        </p>
        <p className="text-5xl font-black text-purple-700">
          {users.length}
        </p>
      </div>
    )}

    {/* REVENUE SUMMARY (Blank for now) */}
    {summarySubTab === "revenue" && (
      <div className="bg-slate-50 p-12 rounded-3xl border border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest">
        Revenue analytics coming soon...
      </div>
    )}

  </div>
)}
          </>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase italic">
        APCC Secure Admin Interface
      </div>
    </div>
  );
};