import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, Video, FileText, ClipboardList, HelpCircle, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getModuleByWeek, markVideoWatched as markVideoAPI } from '../../services/curriculumService';
import useCurriculumProgress from '../../hooks/useCurriculumProgress';
import WeekSidebar from '../../components/curriculum/WeekSidebar';
import VideoPlayer from '../../components/curriculum/VideoPlayer';
import ReadingSection from '../../components/curriculum/ReadingSection';
import AssignmentForm from '../../components/curriculum/AssignmentForm';
import QuizSection from '../../components/curriculum/QuizSection';
import CurriculumProgressBar from '../../components/curriculum/CurriculumProgressBar';

const TABS = [
  { id: 'video', label: 'Video', Icon: Video },
  { id: 'reading', label: 'Reading', Icon: FileText },
  { id: 'assignment', label: 'Assignment', Icon: ClipboardList },
  { id: 'quiz', label: 'Quiz', Icon: HelpCircle },
];

const SkeletonContent = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-stone-200 rounded w-2/3" />
    <div className="h-4 bg-stone-200 rounded w-1/2" />
    <div className="bg-stone-200 rounded-xl" style={{ aspectRatio: '16/9' }} />
    <div className="h-4 bg-stone-200 rounded w-full" />
    <div className="h-4 bg-stone-200 rounded w-5/6" />
  </div>
);

const CurriculumWeekPage = () => {
  const { weekNumber: weekParam } = useParams();
  const weekNumber = parseInt(weekParam);
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { getWeekProgress, getWeekStatus, updateProgressLocally, refetchProgress, loading: progressLoading } = useCurriculumProgress();

  const weekProgress = getWeekProgress(weekNumber);

  const fetchModule = useCallback(async () => {
    try {
      setModuleLoading(true);
      const { data } = await getModuleByWeek(weekNumber);
      setModule(data);
    } catch (err) {
      toast.error('Failed to load week content');
      navigate('/curriculum');
    } finally {
      setModuleLoading(false);
    }
  }, [weekNumber, navigate]);

  useEffect(() => {
    if (weekNumber < 1 || weekNumber > 12 || isNaN(weekNumber)) {
      navigate('/curriculum');
      return;
    }
    fetchModule();
    setActiveTab('video');
    window.scrollTo(0, 0);
  }, [weekNumber, fetchModule, navigate]);

  const handleMarkVideoWatched = async () => {
    try {
      updateProgressLocally(weekNumber, { videoWatched: true });
      await markVideoAPI(weekNumber);
      toast.success('Video marked as watched!');
      refetchProgress();
    } catch (err) {
      toast.error('Failed to mark video as watched');
      updateProgressLocally(weekNumber, { videoWatched: false });
    }
  };

  const handleQuizSubmitted = (data) => {
    updateProgressLocally(weekNumber, {
      quizSubmitted: true,
      quizScore: data.quizScore,
      quizAnswers: data.quizAnswers,
      isCompleted: data.isCompleted,
      completedAt: data.completedAt,
    });
    refetchProgress();
  };

  const handleAssignmentSubmitted = (data) => {
    updateProgressLocally(weekNumber, {
      assignmentSubmitted: true,
      assignmentText: data.assignmentText,
    });
    refetchProgress();
  };

  const videoWatched = weekProgress?.videoWatched || false;
  const quizSubmitted = weekProgress?.quizSubmitted || false;
  const isCompleted = weekProgress?.isCompleted || false;

  const weekProgressPercent = (() => {
    let steps = 0;
    if (videoWatched) steps++;
    if (quizSubmitted) steps++;
    if (weekProgress?.assignmentSubmitted) steps++;
    return Math.round((steps / 3) * 100);
  })();

  const loading = moduleLoading || progressLoading;

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <WeekSidebar
        currentWeek={weekNumber}
        getWeekStatus={getWeekStatus}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-paper border-b-[3px] border-amber-200/60 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition"
                aria-label="Open week navigation"
              >
                <Menu size={20} />
              </button>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">
                  Week {weekNumber} of 12
                </span>
                <h1 className="text-lg sm:text-xl font-black font-serif-custom text-stone-900 leading-tight">
                  {loading ? '...' : module?.moduleTitle || `Week ${weekNumber}`}
                </h1>
              </div>
            </div>
            {isCompleted && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 border border-teal-300 text-teal-800 text-[10px] font-bold uppercase tracking-widest" style={{ borderRadius: '6px 14px 6px 14px' }}>
                <CheckCircle size={14} /> Completed
              </span>
            )}
          </div>
          <div className="max-w-4xl mx-auto mt-2">
            <CurriculumProgressBar percentage={weekProgressPercent} />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <SkeletonContent />
          ) : (
            <>
              {/* Tabs */}
              <nav className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Week content tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                      activeTab === tab.id
                        ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5'
                        : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'
                    }`}
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                  >
                    <tab.Icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Tab panels */}
              <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-label={activeTab}>
                {activeTab === 'video' && (
                  <section className="space-y-6">
                    <VideoPlayer
                      videoUrl={module?.videoUrl}
                      thumbnail={module?.videoThumbnail}
                      title={module?.moduleTitle}
                    />
                    <p className="text-stone-600 leading-relaxed">{module?.description}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleMarkVideoWatched}
                        disabled={videoWatched}
                        className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                          videoWatched
                            ? 'bg-teal-50 border-teal-300 text-teal-700 cursor-default'
                            : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                        style={{ borderRadius: '8px 20px 8px 20px' }}
                        aria-disabled={videoWatched}
                      >
                        <CheckCircle size={16} />
                        {videoWatched ? 'Video Watched' : 'Mark as Watched'}
                      </button>
                    </div>
                  </section>
                )}

                {activeTab === 'reading' && (
                  <ReadingSection
                    content={module?.readingContent}
                    pdfUrl={module?.readingPdfUrl}
                  />
                )}

                {activeTab === 'assignment' && (
                  <AssignmentForm
                    weekNumber={weekNumber}
                    assignment={module?.assignment}
                    progress={weekProgress}
                    onSubmitted={handleAssignmentSubmitted}
                  />
                )}

                {activeTab === 'quiz' && (
                  <QuizSection
                    weekNumber={weekNumber}
                    questions={module?.quiz}
                    progress={weekProgress}
                    onSubmitted={handleQuizSubmitted}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t-2 border-stone-200">
                <button
                  onClick={() => navigate(`/curriculum/week/${weekNumber - 1}`)}
                  disabled={weekNumber <= 1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-2 border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{ borderRadius: '8px 20px 8px 20px' }}
                >
                  <ChevronLeft size={16} />
                  Previous Week
                </button>

                {weekNumber < 12 ? (
                  <button
                    onClick={() => navigate(`/curriculum/week/${weekNumber + 1}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-amber-900 text-amber-50 hover:bg-amber-800 transition-all"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                  >
                    Next Week
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/curriculum/certificate')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-teal-700 text-teal-50 hover:bg-teal-600 transition-all"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                  >
                    View Certificate
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurriculumWeekPage;
