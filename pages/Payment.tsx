import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BUSINESS_DETAILS } from "../constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const baseAmount = 200;
  const gstAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + gstAmount;

  const BACKEND_URL = "https://razorpay-backend-1-aeoq.onrender.com";
  const RAZORPAY_KEY = "rzp_live_SCmfJVKrLRgWdS";

  useEffect(() => {
    const app = localStorage.getItem("pending_application");
    if (!app) {
      navigate("/apply", { replace: true });
    }
  }, [navigate]);

  const handleProceed = async () => {
    try {
      setLoading(true);

      const application = JSON.parse(
        localStorage.getItem("pending_application") || "{}"
      );

      // ✅ MAP FIELDS CORRECTLY FOR BACKEND
      const userPayload = {
        firstName: application.firstName,
        middleName: application.middleName || null,
        lastName: application.lastName,
        email: application.email,
        phone: application.mobile, // 🔥 mobile → phone
        aadhaar: application.aadhaar,
        dob: application.dob,
        gender: application.gender,
        address: application.address,

        preferredSector: application.preferredSector || [],
        preferredJobType: application.preferredJobType,
        careerGoal: application.careerGoal,
        skills: application.skills,
        englishProficiency: application.englishProficiency,
        expectedSalary: parseInt(application.expectedSalary || "0"),
        preferredLocation: application.preferredLocation,
        hasPreviousExperience:
          application.hasPreviousExperience === "yes",

        resumeUrl: null,
        agentCode: application.agentCode || null,
      };

      // 1️⃣ CREATE USER
      const userRes = await fetch(`${BACKEND_URL}/api/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        alert(userData.error || "User creation failed");
        setLoading(false);
        return;
      }

      const userId = userData.userId;

      // 2️⃣ CREATE ORDER
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      // 3️⃣ OPEN RAZORPAY
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Abhishek Placement & Career Counselling",
        description: "Candidate Registration Fee",

        handler: async (response: any) => {
  const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      userId: userId,
      amount: baseAmount,
      gst: gstAmount,
    }),
  });

  const result = await verifyRes.json();

  if (result.success) {

    // ✅ SAVE PAYMENT DETAILS (REQUIRED BY CONFIRMATION PAGE)
    localStorage.setItem(
      "payment_details",
      JSON.stringify({
        base: baseAmount,
        gst: gstAmount,
        total: totalAmount,
        status: "paid",
        payment_id: response.razorpay_payment_id,
        order_id: response.razorpay_order_id,
      })
    );

    navigate("/confirmation");
  } else {
    alert("Payment verification failed ❌");
  }
},

        modal: {
          ondismiss: () => {
            alert("Payment cancelled");
          },
        },

        theme: {
          color: "#003366",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="p-8 bg-[#003366] text-white text-center">
          <h2 className="text-2xl font-bold">Candidate Registration</h2>
          <p className="text-cyan-200 mt-2 text-sm">
            Application Fee: ₹{totalAmount.toFixed(2)} (Incl. 18% GST)
          </p>
        </div>

        <div className="p-8">
          <button
            onClick={handleProceed}
            disabled={loading}
            className="w-full bg-[#003366] hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg"
          >
            {loading ? "Processing…" : "Pay & Submit Application"}
          </button>

          <div className="text-center mt-6 text-xs text-slate-500">
            Offline payment:
            <div className="flex justify-center gap-4 mt-2">
              <a href={`tel:${BUSINESS_DETAILS.phone1}`}>
                📞 {BUSINESS_DETAILS.phone1}
              </a>
              <a href={`tel:${BUSINESS_DETAILS.phone2}`}>
                📞 {BUSINESS_DETAILS.phone2}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};