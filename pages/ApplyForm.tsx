import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationFormData, EducationRow } from '../types';
import { LegalModal } from '../components/LegalModal';
import { TermsContent } from './Terms';
import { PrivacyContent } from './Privacy';

export const ApplyForm: React.FC = () => {
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (
    index: number,
    field: keyof EducationRow,
    value: string
  ) => {
    const newEdu = [...(formData.education || [])];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData(prev => ({ ...prev, education: newEdu }));
  };

  const handleSectorChange = (sector: string) => {
    const current = formData.preferredSector || [];
    setFormData(prev => ({
      ...prev,
      preferredSector: current.includes(sector)
        ? current.filter(s => s !== sector)
        : [...current, sector],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert("Please agree to Terms & Conditions.");
      return;
    }

    localStorage.setItem('pending_application', JSON.stringify(formData));
    navigate('/payment');
  };

  const inputClass =
    "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-black";

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";
  const sectionTitleClass = "text-xl font-bold text-[#003366] uppercase";

  const sectors = [
    'Accounting',
    'Sales / Marketing',
    'Computer / IT',
    'Banking',
    'Office Admin',
    'Technician',
  ];

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

        {/* HEADER */}
        <div className="bg-[#003366] p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">
            Registration & Career Goal Questionnaire
          </h1>
          <p className="text-cyan-200">नोंदणी व करिअर उद्दिष्ट प्रश्नावली</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">

          {/* SECTION 1 */}
          <section>
            <h2 className={sectionTitleClass}>PERSONAL INFORMATION</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className={labelClass}>First Name*</label>
                <input required name="firstName" onChange={handleInputChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Last Name*</label>
                <input required name="lastName" onChange={handleInputChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Mobile*</label>
                <input required name="phone" onChange={handleInputChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Email*</label>
                <input required type="email" name="email" onChange={handleInputChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Date of Birth*</label>
                <input required type="date" name="dob" onChange={handleInputChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Aadhaar*</label>
                <input required name="aadhaar" className={inputClass} onChange={handleInputChange}/>
              </div>

              {/* AGENT CODE FIELD */}
              <div className="md:col-span-3">
                <label className={labelClass}>Agent Code (Optional)</label>
                <input
                  name="agentCode"
                  placeholder="Enter agent code if referred"
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* SECTION 2 EDUCATION */}
          <section>
            <h2 className={sectionTitleClass}>EDUCATIONAL DETAILS</h2>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 border">Qualification</th>
                    <th className="p-2 border">Year</th>
                    <th className="p-2 border">% / CGPA</th>
                    <th className="p-2 border">Stream</th>
                    <th className="p-2 border">College</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.education?.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border bg-slate-50">{row.qualification}</td>
                      <td className="p-2 border">
                        <input
                          className="w-full"
                          value={row.passingYear}
                          onChange={(e) =>
                            handleEducationChange(idx, 'passingYear', e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          className="w-full"
                          value={row.percentage}
                          onChange={(e) =>
                            handleEducationChange(idx, 'percentage', e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          className="w-full"
                          value={row.stream}
                          onChange={(e) =>
                            handleEducationChange(idx, 'stream', e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          className="w-full"
                          value={row.collegeName}
                          onChange={(e) =>
                            handleEducationChange(idx, 'collegeName', e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3 CAREER */}
          <section>
            <h2 className={sectionTitleClass}>CAREER INFORMATION</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={labelClass}>Preferred Sector*</label>
                {sectors.map(sector => (
                  <div key={sector}>
                    <input
                      type="checkbox"
                      onChange={() => handleSectorChange(sector)}
                    /> {sector}
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Career Goal*</label>
                <textarea required name="careerGoal" onChange={handleInputChange} className={inputClass}/>
              </div>
            </div>
          </section>

          {/* TERMS */}
          <div className="mt-8">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            /> I agree to Terms & Conditions
          </div>

          {/* SUBMIT */}
          <div className="flex justify-center pt-8 border-t">
            <button
              type="submit"
              className="bg-cyan-600 text-white px-10 py-4 rounded-xl text-lg font-bold"
            >
              PROCEED
            </button>
          </div>
        </form>
      </div>

      <LegalModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms & Conditions">
        <TermsContent />
      </LegalModal>

      <LegalModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy Policy">
        <PrivacyContent />
      </LegalModal>
    </div>
  );
};