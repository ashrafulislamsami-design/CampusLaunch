import { Rocket, Award } from 'lucide-react';

const CertificateCard = ({ studentName, completionDate }) => {
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div id="certificate-card" className="max-w-3xl mx-auto">
      <div className="bg-white border-[4px] border-amber-300 p-2 shadow-2xl" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="border-[3px] border-amber-200 p-8 sm:p-12 text-center" style={{ borderRadius: '12px 40px 12px 40px' }}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Rocket size={32} className="text-teal-700" />
            <span className="text-2xl font-black text-amber-900 font-serif-custom">CampusLaunch</span>
          </div>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[2px] w-16 bg-amber-300" />
            <Award size={28} className="text-amber-500" />
            <div className="h-[2px] w-16 bg-amber-300" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black font-serif-custom text-stone-900 mb-2">
            Certificate of Completion
          </h1>
          <p className="text-stone-500 font-medium text-sm uppercase tracking-[0.3em] mb-8">
            This is to certify that
          </p>

          {/* Student name */}
          <p className="text-3xl sm:text-5xl font-black font-serif-custom text-teal-800 mb-2 py-4 border-b-[3px] border-t-[3px] border-amber-200 inline-block px-8">
            {studentName || 'Student Name'}
          </p>

          {/* Course details */}
          <p className="text-stone-500 font-medium text-sm mt-8 mb-2 uppercase tracking-widest">
            has successfully completed the
          </p>
          <p className="text-xl sm:text-2xl font-bold font-serif-custom text-amber-900 mb-8">
            12-Week Startup Curriculum
          </p>

          {/* Date */}
          <p className="text-stone-400 text-sm">
            Completed on <span className="font-bold text-stone-600">{formattedDate}</span>
          </p>

          {/* Decorative bottom */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-amber-300" />
            <div className="w-3 h-3 bg-amber-400 rotate-45" />
            <div className="h-[2px] w-24 bg-gradient-to-l from-transparent to-amber-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
