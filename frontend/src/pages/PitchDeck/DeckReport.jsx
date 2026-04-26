import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BarChart2, TrendingUp, Users, Star, Upload, MessageSquare } from 'lucide-react';

import { API_BASE_URL as API } from '@/config';

const CRITERIA_LABELS = {
  problemClarity:    'Problem Clarity',
  solutionQuality:   'Solution Quality',
  marketOpportunity: 'Market Opportunity',
  businessModel:     'Business Model',
  teamStrength:      'Team Strength',
  slideDesign:       'Slide Design',
};

const RECO_COLORS = {
  'needs-work':        'bg-red-100   text-red-800',
  'good-potential':    'bg-amber-100 text-amber-800',
  'competition-ready': 'bg-green-100 text-green-800',
};

function ScoreBar({ score, max = 5 }) {
  const pct = score ? (score / max) * 100 : 0;
  const color = score < 2.5 ? '#ef4444' : score < 3.5 ? '#f59e0b' : '#0d9488';
  return (
    <div className="w-full bg-stone-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function DeckReport() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVer, setActiveVer] = useState(null);

  useEffect(() => {
    fetch(`${API}/decks/${id}/report`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setReport(d);
        if (d.versionReports?.length > 0) setActiveVer(d.versionReports[d.versionReports.length - 1].version);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-stone-400 animate-pulse font-black text-xs uppercase tracking-widest">Loading…</div>;
  if (!report)  return <div className="text-center py-20">Report not found.</div>;

  const { deck, totalReviews, versionReports, trend } = report;
  const activeReport = versionReports?.find(vr => vr.version === activeVer);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Hero */}
      <div className="jewel-teal p-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-black text-teal-50 font-serif-custom mb-1">{deck.title}</h1>
            <p className="text-teal-200 text-sm">v{deck.currentVersion} · {totalReviews} total reviews</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to={`/decks/${id}/version`}
              className="flex items-center gap-1.5 bg-white/10 text-teal-50 border-2 border-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-white/20 transition"
              style={{ borderRadius: '8px 20px 8px 20px' }}>
              <Upload size={11} /> New Version
            </Link>
            <Link to={`/decks/${id}/review`}
              className="flex items-center gap-1.5 bg-amber-500 text-white border-2 border-amber-500 text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-amber-600 transition"
              style={{ borderRadius: '20px 8px 20px 8px' }}>
              <Star size={11} /> Review
            </Link>
          </div>
        </div>
      </div>

      {/* Trend chart (textual) */}
      {trend?.length > 1 && (
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={12} className="text-teal-700" /> Score Trend Across Versions
          </h3>
          <div className="flex items-end gap-4 h-20">
            {trend.map(t => (
              <div key={t.version} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-black text-amber-900">{t.avg ?? '—'}</span>
                <div className="w-full bg-amber-100 rounded-t-lg"
                  style={{ height: t.avg ? `${(t.avg / 5) * 64}px` : '4px', backgroundColor: t.avg ? '#b45309' : '#e7e5e4' }} />
                <span className="text-[9px] text-stone-400 font-bold">v{t.version}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version selector */}
      {versionReports?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {versionReports.map(vr => (
            <button key={vr.version} onClick={() => setActiveVer(vr.version)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all
                ${activeVer === vr.version
                  ? 'bg-amber-900 border-amber-900 text-amber-50'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-amber-400'}`}
              style={{ borderRadius: '6px 16px 6px 16px' }}>
              v{vr.version} ({vr.totalReviewers} reviews)
            </button>
          ))}
        </div>
      )}

      {/* Active version breakdown */}
      {activeReport && (
        <>
          {/* Category scores */}
          <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6"
               style={{ borderRadius: '12px 32px 12px 32px' }}>
            <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-5 flex items-center gap-2">
              <BarChart2 size={12} className="text-teal-700" /> Category Breakdown — v{activeReport.version}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                const avg = activeReport.categoryAvgs[key];
                return (
                  <div key={key}>
                    <div className="flex justify-between text-[10px] font-bold text-stone-600 mb-1.5">
                      <span>{label}</span>
                      <span className="text-amber-900">{avg ?? '—'}/5</span>
                    </div>
                    <ScoreBar score={avg} />
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t-2 border-stone-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Overall Average</span>
              <span className="text-3xl font-black text-amber-900 font-serif-custom">
                {activeReport.overallAvg ?? '—'}<span className="text-lg">/5</span>
              </span>
            </div>
          </div>

          {/* Individual reviews */}
          {activeReport.reviews?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={12} className="text-teal-700" /> Reviewer Comments
              </h3>
              {activeReport.reviews.map(rev => (
                <div key={rev._id}
                  className="placard bg-white border-2 border-stone-200 shadow-[2px_3px_0px_#d97706] p-5"
                  style={{ borderRadius: '8px 24px 8px 24px' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-black text-stone-800 text-sm">{rev.reviewerName || 'Anonymous'}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">{rev.reviewerRole}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-amber-900 font-serif-custom">{rev.avgScore}/5</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${RECO_COLORS[rev.recommendation] || ''}`}>
                        {rev.recommendation?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  {rev.overallComment && (
                    <p className="text-stone-600 text-xs italic border-l-4 border-amber-300 pl-3">{rev.overallComment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}