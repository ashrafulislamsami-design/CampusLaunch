import { Mic2, Trophy, Users } from 'lucide-react';

const PitchArenaHero = ({ stats }) => {
  return (
    <header
      className="relative overflow-hidden p-8 sm:p-12 mb-10 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white shadow-2xl"
      style={{ borderRadius: '16px 48px 16px 48px' }}
    >
      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="lg:w-2/3">
          <div className="flex items-center gap-2 mb-3">
            <Mic2 size={20} className="text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
              Live Pitch Platform
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-serif-custom drop-shadow-lg tracking-tight mb-3">
            Virtual Pitch Arena
          </h1>
          <p className="text-stone-300 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
            Where ideas meet their moment. Compete, judge, and watch live startup pitches from the brightest student founders across Bangladesh.
          </p>
        </div>
        <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl hidden lg:block">
          <Mic2 size={80} className="text-amber-400/60" />
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="relative z-10 flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-sm font-bold">{stats.totalEvents || 0} Events Hosted</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-teal-400" />
            <span className="text-sm font-bold">{stats.totalTeams || 0} Teams Pitched</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">৳</span>
            <span className="text-sm font-bold">{(stats.totalPrize || 0).toLocaleString()} BDT in Prizes</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default PitchArenaHero;
