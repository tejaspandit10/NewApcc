import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_DETAILS } from '../constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState(false);

  // 🔹 Fee calculation
  const baseAmount = 200;
  const gstAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + gstAmount;

  // 🔐 PRODUCTION CONFIG (safe to expose)
  const BACKEND_URL = 'https://razorpay-backend-1-aeoq.onrender.com';
  const RAZORPAY_KEY = 'rzp_test_SEsp3tLXyzpq3x';

  /* 🔒 GUARD: user must come from Apply Form */
  useEffect(() => {
    const app = localStorage.getItem('pending_application');
    if (!app) {
      navigate('/apply', { replace: true });
    }
  }, [navigate]);

  /* 🧹 Always start with clean payment state */
  useEffect(() => {
    localStorage.removeItem('payment_details');
  }, []);

  const handleProceed = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create order from backend
      const res = await fetch(`${BACKEND_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const order = await res.json();

      // 2️⃣ Razorpay options
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'Abhishek Placement & Career Counselling',
        description: 'Candidate Registration Fee',

        handler: async (response: any) => {
          // 3️⃣ Verify payment
          const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          const result = await verifyRes.json();

          if (result.success) {
            localStorage.setItem(
              'payment_details',
              JSON.stringify({
                base: baseAmount,
                gst: gstAmount,
                total: totalAmount,
                status: 'paid',
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
              })
            );

            navigate('/confirmation');
          } else {
            alert('Payment verification failed ❌');
          }
        },

        modal: {
          ondismiss: () => {
            localStorage.removeItem('payment_details');
            alert('Payment cancelled');
          },
        },

        prefill: {
          name: 'Candidate',
          email: 'candidate@example.com',
        },

        theme: {
          color: '#003366',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-[#003366] text-white text-center">
          <h2 className="text-2xl font-bold">Candidate Registration</h2>
          <p className="text-cyan-200 mt-2 text-sm">
            Application Fee: ₹{totalAmount.toFixed(2)} (Incl. 18% GST)
          </p>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-bold mb-4 text-slate-800">
            Select Preferred Method
          </h3>

          <div className="space-y-3">
            {[
              { id: 'upi', name: 'UPI (PhonePe, GPay, Paytm)', icon: '📱' },
              { id: 'card', name: 'Credit / Debit Card', icon: '💳' },
              { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
            ].map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-4 p-4 border rounded-xl ${
                  method === m.id ? 'border-slate-400 bg-slate-50' : ''
                }`}
              >
                <input
                  type="radio"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id as any)}
                />
                <span className="text-xl">{m.icon}</span>
                <span className="font-medium">{m.name}</span>
              </label>
            ))}
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-xl border">
            <div className="flex justify-between text-sm mb-2">
              <span>Registration Fee</span>
              <span>₹{baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>GST (18%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg border-t pt-4">
              <span className="font-bold">Total Payable</span>
              <span className="font-bold text-2xl text-[#003366]">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={loading}
            className="w-full mt-8 bg-[#003366] hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg"
          >
            {loading ? 'Processing…' : 'Pay & Submit Application'}
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
