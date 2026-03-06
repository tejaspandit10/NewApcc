import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://razorpay-backend-1-aeoq.onrender.com";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      // ✅ Store token (MATCH NAVBAR KEY)
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", data.role);

      // Redirect to dashboard
      navigate("/admin");

    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">

        <h1 className="text-3xl font-black text-[#003366] text-center mb-2 uppercase">
          Admin Login
        </h1>
        <p className="text-center text-slate-500 mb-8">
          Secure APCC Dashboard Access
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="admin@jobs-apcc.in"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
};