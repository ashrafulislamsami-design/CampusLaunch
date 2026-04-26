import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config';
import { ArrowLeft, FileText, Sparkles, PieChart, Users, Target, Activity, AlertTriangle, CheckCircle, TrendingUp, Search } from 'lucide-react';

const AIReportPage = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedReportId = id ? id.replace(/[^a-zA-Z0-9]/g, '') : null;

  useEffect(() => {
    const fetchReport = async () => {
      if (!normalizedReportId) {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/ai/reports/${normalizedReportId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to load report');
        }

        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error('Failed to load AI report:', err);
        setError(err.message || 'Unable to load report');
        toast.error(err.message || 'Unable to load saved pitch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [normalizedReportId, token]);

  const formatSectionValue = (value, separator = ', ') => {
    if (Array.isArray(value)) {
      return value.join(separator);
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value && typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return null;
  };


  const renderValue = (value, type = null) => {
    if (value === null || value === undefined) return null;
    
    // Custom formatting for Market Analysis
    let displayValue = value;
    if (type === 'Market Analysis') {
      const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        const formatted = (num * 100000).toLocaleString('en-IN');
        displayValue = `${formatted}/- dollars`;
      }
    }

    // If it's already a React element (JSX), render it directly
    if (typeof displayValue === 'object' && displayValue.$$typeof) {
      return displayValue;
    }

    if (Array.isArray(displayValue)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayValue.map((item, index) => (
            <div key={index} className="group relative bg-white border border-slate-200 p-5 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg" style={{borderRadius: '16px 32px 16px 32px'}}>
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {typeof item === 'object' && item !== null && !item.$$typeof ? (
                <div className="space-y-3">
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-indigo-500 font-bold">{key}</p>
                      <p className="text-slate-700 mt-1 font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-700 font-medium leading-relaxed">
                  {typeof item === 'object' && item !== null ? item : String(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof displayValue === 'object' && displayValue !== null) {
      return (
        <div className="bg-white border border-slate-200 p-6 shadow-sm" style={{borderRadius: '16px 48px 16px 48px'}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(displayValue).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-indigo-500 font-bold">{key}</p>
                <div className="text-slate-700 font-medium leading-relaxed">
                  {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-indigo-50/50 border border-indigo-100 p-6 text-xl font-bold text-indigo-900 shadow-inner" style={{borderRadius: '12px 32px 12px 32px'}}>
        {String(displayValue)}
      </div>
    );
  };

  const sectionIcons = {
    'Market Analysis': <PieChart size={22} className="text-indigo-600" />,
    'Competitors': <Users size={22} className="text-indigo-600" />,
    'Similar Companies': <Search size={22} className="text-indigo-600" />,
    'Risks': <AlertTriangle size={22} className="text-red-500" />,
    'Next Steps': <TrendingUp size={22} className="text-teal-600" />,
    'AI Suggestions': <Sparkles size={22} className="text-amber-500" />
  };

  const renderSection = (title, value) => {
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) return null;
    
    return (
      <div className="mb-10 group">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
            {sectionIcons[title] || <Activity size={22} className="text-slate-400" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif-custom relative">
            {title}
            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-indigo-500 group-hover:w-full transition-all duration-500"></span>
          </h2>
        </div>
        <div className="relative">
          {renderValue(value, title)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/ai-validator" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
              <ArrowLeft size={18} /> Back to AI Validator
            </Link>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 border border-slate-200 shadow-sm">
            Report ID: {normalizedReportId}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Pitch Analysis Report</h1>
              <p className="text-slate-500 mt-1">Comprehensive startup validation and market insights.</p>
            </div>
          </div>

          {loading && (
            <div className="py-14 text-center text-slate-500">Loading saved pitch report…</div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-semibold">Unable to load report</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && report && (
            <div className="space-y-8">
              {console.log('Rendering report sections:', report)}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-indigo-50 hover:border-indigo-200">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Problem</p>
                    <AlertTriangle size={16} className="text-red-300 group-hover:text-red-500 transition-colors" />
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{report.ideaData?.problem || 'Not provided'}</p>
                </div>
                <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-indigo-50 hover:border-indigo-200">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Solution</p>
                    <CheckCircle size={16} className="text-teal-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{report.ideaData?.solution || 'Not provided'}</p>
                </div>
                <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-indigo-50 hover:border-indigo-200">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Target</p>
                    <Target size={16} className="text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{report.ideaData?.target || 'Not provided'}</p>
                </div>
              </div>

              {renderSection('AI Suggestions', report.suggestions && Object.keys(report.suggestions).length > 0 ? 
                report.suggestions : null)}

              {renderSection('Market Analysis', report.aiResponse?.marketSize)}
              {renderSection('Competitors', report.aiResponse?.competitors)}
              {renderSection('Similar Companies', report.aiResponse?.similarCompanies)}
              {report.aiResponse?.swot && (
                <div className="mb-10 group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <Activity size={22} className="text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif-custom relative">
                      SWOT Analysis
                      <span className="absolute -bottom-1 left-0 w-0 h-1 bg-indigo-500 group-hover:w-full transition-all duration-500"></span>
                    </h2>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-[32px] bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[10px] text-green-600 uppercase tracking-[0.3em] font-black mb-4">Strengths</p>
                      <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">{report.aiResponse.swot.s || 'Not available'}</p>
                    </div>
                    <div className="rounded-[32px] bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[10px] text-amber-600 uppercase tracking-[0.3em] font-black mb-4">Weaknesses</p>
                      <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">{report.aiResponse.swot.w || 'Not available'}</p>
                    </div>
                    <div className="rounded-[32px] bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[10px] text-indigo-600 uppercase tracking-[0.3em] font-black mb-4">Opportunities</p>
                      <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">{report.aiResponse.swot.o || 'Not available'}</p>
                    </div>
                    <div className="rounded-[32px] bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-[10px] text-red-600 uppercase tracking-[0.3em] font-black mb-4">Threats</p>
                      <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">{report.aiResponse.swot.t || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              )}

              {renderSection('Risks', report.aiResponse?.risks)}
              {renderSection('Next Steps', report.aiResponse?.nextSteps)}
            </div>
          )}

          {!loading && report && (!report.ideaData || !report.aiResponse) && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
              <p className="font-semibold">Report data incomplete</p>
              <p>The report was loaded but some sections may be missing. Raw data: {JSON.stringify(report, null, 2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIReportPage;
