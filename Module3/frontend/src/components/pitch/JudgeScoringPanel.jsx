import React, { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitScore } from '../../services/pitchService';

const CRITERIA = [
  { key: 'problemClarity', label: 'Problem Clarity', max: 25 },
  { key: 'solutionViability', label: 'Solution Viability', max: 25 },
  { key: 'teamStrength', label: 'Team Strength', max: 25 },
  { key: 'marketPotential', label: 'Market Potential', max: 25 },
];

const JudgeScoringPanel = ({ eventId, teamId, teamName, onScored }) => {
  const [scores, setScores] = useState({ problemClarity: 0, solutionViability: 0, teamStrength: 0, marketPotential: 0 });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitScore({ eventId, teamId, ...scores, feedback });
      toast.success(`Score submitted: ${total}/100`);
      setSubmitted(true);
      onScored?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-teal-700 font-bold text-lg">✓ Score Submitted</p>
        <p className="text-stone-500 text-sm mt-1">Total: {total}/100</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-stone-900 text-sm uppercase tracking-widest">
        Score: <span className="text-amber-700">{teamName || 'Team'}</span>
      </h3>

      {CRITERIA.map(({ key, label, max }) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-stone-600">{label}</label>
            <span className="text-xs font-black text-amber-900">{scores[key]}/{max}</span>
          </div>
          <input
            type="range"
            min={0}
            max={max}
            value={scores[key]}
            onChange={(e) => setScores(s => ({ ...s, [key]: Number(e.target.value) }))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            aria-label={`${label} score`}
          />
        </div>
      ))}

      <div className="pt-2 border-t border-stone-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Total</span>
          <span className="text-lg font-black text-amber-900">{total}/100</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-stone-600 mb-1 block">Feedback (optional)</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg text-sm focus:border-amber-400 focus:ring-0 resize-none"
          placeholder="Write feedback for this team..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-900 text-amber-50 font-bold text-xs uppercase tracking-widest hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ borderRadius: '8px 20px 8px 20px' }}
      >
        <Send size={14} />
        {submitting ? 'Submitting...' : 'Submit Score'}
      </button>
    </div>
  );
};

export default React.memo(JudgeScoringPanel);
