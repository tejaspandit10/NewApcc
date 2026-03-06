
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationFormData, EducationRow } from '../types';
import { LegalModal } from '../components/LegalModal';
import { TermsContent } from './Terms';
import { PrivacyContent } from './Privacy';

export const ApplyForm: React.FC = () => {
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selfDeclaration, setSelfDeclaration] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({
    education: [
      { qualification: '10th', passingYear: '', percentage: '', stream: '', collegeName: '' },
      { qualification: '12th', passingYear: '', percentage: '', stream: '', collegeName: '' },
      { qualification: 'ITI', passingYear: '', percentage: '', stream: '', collegeName: '' },
      { qualification: 'Diploma', passingYear: '', percentage: '', stream: '', collegeName: '' },
      { qualification: 'Graduation', passingYear: '', percentage: '', stream: '', collegeName: '' },
      { qualification: 'Post Graduation', passingYear: '', percentage: '', stream: '', collegeName: '' },
    ],
    preferredSector: [],
    date: new Date().toLocaleDateString('en-GB'),
    hasPreviousExperience: 'no',
    agentCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkDuplicate = async (field: string, value: string) => {
  if (!value) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/check-duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "user",
        field,
        value,
      }),
    });

    const data = await res.json();

    setDuplicateErrors(prev => ({
      ...prev,
      [field]: data.exists ? `${field} already exists` : "",
    }));

  } catch (err) {
    console.error(err);
  }
};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          resumeBase64: reader.result as string,
          resumeFileName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEducationChange = (index: number, field: keyof EducationRow, value: string) => {
    const newEdu = [...(formData.education || [])];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData(prev => ({ ...prev, education: newEdu }));
  };

  const handleSectorChange = (sector: string) => {
    const current = formData.preferredSector || [];
    if (current.includes(sector)) {
      setFormData(prev => ({ ...prev, preferredSector: current.filter(s => s !== sector) }));
    } else {
      setFormData(prev => ({ ...prev, preferredSector: [...current, sector] }));
    }
  };
const BACKEND_URL = "https://razorpay-backend-1-aeoq.onrender.com";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (submitting) return;
  setSubmitting(true);
  
  if (Object.values(duplicateErrors).some(Boolean)) {
  alert("Please fix duplicate fields before submitting.");
  return;
}

  if (!agreedToTerms) {
    alert("Please agree to the Terms & Conditions and No-Refund Policy before proceeding.");
    return;
  }

  if (!selfDeclaration) {
    alert("Please check the Self Declaration checkbox.");
    return;
  }

  try {
    // Convert values to match backend schema
    const payload = {
      ...formData,

      phone: (formData as any).mobile, // rename mobile → phone
      expectedSalary: Number(formData.expectedSalary),
      hasPreviousExperience: formData.hasPreviousExperience === "yes",
    };

    const res = await fetch(`${BACKEND_URL}/api/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Server error");
      return;
    }

    // Save userId for payment page
    localStorage.setItem("userId", data.userId);

    // Optional: still keep your existing storage
    localStorage.setItem("pending_application", JSON.stringify(formData));
    localStorage.setItem("payment_context", "candidate");

    navigate("/payment");

  } catch (error) {
    console.error(error);
    alert("Server error. Please try again.");
  }
};

  const inputClass = "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-black transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";
  const sectionTitleClass = "text-xl font-bold text-[#003366] uppercase";

  const sectors = [
    'Accounting', 'Sales / Marketing', 'Computer / IT', 
    'Banking', 'Office Admin', 'Technician'
  ];

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-[#003366] p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2 uppercase tracking-tight">Registration & Career Goal Questionnaire</h1>
          <p className="text-cyan-200 font-medium">नोंदणी व करिअर उद्दिष्ट प्रश्नावली</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Section 1: Personal Information */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6 border-b-2 border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <h2 className={sectionTitleClass}>PERSONAL INFORMATION (वैयक्तिक माहिती)</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>First Name (प्रथम नाव)*</label>
                <input required name="firstName" onChange={handleInputChange} className={inputClass} placeholder="Enter First Name" />
              </div>
              <div>
                <label className={labelClass}>Middle Name (मधले नाव)</label>
                <input name="middleName" onChange={handleInputChange} className={inputClass} placeholder="Enter Middle Name" />
              </div>
              <div>
                <label className={labelClass}>Last Name (आडनाव)*</label>
                <input required name="lastName" onChange={handleInputChange} className={inputClass} placeholder="Enter Last Name" />
              </div>
              <div>
                <label className={labelClass}>Date of Birth (जन्म तारीख)*</label>
                <input required type="date" name="dob" onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mobile Number (मोबाईल नंबर)*</label>
                <input
  required
  type="tel"
  pattern="[0-9]{10}"
  maxLength={10}
  name="mobile"
  onChange={handleInputChange}
  onBlur={(e) => checkDuplicate("phone", e.target.value)}
  className={inputClass}
  placeholder="10-digit Mobile Number"
/>

{duplicateErrors.phone && (
  <p className="text-red-500 text-xs mt-1">
    {duplicateErrors.phone}
  </p>
)}
              </div>
              <div>
                <label className={labelClass}>Email ID (ईमेल आयडी)*</label>
                <input
  required
  type="email"
  name="email"
  onChange={handleInputChange}
  onBlur={(e) => checkDuplicate("email", e.target.value)}
  className={inputClass}
  placeholder="example@email.com"
/>

{duplicateErrors.email && (
  <p className="text-red-500 text-xs mt-1">
    {duplicateErrors.email}
  </p>
)}
              </div>
              <div>
                <label className={labelClass}>Aadhaar Number (आधार कार्ड क्रमांक)*</label>
                <input 
                  required 
                  type="text" 
                  maxLength={12} 
                  name="aadhaar" 
                  placeholder="12-digit Aadhaar Number" 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      handleInputChange({ target: { name: 'aadhaar', value } } as any);
                    }
                  }}
		  onBlur={(e) => checkDuplicate("aadhaar", e.target.value)} 
                  className={inputClass} 
                />
		{duplicateErrors.aadhaar && (
  <p className="text-red-500 text-xs mt-1">
    {duplicateErrors.aadhaar}
  </p>
)}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address (पत्ता)*</label>
                <textarea required name="address" rows={2} onChange={handleInputChange} className={inputClass} placeholder="Enter Full Residential Address"></textarea>
              </div>
              <div>
                <label className={labelClass}>Gender (लिंग)*</label>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-sm font-medium">
                    <input type="radio" required name="gender" value="male" onChange={handleInputChange} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span>पुरुष (Male)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-sm font-medium">
                    <input type="radio" name="gender" value="female" onChange={handleInputChange} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span>स्त्री (Female)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-sm font-medium">
                    <input type="radio" name="gender" value="other" onChange={handleInputChange} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span>इतर (Other)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Agent Code Subsection */}
            <div className="mt-8 pt-8 border-t border-slate-100">
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="max-w-md">
                    <label className={`${labelClass} text-blue-900`}>Agent Code (एजंट कोड) - If any</label>
                    <input 
                      name="agentCode" 
                      onChange={handleInputChange} 
                      className={`${inputClass} border-slate-300 uppercase font-bold tracking-widest`} 
                      placeholder="Enter Agent Code" 
                    />
                    <p className="text-[10px] text-slate-500 mt-2">Enter the agent code provided by your consultant or partner.</p>
                  </div>
               </div>
            </div>
          </section>

          {/* Section 2: Educational Details */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <h2 className={sectionTitleClass}>EDUCATIONAL DETAILS (शैक्षणिक माहिती)</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-left border-b text-[#003366] font-bold">Qualification</th>
                    <th className="p-4 text-left border-b text-[#003366] font-bold">Passing Year</th>
                    <th className="p-4 text-left border-b text-[#003366] font-bold">% / CGPA</th>
                    <th className="p-4 text-left border-b text-[#003366] font-bold">Stream</th>
                    <th className="p-4 text-left border-b text-[#003366] font-bold">College Name</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.education?.map((row, idx) => (
                    <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="p-4 border-b font-semibold bg-slate-50/50 text-slate-800">{row.qualification}</td>
                      <td className="p-2 border-b"><input type="text" placeholder="Year" className="w-full p-2 bg-transparent outline-none text-black focus:bg-white" value={row.passingYear} onChange={(e) => handleEducationChange(idx, 'passingYear', e.target.value)} /></td>
                      <td className="p-2 border-b"><input type="text" placeholder="Result" className="w-full p-2 bg-transparent outline-none text-black focus:bg-white" value={row.percentage} onChange={(e) => handleEducationChange(idx, 'percentage', e.target.value)} /></td>
                      <td className="p-2 border-b"><input type="text" placeholder="Stream" className="w-full p-2 bg-transparent outline-none text-black focus:bg-white" value={row.stream} onChange={(e) => handleEducationChange(idx, 'stream', e.target.value)} /></td>
                      <td className="p-2 border-b"><input type="text" placeholder="College/Uni" className="w-full p-2 bg-transparent outline-none text-black focus:bg-white" value={row.collegeName} onChange={(e) => handleEducationChange(idx, 'collegeName', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Career Information */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-100 pb-4">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
              <h2 className={sectionTitleClass}>CAREER INFORMATION (करिअर संबंधित माहिती)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Preferred Job Sector (कोणत्या क्षेत्रात नोकरी हवी आहे?)*</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {sectors.map(sector => (
                    <label key={sector} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1.5 rounded text-slate-800 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.preferredSector?.includes(sector)} 
                        onChange={() => handleSectorChange(sector)} 
                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      {sector}
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <input 
                    name="otherSector" 
                    placeholder="Other (Specify) / इतर (नमूद करा)" 
                    onChange={handleInputChange} 
                    className={`${inputClass} text-sm py-2`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Preferred Job Type (नोकरीचा प्रकार)*</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {['Full Time', 'Part Time', 'Internship', 'Work From Home'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm cursor-pointer text-slate-800 p-1.5 hover:bg-slate-50 rounded transition-colors">
                      <input 
                        type="radio" 
                        required
                        name="preferredJobType" 
                        value={type} 
                        onChange={handleInputChange} 
                        className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" 
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <label className={labelClass}>Career Goal (आपले करिअर गोल काय आहेत?)*</label>
                <textarea required name="careerGoal" rows={3} onChange={handleInputChange} className={inputClass} placeholder="Explain your professional aspirations..."></textarea>
              </div>
              <div>
                <label className={labelClass}>Skills / Experience (कौशल्य / अनुभव)*</label>
                <textarea required name="skills" rows={3} onChange={handleInputChange} className={inputClass} placeholder="List your technical skills and practical experience..."></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <label className={labelClass}>English Proficiency (इंग्रजी ज्ञान)*</label>
                <select required name="englishProficiency" onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Option</option>
                  <option value="yes">Yes (हो)</option>
                  <option value="no">No (नाही)</option>
                  <option value="basic">Basic (प्राथमिक)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Monthly Salary (अपेक्षित मासिक पगार)*</label>
                <input required type="number" name="expectedSalary" onChange={handleInputChange} className={inputClass} placeholder="e.g. 25000" />
              </div>
              <div>
                <label className={labelClass}>Preferred Job Location (नोकरीचे ठिकाण)*</label>
                <input required type="text" name="preferredLocation" onChange={handleInputChange} className={inputClass} placeholder="e.g. Pune, Mumbai, All India" />
              </div>
            </div>

            <div className="mt-8 bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <label className={`${labelClass} mb-4 text-base`}>Previous Work Experience (आधी काम केले आहे का?)*</label>
              <div className="flex gap-8 mb-6">
                <label className="flex items-center gap-3 cursor-pointer font-bold text-[#003366]">
                  <input type="radio" required name="hasPreviousExperience" value="yes" onChange={(e) => setFormData(prev => ({...prev, hasPreviousExperience: 'yes'}))} className="w-5 h-5 text-cyan-600 focus:ring-cyan-500" />
                  हो (Yes)
                </label>
                <label className="flex items-center gap-3 cursor-pointer font-bold text-[#003366]">
                  <input type="radio" name="hasPreviousExperience" value="no" defaultChecked onChange={(e) => setFormData(prev => ({...prev, hasPreviousExperience: 'no'}))} className="w-5 h-5 text-cyan-600 focus:ring-cyan-500" />
                  नाही (No)
                </label>
              </div>

              {formData.hasPreviousExperience === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className={labelClass}>Company Name (कंपनीचे नाव)</label>
                    <input name="prevCompany" onChange={handleInputChange} className={inputClass} placeholder="Company Name" />
                  </div>
                  <div>
                    <label className={labelClass}>Designation (हुद्दा)</label>
                    <input name="prevDesignation" onChange={handleInputChange} className={inputClass} placeholder="Job Title" />
                  </div>
                  <div>
                    <label className={labelClass}>Duration (कालावधी)</label>
                    <input name="prevDuration" onChange={handleInputChange} className={inputClass} placeholder="e.g. 2 Years" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Resume Upload */}
          <section className="bg-cyan-50/50 p-8 rounded-2xl border border-cyan-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
              <h2 className={sectionTitleClass}>RESUME UPLOAD (OPTIONAL)</h2>
            </div>
            <div className="max-w-md">
              <label className={labelClass}>Upload Resume (रिज्युमे अपलोड करा)</label>
              <div className="mt-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-300 rounded-xl bg-white hover:bg-cyan-50/30 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📄</span>
                  <p className="text-sm font-bold text-slate-700">
                    {formData.resumeFileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Declaration */}
          <section className="bg-slate-50 p-10 rounded-2xl border-2 border-dashed border-slate-300">
            <div className="flex items-center gap-3 mb-8">
              <span className="bg-[#003366] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">5</span>
              <h2 className={sectionTitleClass}>SELF-DECLARATION (जाहिरनामा)</h2>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8">
              <div className="flex items-start gap-4">
                <input 
                  id="self-dec"
                  type="checkbox" 
                  required 
                  checked={selfDeclaration}
                  onChange={(e) => setSelfDeclaration(e.target.checked)}
                  className="w-6 h-6 mt-1 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="self-dec" className="text-sm text-slate-700 leading-relaxed cursor-pointer font-medium select-none">
                  <strong className="text-slate-900 block mb-1">Self Declaration (स्व-घोषणा):</strong>
                  I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of my application.
                  <br/>
                  <span className="text-[10px] text-slate-500 mt-1 block">(मी याद्वारे घोषित करतो/करते की वरील सर्व माहिती माझ्या माहितीनुसार सत्य आणि अचूक आहे.)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Applicant Signature (Full Name / सही)*</label>
                <input required name="signature" onChange={handleInputChange} className={`${inputClass} font-serif italic text-lg`} placeholder="Type your full name as signature" />
              </div>
              <div>
                <label className={labelClass}>Date (तारीख)</label>
                <input disabled value={formData.date} className={`${inputClass} bg-slate-100 font-bold text-slate-600`} />
              </div>
            </div>
          </section>

          <div className="bg-[#003366]/5 p-8 rounded-2xl border-2 border-slate-200">
             <div className="flex items-start gap-4">
               <input 
                id="terms-check"
                type="checkbox" 
                required 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-6 h-6 mt-1 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
               />
               <label htmlFor="terms-check" className="text-sm font-bold text-[#003366] cursor-pointer select-none">
                 I agree to the <button 
                   type="button"
                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                   className="text-cyan-600 underline hover:text-cyan-700 transition-colors mx-1"
                 >Terms & Conditions</button> and <span className="text-red-600">No-Refund Policy</span>.
                 <p className="text-[10px] text-slate-500 font-medium mt-1">Please view the Terms & Conditions before accepting.</p>
               </label>
             </div>
          </div>

          <div className="flex flex-col items-center gap-6 pt-10 border-t-2 border-slate-100">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Final Step</p>
              <p className="text-sm text-slate-600">Verify all details before submitting. Incomplete forms may be rejected.</p>
            </div>
            <button 
              type="submit" 
              className="bg-[#003366] hover:bg-blue-800 text-white px-20 py-5 rounded-2xl font-black text-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 shadow-blue-900/20"
            >
              {submitting ? "Processing..." : "SUBMIT & CONTINUE"}
            </button>
          </div>
        </form>
      </div>

      <LegalModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        title="Terms & Conditions"
      >
        <TermsContent />
      </LegalModal>

      <LegalModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
        title="Privacy Policy"
      >
        <PrivacyContent />
      </LegalModal>
    </div>
  );
};
