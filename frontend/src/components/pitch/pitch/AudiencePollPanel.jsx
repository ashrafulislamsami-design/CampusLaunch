import { useState } from 'react';
import { ThumbsUp, CheckCircle } from 'lucide-react';

const AudiencePollPanel = ({ teams, voteCounts, hasVoted, onVote, loading }) => {
  const [selected, setSelected] = useState('');
  const maxVotes = Math.max(1, ...voteCounts.map(v => v.count));

  const getTeamVotes = (teamId) => {
    const v = voteCounts.find(vc => vc.team?._id === teamId);
    return v?.count || 0;
  };

  const handleVote = () => {
    if (!selected || hasVoted) return;
    onVote(selected);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
        <ThumbsUp size={14} /> Audience Vote
      </h3>

      {hasVoted && (
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
          <CheckCircle size={16} className="text-teal-600" />
          <span className="text-xs font-bold text-teal-800">Your vote has been recorded!</span>
        </div>
      )}

      <div className="space-y-2">
        {teams.map((team) => {
          const votes = getTeamVotes(team._id || team.team?._id);
          const pct = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

          return (
            <div key={team._id || team.team?._id}>
              <label
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selected === (team._id || team.team?._id)
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300'
                } ${hasVoted ? 'cursor-default' : ''}`}
              >
                {!hasVoted && (
                  <input
                    type="radio"
                    name="vote"
                    value={team._id || team.team?._id}
                    checked={selected === (team._id || team.team?._id)}
                    onChange={(e) => setSelected(e.target.value)}
                    className="accent-amber-600"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-stone-800 block truncate">
                    {team.name || team.team?.name || 'Team'}
                  </span>
                  <div className="mt-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-black text-stone-500 ml-2">{votes}</span>
              </label>
            </div>
          );
        })}
      </div>

      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={!selected || loading}
          className="w-full py-2.5 bg-amber-900 text-amber-50 font-bold text-xs uppercase tracking-widest hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ borderRadius: '8px 20px 8px 20px' }}
        >
          {loading ? 'Voting...' : 'Cast Vote'}
        </button>
      )}
    </section>
  );
};

export default AudiencePollPanel;
