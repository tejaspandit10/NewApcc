import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ResumePayment: React.FC = () => {

  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const BACKEND_URL = "https://api.jobs-apcc.in";

  const handleFindUser = async () => {

    const res = await fetch(`${BACKEND_URL}/api/users/resume-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    localStorage.setItem("userId", data.userId);

    navigate("/payment");

  };

  return (
    <div className="max-w-md mx-auto py-20">

      <h2 className="text-2xl font-bold mb-6">
        Continue Payment
      </h2>

      <input
        type="email"
        placeholder="Enter your email"
        className="border p-3 w-full mb-4"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <button
        onClick={handleFindUser}
        className="bg-blue-900 text-white px-6 py-3 rounded"
      >
        Continue Payment
      </button>

    </div>
  );
};