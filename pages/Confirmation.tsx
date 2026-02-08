import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BUSINESS_DETAILS } from '../constants';

export const Confirmation: React.FC = () => {
  const navigate = useNavigate();

  const rawPayment = localStorage.getItem('payment_details');
  const rawData = localStorage.getItem('pending_application');

  const payment = rawPayment ? JSON.parse(rawPayment) : null;
  const data = rawData ? JSON.parse(rawData) : null;

  // 🔒 Lock page if not paid
  useEffect(() => {
    if (!payment || payment.status !== 'paid') {
      navigate('/payment', { replace: true });
    }
  }, [navigate, payment]);

  if (!payment || !data) return null;

  const base = payment.base;
  const gst = payment.gst;
  const cgst = gst / 2;
  const sgst = gst / 2;
  const total = payment.total;

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Success Banner */}
      <div className="bg-[#003366] p-8 rounded-3xl text-white text-center mb-10 no-print shadow-lg">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
        <p className="text-blue-100">
          Your application has been submitted successfully.
        </p>
        <div className="mt-4 inline-block bg-green-400 text-green-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Status: Paid
        </div>
      </div>

      {/* Receipt */}
      <div className="bg-white p-12 rounded-2xl shadow-2xl border border-slate-200 print:border-0 print:shadow-none">
        <div className="flex justify-between items-start border-b pb-10 mb-10">
          <div>
            <h2 className="text-xl font-bold text-[#003366]">
              Abhishek Placement & Career Counselling
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              {BUSINESS_DETAILS.address}
              <br />
              GSTIN: <b>{BUSINESS_DETAILS.gstin}</b>
              <br />
              Contact: {BUSINESS_DETAILS.phone1}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm text-slate-500">Payment ID</h3>
            <p className="font-bold text-slate-800">
              {payment.payment_id}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Applicant */}
        <div className="mb-10 text-black">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
            Applicant Details
          </h4>
          <p className="text-lg font-bold">
            {data.firstName} {data.lastName}
          </p>
          <p className="text-sm">{data.address}</p>
          <p className="text-sm">Mob: {data.mobile}</p>
        </div>

        {/* Fee */}
        <table className="w-full mb-10 text-sm">
          <thead>
            <tr className="bg-slate-50 border-y">
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4">
                Registration & Career Counselling Fee
              </td>
              <td className="p-4 text-right font-bold">
                ₹{base.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 bg-slate-50 p-6 rounded-xl border">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{base.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>CGST</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>SGST</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total Paid</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-slate-400 mt-8">
          This is a system-generated payment confirmation.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex gap-4 justify-center no-print">
        <button
          onClick={handlePrint}
          className="bg-slate-800 text-white px-10 py-4 rounded-xl font-bold"
        >
          Print Receipt
        </button>
        <Link
          to="/"
          className="bg-slate-100 px-10 py-4 rounded-xl font-bold"
        >
          Home
        </Link>
      </div>
    </div>
  );
};
