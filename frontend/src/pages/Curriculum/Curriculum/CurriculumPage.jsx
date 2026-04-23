import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllModules } from '../../services/curriculumService';
import useCurriculumProgress from '../../hooks/useCurriculumProgress';
import ModuleCard from '../../components/curriculum/ModuleCard';
import CurriculumProgressBar from '../../components/curriculum/CurriculumProgressBar';

const SkeletonCard = () => (
  <div className="placard p-6 bg-white animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-12 h-12 bg-stone-200 rounded-lg" />
      <div className="w-12 h-12 bg-stone-200 rounded-full" />
    </div>
    <div className="h-3 bg-stone-200 rounded w-24 mb-2" />
    <div className="h-5 bg-stone-200 rounded w-full mb-2" />
    <div className="h-5 bg-stone-200 rounded w-3/4 mb-4" />
    <div className="h-6 bg-stone-200 rounded w-28 mb-4" />
    <div className="h-10 bg-stone-200 rounded w-full" />
  </div>
);

const CurriculumPage = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const { overallPercentage, completedCount, getWeekStatus, loading: progressLoading } = useCurriculumProgress();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data } = await getAllModules();
        setModules(data);
      } catch (err) {
        toast.error('Failed to load curriculum modules');
      } finally {
        setModulesLoading(false);
      }
    };
    fetchModules();
  }, []);

  const loading = modulesLoading || progressLoading;
  const allComplete = completedCount === 12;

  const getGroupProgress = useMemo(() => {
    return (weeks) => {
      let completed = 0;
      weeks.forEach((w) => {
        if (getWeekStatus(w) === 'completed') completed++;
      });
      return Math.round((completed / weeks.length) * 100);
    };
  }, [getWeekStatus]);

  const firstIncompleteWeek = useMemo(() => {
    for (let w = 1; w <= 12; w++) {
      if (getWeekStatus(w) !== 'completed') return w;
    }
    return 1;
  }, [getWeekStatus]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <header
        className="relative overflow-hidden p-8 sm:p-12 mb-10 jewel-teal shadow-xl"
        style={{ borderRadius: '16px 48px 16px 48px' }}
      >
        <div className="absolute inset-0 opacity-[0.05] bg-black" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={20} className="text-teal-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-200">
                12-Week Program
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-serif-custom text-teal-50 drop-shadow-md tracking-tight mb-4">
              Startup Curriculum
            </h1>
            <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
              Our structured startup course guides students step by step through the startup process. From ideation to pitching, gain essential skills to succeed in your entrepreneurial journey.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 text-teal-50 font-bold text-sm rounded-lg">
                {completedCount} of 12 weeks completed
              </span>
              {allComplete && (
                <button
                  onClick={() => navigate('/curriculum/certificate')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-amber-900 font-bold text-xs uppercase tracking-widest hover:bg-amber-300 transition-all shadow-lg"
                  style={{ borderRadius: '8px 20px 8px 20px' }}
                >
                  <Award size={16} />
                  View Certificate
                </button>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl hidden lg:block">
            <Rocket size={80} className="text-teal-100 opacity-60 transform -rotate-12" />
          </div>
        </div>
      </header>

      {/* Global Progress Bar */}
      <section className="mb-10 placard p-6 bg-white" aria-label="Overall course progress">
        <CurriculumProgressBar percentage={overallPercentage} label="Overall Progress" />
      </section>

      {/* Module Grid */}
      <section aria-label="Curriculum modules">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-20 placard bg-stone-50 border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
            <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 font-black uppercase tracking-widest text-sm">Curriculum coming soon</p>
            <p className="text-stone-400 text-sm mt-2">Check back later for exciting startup content!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((groupIdx) => (
                <ModuleCard
                  key={groupIdx}
                  groupIndex={groupIdx}
                  getWeekStatus={getWeekStatus}
                  getGroupProgress={getGroupProgress}
                />
              ))}
            </div>

            {completedCount === 0 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => navigate(`/curriculum/week/${firstIncompleteWeek}`)}
                  className="gilded-btn text-lg px-12 py-4"
                >
                  Start Learning
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CurriculumPage;
