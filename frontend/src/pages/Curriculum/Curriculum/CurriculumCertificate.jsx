import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCertificateEligibility } from '../../services/curriculumService';
import CertificateCard from '../../components/curriculum/CertificateCard';
import ConfettiOverlay from '../../components/curriculum/ConfettiOverlay';

const CurriculumCertificate = () => {
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const { data } = await getCertificateEligibility();
        if (!data.eligible) {
          toast.error('Complete all 12 weeks to unlock your certificate');
          navigate('/curriculum');
          return;
        }
        setCertData(data);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } catch (err) {
        toast.error('Failed to verify certificate eligibility');
        navigate('/curriculum');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [navigate]);

  const handleDownload = () => {
    window.print();
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `I just completed the 12-Week Startup Curriculum on CampusLaunch! 🚀 Learned everything from ideation to investor pitching. #CampusLaunch #StartupCurriculum #Entrepreneurship`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-1/3 mx-auto" />
          <div className="h-96 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!certData) return null;

  return (
    <>
      <ConfettiOverlay active={showConfetti} duration={4000} />

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-card, #certificate-card * { visibility: visible; }
          #certificate-card { position: absolute; left: 0; top: 0; width: 100%; }
          nav, header, .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/curriculum')}
          className="no-print inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-amber-900 transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to Curriculum
        </button>

        {/* Header */}
        <div className="no-print text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black font-serif-custom text-stone-900 mb-2">
            Congratulations! 🎉
          </h1>
          <p className="text-stone-500 text-lg">
            You have completed the entire 12-Week Startup Curriculum
          </p>
        </div>

        {/* Certificate */}
        <CertificateCard
          studentName={certData.studentName}
          completionDate={certData.completionDate}
        />

        {/* Actions */}
        <div className="no-print flex flex-wrap items-center justify-center gap-4 mt-10">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900 text-amber-50 font-bold text-xs uppercase tracking-widest hover:bg-amber-800 transition-all shadow-lg"
            style={{ borderRadius: '8px 20px 8px 20px' }}
          >
            <Download size={16} />
            Download Certificate
          </button>
          <button
            onClick={handleShareLinkedIn}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0077B5] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#005885] transition-all shadow-lg"
            style={{ borderRadius: '8px 20px 8px 20px' }}
          >
            <Share2 size={16} />
            Share on LinkedIn
          </button>
        </div>
      </div>
    </>
  );
};

export default CurriculumCertificate;
