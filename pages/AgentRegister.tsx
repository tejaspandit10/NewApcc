import React, { useState } from 'react';
import { AgentFormData } from '../types';
import { LegalModal } from '../components/LegalModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BACKEND_URL = "https://razorpay-backend-1-aeoq.onrender.com";
const RAZORPAY_KEY = "rzp_live_SCmfJVKrLRgWdS";

const baseAmount = 300;
const gstAmount = baseAmount * 0.18;
const totalAmount = baseAmount + gstAmount;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi"
];

export const AgentRegister: React.FC = () => {

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selfDeclaration, setSelfDeclaration] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState<any>({});

  const [formData, setFormData] = useState<Partial<AgentFormData>>({
    state: 'Maharashtra',
    aadhaarNumber: ''
  });

  const inputClass =
    "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-black transition-all";

  const labelClass =
    "block text-sm font-semibold text-slate-700 mb-1";

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "ifscCode") {
  const upper = value.toUpperCase();
  setFormData(prev => ({ ...prev, [name]: upper }));
  return;
}

    if (name === "accountNumber") {
  const numericValue = value.replace(/\D/g, "").slice(0, 18);
  setFormData(prev => ({ ...prev, [name]: numericValue }));
  return;
}

    if (name === "aadhaarNumber") {
      const numericValue = value.replace(/\D/g, "").slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkDuplicate = async (field: string, value: string) => {
  if (!value) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/check-duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "agent",
        field,
        value,
      }),
    });

    const data = await res.json();

    setDuplicateErrors((prev: any) => ({
      ...prev,
      [field]: data.exists ? `${field} already exists` : "",
    }));

  } catch (err) {
    console.error(err);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
  duplicateErrors.email ||
  duplicateErrors.phone ||
  duplicateErrors.aadhaarNumber
) {
  alert("Please fix duplicate errors before submitting.");
  return;
}

    if (!selfDeclaration) {
      alert("Please confirm the Self Declaration.");
      return;
    }

    if (!agreedToTerms) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Razorpay Order
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        alert("Failed to create payment order");
        return;
      }

      // 2️⃣ Razorpay
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "APCC Agent Registration",
        description: "Agent Onboarding Fee",

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: baseAmount,
                gst: gstAmount,

                agentTempData: {
  name: `${formData.firstName} ${formData.middleName || ""} ${formData.lastName}`,
  email: formData.email,
  phone: formData.mobile,
  aadhaarNumber: formData.aadhaarNumber,
  addressFull: formData.address,
  addressCity: formData.city,
  addressState: formData.state,
  addressPincode: formData.pincode,
  occupation: formData.occupation,

  // 🔥 ADD THESE
  accountNumber: formData.accountNumber,
  ifscCode: formData.ifscCode,
}
              }),
            });

            const result = await verifyRes.json();

            if (!result.success) {
              alert(result.error || "Payment verification failed");
              return;
            }
      
      alert(`Registration successful! Your Agent Code is: ${result.agentCode}`);

            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });

          } catch (err) {
            console.error(err);
            alert("Verification failed");
          }
        },

        theme: { color: "#003366" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            ✓
          </div>
          <h1 className="text-3xl font-black text-[#003366] mb-4 uppercase tracking-tight">
            Application Submitted!
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Your agent application has been submitted successfully.
            Our team will contact you shortly after approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#003366] p-10 text-white text-center">
          <h1 className="text-3xl font-bold mb-2 uppercase tracking-tight">
            Register as APCC Agent
          </h1>
          <p className="text-cyan-200 font-medium">
            Partner with us to transform careers across India.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">

          {/* KEEP YOUR ORIGINAL FORM UI BELOW (UNCHANGED) */}
<section>
            <h2 className="text-sm font-black text-cyan-600 uppercase tracking-widest mb-6 border-b pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>First Name*</label>
                <input required name="firstName" onChange={handleInputChange} className={inputClass} placeholder="First Name" />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input name="middleName" onChange={handleInputChange} className={inputClass} placeholder="Middle Name" />
              </div>
              <div>
                <label className={labelClass}>Last Name*</label>
                <input required name="lastName" onChange={handleInputChange} className={inputClass} placeholder="Last Name" />
              </div>
              <div>
                <label className={labelClass}>Mobile Number*</label>
                <input
  required
  type="tel"
  pattern="[0-9]{10}"
  maxLength={10}
  name="mobile"
  value={formData.mobile || ""}
  onChange={(e) => {
    handleInputChange(e);
    if (e.target.value.length === 10) {
      checkDuplicate("phone", e.target.value);
    }
  }}
  className={inputClass}
  placeholder="10-digit Mobile"
/>

{duplicateErrors.phone && (
  <p className="text-red-500 text-xs mt-1">
    {duplicateErrors.phone}
  </p>
)}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Email ID*</label>
                <input
  required
  type="email"
  name="email"
  value={formData.email || ""}
  onChange={(e) => {
    handleInputChange(e);
    checkDuplicate("email", e.target.value);
  }}
  className={inputClass}
  placeholder="email@example.com"
/>

{duplicateErrors.email && (
  <p className="text-red-500 text-xs mt-1">
    {duplicateErrors.email}
  </p>
)}
              </div>
            </div>
          </section>

          {/* Section: Address Details */}
          <section>
            <h2 className="text-sm font-black text-cyan-600 uppercase tracking-widest mb-6 border-b pb-2">Location Details</h2>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Full Address*</label>
                <textarea required name="address" rows={3} onChange={handleInputChange} className={inputClass} placeholder="House No, Street, Landmark..."></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>City / District*</label>
                  <input required name="city" onChange={handleInputChange} className={inputClass} placeholder="City" />
                </div>
                <div>
                  <label className={labelClass}>State*</label>
                  <select required name="state" value={formData.state} onChange={handleInputChange} className={inputClass}>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>PIN Code*</label>
                  <input required type="text" pattern="[0-9]{6}" maxLength={6} name="pincode" onChange={handleInputChange} className={inputClass} placeholder="6-digit PIN" />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Background & ID */}
          <section>
            <h2 className="text-sm font-black text-cyan-600 uppercase tracking-widest mb-6 border-b pb-2">Background & Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Occupation / Background*</label>
                <input required name="occupation" onChange={handleInputChange} className={inputClass} placeholder="e.g. Consultant, Teacher, Retired" />
              </div>
              <div>
                <label className={labelClass}>Aadhaar Number</label>
                <input 
  name="aadhaarNumber" 
  value={formData.aadhaarNumber}
  onChange={(e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 12);
    handleInputChange({
      target: { name: "aadhaarNumber", value: numericValue }
    } as any);

    if (numericValue.length === 12) {
      checkDuplicate("aadhaarNumber", numericValue);
    }
  }}
  className={inputClass} 
  placeholder="12-digit Aadhaar Number" 
/>

{duplicateErrors.aadhaarNumber && (
  <p className="text-red-500 text-xs mt-1">
    {duplicateErrors.aadhaarNumber}
  </p>
)}
              </div>
            </div>
          </section>
	  
	  {/* Section: Bank Details */}
<section>
  <h2 className="text-sm font-black text-cyan-600 uppercase tracking-widest mb-6 border-b pb-2">
    Bank Details
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    
    <div>
      <label className={labelClass}>Bank Account Number*</label>
      <input
  required
  type="text"
  name="accountNumber"
  value={formData.accountNumber || ""}
  onChange={handleInputChange}
  pattern="^[0-9]{9,18}$"
  className={inputClass}
  placeholder="Enter Account Number"
/>
    </div>

    <div>
      <label className={labelClass}>IFSC Code*</label>
      <input
  required
  name="ifscCode"
  value={formData.ifscCode || ""}
  onChange={handleInputChange}
  pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
  className={inputClass}
  placeholder="SBIN0001234"
/>
    </div>

  </div>
</section>

          {/* Section: Declaration */}
          <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <input 
                    id="dec-check" 
                    type="checkbox" 
                    required 
                    checked={selfDeclaration}
                    onChange={(e) => setSelfDeclaration(e.target.checked)}
                    className="w-6 h-6 mt-1 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="dec-check" className="text-sm font-medium text-slate-700 cursor-pointer">
                    <strong className="text-black block mb-1">Self Declaration:</strong>
                    I hereby confirm that the information provided above is true and correct. I understand that submission of this form does not guarantee approval as an APCC agent.
                  </label>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-slate-200">
                  <input 
                    id="terms-check" 
                    type="checkbox" 
                    required 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-6 h-6 mt-1 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-sm font-medium text-slate-700 cursor-pointer">
                    I agree to the <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                      className="text-cyan-600 font-bold underline hover:text-cyan-700"
                    >Terms & Conditions</button>.
                  </label>
                </div>
             </div>
          </section>
<button
            type="submit"
            disabled={loading || !agreedToTerms || !selfDeclaration}
            className="w-full py-5 rounded-2xl font-black text-xl bg-[#003366] text-white hover:bg-blue-800 transition-all"
          >
            {loading ? "Processing..." : "SUBMIT AGENT APPLICATION"}
          </button>

        </form>
      </div>
    </div>
  );
};