import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { getResults } from '../../services/pitchService';
import PodiumDisplay from '../../components/pitch/PodiumDisplay';
import WinnerBadge from '../../components/pitch/WinnerBadge';
import ConfettiOverlay from '../../components/curriculum/ConfettiOverlay';

const PitchResultsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: result } = await getResults(eventId);
        setData(result);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Results not available yet');
        navigate(`/pitch-arena/event/${eventId}`);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId, navigate]);

  const handleShare = () => {
    const text = encodeURIComponent(
      `Check out the results from "${data?.event?.title}" on CampusLaunch! 🚀 #CampusLaunch #PitchArena #StartupBD`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 rounded w-1/3 mx-auto" />
        <div className="h-64 bg-stone-200 rounded-xl" />
        <div className="h-48 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { event, rankings, audienceVotes, feedbacks } = data;
  const badgeLabels = ['🏆 Pitch Champion', '🥈 Runner Up', '🥉 Third Place'];

  return (
    <>
      <ConfettiOverlay active={showConfetti} duration={4000} />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <button
          onClick={() => navigate('/pitch-arena')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-amber-900 transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Arena
        </button>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black font-serif-custom text-stone-900 mb-2">
            🏆 Final Results
          </h1>
          <p className="text-stone-500 text-lg">{event?.title}</p>
        </header>

        {/* Podium */}
        {rankings.length > 0 && (
          <section className="placard p-8 bg-white mb-8">
            <PodiumDisplay rankings={rankings} />
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {rankings.slice(0, 3).map((r, i) => (
                <WinnerBadge key={r.team?._id} title={`${badgeLabels[i]} - ${r.team?.name}`} size="lg" />
              ))}
            </div>
          </section>
        )}

        {/* Full scoreboard */}
        <section className="placard bg-white overflow-hidden mb-8">
          <div className="p-5 border-b-2 border-stone-200">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Trophy size={14} /> Complete Rankings
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left">
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400">Rank</th>
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400">Team</th>
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400 text-center">Problem</th>
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400 text-center">Solution</th>
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400 text-center">Team</th>
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400 text-center">Market</th>
                  <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-stone-400 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.team?._id} className={`border-t border-stone-100 ${r.rank <= 3 ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-4 py-3 font-black text-amber-700">{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : `#${r.rank}`}</td>
                    <td className="px-4 py-3 font-bold text-stone-900">{r.team?.name}</td>
                    <td className="px-4 py-3 text-center text-stone-600">{r.avgProblem}</td>
                    <td className="px-4 py-3 text-center text-stone-600">{r.avgSolution}</td>
                    <td className="px-4 py-3 text-center text-stone-600">{r.avgTeam}</td>
                    <td className="px-4 py-3 text-center text-stone-600">{r.avgMarket}</td>
                    <td className="px-4 py-3 text-center font-black text-amber-900">{r.avgTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audience votes */}
        {audienceVotes?.length > 0 && (
          <section className="placard p-6 bg-white mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">👏 Audience Favorite</h2>
            <div className="space-y-2">
              {audienceVotes.map((v, i) => (
                <div key={v.team?._id} className={`flex items-center justify-between p-3 rounded-lg ${i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-stone-50'}`}>
                  <span className="font-bold text-stone-800">{i === 0 ? '🏅 ' : ''}{v.team?.name}</span>
                  <span className="font-black text-amber-700">{v.count} votes</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Judge feedback */}
        {feedbacks?.length > 0 && (
          <section className="placard p-6 bg-white mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">💬 Judge Feedback</h2>
            <div className="space-y-4">
              {feedbacks.map((f, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-stone-800">To: {f.team?.name}</span>
                    <span className="text-xs text-stone-400">By {f.judge?.name}</span>
                  </div>
                  <p className="text-stone-600 text-sm">{f.feedback}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prize money */}
        {event?.prizeMoney && (
          <section className="placard p-6 bg-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Prize Money</h2>
                <p className="text-2xl font-black text-amber-900">
                  ৳{((event.prizeMoney.first || 0) + (event.prizeMoney.second || 0) + (event.prizeMoney.third || 0)).toLocaleString()} BDT
                </p>
              </div>
              <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded ${event.prizeDistributed ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                {event.prizeDistributed ? '✓ Distributed' : 'Announced'}
              </span>
            </div>
          </section>
        )}

        {/* Share */}
        <div className="text-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0077B5] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#005885] transition-all"
            style={{ borderRadius: '8px 20px 8px 20px' }}
          >
            <Share2 size={16} /> Share Results on LinkedIn
          </button>
        </div>
      </div>
    </>
  );
};

export default PitchResultsPage;
