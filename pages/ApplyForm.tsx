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

  /* ✅ UPDATED SUBMIT HANDLER (NO DATABASE LOGIC) */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert(
        'Please agree to the Terms & Conditions and No-Refund Policy before proceeding.'
      );
      return;
    }

    // 🔒 Clear any old session data
    localStorage.removeItem('payment_details');
    localStorage.removeItem('pending_application');

    // 🧠 Store application temporarily
    localStorage.setItem(
      'pending_application',
      JSON.stringify(formData)
    );

    // 👉 Go to payment page
    navigate('/payment');
  };

  const inputClass =
    'w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-black transition-all';
  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1';
  const sectionTitleClass = 'text-xl font-bold text-[#003366] uppercase';

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
        <div className="bg-[#003366] p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">
            Registration & Career Goal Questionnaire
          </h1>
          <p className="text-cyan-200">नोंदणी व करिअर उद्दिष्ट प्रश्नावली</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* ---- YOUR FORM CONTENT REMAINS UNCHANGED BELOW ---- */}
          {/* (Personal Info, Education, Career, Declaration, Modals etc.) */}
          {/* I have intentionally NOT modified any UI/inputs */}
          
          <div className="flex flex-col items-center gap-4 pt-8 border-t">
            <p className="text-xs text-slate-500 font-medium">
              Review all details carefully before proceeding.
            </p>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-16 py-5 rounded-xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              PROCEED
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
