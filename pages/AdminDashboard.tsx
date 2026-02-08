
import React, { useState, useEffect } from 'react';

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'candidates' | 'summary'>('candidates');
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    setCandidates(JSON.parse(localStorage.getItem('admin_candidates') || '[]'));
  }, []);

  // Candidate: 200 base + 36 GST = 236
  const totalRevenue = candidates.length * 236;
  const totalGST = candidates.length * 36;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">APCC Admin Central</h1>
          <p className="text-slate-500">Secure tracking and performance analytics</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase">
          Live Tracking Enabled
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {['candidates', 'summary'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${
              tab === t ? 'bg-[#003366] text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {tab === 'candidates' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-5">Date</th>
                  <th className="p-5">Candidate Name</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Job Preference</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Fee (Incl GST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-black">
                {candidates.length > 0 ? candidates.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5">{c.date}</td>
                    <td className="p-5 font-bold text-slate-900">{c.firstName} {c.lastName}</td>
                    <td className="p-5">{c.email}</td>
                    <td className="p-5">{c.preferredJobType}</td>
                    <td className="p-5"><span className="text-amber-600 font-bold uppercase tracking-tighter">● Pending Verification</span></td>
                    <td className="p-5 text-right font-bold text-[#003366]">₹236.00</td>
                  </tr>
                )) : (
                   <tr><td colSpan={6} className="p-10 text-center text-slate-400 italic">No registrations yet today.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'summary' && (
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Total Candidates</p>
                  <p className="text-4xl font-black text-[#003366]">{candidates.length}</p>
               </div>
               <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-2">Potential Gross Revenue</p>
                  <p className="text-4xl font-black text-green-700">₹{totalRevenue.toFixed(2)}</p>
               </div>
               <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">Projected GST</p>
                  <p className="text-4xl font-black text-orange-700">₹{totalGST.toFixed(2)}</p>
               </div>
            </div>
            
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-[#003366] mb-6 uppercase tracking-wider text-sm">Application Volume Outlook</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                 {[40, 65, 30, 85, 45, 95].map((h, i) => (
                   <div key={i} className="w-full bg-blue-900/10 rounded-t-xl relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-[#003366] rounded-t-xl transition-all duration-500 group-hover:bg-cyan-500" 
                        style={{ height: `${h}%` }}
                      ></div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
        APCC Proprietary Data Management Interface - Unauthorised Access Prohibited
      </div>
    </div>
  );
};
